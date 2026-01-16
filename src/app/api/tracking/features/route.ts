import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

const COOKIE_NAME = "tracking_session";

/**
 * GET /api/tracking/features
 *
 * Returns detailed feature usage analytics.
 *
 * Query params:
 * - period: 7, 30, or 90 days (default 30)
 *
 * Returns:
 * - Feature usage matrix with trends
 * - Map interactions breakdown (by category, planet, line type)
 * - Calendar interactions breakdown
 * - Stella interactions breakdown
 * - Top user actions per feature area
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
    const period = parseInt(searchParams.get("period") || "30", 10);

    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setDate(periodStart.getDate() - period);
    periodStart.setHours(0, 0, 0, 0);

    // Previous period for comparison
    const prevPeriodStart = new Date(periodStart);
    prevPeriodStart.setDate(prevPeriodStart.getDate() - period);

    // Fetch all events from both periods
    const { data: allEvents } = await supabaseAdmin
      .from("app_events")
      .select("event_name, event_category, properties, created_at, user_id")
      .not("user_id", "is", null)
      .gte("created_at", prevPeriodStart.toISOString())
      .order("created_at", { ascending: false });

    const events = allEvents || [];

    // Split events into current and previous period
    const currentEvents = events.filter(e => new Date(e.created_at) >= periodStart);
    const prevEvents = events.filter(e => {
      const date = new Date(e.created_at);
      return date >= prevPeriodStart && date < periodStart;
    });

    // ========================================
    // Feature Usage Matrix
    // ========================================
    const currentFeatureCounts: Record<string, number> = {};
    const prevFeatureCounts: Record<string, number> = {};

    for (const e of currentEvents) {
      currentFeatureCounts[e.event_name] = (currentFeatureCounts[e.event_name] || 0) + 1;
    }

    for (const e of prevEvents) {
      prevFeatureCounts[e.event_name] = (prevFeatureCounts[e.event_name] || 0) + 1;
    }

    const allFeatureNames = new Set([
      ...Object.keys(currentFeatureCounts),
      ...Object.keys(prevFeatureCounts),
    ]);

    const featureMatrix = Array.from(allFeatureNames).map(name => {
      const current = currentFeatureCounts[name] || 0;
      const prev = prevFeatureCounts[name] || 0;
      const trend = prev > 0 ? ((current - prev) / prev) * 100 : 0;
      const uniqueUsers = new Set(
        currentEvents.filter(e => e.event_name === name).map(e => e.user_id)
      ).size;

      return {
        name,
        count: current,
        prevCount: prev,
        trend: Math.round(trend * 10) / 10,
        uniqueUsers,
      };
    }).sort((a, b) => b.count - a.count);

    // ========================================
    // Map Interactions Breakdown
    // ========================================
    const mapEvents = currentEvents.filter(e => e.event_category === "map");

    // Category filter usage
    const categoryFilterUsage: Record<string, number> = {};
    const lineTapsByPlanet: Record<string, number> = {};
    const lineTapsByType: Record<string, number> = {};
    const powerPlaceFlyTos: Record<string, number> = {};

    for (const e of mapEvents) {
      const props = e.properties as Record<string, unknown>;

      if (e.event_name === "category_filter" && props?.category) {
        const cat = String(props.category);
        categoryFilterUsage[cat] = (categoryFilterUsage[cat] || 0) + 1;
      }

      if (e.event_name === "line_tap") {
        if (props?.planet) {
          const planet = String(props.planet);
          lineTapsByPlanet[planet] = (lineTapsByPlanet[planet] || 0) + 1;
        }
        if (props?.line_type) {
          const lineType = String(props.line_type);
          lineTapsByType[lineType] = (lineTapsByType[lineType] || 0) + 1;
        }
      }

      if (e.event_name === "power_place_fly_to" && props?.city) {
        const city = String(props.city);
        powerPlaceFlyTos[city] = (powerPlaceFlyTos[city] || 0) + 1;
      }
    }

    const mapBreakdown = {
      totalEvents: mapEvents.length,
      categoryFilters: Object.entries(categoryFilterUsage)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count),
      lineTapsByPlanet: Object.entries(lineTapsByPlanet)
        .map(([planet, count]) => ({ planet, count }))
        .sort((a, b) => b.count - a.count),
      lineTapsByType: Object.entries(lineTapsByType)
        .map(([lineType, count]) => ({ lineType, count }))
        .sort((a, b) => b.count - a.count),
      topCities: Object.entries(powerPlaceFlyTos)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };

    // ========================================
    // Calendar Interactions Breakdown
    // ========================================
    const calendarEvents = currentEvents.filter(e => e.event_category === "calendar");

    const calendarTabUsage: Record<string, number> = {};
    const goalUsage: Record<string, number> = {};
    let powerDayClicks = 0;
    let regularDayClicks = 0;

    for (const e of calendarEvents) {
      const props = e.properties as Record<string, unknown>;

      if (e.event_name === "calendar_tab_switch" && props?.tab) {
        const tab = String(props.tab);
        calendarTabUsage[tab] = (calendarTabUsage[tab] || 0) + 1;
      }

      if (e.event_name === "goal_select" && props?.goal) {
        const goal = String(props.goal);
        goalUsage[goal] = (goalUsage[goal] || 0) + 1;
      }

      if (e.event_name === "day_click") {
        if (props?.is_power_day) {
          powerDayClicks++;
        } else {
          regularDayClicks++;
        }
      }
    }

    const calendarBreakdown = {
      totalEvents: calendarEvents.length,
      tabUsage: Object.entries(calendarTabUsage)
        .map(([tab, count]) => ({ tab, count }))
        .sort((a, b) => b.count - a.count),
      goalUsage: Object.entries(goalUsage)
        .map(([goal, count]) => ({ goal, count }))
        .sort((a, b) => b.count - a.count),
      dayClicks: {
        powerDays: powerDayClicks,
        regularDays: regularDayClicks,
        powerDayRate: powerDayClicks + regularDayClicks > 0
          ? Math.round((powerDayClicks / (powerDayClicks + regularDayClicks)) * 100)
          : 0,
      },
    };

    // ========================================
    // Stella Interactions Breakdown
    // ========================================
    const stellaEvents = currentEvents.filter(e => e.event_category === "stella");

    let totalMessages = 0;
    let totalCharacters = 0;
    let avgSessionDuration = 0;
    const durationSamples: number[] = [];

    for (const e of stellaEvents) {
      const props = e.properties as Record<string, unknown>;

      if (e.event_name === "stella_message_sent") {
        totalMessages++;
        if (typeof props?.char_count === "number") {
          totalCharacters += props.char_count;
        }
      }

      if (e.event_name === "stella_chat_close" && typeof props?.duration_ms === "number") {
        durationSamples.push(props.duration_ms);
      }
    }

    if (durationSamples.length > 0) {
      avgSessionDuration = Math.round(
        durationSamples.reduce((a, b) => a + b, 0) / durationSamples.length / 1000
      );
    }

    const stellaBreakdown = {
      totalEvents: stellaEvents.length,
      totalMessages,
      avgCharCount: totalMessages > 0 ? Math.round(totalCharacters / totalMessages) : 0,
      avgSessionDuration, // in seconds
      sessionsTracked: durationSamples.length,
    };

    // ========================================
    // Profile Interactions Breakdown
    // ========================================
    const profileEvents = currentEvents.filter(e => e.event_category === "profile");

    const birthDataEdits: Record<string, number> = {};
    let signOutClicks = 0;
    let deleteAccountClicks = 0;

    for (const e of profileEvents) {
      const props = e.properties as Record<string, unknown>;

      if (e.event_name === "birth_data_edit_start" && props?.field) {
        const field = String(props.field);
        birthDataEdits[field] = (birthDataEdits[field] || 0) + 1;
      }

      if (e.event_name === "sign_out_click") {
        signOutClicks++;
      }

      if (e.event_name === "delete_account_click") {
        deleteAccountClicks++;
      }
    }

    const profileBreakdown = {
      totalEvents: profileEvents.length,
      birthDataEdits: Object.entries(birthDataEdits)
        .map(([field, count]) => ({ field, count }))
        .sort((a, b) => b.count - a.count),
      signOutClicks,
      deleteAccountClicks,
    };

    // ========================================
    // Navigation Breakdown
    // ========================================
    const navEvents = currentEvents.filter(e => e.event_category === "navigation");

    const tabSwitches: Record<string, number> = {};
    const tabFlows: Record<string, number> = {};

    for (const e of navEvents) {
      const props = e.properties as Record<string, unknown>;

      if (e.event_name === "tab_switch") {
        if (props?.to) {
          const to = String(props.to);
          tabSwitches[to] = (tabSwitches[to] || 0) + 1;
        }
        if (props?.from && props?.to) {
          const flow = `${props.from} → ${props.to}`;
          tabFlows[flow] = (tabFlows[flow] || 0) + 1;
        }
      }
    }

    const navigationBreakdown = {
      totalEvents: navEvents.length,
      tabVisits: Object.entries(tabSwitches)
        .map(([tab, count]) => ({ tab, count }))
        .sort((a, b) => b.count - a.count),
      commonFlows: Object.entries(tabFlows)
        .map(([flow, count]) => ({ flow, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };

    // ========================================
    // Daily Trend (7-day sparkline per category)
    // ========================================
    const categorySparklines: Record<string, number[]> = {};
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayEvents = currentEvents.filter(e => {
        const d = new Date(e.created_at);
        return d >= dayStart && d < dayEnd;
      });

      const categories = ["navigation", "map", "calendar", "stella", "profile"];
      for (const cat of categories) {
        if (!categorySparklines[cat]) categorySparklines[cat] = [];
        categorySparklines[cat].push(dayEvents.filter(e => e.event_category === cat).length);
      }
    }

    return NextResponse.json({
      period,
      totalEvents: currentEvents.length,
      featureMatrix: featureMatrix.slice(0, 20),
      map: mapBreakdown,
      calendar: calendarBreakdown,
      stella: stellaBreakdown,
      profile: profileBreakdown,
      navigation: navigationBreakdown,
      sparklines: categorySparklines,
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Features API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch features data" },
      { status: 500 }
    );
  }
}
