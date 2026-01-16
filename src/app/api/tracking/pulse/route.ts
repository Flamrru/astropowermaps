import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

const COOKIE_NAME = "tracking_session";

/**
 * GET /api/tracking/pulse
 *
 * Returns quick "pulse" metrics for the analytics dashboard.
 * Designed for a 30-second daily health check.
 *
 * Returns:
 * - DAU, WAU, MAU with trends vs previous period
 * - Session count today
 * - Return rate (% users with 2+ days activity this week)
 * - Feature usage breakdown (today vs yesterday)
 * - 7-day sparkline data for key metrics
 */
export async function GET() {
  // Check authentication
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);

  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const weekAgoStart = new Date(todayStart);
    weekAgoStart.setDate(weekAgoStart.getDate() - 7);

    const twoWeeksAgoStart = new Date(todayStart);
    twoWeeksAgoStart.setDate(twoWeeksAgoStart.getDate() - 14);

    const monthAgoStart = new Date(todayStart);
    monthAgoStart.setDate(monthAgoStart.getDate() - 30);

    const twoMonthsAgoStart = new Date(todayStart);
    twoMonthsAgoStart.setDate(twoMonthsAgoStart.getDate() - 60);

    // Fetch all events from the past 60 days (for comparisons)
    const { data: allEvents } = await supabaseAdmin
      .from("app_events")
      .select("user_id, session_id, event_name, event_category, created_at")
      .not("user_id", "is", null)
      .gte("created_at", twoMonthsAgoStart.toISOString())
      .order("created_at", { ascending: false });

    const events = allEvents || [];

    // Helper to get date string (YYYY-MM-DD)
    const getDateStr = (dateStr: string) => dateStr.split("T")[0];

    // Calculate DAU (today vs yesterday)
    const todayUsers = new Set<string>();
    const yesterdayUsers = new Set<string>();

    for (const e of events) {
      const eventDate = new Date(e.created_at);
      if (eventDate >= todayStart) {
        todayUsers.add(e.user_id);
      } else if (eventDate >= yesterdayStart && eventDate < todayStart) {
        yesterdayUsers.add(e.user_id);
      }
    }

    const dau = todayUsers.size;
    const dauYesterday = yesterdayUsers.size;
    const dauTrend = dauYesterday > 0 ? ((dau - dauYesterday) / dauYesterday) * 100 : 0;

    // Calculate WAU (this week vs last week)
    const thisWeekUsers = new Set<string>();
    const lastWeekUsers = new Set<string>();

    for (const e of events) {
      const eventDate = new Date(e.created_at);
      if (eventDate >= weekAgoStart) {
        thisWeekUsers.add(e.user_id);
      } else if (eventDate >= twoWeeksAgoStart && eventDate < weekAgoStart) {
        lastWeekUsers.add(e.user_id);
      }
    }

    const wau = thisWeekUsers.size;
    const wauLastWeek = lastWeekUsers.size;
    const wauTrend = wauLastWeek > 0 ? ((wau - wauLastWeek) / wauLastWeek) * 100 : 0;

    // Calculate MAU (this month vs last month)
    const thisMonthUsers = new Set<string>();
    const lastMonthUsers = new Set<string>();

    for (const e of events) {
      const eventDate = new Date(e.created_at);
      if (eventDate >= monthAgoStart) {
        thisMonthUsers.add(e.user_id);
      } else if (eventDate >= twoMonthsAgoStart && eventDate < monthAgoStart) {
        lastMonthUsers.add(e.user_id);
      }
    }

    const mau = thisMonthUsers.size;
    const mauLastMonth = lastMonthUsers.size;
    const mauTrend = mauLastMonth > 0 ? ((mau - mauLastMonth) / mauLastMonth) * 100 : 0;

    // Calculate sessions today
    const todaySessions = new Set<string>();
    for (const e of events) {
      if (new Date(e.created_at) >= todayStart && e.session_id) {
        todaySessions.add(e.session_id);
      }
    }
    const sessionsToday = todaySessions.size;

    // Calculate return rate (users with 2+ active days this week)
    const userActiveDays = new Map<string, Set<string>>();
    for (const e of events) {
      if (new Date(e.created_at) >= weekAgoStart) {
        if (!userActiveDays.has(e.user_id)) {
          userActiveDays.set(e.user_id, new Set());
        }
        userActiveDays.get(e.user_id)!.add(getDateStr(e.created_at));
      }
    }

    let returningUsers = 0;
    for (const [, days] of userActiveDays) {
      if (days.size >= 2) returningUsers++;
    }
    const returnRate = thisWeekUsers.size > 0
      ? (returningUsers / thisWeekUsers.size) * 100
      : 0;

    // Feature usage breakdown (by event_name, today vs yesterday)
    const todayFeatures: Record<string, number> = {};
    const yesterdayFeatures: Record<string, number> = {};

    for (const e of events) {
      const eventDate = new Date(e.created_at);
      if (eventDate >= todayStart) {
        todayFeatures[e.event_name] = (todayFeatures[e.event_name] || 0) + 1;
      } else if (eventDate >= yesterdayStart && eventDate < todayStart) {
        yesterdayFeatures[e.event_name] = (yesterdayFeatures[e.event_name] || 0) + 1;
      }
    }

    // Combine and calculate trends
    const allFeatureNames = new Set([
      ...Object.keys(todayFeatures),
      ...Object.keys(yesterdayFeatures),
    ]);

    const featureUsage = Array.from(allFeatureNames).map((name) => {
      const today = todayFeatures[name] || 0;
      const yesterday = yesterdayFeatures[name] || 0;
      const trend = yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : 0;
      return { name, today, yesterday, trend };
    }).sort((a, b) => b.today - a.today).slice(0, 10);

    // 7-day sparkline data (daily active users)
    const sparklineData: Array<{ date: string; dau: number; sessions: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayUsers = new Set<string>();
      const daySessions = new Set<string>();

      for (const e of events) {
        const eventDate = new Date(e.created_at);
        if (eventDate >= dayStart && eventDate < dayEnd) {
          dayUsers.add(e.user_id);
          if (e.session_id) daySessions.add(e.session_id);
        }
      }

      sparklineData.push({
        date: dayStart.toISOString().split("T")[0],
        dau: dayUsers.size,
        sessions: daySessions.size,
      });
    }

    // Category breakdown (today)
    const categoryBreakdown: Record<string, number> = {};
    for (const e of events) {
      if (new Date(e.created_at) >= todayStart && e.event_category) {
        categoryBreakdown[e.event_category] = (categoryBreakdown[e.event_category] || 0) + 1;
      }
    }

    return NextResponse.json({
      metrics: {
        dau: { value: dau, trend: dauTrend },
        wau: { value: wau, trend: wauTrend },
        mau: { value: mau, trend: mauTrend },
        sessionsToday,
        returnRate: Math.round(returnRate * 10) / 10,
      },
      featureUsage,
      categoryBreakdown,
      sparkline: sparklineData,
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Pulse API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pulse data" },
      { status: 500 }
    );
  }
}
