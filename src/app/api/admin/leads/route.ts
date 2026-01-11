import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/stripe-config";

const COOKIE_NAME = "admin_session";

// Subscription launch date (Jan 7, 2026 Swiss time)
const SUBSCRIPTION_LAUNCH = new Date("2026-01-07T00:00:00+01:00");

// Funnel tracking start date (Dec 31, 2025 - when we started tracking funnel events)
const FUNNEL_TRACKING_START = new Date("2025-12-31T00:00:00+00:00");

// ========== STRIPE DATA TYPES ==========
interface StripeSubscriptionInfo {
  status: string;           // trialing, active, past_due, canceled, etc.
  trialEnd: string | null;  // ISO date
  cancelAt: string | null;  // ISO date (scheduled cancellation)
  canceledAt: string | null; // ISO date (actual cancellation)
  currentPeriodEnd: string; // ISO date
  recurringAmount: number;  // subscription price in cents
}

interface StripePaymentInfo {
  totalPaid: number;        // LTV - sum of all successful payments in cents
  lastPaymentAmount: number; // Most recent payment amount
  lastPaymentDate: string;   // ISO date
  paymentCount: number;      // Number of successful payments
}

// In-memory cache with TTL
let stripeCache: {
  subscriptions: Map<string, StripeSubscriptionInfo> | null;
  payments: Map<string, StripePaymentInfo> | null;
  timestamp: number;
} = { subscriptions: null, payments: null, timestamp: 0 };

const STRIPE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Get Stripe instance
function getStripe(): Stripe {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error("Stripe secret key is not configured");
  }
  return new Stripe(key);
}

// Fetch all subscriptions from Stripe (with caching)
async function fetchStripeSubscriptions(forceRefresh = false): Promise<Map<string, StripeSubscriptionInfo>> {
  // Check cache
  if (!forceRefresh && stripeCache.subscriptions && Date.now() - stripeCache.timestamp < STRIPE_CACHE_TTL) {
    return stripeCache.subscriptions;
  }

  const stripe = getStripe();
  const emailToSubscription = new Map<string, StripeSubscriptionInfo>();

  // Fetch all subscriptions (paginated - handle up to 300)
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const params: Stripe.SubscriptionListParams = {
      limit: 100,
      expand: ["data.customer"],
    };
    if (startingAfter) params.starting_after = startingAfter;

    const subscriptions = await stripe.subscriptions.list(params);

    for (const sub of subscriptions.data) {
      const customer = sub.customer as Stripe.Customer;
      if (customer.email) {
        // Get current_period_end from subscription items (where it's stored in Stripe's type system)
        const currentPeriodEnd = sub.items.data[0]?.current_period_end;
        emailToSubscription.set(customer.email.toLowerCase(), {
          status: sub.status,
          trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
          canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
          currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : new Date().toISOString(),
          recurringAmount: sub.items.data[0]?.price?.unit_amount || 0,
        });
      }
    }

    hasMore = subscriptions.has_more;
    if (hasMore && subscriptions.data.length > 0) {
      startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
    }
  }

  return emailToSubscription;
}

