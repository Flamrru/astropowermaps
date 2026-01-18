import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

const COOKIE_NAME = "tracking_session";

/**
 * Variant configuration - maps codes to display info
 */
const VARIANT_CONFIG: Record<string, { label: string; price_cents: number }> = {
  control: { label: "$19.99 (Control)", price_cents: 1999 },
  x14ts: { label: "$14.99", price_cents: 1499 },
  x24ts: { label: "$24.99", price_cents: 2499 },
  x29ts: { label: "$29.99", price_cents: 2999 },
};

interface VariantData {
  code: string;
  label: string;
  price_cents: number;
  leads: number;
  purchases: number;
  conversion_rate: number;
  revenue_per_lead: number;
  total_revenue_cents: number;
  is_winner: boolean;
  confidence: "reliable" | "needs_data";
}

interface DailyTrend {
  date: string;
  variant: string;
  revenue_per_lead: number;
  leads: number;
  purchases: number;
}

interface ABPriceTestResponse {
  variants: VariantData[];
  daily_trends: DailyTrend[];
  totals: {
    leads: number;
    purchases: number;
    revenue_cents: number;
  };
  generated_at: string;
}

/**
 * GET /api/tracking/ab-price-test
 *
 * Returns A/B price test performance data:
 * - Per-variant metrics (leads, purchases, conversion, revenue)
 * - Daily trends for charting
 * - Winner determination based on revenue per lead
 */
