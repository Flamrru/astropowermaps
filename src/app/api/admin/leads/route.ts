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
    // Filter out test purchases (test@example.com and amounts under $1)
    let purchasesQuery = supabaseAdmin
      .from("astro_purchases")
      .select("id, email, amount_cents, lead_id, status, completed_at")
      .neq("email", "test@example.com")
      .gte("amount_cents", 100); // Exclude test amounts under $1

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
      // Try to find lead by lead_id first, then by email
      let lead = leads?.find(l => l.id === purchase.lead_id);
      if (!lead && purchase.email) {
        lead = leads?.find(l => l.email === purchase.email);
      }
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

    // Create maps of lead_id and email to purchase info
    const purchasesByLeadId = new Map<string, { amount_cents: number; completed_at: string }>();
    const purchasesByEmail = new Map<string, { amount_cents: number; completed_at: string }>();
    const purchasedEmails = new Set<string>();

    completedPurchases.forEach(p => {
      const purchaseInfo = { amount_cents: p.amount_cents, completed_at: p.completed_at };
      if (p.lead_id) {
        purchasesByLeadId.set(p.lead_id, purchaseInfo);
      }
      if (p.email) {
        purchasesByEmail.set(p.email, purchaseInfo);
        purchasedEmails.add(p.email);
      }
    });

    // Add purchase details to leads (check by lead_id first, then by email)
    const leadsWithPurchaseStatus = leads?.map(lead => {
      const purchaseById = purchasesByLeadId.get(lead.id);
      const purchaseByEmail = purchasesByEmail.get(lead.email);
      const purchase = purchaseById || purchaseByEmail;
      const hasPurchased = purchasedLeadIds.has(lead.id) || purchasedEmails.has(lead.email);

      return {
        ...lead,
        has_purchased: hasPurchased,
        purchase_amount: purchase?.amount_cents || null,
        purchase_date: purchase?.completed_at || null,
      };
    }) || [];

    // Calculate analytics
    const analytics = {
      // Zodiac sign distribution
      zodiacSigns: {} as Record<string, number>,
      // Age distribution
      ageRanges: {
        "18-24": 0,
        "25-34": 0,
        "35-44": 0,
        "45-54": 0,
        "55-64": 0,
        "65+": 0,
        "unknown": 0,
      } as Record<string, number>,
      // Location distribution (by country)
      countries: {} as Record<string, number>,
      // Birth data stats
      withBirthData: 0,
      withoutBirthData: 0,
      // Purchase stats
      purchased: 0,
      notPurchased: 0,
    };

    const getZodiacSign = (date: string): string => {
      const d = new Date(date);
      const month = d.getMonth() + 1;
      const day = d.getDate();

      if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
      if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
      if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
      if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
      if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
      if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
      if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
      if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
      if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
      if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
      return "Pisces";
    };

    const getAge = (birthDate: string): number => {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };

    const getCountry = (location: string): string => {
      if (!location) return "Unknown";
      const parts = location.split(", ");
      return parts[parts.length - 1] || "Unknown";
    };

    leadsWithPurchaseStatus.forEach(lead => {
      // Birth data stats
      if (lead.birth_date) {
        analytics.withBirthData++;

        // Zodiac
        const sign = getZodiacSign(lead.birth_date);
        analytics.zodiacSigns[sign] = (analytics.zodiacSigns[sign] || 0) + 1;

        // Age
        const age = getAge(lead.birth_date);
        if (age >= 18 && age <= 24) analytics.ageRanges["18-24"]++;
        else if (age >= 25 && age <= 34) analytics.ageRanges["25-34"]++;
        else if (age >= 35 && age <= 44) analytics.ageRanges["35-44"]++;
        else if (age >= 45 && age <= 54) analytics.ageRanges["45-54"]++;
        else if (age >= 55 && age <= 64) analytics.ageRanges["55-64"]++;
        else if (age >= 65) analytics.ageRanges["65+"]++;
        else analytics.ageRanges["unknown"]++;
      } else {
        analytics.withoutBirthData++;
        analytics.ageRanges["unknown"]++;
      }

      // Location
      if (lead.birth_location_name) {
        const country = getCountry(lead.birth_location_name);
        analytics.countries[country] = (analytics.countries[country] || 0) + 1;
      }

      // Purchase status
      if (lead.has_purchased) {
        analytics.purchased++;
      } else {
        analytics.notPurchased++;
      }
    });

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
      analytics,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