// Fetch payment history from Stripe (for LTV and actual amounts)
async function fetchStripePayments(): Promise<Map<string, StripePaymentInfo>> {
  // Check cache (payments are fetched together with subscriptions)
  if (stripeCache.payments && Date.now() - stripeCache.timestamp < STRIPE_CACHE_TTL) {
    return stripeCache.payments;
  }

  const stripe = getStripe();
  const paymentsByEmail = new Map<string, { amounts: number[]; dates: string[] }>();

  // Fetch all successful charges (paginated - handle up to 300)
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const params: Stripe.ChargeListParams = {
      limit: 100,
      expand: ["data.customer"],
    };
    if (startingAfter) params.starting_after = startingAfter;

    const charges = await stripe.charges.list(params);

    for (const charge of charges.data) {
      if (charge.status !== "succeeded") continue;

      const customer = charge.customer as Stripe.Customer | null;
      const email = customer?.email || charge.billing_details?.email;

      if (email) {
        const key = email.toLowerCase();
        if (!paymentsByEmail.has(key)) {
          paymentsByEmail.set(key, { amounts: [], dates: [] });
        }
        paymentsByEmail.get(key)!.amounts.push(charge.amount);
        paymentsByEmail.get(key)!.dates.push(new Date(charge.created * 1000).toISOString());
      }
    }

    hasMore = charges.has_more;
    if (hasMore && charges.data.length > 0) {
      startingAfter = charges.data[charges.data.length - 1].id;
    }
  }

  // Calculate totals
  const emailToPayments = new Map<string, StripePaymentInfo>();
  for (const [email, data] of paymentsByEmail) {
    emailToPayments.set(email, {
      totalPaid: data.amounts.reduce((sum, a) => sum + a, 0), // LTV
      lastPaymentAmount: data.amounts[0] || 0, // Most recent (first in list from Stripe)
      lastPaymentDate: data.dates[0] || "",
      paymentCount: data.amounts.length,
    });
  }

  return emailToPayments;
}

// Fetch all Stripe data (subscriptions + payments) with caching
async function fetchStripeData(forceRefresh = false): Promise<{
  subscriptions: Map<string, StripeSubscriptionInfo>;
  payments: Map<string, StripePaymentInfo>;
}> {
  // Check cache
  if (!forceRefresh && stripeCache.subscriptions && stripeCache.payments &&
      Date.now() - stripeCache.timestamp < STRIPE_CACHE_TTL) {
    return {
      subscriptions: stripeCache.subscriptions,
      payments: stripeCache.payments,
    };
  }

  // Fetch both in parallel
  const [subscriptions, payments] = await Promise.all([
    fetchStripeSubscriptions(forceRefresh),
    fetchStripePayments(),
  ]);

  // Update cache
  stripeCache = {
    subscriptions,
    payments,
    timestamp: Date.now(),
  };

  return { subscriptions, payments };
}

type Period = "today" | "week" | "month" | "all";

// Zurich timezone for day cutoff
const ZURICH_TZ = "Europe/Zurich";

// Get the start of today in Zurich timezone (00:00 Zurich time)
function getZurichDayStart(daysAgo = 0): Date {
  // Get current time formatted in Zurich timezone
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZURICH_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Get today's date in Zurich
  const now = new Date();
  const zurichDateStr = formatter.format(now); // "YYYY-MM-DD"

  // Parse it and subtract days if needed
  const [year, month, day] = zurichDateStr.split("-").map(Number);
  const zurichDate = new Date(Date.UTC(year, month - 1, day));

  if (daysAgo > 0) {
    zurichDate.setUTCDate(zurichDate.getUTCDate() - daysAgo);
  }

  // Convert Zurich 00:00 to UTC
  // Zurich is UTC+1 in winter, UTC+2 in summer
  // Get the offset for this specific date
  const testDate = new Date(zurichDate);
  const zurichOffset = getZurichOffset(testDate);

  // Zurich 00:00 = UTC (00:00 - offset)
  return new Date(zurichDate.getTime() - zurichOffset * 60 * 1000);
}

// Get Zurich timezone offset in minutes for a given date
function getZurichOffset(date: Date): number {
  // Create a date string in Zurich timezone and parse it to find the offset
  const zurichStr = date.toLocaleString("en-US", { timeZone: ZURICH_TZ });
  const zurichDate = new Date(zurichStr);
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  return (zurichDate.getTime() - utcDate.getTime()) / 60000;
}

// Get the start date for a legacy period (using Zurich timezone)
function getPeriodStart(period: Period): Date | null {
  switch (period) {
    case "today":
      return getZurichDayStart(0);
    case "week":
      return getZurichDayStart(7);
    case "month":
      return getZurichDayStart(30);
    case "all":
    default:
      return null;
  }
}