export async function GET() {
  // Check authentication
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);

  if (session?.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all leads with their variant codes
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from("astro_leads")
      .select("id, session_id, price_variant_code, created_at")
      .order("created_at", { ascending: true })
      .limit(10000); // Override default 1000 limit

    if (leadsError) {
      console.error("Failed to fetch leads:", leadsError);
      return NextResponse.json(
        { error: "Failed to fetch leads data" },
        { status: 500 }
      );
    }

    // Fetch completed purchases
    const { data: purchases, error: purchasesError } = await supabaseAdmin
      .from("astro_purchases")
      .select("session_id, amount_cents, completed_at, metadata")
      .eq("status", "completed");

    if (purchasesError) {
      console.error("Failed to fetch purchases:", purchasesError);
      return NextResponse.json(
        { error: "Failed to fetch purchases data" },
        { status: 500 }
      );
    }

    // Build a set of session IDs that have completed purchases
    const purchasedSessionIds = new Set(purchases?.map((p) => p.session_id) || []);

    // Build a map of session_id -> purchase data for revenue calculation
    const purchaseBySession = new Map<string, { amount_cents: number; completed_at: string }>();
    for (const purchase of purchases || []) {
      // Get actual amount from metadata if available, otherwise use amount_cents
      const metadata = purchase.metadata as Record<string, unknown> | null;
      const planId = metadata?.plan_id as string | undefined;

      // Determine price based on plan_id
      let actualAmount = purchase.amount_cents || 1999;
      if (planId === "one_time_14") actualAmount = 1499;
      else if (planId === "one_time_24") actualAmount = 2499;
      else if (planId === "one_time_29") actualAmount = 2999;
      else if (planId === "one_time" || planId === "winback") actualAmount = purchase.amount_cents || 1999;

      purchaseBySession.set(purchase.session_id, {
        amount_cents: actualAmount,
        completed_at: purchase.completed_at || "",
      });
    }

    // Group leads by variant code
    const variantStats: Record<string, { leads: number; purchases: number; revenue_cents: number }> = {
      control: { leads: 0, purchases: 0, revenue_cents: 0 },
      x14ts: { leads: 0, purchases: 0, revenue_cents: 0 },
      x24ts: { leads: 0, purchases: 0, revenue_cents: 0 },
      x29ts: { leads: 0, purchases: 0, revenue_cents: 0 },
    };

    // Daily trends aggregation
    const dailyMap = new Map<string, Record<string, { leads: number; purchases: number; revenue_cents: number }>>();

    for (const lead of leads || []) {
      // Normalize variant code: null/empty → "control"
      const variantCode = lead.price_variant_code || "control";

      // Skip unknown variants
      if (!variantStats[variantCode]) continue;

      // Count lead
      variantStats[variantCode].leads += 1;

      // Check if this lead converted
      const isPurchased = purchasedSessionIds.has(lead.session_id);
      if (isPurchased) {
        variantStats[variantCode].purchases += 1;

        // Get actual purchase amount
        const purchaseData = purchaseBySession.get(lead.session_id);
        const revenueCents = purchaseData?.amount_cents || VARIANT_CONFIG[variantCode]?.price_cents || 1999;
        variantStats[variantCode].revenue_cents += revenueCents;
      }

      // Aggregate daily stats
      const dateStr = lead.created_at?.substring(0, 10) || "";
      if (dateStr) {
        if (!dailyMap.has(dateStr)) {
          dailyMap.set(dateStr, {
            control: { leads: 0, purchases: 0, revenue_cents: 0 },
            x14ts: { leads: 0, purchases: 0, revenue_cents: 0 },
            x24ts: { leads: 0, purchases: 0, revenue_cents: 0 },
            x29ts: { leads: 0, purchases: 0, revenue_cents: 0 },
          });
        }
        const dayStats = dailyMap.get(dateStr)!;
        if (dayStats[variantCode]) {
          dayStats[variantCode].leads += 1;
          if (isPurchased) {
            dayStats[variantCode].purchases += 1;
            const purchaseData = purchaseBySession.get(lead.session_id);
            const revenueCents = purchaseData?.amount_cents || VARIANT_CONFIG[variantCode]?.price_cents || 1999;
            dayStats[variantCode].revenue_cents += revenueCents;
          }
        }
      }
    }

    // Build variant data array
    const variants: VariantData[] = [];
    let totalLeads = 0;
    let totalPurchases = 0;
    let totalRevenueCents = 0;
    let bestRevenuePerLead = 0;
    let winnerCode: string | null = null;

    // First pass: calculate metrics and find potential winner
    for (const [code, stats] of Object.entries(variantStats)) {
      // Skip variants with no leads
      if (stats.leads === 0) continue;

      const config = VARIANT_CONFIG[code];
      const conversionRate = stats.leads > 0 ? (stats.purchases / stats.leads) * 100 : 0;
      const revenuePerLead = stats.leads > 0 ? stats.revenue_cents / stats.leads / 100 : 0;
      const confidence: "reliable" | "needs_data" = stats.leads >= 100 ? "reliable" : "needs_data";

      // Track winner (only among reliable variants, or all if none are reliable)
      if (confidence === "reliable" && revenuePerLead > bestRevenuePerLead) {
        bestRevenuePerLead = revenuePerLead;
        winnerCode = code;
      }

      totalLeads += stats.leads;
      totalPurchases += stats.purchases;
      totalRevenueCents += stats.revenue_cents;

      variants.push({
        code,
        label: config?.label || code,
        price_cents: config?.price_cents || 1999,
        leads: stats.leads,
        purchases: stats.purchases,
        conversion_rate: Math.round(conversionRate * 10) / 10,
        revenue_per_lead: Math.round(revenuePerLead * 100) / 100,
        total_revenue_cents: stats.revenue_cents,
        is_winner: false, // Will set in second pass
        confidence,
      });
    }

    // If no reliable winners, pick the best among unreliable with 10+ leads
    if (!winnerCode) {
      for (const v of variants) {
        if (v.leads >= 10 && v.revenue_per_lead > bestRevenuePerLead) {
          bestRevenuePerLead = v.revenue_per_lead;
          winnerCode = v.code;
        }
      }
    }

    // Second pass: mark the winner
    for (const v of variants) {
      v.is_winner = v.code === winnerCode;
    }

    // Sort variants by revenue per lead (descending)
    variants.sort((a, b) => b.revenue_per_lead - a.revenue_per_lead);

    // Build daily trends array (last 30 days)
    const dailyTrends: DailyTrend[] = [];
    const sortedDates = Array.from(dailyMap.keys()).sort();
    const recentDates = sortedDates.slice(-30);

    for (const date of recentDates) {
      const dayStats = dailyMap.get(date)!;
      for (const [code, stats] of Object.entries(dayStats)) {
        if (stats.leads === 0) continue;
        const config = VARIANT_CONFIG[code];
        dailyTrends.push({
          date,
          variant: config?.label || code,
          revenue_per_lead: stats.leads > 0 ? Math.round((stats.revenue_cents / stats.leads) / 100 * 100) / 100 : 0,
          leads: stats.leads,
          purchases: stats.purchases,
        });
      }
    }

    const response: ABPriceTestResponse = {
      variants,
      daily_trends: dailyTrends,
      totals: {
        leads: totalLeads,
        purchases: totalPurchases,
        revenue_cents: totalRevenueCents,
      },
      generated_at: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("A/B price test API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch A/B test data" },
      { status: 500 }
    );
  }
}
