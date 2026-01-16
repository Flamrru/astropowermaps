import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

const COOKIE_NAME = "tracking_session";

/**
 * GET /api/tracking/retention
 *
 * Returns cohort retention analysis.
 *
 * Query params:
 * - cohort_size: "week" or "month" (default "week")
 *
 * Returns:
 * - Weekly/monthly cohort retention grid
 * - Day 1/7/30 return rates
 * - Feature correlation with retention
 */
export async function GET(request: NextRequest) {
  // Check authentication
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);

  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const cohortSize = searchParams.get("cohort_size") || "week";

    const now = new Date();

    // Fetch all user profiles with creation dates
    const { data: profiles } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id, created_at")
      .order("created_at", { ascending: true });

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        cohorts: [],
        retentionRates: { day1: 0, day7: 0, day30: 0 },
        featureCorrelation: [],
      });
    }

    // Fetch all events with dates
    const { data: allEvents } = await supabaseAdmin
      .from("app_events")
      .select("user_id, event_category, created_at")
      .not("user_id", "is", null)
      .order("created_at", { ascending: true });

    const events = allEvents || [];

    // Build user activity map: user_id -> Set of active dates (YYYY-MM-DD)
    const userActiveDates = new Map<string, Set<string>>();
    const userFirstActivity = new Map<string, Date>();
    const userCategories = new Map<string, Set<string>>();

    for (const event of events) {
      const dateStr = event.created_at.split("T")[0];
      const eventDate = new Date(event.created_at);

      if (!userActiveDates.has(event.user_id)) {
        userActiveDates.set(event.user_id, new Set());
        userFirstActivity.set(event.user_id, eventDate);
        userCategories.set(event.user_id, new Set());
      }

      userActiveDates.get(event.user_id)!.add(dateStr);
      if (event.event_category) {
        userCategories.get(event.user_id)!.add(event.event_category);
      }
    }

    // ========================================
    // Cohort Retention Grid
    // ========================================
    const cohortData: Array<{
      cohort: string;
      cohortStart: string;
      userCount: number;
      retention: number[]; // % retained at week/month 0, 1, 2, etc.
    }> = [];

    // Determine cohort boundaries (last 8 weeks or 6 months)
    const numCohorts = cohortSize === "week" ? 8 : 6;
    const cohortDays = cohortSize === "week" ? 7 : 30;

    for (let i = 0; i < numCohorts; i++) {
      const cohortEnd = new Date(now);
      cohortEnd.setDate(cohortEnd.getDate() - i * cohortDays);
      cohortEnd.setHours(23, 59, 59, 999);

      const cohortStart = new Date(cohortEnd);
      cohortStart.setDate(cohortStart.getDate() - cohortDays + 1);
      cohortStart.setHours(0, 0, 0, 0);

      // Find users who signed up in this cohort
      const cohortUsers = profiles.filter((p) => {
        const signupDate = new Date(p.created_at);
        return signupDate >= cohortStart && signupDate <= cohortEnd;
      });

      if (cohortUsers.length === 0) continue;

      // Calculate retention for each subsequent period
      const retention: number[] = [];
      const maxPeriods = Math.min(8, Math.ceil((now.getTime() - cohortStart.getTime()) / (cohortDays * 24 * 60 * 60 * 1000)));

      for (let period = 0; period < maxPeriods; period++) {
        const periodStart = new Date(cohortStart);
        periodStart.setDate(periodStart.getDate() + period * cohortDays);
        const periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + cohortDays);

        // Count users active in this period
        let activeCount = 0;
        for (const user of cohortUsers) {
          const activeDates = userActiveDates.get(user.user_id);
          if (!activeDates) continue;

          // Check if user was active during this period
          for (const dateStr of activeDates) {
            const date = new Date(dateStr);
            if (date >= periodStart && date < periodEnd) {
              activeCount++;
              break;
            }
          }
        }

        retention.push(Math.round((activeCount / cohortUsers.length) * 100));
      }

      const cohortLabel = cohortSize === "week"
        ? `Week of ${cohortStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
        : cohortStart.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

      cohortData.unshift({
        cohort: cohortLabel,
        cohortStart: cohortStart.toISOString().split("T")[0],
        userCount: cohortUsers.length,
        retention,
      });
    }

    // ========================================
    // Day 1/7/30 Return Rates
    // ========================================
    let day1Returns = 0;
    let day7Returns = 0;
    let day30Returns = 0;
    let eligibleDay1 = 0;
    let eligibleDay7 = 0;
    let eligibleDay30 = 0;

    for (const profile of profiles) {
      const signupDate = new Date(profile.created_at);
      const activeDates = userActiveDates.get(profile.user_id);
      if (!activeDates) continue;

      const daysSinceSignup = Math.floor((now.getTime() - signupDate.getTime()) / (24 * 60 * 60 * 1000));

      // Day 1 (next day after signup)
      if (daysSinceSignup >= 1) {
        eligibleDay1++;
        const day1Date = new Date(signupDate);
        day1Date.setDate(day1Date.getDate() + 1);
        const day1Str = day1Date.toISOString().split("T")[0];
        if (activeDates.has(day1Str)) day1Returns++;
      }

      // Day 7
      if (daysSinceSignup >= 7) {
        eligibleDay7++;
        // Check if active any day between day 2 and day 7
        let activeInPeriod = false;
        for (let d = 2; d <= 7; d++) {
          const checkDate = new Date(signupDate);
          checkDate.setDate(checkDate.getDate() + d);
          if (activeDates.has(checkDate.toISOString().split("T")[0])) {
            activeInPeriod = true;
            break;
          }
        }
        if (activeInPeriod) day7Returns++;
      }

      // Day 30
      if (daysSinceSignup >= 30) {
        eligibleDay30++;
        // Check if active any day between day 8 and day 30
        let activeInPeriod = false;
        for (let d = 8; d <= 30; d++) {
          const checkDate = new Date(signupDate);
          checkDate.setDate(checkDate.getDate() + d);
          if (activeDates.has(checkDate.toISOString().split("T")[0])) {
            activeInPeriod = true;
            break;
          }
        }
        if (activeInPeriod) day30Returns++;
      }
    }

    const retentionRates = {
      day1: eligibleDay1 > 0 ? Math.round((day1Returns / eligibleDay1) * 100) : 0,
      day7: eligibleDay7 > 0 ? Math.round((day7Returns / eligibleDay7) * 100) : 0,
      day30: eligibleDay30 > 0 ? Math.round((day30Returns / eligibleDay30) * 100) : 0,
    };

    // ========================================
    // Feature Correlation with Retention
    // ========================================
    // Compare feature usage between retained (active in last 7 days) and churned users
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

    const retainedUsers: string[] = [];
    const churnedUsers: string[] = [];

    for (const profile of profiles) {
      const signupDate = new Date(profile.created_at);
      // Only consider users who signed up more than 14 days ago
      if (now.getTime() - signupDate.getTime() < 14 * 24 * 60 * 60 * 1000) continue;

      const activeDates = userActiveDates.get(profile.user_id);
      if (!activeDates) {
        churnedUsers.push(profile.user_id);
        continue;
      }

      // Check if active in last 7 days
      let recentlyActive = false;
      for (const dateStr of activeDates) {
        if (dateStr >= sevenDaysAgoStr) {
          recentlyActive = true;
          break;
        }
      }

      if (recentlyActive) {
        retainedUsers.push(profile.user_id);
      } else {
        churnedUsers.push(profile.user_id);
      }
    }

    // Compare category usage
    const retainedCategories: Record<string, number> = {};
    const churnedCategories: Record<string, number> = {};

    for (const userId of retainedUsers) {
      const cats = userCategories.get(userId);
      if (cats) {
        for (const cat of cats) {
          retainedCategories[cat] = (retainedCategories[cat] || 0) + 1;
        }
      }
    }

    for (const userId of churnedUsers) {
      const cats = userCategories.get(userId);
      if (cats) {
        for (const cat of cats) {
          churnedCategories[cat] = (churnedCategories[cat] || 0) + 1;
        }
      }
    }

    const allCategories = new Set([
      ...Object.keys(retainedCategories),
      ...Object.keys(churnedCategories),
    ]);

    const featureCorrelation = Array.from(allCategories).map((category) => {
      const retainedPct = retainedUsers.length > 0
        ? Math.round(((retainedCategories[category] || 0) / retainedUsers.length) * 100)
        : 0;
      const churnedPct = churnedUsers.length > 0
        ? Math.round(((churnedCategories[category] || 0) / churnedUsers.length) * 100)
        : 0;

      return {
        category,
        retainedPct,
        churnedPct,
        lift: retainedPct - churnedPct,
      };
    }).sort((a, b) => b.lift - a.lift);

    return NextResponse.json({
      cohortSize,
      cohorts: cohortData,
      retentionRates,
      featureCorrelation,
      stats: {
        totalUsers: profiles.length,
        retainedUsers: retainedUsers.length,
        churnedUsers: churnedUsers.length,
        retentionRate: profiles.length > 0
          ? Math.round((retainedUsers.length / profiles.length) * 100)
          : 0,
      },
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Retention API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch retention data" },
      { status: 500 }
    );
  }
}