// Parse date range from query params (new system)
function parseDateRange(searchParams: URLSearchParams): { from: Date | null; to: Date | null } {
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");

  if (fromStr && toStr) {
    const from = new Date(fromStr);
    const to = new Date(toStr);
    // Set to end of day for 'to' date
    to.setHours(23, 59, 59, 999);
    return { from, to };
  }

  return { from: null, to: null };
}

// Get comparison period (previous period of same length)
function getComparisonPeriod(from: Date, to: Date): { compareFrom: Date; compareTo: Date } {
  const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  const compareFrom = new Date(from);
  compareFrom.setDate(compareFrom.getDate() - daysDiff);
  const compareTo = new Date(to);
  compareTo.setDate(compareTo.getDate() - daysDiff);
  return { compareFrom, compareTo };
}

// Determine granularity based on date range
function getGranularity(daysDiff: number): "daily" | "weekly" | "monthly" {
  if (daysDiff < 30) return "daily";
  if (daysDiff < 90) return "weekly";
  return "monthly";
}

// Group data points by granularity
function groupByGranularity(
  dates: Date[],
  granularity: "daily" | "weekly" | "monthly"
): Map<string, number> {
  const groups = new Map<string, number>();

  dates.forEach(date => {
    let key: string;
    if (granularity === "daily") {
      key = date.toISOString().split("T")[0];
    } else if (granularity === "weekly") {
      // Get start of week (Monday)
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      d.setDate(diff);
      key = d.toISOString().split("T")[0];
    } else {
      // Monthly
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }
    groups.set(key, (groups.get(key) || 0) + 1);
  });

  return groups;
}

