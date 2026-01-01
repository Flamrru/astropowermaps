import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

const COOKIE_NAME = "admin_session";

type Period = "today" | "week" | "month" | "all";

// Get the start date for a period
function getPeriodStart(period: Period): Date | null {
  const now = new Date();
  switch (period) {
    case "today":
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      return today;
    case "week":
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      return weekAgo;
    case "month":
      const monthAgo = new Date(now);
      monthAgo.setDate(monthAgo.getDate() - 30);
      monthAgo.setHours(0, 0, 0, 0);
      return monthAgo;
    case "all":
    default:
      return null;
  }
}

export async function GET(request: NextRequest) {
  // Check authentication
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);

  if (session?.value !== "authenticated") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Get period from query params
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") as Period) || "all";
  const periodStart = getPeriodStart(period);

  try {
    // Build leads query with optional period filter
    let leadsQuery = supabaseAdmin
      .from("astro_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (periodStart) {
      leadsQuery = leadsQuery.gte("created_at", periodStart.toISOString());
    }

    const { data: leads, error } = await leadsQuery;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch leads" },
        { status: 500 }
      );
    }

    // Calculate time-based stats (always from all leads for context)
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now);
    monthStart.setDate(monthStart.getDate() - 30);

    // Fetch ALL leads for stats (not filtered by period)
    const { data: allLeads } = await supabaseAdmin
      .from("astro_leads")
      .select("created_at");

    const stats = {
      total: allLeads?.length || 0,
      today: allLeads?.filter(l => new Date(l.created_at) >= todayStart).length || 0,
      thisWeek: allLeads?.filter(l => new Date(l.created_at) >= weekStart).length || 0,
      thisMonth: allLeads?.filter(l => new Date(l.created_at) >= monthStart).length || 0,
    };

    // Fetch funnel events with period filter
    let funnelQuery = supabaseAdmin
      .from("astro_funnel_events")
      .select("event_name");

    if (periodStart) {
      funnelQuery = funnelQuery.gte("created_at", periodStart.toISOString());
    }

    const { data: funnelEvents } = await funnelQuery;

    // Count each funnel event type
    const funnelCounts: Record<string, number> = {
      page_view: leads?.length || 0,
      quiz_start: 0,
      q1_answered: 0,
      q2_answered: 0,
      email_screen: 0,
      lead: leads?.length || 0,
      purchase: 0,
    };

    funnelEvents?.forEach((event) => {
      if (event.event_name in funnelCounts) {
        funnelCounts[event.event_name]++;
      }
    });

    // Fetch purchases with period filter for revenue metrics
    let purchasesQuery = supabaseAdmin
      .from("astro_purchases")
      .select("id, amount_cents, lead_id, status, completed_at");

    if (periodStart) {
      purchasesQuery = purchasesQuery.gte("completed_at", periodStart.toISOString());
    }

    const { data: purchases } = await purchasesQuery;

    // Filter to completed purchases only
    const completedPurchases = purchases?.filter(p => p.status === "completed") || [];

    // Update funnel purchase count
    funnelCounts.purchase = completedPurchases.length;

    // Calculate revenue metrics
    const totalRevenue = completedPurchases.reduce((sum, p) => sum + (p.amount_cents || 0), 0);
    const purchaseCount = completedPurchases.length;
    const leadCount = leads?.length || 0;
    const conversionRate = leadCount > 0 ? purchaseCount / leadCount : 0;
    const averageOrderValue = purchaseCount > 0 ? totalRevenue / purchaseCount : 0;

    // Get lead IDs that have purchased (for badge display)
    const purchasedLeadIds = new Set(completedPurchases.map(p => p.lead_id).filter(Boolean));

    // Revenue by UTM source - need to join with leads
    const revenueBySource: Record<string, { revenue: number; purchases: number; leads: number }> = {};

    // Initialize sources from leads
    leads?.forEach(lead => {
      const source = lead.utm_source || "direct";
      if (!revenueBySource[source]) {
        revenueBySource[source] = { revenue: 0, purchases: 0, leads: 0 };
      }
      revenueBySource[source].leads++;
    });

    // Add revenue from purchases
    completedPurchases.forEach(purchase => {
      const lead = leads?.find(l => l.id === purchase.lead_id);
      const source = lead?.utm_source || "direct";
      if (!revenueBySource[source]) {
        revenueBySource[source] = { revenue: 0, purchases: 0, leads: 0 };
      }
      revenueBySource[source].revenue += purchase.amount_cents || 0;
      revenueBySource[source].purchases++;
    });

    // Convert to array and calculate conversion rates
    const bySource = Object.entries(revenueBySource)
      .map(([source, data]) => ({
        source,
        revenue: data.revenue,
        purchases: data.purchases,
        leads: data.leads,
        conversionRate: data.leads > 0 ? data.purchases / data.leads : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Add has_purchased flag to leads
    const leadsWithPurchaseStatus = leads?.map(lead => ({
      ...lead,
      has_purchased: purchasedLeadIds.has(lead.id),
    })) || [];

    return NextResponse.json({
      period,
      leads: leadsWithPurchaseStatus,
      stats,
      funnel: funnelCounts,
      revenue: {
        total: totalRevenue,
        purchaseCount,
        conversionRate,
        averageOrderValue,
        bySource,
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
