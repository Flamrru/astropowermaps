import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

const COOKIE_NAME = "tracking_session";

/**
 * GET /api/tracking/journeys
 *
 * Returns user journey analysis:
 * - Entry points distribution (first event of each session)
 * - Common navigation paths
 * - Feature-to-Stella conversion rates
 * - Drop-off points (last event of each session)
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
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all events from last 30 days ordered by session and time
    const { data: allEvents } = await supabaseAdmin
      .from("app_events")
      .select("session_id, event_name, event_category, properties, created_at")
      .not("session_id", "is", null)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("session_id", { ascending: true })
      .order("created_at", { ascending: true });

    if (!allEvents || allEvents.length === 0) {
      return NextResponse.json({
        entryPoints: [],
        exitPoints: [],
        commonPaths: [],
        conversionFunnel: [],
        totalSessions: 0,
        generatedAt: now.toISOString(),
      });
    }

    // ========================================
    // Group events by session
    // ========================================
    const sessionEvents = new Map<string, typeof allEvents>();

    for (const event of allEvents) {
      if (!sessionEvents.has(event.session_id)) {
        sessionEvents.set(event.session_id, []);
      }
      sessionEvents.get(event.session_id)!.push(event);
    }

    // ========================================
    // Entry Points (first event of each session)
    // ========================================
    const entryPointCounts: Record<string, number> = {};

    for (const [, events] of sessionEvents) {
      if (events.length === 0) continue;
      const firstEvent = events[0];
      // Use the screen/feature from tab_switch or infer from category
      let entryPoint = firstEvent.event_category || "unknown";

      // If it's a tab_switch, get the destination
      if (firstEvent.event_name === "tab_switch") {
        const props = firstEvent.properties as Record<string, unknown> | null;
        entryPoint = (props?.to as string) || entryPoint;
      }

      entryPointCounts[entryPoint] = (entryPointCounts[entryPoint] || 0) + 1;
    }

    const totalSessions = sessionEvents.size;
    const entryPoints = Object.entries(entryPointCounts)
      .map(([point, count]) => ({
        point,
        count,
        percentage: Math.round((count / totalSessions) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // ========================================
    // Exit Points (last event of each session)
    // ========================================
    const exitPointCounts: Record<string, number> = {};

    for (const [, events] of sessionEvents) {
      if (events.length === 0) continue;
      const lastEvent = events[events.length - 1];
      let exitPoint = lastEvent.event_category || "unknown";

      if (lastEvent.event_name === "tab_switch") {
        const props = lastEvent.properties as Record<string, unknown> | null;
        exitPoint = (props?.to as string) || exitPoint;
      }

      exitPointCounts[exitPoint] = (exitPointCounts[exitPoint] || 0) + 1;
    }

    const exitPoints = Object.entries(exitPointCounts)
      .map(([point, count]) => ({
        point,
        count,
        percentage: Math.round((count / totalSessions) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // ========================================
    // Common Navigation Paths (2-3 step sequences)
    // ========================================
    const pathCounts: Record<string, number> = {};

    for (const [, events] of sessionEvents) {
      // Get unique categories in order (dedupe consecutive same category)
      const categories: string[] = [];
      let lastCat = "";

      for (const event of events) {
        let cat = event.event_category || "unknown";
        if (event.event_name === "tab_switch") {
          const props = event.properties as Record<string, unknown> | null;
          cat = (props?.to as string) || cat;
        }
        if (cat !== lastCat) {
          categories.push(cat);
          lastCat = cat;
        }
      }

      // Generate 3-step paths
      for (let i = 0; i < categories.length - 2; i++) {
        const path = `${categories[i]} → ${categories[i + 1]} → ${categories[i + 2]}`;
        pathCounts[path] = (pathCounts[path] || 0) + 1;
      }
    }

    const commonPaths = Object.entries(pathCounts)
      .filter(([, count]) => count >= 2) // Only show paths that occurred at least twice
      .map(([path, count]) => ({
        path,
        count,
        percentage: Math.round((count / totalSessions) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // ========================================
    // Conversion Funnel (Feature → Stella conversion)
    // ========================================
    const categoryToStella: Record<string, { total: number; converted: number }> = {};

    for (const [, events] of sessionEvents) {
      // Track which categories were used in this session
      const categoriesInSession = new Set<string>();
      let usedStella = false;

      for (const event of events) {
        const cat = event.event_category || "unknown";
        categoriesInSession.add(cat);

        if (cat === "stella") {
          usedStella = true;
        }
      }

      // For each category, track if this session also used Stella
      for (const cat of categoriesInSession) {
        if (cat === "stella") continue; // Skip stella itself

        if (!categoryToStella[cat]) {
          categoryToStella[cat] = { total: 0, converted: 0 };
        }
        categoryToStella[cat].total++;
        if (usedStella) {
          categoryToStella[cat].converted++;
        }
      }
    }

    const conversionFunnel = Object.entries(categoryToStella)
      .filter(([, data]) => data.total >= 5) // Only show categories with enough data
      .map(([category, data]) => ({
        category,
        sessions: data.total,
        stellaConversions: data.converted,
        conversionRate: Math.round((data.converted / data.total) * 100),
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, 8);

    // ========================================
    // Session Flow Stats
    // ========================================
    let totalEvents = 0;
    let totalCategories = 0;

    for (const [, events] of sessionEvents) {
      totalEvents += events.length;
      const uniqueCats = new Set(events.map(e => e.event_category));
      totalCategories += uniqueCats.size;
    }

    const avgEventsPerSession = Math.round(totalEvents / totalSessions);
    const avgCategoriesPerSession = (totalCategories / totalSessions).toFixed(1);

    return NextResponse.json({
      entryPoints,
      exitPoints,
      commonPaths,
      conversionFunnel,
      stats: {
        totalSessions,
        avgEventsPerSession,
        avgCategoriesPerSession,
      },
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Journeys API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch journeys data" },
      { status: 500 }
    );
  }
}
