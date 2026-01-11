import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { categorizeMessage, type TopicKey } from "@/lib/tracking";

const COOKIE_NAME = "tracking_session";

/**
 * GET /api/tracking/data
 *
 * Returns aggregate metrics for the tracking dashboard:
 * - DAU/WAU/MAU
 * - Feature usage by screen
 * - Stella message volume
 * - Topic breakdown
 *
 * Query params:
 * - from: ISO date string
 * - to: ISO date string
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
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    // Default to last 30 days if no range specified
    const now = new Date();
    const defaultFrom = new Date(now);
    defaultFrom.setDate(defaultFrom.getDate() - 30);

    const from = fromDate ? new Date(fromDate) : defaultFrom;
    const to = toDate ? new Date(toDate) : now;

    // Ensure 'to' includes the full day
    to.setHours(23, 59, 59, 999);

    const fromISO = from.toISOString();
    const toISO = to.toISOString();

    // Calculate date boundaries for DAU/WAU/MAU
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Run queries in parallel
    const [
      dauResult,
      wauResult,
      mauResult,
      totalUsersResult,
      featureUsageResult,
      stellaMessagesResult,
      stellaByDayResult,
      recentQueriesResult,
    ] = await Promise.all([
      // DAU: Distinct users with events today
      supabaseAdmin
        .from("app_events")
        .select("user_id")
        .not("user_id", "is", null)
        .gte("created_at", todayStart.toISOString()),

      // WAU: Distinct users with events in last 7 days
      supabaseAdmin
        .from("app_events")
        .select("user_id")
        .not("user_id", "is", null)
        .gte("created_at", weekAgo.toISOString()),

      // MAU: Distinct users with events in last 30 days
      supabaseAdmin
        .from("app_events")
        .select("user_id")
        .not("user_id", "is", null)
        .gte("created_at", monthAgo.toISOString()),

      // Total users (from user_profiles)
      supabaseAdmin.from("user_profiles").select("user_id", { count: "exact" }),

      // Feature usage by screen (within date range)
      supabaseAdmin
        .from("app_events")
        .select("properties")
        .eq("event_name", "page_view")
        .gte("created_at", fromISO)
        .lte("created_at", toISO),

      // Total Stella messages (within date range)
      supabaseAdmin
        .from("stella_messages")
        .select("id", { count: "exact" })
        .eq("role", "user")
        .is("deleted_at", null)
        .gte("created_at", fromISO)
        .lte("created_at", toISO),

      // Stella messages by day (within date range)
      supabaseAdmin
        .from("stella_messages")
        .select("created_at")
        .eq("role", "user")
        .is("deleted_at", null)
        .gte("created_at", fromISO)
        .lte("created_at", toISO)
        .order("created_at", { ascending: true }),

      // Recent user queries for topic analysis
      supabaseAdmin
        .from("stella_messages")
        .select("content, created_at")
        .eq("role", "user")
        .is("deleted_at", null)
        .gte("created_at", fromISO)
        .lte("created_at", toISO)
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    // Calculate distinct user counts
    const dau = new Set(dauResult.data?.map((e) => e.user_id) || []).size;
    const wau = new Set(wauResult.data?.map((e) => e.user_id) || []).size;
    const mau = new Set(mauResult.data?.map((e) => e.user_id) || []).size;
    const totalUsers = totalUsersResult.count || 0;

    // Calculate feature usage by screen
    const featureUsage: Record<string, number> = {};
    for (const event of featureUsageResult.data || []) {
      const screen = (event.properties as Record<string, unknown>)?.screen as string;
      if (screen) {
        featureUsage[screen] = (featureUsage[screen] || 0) + 1;
      }
    }

    // Calculate Stella volume by day
    const stellaByDay: Record<string, number> = {};
    for (const msg of stellaByDayResult.data || []) {
      const date = msg.created_at.split("T")[0];
      stellaByDay[date] = (stellaByDay[date] || 0) + 1;
    }

    // Convert to array format for chart
    const stellaVolumeByDay = Object.entries(stellaByDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate topic breakdown from queries
    const topicCounts: Record<TopicKey, number> = {
      love: 0,
      career: 0,
      saturn_return: 0,
      jupiter: 0,
      timing: 0,
      home: 0,
      growth: 0,
      health: 0,
      general: 0,
    };

    const recentQueries = recentQueriesResult.data || [];
    for (const query of recentQueries) {
      const topics = categorizeMessage(query.content);
      for (const topic of topics) {
        topicCounts[topic]++;
      }
    }

    // Convert to array with percentages
    const totalTopicAssignments = Object.values(topicCounts).reduce((a, b) => a + b, 0);
    const topicBreakdown = Object.entries(topicCounts)
      .map(([topic, count]) => ({
        topic: topic as TopicKey,
        count,
        percentage: totalTopicAssignments > 0 ? Math.round((count / totalTopicAssignments) * 100) : 0,
      }))
      .filter((t) => t.count > 0)
      .sort((a, b) => b.count - a.count);

    // Calculate common questions (group similar queries)
    const queryGroups: Record<string, { count: number; example: string }> = {};
    for (const query of recentQueries.slice(0, 200)) {
      // Normalize query for grouping
      const normalized = query.content
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .trim()
        .substring(0, 50);

      if (normalized.length > 10) {
        if (!queryGroups[normalized]) {
          queryGroups[normalized] = { count: 0, example: query.content };
        }
        queryGroups[normalized].count++;
      }
    }

    const commonQuestions = Object.values(queryGroups)
      .filter((q) => q.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((q) => ({
        question: q.example.length > 100 ? q.example.substring(0, 100) + "..." : q.example,
        count: q.count,
      }));

    return NextResponse.json({
      metrics: {
        dau,
        wau,
        mau,
        totalUsers,
      },
      featureUsage,
      stella: {
        total: stellaMessagesResult.count || 0,
        byDay: stellaVolumeByDay,
      },
      topicBreakdown,
      commonQuestions,
      dateRange: {
        from: fromISO,
        to: toISO,
      },
    });
  } catch (error) {
    console.error("Tracking data API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking data" },
      { status: 500 }
    );
  }
}