// Format date label based on granularity
function formatLabel(dateKey: string, granularity: "daily" | "weekly" | "monthly"): string {
  const date = new Date(dateKey);
  if (granularity === "daily") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } else if (granularity === "weekly") {
    return `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  } else {
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
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

  // Get period from query params (support both new and legacy systems)
  const { searchParams } = new URL(request.url);
  const forceStripeRefresh = searchParams.get("refreshStripe") === "true";

  // New system: explicit from/to dates
  const { from: dateFrom, to: dateTo } = parseDateRange(searchParams);

  // Legacy system: period presets
  const period = (searchParams.get("period") as Period) || "all";
  const periodStart = getPeriodStart(period);

  // Determine the effective date range (new system takes precedence)
  let effectiveFrom: Date | null = null;
  let effectiveTo: Date | null = null;

  if (dateFrom && dateTo) {
    effectiveFrom = dateFrom;
    effectiveTo = dateTo;
  } else if (periodStart) {
    effectiveFrom = periodStart;
    effectiveTo = new Date(); // Now
  }

  // Calculate comparison period (previous period of same length)
  let comparisonFrom: Date | null = null;
  let comparisonTo: Date | null = null;
  if (effectiveFrom && effectiveTo) {
    const { compareFrom, compareTo } = getComparisonPeriod(effectiveFrom, effectiveTo);
    comparisonFrom = compareFrom;
    comparisonTo = compareTo;
  }

  // Calculate days in range for granularity
  const daysDiff = effectiveFrom && effectiveTo
    ? Math.ceil((effectiveTo.getTime() - effectiveFrom.getTime()) / (1000 * 60 * 60 * 24))
    : 365; // Default to yearly granularity for "all"
  const granularity = getGranularity(daysDiff);

  try {
    // Build leads query with optional date range filter
    let leadsQuery = supabaseAdmin
      .from("astro_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (effectiveFrom) {
      leadsQuery = leadsQuery.gte("created_at", effectiveFrom.toISOString());
    }
    if (effectiveTo) {
      leadsQuery = leadsQuery.lte("created_at", effectiveTo.toISOString());
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
    // Using Zurich timezone for day boundaries (00:00 Zurich time)
    const todayStart = getZurichDayStart(0);   // Today 00:00 Zurich
    const weekStart = getZurichDayStart(7);    // 7 days ago 00:00 Zurich
    const monthStart = getZurichDayStart(30);  // 30 days ago 00:00 Zurich

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

    // Fetch funnel events with date range filter (include session_id for deduplication)
    let funnelQuery = supabaseAdmin
      .from("astro_funnel_events")
      .select("event_name, session_id, created_at");

    if (effectiveFrom) {
      funnelQuery = funnelQuery.gte("created_at", effectiveFrom.toISOString());
    }
    if (effectiveTo) {
      funnelQuery = funnelQuery.lte("created_at", effectiveTo.toISOString());
    }

    const { data: funnelEvents } = await funnelQuery;

    // Fetch comparison period funnel events
    let comparisonFunnelEvents: typeof funnelEvents = [];
    if (comparisonFrom && comparisonTo) {
      const { data: compFunnel } = await supabaseAdmin
        .from("astro_funnel_events")
        .select("event_name, session_id, created_at")
        .gte("created_at", comparisonFrom.toISOString())
        .lte("created_at", comparisonTo.toISOString());
      comparisonFunnelEvents = compFunnel || [];
    }

    // Deduplicate funnel events: count unique sessions per event type
    // This prevents counting the same user multiple times if they refresh/restart
    const deduplicateFunnelEvents = (events: typeof funnelEvents) => {
      const sessionsByEvent = new Map<string, Set<string>>();
      events?.forEach((event) => {
        if (!sessionsByEvent.has(event.event_name)) {
          sessionsByEvent.set(event.event_name, new Set());
        }
        if (event.session_id) {
          sessionsByEvent.get(event.event_name)!.add(event.session_id);
        }
      });
      return sessionsByEvent;
    };

    const uniqueSessionsByEvent = deduplicateFunnelEvents(funnelEvents);

    // Get all session_ids that have funnel events (for matching leads)
    const trackedSessionIds = new Set<string>();
    funnelEvents?.forEach((event) => {
      if (event.session_id) {
        trackedSessionIds.add(event.session_id);
      }
    });

    // Count leads that have a matching session_id in funnel events
    // This gives us accurate "lead captured" count for the funnel
    const leadsWithFunnelTracking = leads?.filter(
      (lead) => lead.session_id && trackedSessionIds.has(lead.session_id)
    ) || [];

    // Count each funnel event type (deduplicated by session)
    const funnelCounts: Record<string, number> = {
      page_view: leads?.length || 0, // Total leads in period (for reference)
      quiz_start: uniqueSessionsByEvent.get("quiz_start")?.size || 0,
      q1_answered: uniqueSessionsByEvent.get("q1_answered")?.size || 0,
      q2_answered: uniqueSessionsByEvent.get("q2_answered")?.size || 0,
      email_screen: uniqueSessionsByEvent.get("email_screen")?.size || 0,
      lead: leadsWithFunnelTracking.length, // Only leads with tracked funnel sessions
      purchase: 0,
    };

    // Fetch purchases with date range filter for revenue metrics
    // Filter out test purchases (test@example.com and amounts under $1)
    let purchasesQuery = supabaseAdmin
      .from("astro_purchases")
      .select("id, email, amount_cents, lead_id, status, completed_at, metadata")
      .neq("email", "test@example.com")
      .gte("amount_cents", 100); // Exclude test amounts under $1

    if (effectiveFrom) {
      purchasesQuery = purchasesQuery.gte("completed_at", effectiveFrom.toISOString());
    }
    if (effectiveTo) {
      purchasesQuery = purchasesQuery.lte("completed_at", effectiveTo.toISOString());
    }

    const { data: purchases } = await purchasesQuery;

    // Fetch comparison period purchases
    let comparisonPurchases: typeof purchases = [];
    if (comparisonFrom && comparisonTo) {
      const { data: compPurchases } = await supabaseAdmin
        .from("astro_purchases")
        .select("id, email, amount_cents, lead_id, status, completed_at, metadata")
        .neq("email", "test@example.com")
        .gte("amount_cents", 100)
        .gte("completed_at", comparisonFrom.toISOString())
        .lte("completed_at", comparisonTo.toISOString());
      comparisonPurchases = compPurchases || [];
    }

    // Fetch comparison period leads
    let comparisonLeads: typeof leads = [];
    if (comparisonFrom && comparisonTo) {
      const { data: compLeads } = await supabaseAdmin
        .from("astro_leads")
        .select("*")
        .gte("created_at", comparisonFrom.toISOString())
        .lte("created_at", comparisonTo.toISOString());
      comparisonLeads = compLeads || [];
    }

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

    // Deduplicate leads by email - keep the lead that purchased, or the most recent one
    // This prevents showing the same email multiple times if user submitted form twice
    const deduplicatedLeads = (() => {
      const emailToLead = new Map<string, typeof leads[0]>();

      leads?.forEach(lead => {
        const existing = emailToLead.get(lead.email);
        if (!existing) {
          // First time seeing this email
          emailToLead.set(lead.email, lead);
        } else {
          // We've seen this email before - decide which to keep
          const existingHasPurchase = purchasedLeadIds.has(existing.id) || purchasedEmails.has(existing.email);
          const currentHasPurchase = purchasedLeadIds.has(lead.id);

          // Prefer the lead that has a direct purchase link, or the most recent one
          if (currentHasPurchase && !purchasedLeadIds.has(existing.id)) {
            // Current lead has direct purchase link, existing doesn't
            emailToLead.set(lead.email, lead);
          } else if (!existingHasPurchase && !currentHasPurchase) {
            // Neither has purchase - keep the one with more data or most recent
            const existingHasData = existing.birth_date || existing.quiz_q1;
            const currentHasData = lead.birth_date || lead.quiz_q1;
            if (currentHasData && !existingHasData) {
              emailToLead.set(lead.email, lead);
            }
            // Otherwise keep existing (which is more recent since we ordered by created_at desc)
          }
        }
      });

      return Array.from(emailToLead.values());
    })();

    // Add purchase details to leads (check by lead_id first, then by email)
    const leadsWithPurchaseStatus = deduplicatedLeads.map(lead => {
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
    });

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

    // Fetch user profiles with subscription data
    // Note: Only selecting columns that exist in the schema
    const { data: profiles } = await supabaseAdmin
      .from("user_profiles")
      .select(`
        user_id,
        account_status,
        subscription_status,
        subscription_id,
        payment_type,
        stripe_customer_id
      `);

    // Get auth users to map emails to profiles
    const { data: authUsersData } = await supabaseAdmin.auth.admin.listUsers();
    const authUsers = authUsersData?.users || [];

    // Create email → profile map
    const emailToProfile = new Map<string, {
      user_id: string;
      account_status: string | null;
      subscription_status: string | null;
      subscription_id: string | null;
      payment_type: string | null;
      stripe_customer_id: string | null;
    }>();

    authUsers.forEach(user => {
      const profile = profiles?.find(p => p.user_id === user.id);
      if (profile && user.email) {
        emailToProfile.set(user.email.toLowerCase(), profile);
      }
    });

    // Attach profile data to leads
    const leadsWithProfiles = leadsWithPurchaseStatus.map(lead => ({
      ...lead,
      profile: emailToProfile.get(lead.email.toLowerCase()) || null,
    }));

    // ========== STRIPE DATA INTEGRATION ==========
    // Fetch subscription and payment data from Stripe (with graceful fallback)
    let stripeSubscriptions = new Map<string, StripeSubscriptionInfo>();
    let stripePayments = new Map<string, StripePaymentInfo>();
    let stripeCacheAge = 0;

    try {
      const stripeData = await fetchStripeData(forceStripeRefresh);
      stripeSubscriptions = stripeData.subscriptions;
      stripePayments = stripeData.payments;
      stripeCacheAge = Date.now() - stripeCache.timestamp;
    } catch (error) {
      console.error("Failed to fetch Stripe data:", error);
      // Continue with empty maps - dashboard still works with DB data
    }

    // Merge Stripe data with leads
    const leadsWithStripeData = leadsWithProfiles.map(lead => {
      const subInfo = stripeSubscriptions.get(lead.email.toLowerCase());
      const paymentInfo = stripePayments.get(lead.email.toLowerCase());
      return {
        ...lead,
        stripeSubscription: subInfo || null,
        stripePayments: paymentInfo || null,
      };
    });

    // Calculate Stripe-based stats
    const stripeStats = {
      totalSubscriptions: stripeSubscriptions.size,
      trialing: [...stripeSubscriptions.values()].filter(s => s.status === "trialing").length,
      active: [...stripeSubscriptions.values()].filter(s => s.status === "active").length,
      pastDue: [...stripeSubscriptions.values()].filter(s => s.status === "past_due").length,
      canceled: [...stripeSubscriptions.values()].filter(s => s.status === "canceled").length,
      canceling: [...stripeSubscriptions.values()].filter(s => s.cancelAt && s.status !== "canceled").length,
    };

    // Calculate subscription stats
    const subscriptionStats = {
      trialing: profiles?.filter(p => p.subscription_status === "trialing").length || 0,
      active: profiles?.filter(p => p.subscription_status === "active").length || 0,
      cancelled: profiles?.filter(p => p.subscription_status === "cancelled").length || 0,
      grandfathered: profiles?.filter(p => p.subscription_status === "grandfathered").length || 0,
      past_due: profiles?.filter(p => p.subscription_status === "past_due").length || 0,
      noAccount: leadsWithPurchaseStatus.length - emailToProfile.size,
    };

    // Calculate payment type stats (distinguishes one-time vs subscription)
    // NOTE: This counts ALL profiles, not filtered by date range
    const paymentTypeStats = {
      one_time: profiles?.filter(p => p.payment_type === "one_time").length || 0,
      subscription: profiles?.filter(p => p.payment_type === "subscription").length || 0,
      grandfathered: profiles?.filter(p => p.payment_type === "grandfathered").length || 0,
      none: profiles?.filter(p => !p.payment_type || p.payment_type === "none").length || 0,
    };

    // Calculate purchase stats from completedPurchases (DATE FILTERED!)
    // This is the accurate count for the selected date range
    const purchaseStats = {
      total: completedPurchases.length,
      one_time: completedPurchases.filter(p => {
        const meta = p.metadata as { subscription_mode?: boolean } | null;
        return !meta?.subscription_mode;
      }).length,
      subscription: completedPurchases.filter(p => {
        const meta = p.metadata as { subscription_mode?: boolean } | null;
        return meta?.subscription_mode === true;
      }).length,
    };

    // ========== NEW: Trend data for charts ==========
    // Group leads by date for trend chart
    const leadDates = leads?.map(l => new Date(l.created_at)) || [];
    const currentLeadsByDate = groupByGranularity(leadDates, granularity);

    const compLeadDates = comparisonLeads?.map(l => new Date(l.created_at)) || [];
    const previousLeadsByDate = groupByGranularity(compLeadDates, granularity);

    // Group revenue by date for trend chart
    const revenueDates = completedPurchases.map(p => ({
      date: new Date(p.completed_at),
      amount: p.amount_cents || 0,
    }));
    const currentRevenueByDate = new Map<string, number>();
    revenueDates.forEach(({ date, amount }) => {
      let key: string;
      if (granularity === "daily") {
        key = date.toISOString().split("T")[0];
      } else if (granularity === "weekly") {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        key = d.toISOString().split("T")[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }
      currentRevenueByDate.set(key, (currentRevenueByDate.get(key) || 0) + amount);
    });

    // Comparison revenue
    const compRevenueDates = (comparisonPurchases?.filter(p => p.status === "completed") || []).map(p => ({
      date: new Date(p.completed_at),
      amount: p.amount_cents || 0,
    }));
    const previousRevenueByDate = new Map<string, number>();
    compRevenueDates.forEach(({ date, amount }) => {
      let key: string;
      if (granularity === "daily") {
        key = date.toISOString().split("T")[0];
      } else if (granularity === "weekly") {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        key = d.toISOString().split("T")[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }
      previousRevenueByDate.set(key, (previousRevenueByDate.get(key) || 0) + amount);
    });

    // Build trend data arrays
    const allDateKeys = new Set([...currentLeadsByDate.keys()]);
    const sortedKeys = Array.from(allDateKeys).sort();

    const leadsTrendData = sortedKeys.map(key => ({
      date: key,
      label: formatLabel(key, granularity),
      current: currentLeadsByDate.get(key) || 0,
      previous: previousLeadsByDate.get(key) || 0,
    }));

    const revenueTrendData = sortedKeys.map(key => ({
      date: key,
      label: formatLabel(key, granularity),
      current: currentRevenueByDate.get(key) || 0,
      previous: previousRevenueByDate.get(key) || 0,
    }));

    // ========== NEW: Comparison metrics ==========
    const compCompletedPurchases = comparisonPurchases?.filter(p => p.status === "completed") || [];
    const compTotalRevenue = compCompletedPurchases.reduce((sum, p) => sum + (p.amount_cents || 0), 0);
    const compLeadCount = comparisonLeads?.length || 0;
    const compPurchaseCount = compCompletedPurchases.length;

    // Count trials in each period (users with trialing status created in period)
    const trialCount = subscriptionStats.trialing;
    const compTrialCount = 0; // Would need historical data to calculate this properly

    const comparison = {
      leads: {
        current: leadCount,
        previous: compLeadCount,
        changePercent: compLeadCount > 0 ? ((leadCount - compLeadCount) / compLeadCount) * 100 : 0,
      },
      revenue: {
        current: totalRevenue,
        previous: compTotalRevenue,
        changePercent: compTotalRevenue > 0 ? ((totalRevenue - compTotalRevenue) / compTotalRevenue) * 100 : 0,
      },
      purchases: {
        current: purchaseCount,
        previous: compPurchaseCount,
        changePercent: compPurchaseCount > 0 ? ((purchaseCount - compPurchaseCount) / compPurchaseCount) * 100 : 0,
      },
    };

    // ========== NEW: Enhanced funnel with percentages ==========
    const funnelSteps = [
      { key: "quiz_start", label: "Quiz Started", count: funnelCounts.quiz_start },
      { key: "q1_answered", label: "Q1 Answered", count: funnelCounts.q1_answered },
      { key: "q2_answered", label: "Q2 Answered", count: funnelCounts.q2_answered },
      { key: "email_screen", label: "Email Screen", count: funnelCounts.email_screen },
      { key: "lead", label: "Lead Captured", count: funnelCounts.lead },
      { key: "purchase", label: "Purchase", count: funnelCounts.purchase },
    ];

    const firstStepCount = funnelSteps[0]?.count || 1;
    const enhancedFunnel = funnelSteps.map((step, index) => {
      const prevCount = index > 0 ? funnelSteps[index - 1].count : step.count;
      const dropFromPrevious = prevCount - step.count;
      const dropPercent = prevCount > 0 ? (dropFromPrevious / prevCount) * 100 : 0;

      return {
        key: step.key,
        label: step.label,
        count: step.count,
        percentOfTotal: (step.count / firstStepCount) * 100,
        dropFromPrevious,
        dropPercent,
      };
    });

    // ========== NEW: Milestone conversions ==========
    // Use leads with funnel tracking for accurate funnel metrics
    const quizStartCount = funnelCounts.quiz_start || 0;
    const trackedLeadCount = funnelCounts.lead || 0; // Leads with tracked funnel sessions
    const milestones = {
      quizStart: quizStartCount,
      lead: trackedLeadCount,
      trial: trialCount,
      paid: subscriptionStats.active,
      quizToLead: quizStartCount > 0 ? (trackedLeadCount / quizStartCount) * 100 : 0,
      leadToTrial: trackedLeadCount > 0 ? (trialCount / trackedLeadCount) * 100 : 0,
      trialToPaid: trialCount > 0 ? (subscriptionStats.active / trialCount) * 100 : 0,
      overallConversion: quizStartCount > 0 ? (subscriptionStats.active / quizStartCount) * 100 : 0,
    };

    // Check if date range includes dates before funnel tracking started
    const includesPreTrackingDates = effectiveFrom && effectiveFrom < FUNNEL_TRACKING_START;
    const funnelWarning = includesPreTrackingDates
      ? "Funnel tracking started Dec 31, 2025. Data before this date may be incomplete."
      : null;

    // Count leads without funnel tracking (for reference)
    const leadsWithoutFunnelTracking = (leads?.length || 0) - (leadsWithFunnelTracking?.length || 0);

    // ========== LEGACY STATS (Pre-Subscription Launch) ==========
    // Query leads created before subscription launch (Jan 7, 2026)
    const { data: legacyLeads } = await supabaseAdmin
      .from("astro_leads")
      .select("id, created_at")
      .lt("created_at", SUBSCRIPTION_LAUNCH.toISOString());

    // Query funnel events before subscription launch
    const { data: legacyFunnelEvents } = await supabaseAdmin
      .from("astro_funnel_events")
      .select("event_name, session_id")
      .lt("created_at", SUBSCRIPTION_LAUNCH.toISOString());

    // Query legacy purchases (one-time payments before subscription launch)
    const { data: legacyPurchases } = await supabaseAdmin
      .from("astro_purchases")
      .select("id, amount_cents")
      .lt("completed_at", SUBSCRIPTION_LAUNCH.toISOString())
      .eq("status", "completed")
      .neq("email", "test@example.com")
      .gte("amount_cents", 100);

    // Deduplicate legacy funnel events by session
    const legacySessionsByEvent = new Map<string, Set<string>>();
    legacyFunnelEvents?.forEach((event) => {
      if (!legacySessionsByEvent.has(event.event_name)) {
        legacySessionsByEvent.set(event.event_name, new Set());
      }
      if (event.session_id) {
        legacySessionsByEvent.get(event.event_name)!.add(event.session_id);
      }
    });

    const legacyQuizStartCount = legacySessionsByEvent.get("quiz_start")?.size || 0;
    const legacyLeadCount = legacyLeads?.length || 0;
    const legacyPurchaseCount = legacyPurchases?.length || 0;
    const legacyRevenue = legacyPurchases?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0;
    const legacyConversionRate = legacyQuizStartCount > 0
      ? (legacyLeadCount / legacyQuizStartCount) * 100
      : 0;
    const legacyLeadToPurchase = legacyLeadCount > 0
      ? (legacyPurchaseCount / legacyLeadCount) * 100
      : 0;

    const legacyStats = {
      quizStart: legacyQuizStartCount,
      leads: legacyLeadCount,
      purchases: legacyPurchaseCount,
      revenue: legacyRevenue,
      conversionRate: legacyConversionRate,
      leadToPurchase: legacyLeadToPurchase,
      cutoffDate: SUBSCRIPTION_LAUNCH.toISOString(),
    };

    return NextResponse.json({
      period,
      dateRange: effectiveFrom && effectiveTo ? {
        from: effectiveFrom.toISOString(),
        to: effectiveTo.toISOString(),
        daysDiff,
        granularity,
      } : null,
      leads: leadsWithStripeData,
      stats,
      funnel: funnelCounts,
      funnelWarning,
      funnelMeta: {
        totalLeadsInPeriod: leads?.length || 0,
        leadsWithFunnelTracking: leadsWithFunnelTracking?.length || 0,
        leadsWithoutFunnelTracking,
        trackingStartDate: FUNNEL_TRACKING_START.toISOString(),
      },
      enhancedFunnel,
      milestones,
      revenue: {
        total: totalRevenue,
        purchaseCount,
        conversionRate,
        averageOrderValue,
        bySource,
      },
      analytics,
      subscriptionStats,
      paymentTypeStats,
      purchaseStats,
      stripeStats,
      stripeCacheAge,
      trends: {
        leads: leadsTrendData,
        revenue: revenueTrendData,
      },
      comparison,
      legacyStats,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
