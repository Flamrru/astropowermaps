"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { subDays } from "date-fns";
import DateRangeSelector from "@/components/admin/DateRangeSelector";
import TrendChart from "@/components/admin/TrendChart";
import "./premium-dashboard.css";

interface UserProfile {
  user_id: string;
  account_status: "pending_setup" | "active" | null;
  subscription_status: "none" | "trialing" | "active" | "past_due" | "cancelled" | "paused" | "grandfathered" | null;
  subscription_trial_end: string | null;
  subscription_cancelled_at: string | null;
  stripe_customer_id: string | null;
}

interface Lead {
  id: string;
  email: string;
  quiz_q1: string | null;
  quiz_q2: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  session_id: string;
  created_at: string;
  has_purchased: boolean;
  // Birth data
  birth_date: string | null;
  birth_time: string | null;
  birth_time_unknown: boolean | null;
  birth_location_name: string | null;
  birth_location_lat: number | null;
  birth_location_lng: number | null;
  // Purchase info
  purchase_amount: number | null;
  purchase_date: string | null;
  // User profile with subscription
  profile: UserProfile | null;
}

interface Analytics {
  zodiacSigns: Record<string, number>;
  ageRanges: Record<string, number>;
  countries: Record<string, number>;
  withBirthData: number;
  withoutBirthData: number;
  purchased: number;
  notPurchased: number;
}

type StatusFilter = "all" | "purchased" | "leads";

interface Stats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
}

interface FunnelData {
  page_view: number;
  quiz_start: number;
  q1_answered: number;
  q2_answered: number;
  email_screen: number;
  lead: number;
  purchase: number;
}

interface RevenueBySource {
  source: string;
  revenue: number;
  purchases: number;
  leads: number;
  conversionRate: number;
}

interface RevenueData {
  total: number;
  purchaseCount: number;
  conversionRate: number;
  averageOrderValue: number;
  bySource: RevenueBySource[];
}

interface MailerLiteGroup {
  name: string;
  subscribers: number;
  openRate: number;
  clickRate: number;
}

interface MailerLiteCampaign {
  name: string;
  sent: number;
  openRate: number;
  clickRate: number;
  finishedAt: string | null;
}

interface MailerLiteData {
  configured: boolean;
  groups: {
    leads: MailerLiteGroup | null;
    customers: MailerLiteGroup | null;
  };
  campaigns: {
    totalSent: number;
    avgOpenRate: number;
    avgClickRate: number;
    totalUnsubscribes: number;
    recent: MailerLiteCampaign[];
  };
}

// Legacy period type (kept for backwards compatibility)
type Period = "today" | "week" | "month" | "all";

// New date range system (Facebook-style)
type DatePreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_14_days"
  | "last_30_days"
  | "last_90_days"
  | "this_month"
  | "last_month"
  | "since_launch"
  | "custom";

interface DateRange {
  from: Date;
  to: Date;
  preset: DatePreset;
}

// Subscription launch date (Jan 7, 2026 01:00 Swiss time)
const SUBSCRIPTION_LAUNCH = new Date("2026-01-07T00:00:00+01:00");

// Trend chart data point
interface TrendDataPoint {
  date: string;
  label: string;
  current: number;
  previous: number;
}

// Comparison data for metrics
interface ComparisonData {
  current: number;
  previous: number;
  changePercent: number;
}

// Enhanced funnel step with more metrics
interface EnhancedFunnelStep {
  key: string;
  label: string;
  count: number;
  percentOfTotal: number;
  dropFromPrevious: number;
  dropPercent: number;
}

// Milestone conversions
interface MilestoneData {
  quizStart: number;
  lead: number;
  trial: number;
  paid: number;
  quizToLead: number;
  leadToTrial: number;
  trialToPaid: number;
  overallConversion: number;
}

// Trend data for charts
interface TrendChartData {
  leads: TrendDataPoint[];
  revenue: TrendDataPoint[];
}

interface SubscriptionStats {
  trialing: number;
  active: number;
  cancelled: number;
  grandfathered: number;
  past_due: number;
  noAccount: number;
}

// Legacy stats (pre-subscription launch)
interface LegacyStats {
  quizStart: number;
  leads: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
  leadToPurchase: number;
  cutoffDate: string;
}

// Q1 and Q2 answer options for analytics
const Q1_OPTIONS = ["Yes, definitely", "Maybe once or twice", "Not sure"];
const Q2_OPTIONS = [
  "Career / business growth",
  "Creativity / new ideas",
  "Love / relationships",
  "Clarity / finding direction",
  "Adventure / feeling alive",
];

export default function AdminDashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0, thisWeek: 0, thisMonth: 0 });
  const [funnel, setFunnel] = useState<FunnelData>({
    page_view: 0,
    quiz_start: 0,
    q1_answered: 0,
    q2_answered: 0,
    email_screen: 0,
    lead: 0,
    purchase: 0,
  });
  const [revenue, setRevenue] = useState<RevenueData>({
    total: 0,
    purchaseCount: 0,
    conversionRate: 0,
    averageOrderValue: 0,
    bySource: [],
  });
  const [analytics, setAnalytics] = useState<Analytics>({
    zodiacSigns: {},
    ageRanges: {},
    countries: {},
    withBirthData: 0,
    withoutBirthData: 0,
    purchased: 0,
    notPurchased: 0,
  });
  const [mailerlite, setMailerlite] = useState<MailerLiteData | null>(null);
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStats>({
    trialing: 0,
    active: 0,
    cancelled: 0,
    grandfathered: 0,
    past_due: 0,
    noAccount: 0,
  });
  const [period, setPeriod] = useState<Period>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const router = useRouter();

  // New date range state (Facebook-style)
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const from = subDays(new Date(), 30);
    from.setHours(0, 0, 0, 0);
    return { from, to: new Date(), preset: "last_30_days" };
  });

  // New trend and comparison state
  const [trends, setTrends] = useState<TrendChartData>({ leads: [], revenue: [] });
  const [comparison, setComparison] = useState<{
    leads: ComparisonData;
    revenue: ComparisonData;
    purchases: ComparisonData;
  }>({
    leads: { current: 0, previous: 0, changePercent: 0 },
    revenue: { current: 0, previous: 0, changePercent: 0 },
    purchases: { current: 0, previous: 0, changePercent: 0 },
  });
  const [enhancedFunnel, setEnhancedFunnel] = useState<EnhancedFunnelStep[]>([]);
  const [funnelWarning, setFunnelWarning] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<MilestoneData>({
    quizStart: 0,
    lead: 0,
    trial: 0,
    paid: 0,
    quizToLead: 0,
    leadToTrial: 0,
    trialToPaid: 0,
    overallConversion: 0,
  });

  // Legacy stats (pre-subscription launch)
  const [legacyStats, setLegacyStats] = useState<LegacyStats>({
    quizStart: 0,
    leads: 0,
    purchases: 0,
    revenue: 0,
    conversionRate: 0,
    leadToPurchase: 0,
    cutoffDate: "",
  });
  const [showLegacy, setShowLegacy] = useState(false);

  // Fetch leads function (reusable for refresh)
  const fetchLeads = useCallback(async (showLoading = true, range: DateRange = dateRange) => {
    if (showLoading) setIsLoading(true);
    try {
      // Build URL with date range params (use local date, not UTC)
      // toISOString() converts to UTC which shifts the date in non-UTC timezones
      const formatLocalDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      const fromStr = formatLocalDate(range.from);
      const toStr = formatLocalDate(range.to);
      const url = `/api/admin/leads?from=${fromStr}&to=${toStr}`;

      const res = await fetch(url);
      if (res.status === 401) {
        router.replace("/admin");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch leads");

      const data = await res.json();
      setLeads(data.leads || []);
      setStats(data.stats || { total: 0, today: 0, thisWeek: 0, thisMonth: 0 });
      setFunnel(data.funnel || {
        page_view: 0,
        quiz_start: 0,
        q1_answered: 0,
        q2_answered: 0,
        email_screen: 0,
        lead: 0,
        purchase: 0,
      });
      setRevenue(data.revenue || {
        total: 0,
        purchaseCount: 0,
        conversionRate: 0,
        averageOrderValue: 0,
        bySource: [],
      });
      setAnalytics(data.analytics || {
        zodiacSigns: {},
        ageRanges: {},
        countries: {},
        withBirthData: 0,
        withoutBirthData: 0,
        purchased: 0,
        notPurchased: 0,
      });
      setSubscriptionStats(data.subscriptionStats || {
        trialing: 0,
        active: 0,
        cancelled: 0,
        grandfathered: 0,
        past_due: 0,
        noAccount: 0,
      });

      // Set new data from API
      setTrends(data.trends || { leads: [], revenue: [] });
      setComparison(data.comparison || {
        leads: { current: 0, previous: 0, changePercent: 0 },
        revenue: { current: 0, previous: 0, changePercent: 0 },
        purchases: { current: 0, previous: 0, changePercent: 0 },
      });
      setEnhancedFunnel(data.enhancedFunnel || []);
      setFunnelWarning(data.funnelWarning || null);
      setMilestones(data.milestones || {
        quizStart: 0,
        lead: 0,
        trial: 0,
        paid: 0,
        quizToLead: 0,
        leadToTrial: 0,
        trialToPaid: 0,
        overallConversion: 0,
      });
      setLegacyStats(data.legacyStats || {
        quizStart: 0,
        leads: 0,
        purchases: 0,
        revenue: 0,
        conversionRate: 0,
        leadToPurchase: 0,
        cutoffDate: "",
      });

      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [router, dateRange]);

  // Fetch MailerLite stats
  const fetchMailerLiteStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/mailerlite-stats");
      if (res.ok) {
        const data = await res.json();
        if (data.configured) {
          setMailerlite(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch MailerLite stats:", err);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchLeads();
    fetchMailerLiteStats();
  }, [fetchLeads, fetchMailerLiteStats]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeads(false, dateRange); // Don't show loading spinner on auto-refresh
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchLeads, dateRange]);

  // Handle date range change (new system)
  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
    fetchLeads(true, newRange);
  };

  // Handle period change (legacy - kept for compatibility)
  const handlePeriodChange = (newPeriod: Period) => {
    setPeriod(newPeriod);
    // Convert legacy period to date range
    const now = new Date();
    let from = new Date();
    switch (newPeriod) {
      case "today":
        from.setHours(0, 0, 0, 0);
        break;
      case "week":
        from = subDays(now, 7);
        from.setHours(0, 0, 0, 0);
        break;
      case "month":
        from = subDays(now, 30);
        from.setHours(0, 0, 0, 0);
        break;
      case "all":
        from = new Date("2024-01-01");
        break;
    }
    const range: DateRange = { from, to: now, preset: "custom" };
    handleDateRangeChange(range);
  };

  // Quiz analytics calculations
  const quizAnalytics = useMemo(() => {
    // Q1 distribution
    const q1Counts = Q1_OPTIONS.map((opt) => ({
      label: opt,
      count: leads.filter((l) => l.quiz_q1 === opt).length,
    }));
    const q1Total = leads.filter((l) => l.quiz_q1).length;

    // Q2 distribution (multi-select)
    const q2Counts = Q2_OPTIONS.map((opt) => {
      const count = leads.filter((lead) => {
        if (!lead.quiz_q2) return false;
        try {
          const arr = JSON.parse(lead.quiz_q2);
          return Array.isArray(arr) && arr.includes(opt);
        } catch {
          return false;
        }
      }).length;
      return { label: opt, count };
    });
    const q2Respondents = leads.filter((l) => l.quiz_q2).length;

    return { q1Counts, q1Total, q2Counts, q2Respondents };
  }, [leads]);

  // Filter leads by search query and status
  const filteredLeads = useMemo(() => {
    let filtered = leads;

    // Filter by status
    if (statusFilter === "purchased") {
      filtered = filtered.filter(l => l.has_purchased);
    } else if (statusFilter === "leads") {
      filtered = filtered.filter(l => !l.has_purchased);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((lead) =>
        lead.email.toLowerCase().includes(query) ||
        lead.birth_location_name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [leads, searchQuery, statusFilter]);

  // Logout handler
  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.replace("/admin");
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Email",
      "Quiz Q1",
      "Quiz Q2",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "Session ID",
      "Created At",
    ];

    const rows = filteredLeads.map((lead) => [
      lead.email,
      lead.quiz_q1 || "",
      formatQ2(lead.quiz_q2),
      lead.utm_source || "",
      lead.utm_medium || "",
      lead.utm_campaign || "",
      lead.session_id,
      formatDate(lead.created_at),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format Q2 array
  const formatQ2 = (q2: string | null): string => {
    if (!q2) return "-";
    try {
      const arr = JSON.parse(q2);
      if (Array.isArray(arr)) return arr.join(", ");
      return q2;
    } catch {
      return q2;
    }
  };

  // Format time ago for last updated
  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return "1 min ago";
    if (minutes < 60) return `${minutes} mins ago`;
    return formatDate(date.toISOString());
  };

  if (isLoading) {
    return (
      <div className="cosmic-bg min-h-screen flex items-center justify-center">
        <div className="stars-layer" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[var(--gold-main)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--text-muted)]">Loading celestial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-dashboard cosmic-bg min-h-screen">
      <div className="stars-layer" />

      {/* Premium animated background */}
      <div className="constellation-bg">
        {/* Particles will be rendered via CSS */}
      </div>

      {/* Header */}
      <header className="premium-header relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="logo-mark">
                <svg className="w-5 h-5 text-[var(--premium-gold)] relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
                </svg>
              </div>
              <span className="font-semibold text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Power Map Admin</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {lastUpdated && (
                <span className="flex items-center gap-2 text-xs text-[var(--text-faint)] hidden sm:block">
                  <span className="pulse-dot" />
                  Updated {formatTimeAgo(lastUpdated)}
                </span>
              )}
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Selector (Facebook-style) */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Dashboard Analytics</h1>
          <DateRangeSelector
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </div>

        {/* Revenue Cards */}
        <div className="mb-8 animate-in stagger-1">
          <div className="section-header">
            <div className="section-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--premium-emerald)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2>Revenue</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <RevenueCard
              label="Total Revenue"
              value={`$${(revenue.total / 100).toFixed(2)}`}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              accent
            />
            <RevenueCard
              label="Purchases"
              value={revenue.purchaseCount.toString()}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
            />
            <RevenueCard
              label="Conversion Rate"
              value={`${(revenue.conversionRate * 100).toFixed(1)}%`}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
            <RevenueCard
              label="Avg Order Value"
              value={revenue.purchaseCount > 0 ? `$${(revenue.averageOrderValue / 100).toFixed(2)}` : "$0.00"}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Revenue by Source */}
        {revenue.bySource.length > 0 && (
          <div className="mb-8">
            <RevenueBySourceTable data={revenue.bySource} />
          </div>
        )}

        {/* Trends Section - Leads & Revenue over time */}
        <div className="mb-8 animate-in stagger-2">
          <div className="section-header">
            <div className="section-icon" style={{ background: 'rgba(232, 197, 71, 0.15)', color: 'var(--premium-gold)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h2>Trends</h2>
            <span className="section-subtitle">vs previous period</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TrendChart
              title="Leads Over Time"
              data={trends.leads}
              comparison={comparison.leads}
            />
            <TrendChart
              title="Revenue Over Time"
              data={trends.revenue}
              comparison={comparison.revenue}
              valueFormatter={(v) => `$${(v / 100).toFixed(0)}`}
              color="#22c55e"
            />
          </div>
        </div>

        {/* Key Milestones - Conversion Flow */}
        {milestones.quizStart > 0 && (
          <div className="mb-8 animate-in stagger-3">
            <div className="section-header">
              <div className="section-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--premium-amethyst)' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h2>Key Milestones</h2>
            </div>
            <div className="premium-card glow-gold">
              {/* Milestone Flow Visualization - Simplified: Quiz → Leads → Subscribers */}
              <div className="milestone-flow">
                {/* Quiz Start */}
                <div className="milestone-node">
                  <div className="node-value" style={{ color: 'white' }}>{milestones.quizStart.toLocaleString()}</div>
                  <div className="node-label">Quiz Start</div>
                </div>

                {/* Arrow with conversion rate */}
                <div className="milestone-connector" style={{ color: 'var(--premium-gold)' }}>
                  <div className="connector-line" />
                  <div className="connector-rate">{milestones.quizToLead.toFixed(1)}%</div>
                  <div className="connector-line" style={{ background: 'linear-gradient(90deg, transparent 0%, currentColor 100%)' }} />
                </div>

                {/* Lead */}
                <div className="milestone-node">
                  <div className="node-value" style={{ color: 'var(--premium-gold-bright)' }}>{milestones.lead.toLocaleString()}</div>
                  <div className="node-label">Leads</div>
                </div>

                {/* Arrow with conversion rate (lead to subscriber = trial + active) */}
                <div className="milestone-connector" style={{ color: 'var(--premium-emerald)' }}>
                  <div className="connector-line" />
                  <div className="connector-rate">{milestones.lead > 0 ? (((milestones.trial + milestones.paid) / milestones.lead) * 100).toFixed(1) : '0.0'}%</div>
                  <div className="connector-line" style={{ background: 'linear-gradient(90deg, transparent 0%, currentColor 100%)' }} />
                </div>

                {/* Subscribers (trial + active combined - since trials are paid upfront) */}
                <div className="milestone-node">
                  <div className="node-value" style={{ color: 'var(--premium-emerald-bright)' }}>{(milestones.trial + milestones.paid).toLocaleString()}</div>
                  <div className="node-label">Subscribers</div>
                </div>
              </div>

              {/* Overall conversion */}
              <div className="mt-4 pt-3 border-t border-white/10 text-center">
                <span className="text-sm text-white/50">Overall conversion (Quiz → Subscriber): </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--premium-emerald-bright)' }}>{milestones.quizStart > 0 ? (((milestones.trial + milestones.paid) / milestones.quizStart) * 100).toFixed(2) : '0.00'}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Legacy Data Section (Pre-Subscription Launch) - Collapsible */}
        {legacyStats.leads > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowLegacy(!showLegacy)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all legacy-toggle"
              style={{
                background: showLegacy ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(148, 163, 184, 0.15)' }}>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="text-sm font-medium text-white/70">Legacy Data (Pre-Launch)</span>
                  <span className="text-xs text-white/40 ml-2">{legacyStats.leads.toLocaleString()} leads before Jan 7, 2026</span>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-white/40 transition-transform duration-200 ${showLegacy ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Collapsible content */}
            <div
              className={`overflow-hidden transition-all duration-300 ${showLegacy ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}
            >
              <div className="premium-card" style={{ borderColor: 'rgba(148, 163, 184, 0.15)' }}>
                {/* Legacy Milestone Flow - Quiz → Leads → Purchases (one-time) */}
                <div className="milestone-flow">
                  {/* Quiz Start */}
                  <div className="milestone-node">
                    <div className="node-value" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{legacyStats.quizStart.toLocaleString()}</div>
                    <div className="node-label" style={{ opacity: 0.5 }}>Quiz Start</div>
                  </div>

                  {/* Arrow with conversion rate */}
                  <div className="milestone-connector" style={{ color: 'rgba(148, 163, 184, 0.6)' }}>
                    <div className="connector-line" />
                    <div className="connector-rate" style={{ background: 'rgba(148, 163, 184, 0.1)', borderColor: 'rgba(148, 163, 184, 0.3)' }}>
                      {legacyStats.conversionRate.toFixed(1)}%
                    </div>
                    <div className="connector-line" style={{ background: 'linear-gradient(90deg, transparent 0%, currentColor 100%)' }} />
                  </div>

                  {/* Leads */}
                  <div className="milestone-node">
                    <div className="node-value" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{legacyStats.leads.toLocaleString()}</div>
                    <div className="node-label" style={{ opacity: 0.5 }}>Leads</div>
                  </div>

                  {/* Arrow with lead to purchase rate */}
                  <div className="milestone-connector" style={{ color: 'var(--premium-emerald)' }}>
                    <div className="connector-line" />
                    <div className="connector-rate">
                      {legacyStats.leadToPurchase.toFixed(1)}%
                    </div>
                    <div className="connector-line" style={{ background: 'linear-gradient(90deg, transparent 0%, currentColor 100%)' }} />
                  </div>

                  {/* Purchases (one-time) */}
                  <div className="milestone-node">
                    <div className="node-value" style={{ color: 'var(--premium-emerald-bright)' }}>{legacyStats.purchases.toLocaleString()}</div>
                    <div className="node-label" style={{ opacity: 0.5 }}>Purchases</div>
                  </div>
                </div>

                {/* Revenue summary */}
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-white/40">One-time purchases before subscriptions</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--premium-emerald-bright)' }}>${(legacyStats.revenue / 100).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Status - Simplified view */}
        <div className="mb-8 animate-in stagger-4">
          <div className="section-header">
            <div className="section-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--premium-sapphire)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h2>Subscription Status</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Subscribers = Trialing + Active (combined since trials are paid) */}
            <SubscriptionStatCard
              label="Subscribers"
              value={subscriptionStats.trialing + subscriptionStats.active}
              color="green"
            />
            <SubscriptionStatCard
              label="Cancelled"
              value={subscriptionStats.cancelled}
              color="red"
            />
            {subscriptionStats.past_due > 0 && (
              <SubscriptionStatCard
                label="Past Due"
                value={subscriptionStats.past_due}
                color="yellow"
              />
            )}
            {subscriptionStats.grandfathered > 0 && (
              <SubscriptionStatCard
                label="Free Access"
                value={subscriptionStats.grandfathered}
                color="purple"
              />
            )}
            <SubscriptionStatCard
              label="Leads Only"
              value={subscriptionStats.noAccount}
              color="gray"
            />
          </div>
        </div>

        {/* MailerLite Email Marketing Stats */}
        {mailerlite && mailerlite.configured && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#09c269]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              Email Marketing
              <span className="text-xs font-normal text-[var(--text-faint)] ml-2">(MailerLite)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Leads Subscribers */}
              {mailerlite.groups.leads && (
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                      {mailerlite.groups.leads.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                      Leads
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">{mailerlite.groups.leads.subscribers}</p>
                  <p className="text-xs text-[var(--text-faint)] mt-1">Active subscribers</p>
                </div>
              )}

              {/* Customers Subscribers */}
              {mailerlite.groups.customers && (
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[var(--text-muted)]">
                      {mailerlite.groups.customers.name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                      Customers
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">{mailerlite.groups.customers.subscribers}</p>
                  <p className="text-xs text-[var(--text-faint)] mt-1">Paying customers</p>
                </div>
              )}

              {/* Open Rate */}
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[var(--text-muted)]">Avg Open Rate</span>
                  <svg className="w-4 h-4 text-[var(--text-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-white">{mailerlite.campaigns.avgOpenRate.toFixed(1)}%</p>
                <p className="text-xs text-[var(--text-faint)] mt-1">From recent campaigns</p>
              </div>

              {/* Click Rate */}
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[var(--text-muted)]">Avg Click Rate</span>
                  <svg className="w-4 h-4 text-[var(--text-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-white">{mailerlite.campaigns.avgClickRate.toFixed(1)}%</p>
                <p className="text-xs text-[var(--text-faint)] mt-1">From recent campaigns</p>
              </div>
            </div>

            {/* Recent Campaigns */}
            {mailerlite.campaigns.recent.length > 0 && (
              <div className="mt-4 glass-card rounded-xl p-4">
                <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3">Recent Campaigns</h3>
                <div className="space-y-2">
                  {mailerlite.campaigns.recent.map((campaign, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-sm text-white truncate">{campaign.name}</p>
                        <p className="text-xs text-[var(--text-faint)]">
                          {campaign.finishedAt ? new Date(campaign.finishedAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <div className="flex gap-4 text-right">
                        <div>
                          <p className="text-sm font-medium text-white">{campaign.sent}</p>
                          <p className="text-xs text-[var(--text-faint)]">Sent</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-400">{campaign.openRate.toFixed(1)}%</p>
                          <p className="text-xs text-[var(--text-faint)]">Opens</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-400">{campaign.clickRate.toFixed(1)}%</p>
                          <p className="text-xs text-[var(--text-faint)]">Clicks</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lead Stats cards */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--gold-main)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Leads Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Leads"
              value={stats.total}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
              accent
            />
            <StatCard
              label="Today"
              value={stats.today}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="This Week"
              value={stats.thisWeek}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            <StatCard
              label="This Month"
              value={stats.thisMonth}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Funnel Analytics */}
        <div className="mb-8 animate-in stagger-5">
          <FunnelChart data={funnel} enhancedData={enhancedFunnel} warning={funnelWarning} />
        </div>

        {/* Answer Analytics Section */}
        {leads.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <BarChart
              title="Q1: Have you visited a place that felt right?"
              data={quizAnalytics.q1Counts}
              total={quizAnalytics.q1Total}
              note={`${quizAnalytics.q1Total} responses`}
            />
            <BarChart
              title="Q2: What do you want 2026 to be about?"
              data={quizAnalytics.q2Counts}
              total={quizAnalytics.q2Respondents}
              note={`${quizAnalytics.q2Respondents} respondents (multi-select)`}
            />
          </div>
        )}

        {/* Demographics Analytics - Compact Design */}
        {analytics.withBirthData > 0 && (
          <div className="mb-8 animate-in stagger-5">
            <div className="section-header">
              <div className="section-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: 'var(--premium-amethyst)' }}>
                <span className="text-base">✨</span>
              </div>
              <h2>Demographics</h2>
              <span className="section-subtitle">{analytics.withBirthData} with birth data</span>
            </div>

            <div className="premium-card" style={{ padding: '16px' }}>
              {/* Zodiac Signs - Compact Grid */}
              <div className="mb-4">
                <div className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Zodiac Distribution</div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {Object.entries(analytics.zodiacSigns)
                    .sort((a, b) => b[1] - a[1])
                    .map(([sign, count]) => {
                      const maxCount = Math.max(...Object.values(analytics.zodiacSigns));
                      const intensity = maxCount > 0 ? count / maxCount : 0;
                      return (
                        <div
                          key={sign}
                          className="flex flex-col items-center p-2 rounded-lg transition-all hover:scale-105"
                          style={{
                            background: `rgba(232, 197, 71, ${0.05 + intensity * 0.15})`,
                            border: `1px solid rgba(232, 197, 71, ${0.1 + intensity * 0.2})`,
                          }}
                        >
                          <span className="text-lg">{sign.split(' ')[0]}</span>
                          <span className="text-[10px] text-white/60 truncate w-full text-center">{sign.split(' ')[1]}</span>
                          <span className="text-xs font-semibold" style={{ color: 'var(--premium-gold)' }}>{count}</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Age + Countries - Premium Split Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                {/* Age Groups - Mini Bar Chart */}
                <div>
                  <div className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">Age Distribution</div>
                  <div className="space-y-2">
                    {(() => {
                      const ageEntries = Object.entries(analytics.ageRanges)
                        .filter(([, count]) => count > 0)
                        .sort((a, b) => b[1] - a[1]);
                      const maxCount = Math.max(...ageEntries.map(([, c]) => c), 1);

                      return ageEntries.map(([range, count]) => {
                        const barWidth = (count / maxCount) * 100;
                        return (
                          <div key={range} className="demographics-bar-row">
                            <div className="demographics-bar-label">{range}</div>
                            <div className="demographics-bar-track">
                              <div
                                className="demographics-bar-fill"
                                style={{
                                  width: `${barWidth}%`,
                                  background: 'linear-gradient(90deg, var(--premium-sapphire) 0%, var(--premium-sapphire-bright) 100%)'
                                }}
                              />
                            </div>
                            <div className="demographics-bar-value">{count}</div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Top Countries - Premium List */}
                <div>
                  <div className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">Top Countries</div>
                  <div className="space-y-1.5">
                    {Object.entries(analytics.countries)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([country, count], index) => (
                        <div
                          key={country}
                          className="country-list-item"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="country-rank">{index + 1}</div>
                          <div className="country-name">{country}</div>
                          <div className="country-count">{count}</div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and table */}
        <div className="data-table animate-in stagger-6">
          {/* Table header */}
          <div className="p-4 sm:p-6 border-b border-white/10">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="section-header" style={{ marginBottom: 0 }}>
                  <div className="section-icon" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'rgba(255, 255, 255, 0.6)' }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2>Lead Database</h2>
                    <span className="section-subtitle" style={{ marginLeft: 0 }}>
                      {filteredLeads.length} {filteredLeads.length === 1 ? "lead" : "leads"}
                      {statusFilter !== "all" && ` (${statusFilter})`}
                    </span>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-faint)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by email or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-glass pl-10 pr-4 py-2.5 rounded-xl text-sm w-full sm:w-72"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                {(["all", "purchased", "leads"] as StatusFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === filter
                        ? filter === "purchased"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-[var(--gold-main)]/20 text-[var(--gold-bright)] border border-[var(--gold-main)]/30"
                        : "bg-white/5 text-[var(--text-muted)] hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {filter === "all" && `All (${leads.length})`}
                    {filter === "purchased" && `Purchased (${analytics.purchased})`}
                    {filter === "leads" && `Leads Only (${analytics.notPurchased})`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="p-6 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!error && filteredLeads.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-white/5">
                <svg className="w-8 h-8 text-[var(--text-faint)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-[var(--text-muted)]">
                {searchQuery ? "No leads match your search" : "No leads captured yet"}
              </p>
            </div>
          )}

          {/* Table */}
          {!error && filteredLeads.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20">
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden sm:table-cell">
                      Status
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden md:table-cell">
                      Subscription
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden lg:table-cell">
                      Q1 Answer
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden lg:table-cell">
                      Q2 Answer
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden sm:table-cell">
                      Source
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeads.map((lead, idx) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      style={{ animationDelay: `${idx * 20}ms` }}
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            lead.has_purchased
                              ? "bg-green-500/20 border border-green-500/30"
                              : "bg-gradient-to-br from-[var(--gold-main)]/20 to-[var(--gold-dark)]/20 border border-[var(--gold-main)]/20"
                          }`}>
                            <span className={`text-xs font-medium ${lead.has_purchased ? "text-green-400" : "text-[var(--gold-main)]"}`}>
                              {lead.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm text-white truncate max-w-[200px]">
                            {lead.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        {lead.has_purchased ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-[var(--text-muted)] border border-white/10">
                            Lead
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                        <SubscriptionBadge status={lead.profile?.subscription_status || null} />
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                        {lead.quiz_q1 ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 text-[var(--text-soft)] border border-white/10">
                            {lead.quiz_q1}
                          </span>
                        ) : (
                          <span className="text-[var(--text-faint)]">-</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                          {(() => {
                            if (!lead.quiz_q2) return <span className="text-[var(--text-faint)]">-</span>;
                            try {
                              const arr = JSON.parse(lead.quiz_q2);
                              if (!Array.isArray(arr) || arr.length === 0) {
                                return <span className="text-[var(--text-faint)]">-</span>;
                              }
                              return arr.map((answer: string, i: number) => (
                                <span
                                  key={i}
                                  className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--gold-main)]/10 text-[var(--gold-bright)] border border-[var(--gold-main)]/20"
                                >
                                  {answer.split(" / ")[0]}
                                </span>
                              ));
                            } catch {
                              return <span className="text-[var(--text-faint)]">-</span>;
                            }
                          })()}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        {lead.utm_source ? (
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--gold-main)]/10 text-[var(--gold-bright)] border border-[var(--gold-main)]/20">
                            {lead.utm_source}
                          </span>
                        ) : (
                          <span className="text-sm text-[var(--text-faint)]">Direct</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="text-sm text-[var(--text-muted)] whitespace-nowrap">
                          {formatDate(lead.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lead Detail Modal */}
        {selectedLead && (
          <LeadDetailModal
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
          />
        )}
      </main>
    </div>
  );
}

// Lead detail modal component
function LeadDetailModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "-";
    return timeStr;
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getZodiacSign = (date: string | null): string => {
    if (!date) return "-";
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "♈ Aries";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "♉ Taurus";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "♊ Gemini";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "♋ Cancer";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "♌ Leo";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "♍ Virgo";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "♎ Libra";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "♏ Scorpio";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "♐ Sagittarius";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "♑ Capricorn";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "♒ Aquarius";
    return "♓ Pisces";
  };

  const getAge = (birthDate: string | null): string => {
    if (!birthDate) return "-";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return `${age} years old`;
  };

  const formatQ2 = (q2: string | null): string[] => {
    if (!q2) return [];
    try {
      const arr = JSON.parse(q2);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0a12]/95 backdrop-blur-xl p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              lead.has_purchased
                ? "bg-green-500/20 border border-green-500/30"
                : "bg-gradient-to-br from-[var(--gold-main)]/20 to-[var(--gold-dark)]/20 border border-[var(--gold-main)]/20"
            }`}>
              <span className={`text-lg font-bold ${lead.has_purchased ? "text-green-400" : "text-[var(--gold-main)]"}`}>
                {lead.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{lead.email}</h2>
              <p className="text-sm text-[var(--text-muted)]">
                {lead.has_purchased ? (
                  <span className="text-green-400">Customer • ${((lead.purchase_amount || 0) / 100).toFixed(2)}</span>
                ) : (
                  "Lead"
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Birth Data */}
          {lead.birth_date && (
            <div>
              <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3 flex items-center gap-2">
                <span>🌟</span> Birth Data
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-3">
                  <p className="text-xs text-[var(--text-faint)] mb-1">Birthday</p>
                  <p className="text-sm text-white">{formatDate(lead.birth_date)}</p>
                </div>
                <div className="glass-card rounded-xl p-3">
                  <p className="text-xs text-[var(--text-faint)] mb-1">Birth Time</p>
                  <p className="text-sm text-white">
                    {lead.birth_time_unknown ? "Unknown" : formatTime(lead.birth_time)}
                  </p>
                </div>
                <div className="glass-card rounded-xl p-3">
                  <p className="text-xs text-[var(--text-faint)] mb-1">Zodiac Sign</p>
                  <p className="text-sm text-[var(--gold-bright)]">{getZodiacSign(lead.birth_date)}</p>
                </div>
                <div className="glass-card rounded-xl p-3">
                  <p className="text-xs text-[var(--text-faint)] mb-1">Age</p>
                  <p className="text-sm text-white">{getAge(lead.birth_date)}</p>
                </div>
              </div>
              {lead.birth_location_name && (
                <div className="glass-card rounded-xl p-3 mt-4">
                  <p className="text-xs text-[var(--text-faint)] mb-1">Birth Location</p>
                  <p className="text-sm text-white">{lead.birth_location_name}</p>
                </div>
              )}
            </div>
          )}

          {/* Quiz Answers */}
          <div>
            <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3 flex items-center gap-2">
              <span>📋</span> Quiz Answers
            </h3>
            <div className="space-y-3">
              <div className="glass-card rounded-xl p-3">
                <p className="text-xs text-[var(--text-faint)] mb-1">Q1: Have you visited a place that felt right?</p>
                <p className="text-sm text-white">{lead.quiz_q1 || "-"}</p>
              </div>
              <div className="glass-card rounded-xl p-3">
                <p className="text-xs text-[var(--text-faint)] mb-1">Q2: What do you want 2026 to be about?</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {formatQ2(lead.quiz_q2).length > 0 ? (
                    formatQ2(lead.quiz_q2).map((answer, i) => (
                      <span
                        key={i}
                        className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-[var(--gold-main)]/10 text-[var(--gold-bright)] border border-[var(--gold-main)]/20"
                      >
                        {answer}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-white">-</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Attribution */}
          <div>
            <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3 flex items-center gap-2">
              <span>📊</span> Attribution
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-3">
                <p className="text-xs text-[var(--text-faint)] mb-1">Source</p>
                <p className="text-sm text-white">{lead.utm_source || "Direct"}</p>
              </div>
              <div className="glass-card rounded-xl p-3">
                <p className="text-xs text-[var(--text-faint)] mb-1">Campaign</p>
                <p className="text-sm text-white">{lead.utm_campaign || "-"}</p>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          {lead.profile && (
            <div>
              <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3 flex items-center gap-2">
                <span>🎫</span> Subscription
              </h3>
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[var(--text-muted)]">Status</span>
                  <SubscriptionBadge status={lead.profile.subscription_status} />
                </div>
                {lead.profile.subscription_trial_end && (
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                    <span className="text-sm text-[var(--text-muted)]">Trial Ends</span>
                    <span className="text-sm text-white">{formatDate(lead.profile.subscription_trial_end)}</span>
                  </div>
                )}
                {lead.profile.subscription_cancelled_at && (
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                    <span className="text-sm text-red-400">Cancelled</span>
                    <span className="text-sm text-white">{formatDate(lead.profile.subscription_cancelled_at)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Account</span>
                  <span className={`text-sm ${lead.profile.account_status === "active" ? "text-green-400" : "text-yellow-400"}`}>
                    {lead.profile.account_status === "active" ? "Active" : "Pending Setup"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3 flex items-center gap-2">
              <span>🕐</span> Timeline
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-[var(--text-muted)]">Lead Captured</span>
                <span className="text-sm text-white">{formatDateTime(lead.created_at)}</span>
              </div>
              {lead.has_purchased && lead.purchase_date && (
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-sm text-green-400">Purchased</span>
                  <span className="text-sm text-white">{formatDateTime(lead.purchase_date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat card component
function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`glass-card rounded-xl p-5 ${
        accent ? "border-[var(--gold-main)]/30" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)] mb-1">{label}</p>
          <p
            className={`text-3xl font-bold ${
              accent ? "text-[var(--gold-bright)]" : "text-white"
            }`}
          >
            {value.toLocaleString()}
          </p>
        </div>
        <div
          className={`p-2.5 rounded-lg ${
            accent
              ? "bg-[var(--gold-main)]/10 text-[var(--gold-main)]"
              : "bg-white/5 text-[var(--text-muted)]"
          }`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// Bar chart component for analytics
function BarChart({
  title,
  data,
  total,
  note,
}: {
  title: string;
  data: { label: string; count: number }[];
  total: number;
  note?: string;
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      {note && (
        <p className="text-xs text-[var(--text-faint)] mb-5">{note}</p>
      )}

      <div className="space-y-4">
        {data.map((item, idx) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          const barWidth = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

          return (
            <div key={idx}>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-sm text-[var(--text-soft)] truncate pr-2">
                  {item.label}
                </span>
                <span className="text-sm font-medium text-[var(--gold-bright)] whitespace-nowrap">
                  {item.count}
                  <span className="text-[var(--text-muted)] ml-1">
                    ({percentage.toFixed(0)}%)
                  </span>
                </span>
              </div>
              {/* Bar container */}
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                {/* Animated bar fill */}
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${barWidth}%`,
                    background:
                      "linear-gradient(90deg, var(--gold-dark), var(--gold-main), var(--gold-bright))",
                    boxShadow: "0 0 8px rgba(201, 162, 39, 0.4)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Funnel chart component - Premium styled
function FunnelChart({ data, enhancedData, warning }: { data: FunnelData; enhancedData?: EnhancedFunnelStep[]; warning?: string | null }) {
  // Default step config for icons and colors
  const stepConfig: Record<string, { icon: string; color: string }> = {
    quiz_start: { icon: "🚀", color: "gold" },
    q1_answered: { icon: "✓", color: "gold" },
    q2_answered: { icon: "✓", color: "gold" },
    email_screen: { icon: "📧", color: "gold" },
    lead: { icon: "🎯", color: "gold" },
    purchase: { icon: "💰", color: "green" },
  };

  // Use enhanced data if available, otherwise fall back to basic data
  const hasEnhanced = enhancedData && enhancedData.length > 0;

  const steps = hasEnhanced
    ? enhancedData.map((step) => ({
        key: step.key,
        label: step.label,
        count: step.count,
        percentOfTotal: step.percentOfTotal,
        dropPercent: step.dropPercent,
        icon: stepConfig[step.key]?.icon || "•",
        color: stepConfig[step.key]?.color || "gold",
      }))
    : [
        { key: "quiz_start", label: "Quiz Started", count: data.quiz_start, percentOfTotal: 100, dropPercent: 0, icon: "🚀", color: "gold" },
        { key: "q1_answered", label: "Q1 Answered", count: data.q1_answered, percentOfTotal: data.quiz_start > 0 ? (data.q1_answered / data.quiz_start) * 100 : 0, dropPercent: data.quiz_start > 0 ? ((data.quiz_start - data.q1_answered) / data.quiz_start) * 100 : 0, icon: "✓", color: "gold" },
        { key: "q2_answered", label: "Q2 Answered", count: data.q2_answered, percentOfTotal: data.quiz_start > 0 ? (data.q2_answered / data.quiz_start) * 100 : 0, dropPercent: data.q1_answered > 0 ? ((data.q1_answered - data.q2_answered) / data.q1_answered) * 100 : 0, icon: "✓", color: "gold" },
        { key: "email_screen", label: "Email Screen", count: data.email_screen, percentOfTotal: data.quiz_start > 0 ? (data.email_screen / data.quiz_start) * 100 : 0, dropPercent: data.q2_answered > 0 ? ((data.q2_answered - data.email_screen) / data.q2_answered) * 100 : 0, icon: "📧", color: "gold" },
        { key: "lead", label: "Lead Captured", count: data.lead, percentOfTotal: data.quiz_start > 0 ? (data.lead / data.quiz_start) * 100 : 0, dropPercent: data.email_screen > 0 ? ((data.email_screen - data.lead) / data.email_screen) * 100 : 0, icon: "🎯", color: "gold" },
        { key: "purchase", label: "Purchased", count: data.purchase, percentOfTotal: data.quiz_start > 0 ? (data.purchase / data.quiz_start) * 100 : 0, dropPercent: data.lead > 0 ? ((data.lead - data.purchase) / data.lead) * 100 : 0, icon: "💰", color: "green" },
      ];

  const maxCount = Math.max(...steps.map((s) => s.count), 1);

  return (
    <div className="premium-card" style={{ padding: '16px' }}>
      <div className="section-header" style={{ marginBottom: '12px' }}>
        <div className="section-icon" style={{ background: 'rgba(232, 197, 71, 0.15)', color: 'var(--premium-gold)' }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </div>
        <div>
          <h2 style={{ marginBottom: '1px', fontSize: '0.9rem' }}>Quiz Funnel</h2>
          <span className="section-subtitle" style={{ marginLeft: 0, fontSize: '0.65rem' }}>Unique sessions (deduplicated)</span>
        </div>
      </div>

      {/* Warning for pre-tracking dates */}
      {warning && (
        <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <p className="text-xs flex items-center gap-2" style={{ color: 'var(--premium-amber)' }}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {warning}
          </p>
        </div>
      )}

      <div className="space-y-0">
        {steps.map((step, idx) => {
          const barWidth = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
          const showDropOff = idx > 0 && step.dropPercent > 0;

          return (
            <div key={step.key} className="funnel-step-compact">
              {/* Step bar */}
              <div className="py-1.5">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{step.icon}</span>
                    <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{step.label}</span>
                    {/* Inline drop-off badge */}
                    {showDropOff && (
                      <span className="funnel-dropoff-inline">
                        -{step.dropPercent.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.35)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}>
                      {step.percentOfTotal.toFixed(0)}%
                    </span>
                    <span className="text-xs font-semibold text-white tabular-nums min-w-[40px] text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {step.count.toLocaleString()}
                    </span>
                  </div>
                </div>
                {/* Funnel bar with shimmer */}
                <div className="funnel-bar" style={{ height: '6px' }}>
                  <div
                    className="funnel-bar-fill"
                    style={{
                      width: `${barWidth}%`,
                      background:
                        step.color === "green"
                          ? "linear-gradient(90deg, var(--premium-emerald), var(--premium-emerald-bright))"
                          : "linear-gradient(90deg, var(--premium-gold-dim), var(--premium-gold))",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conversion rates summary - compact */}
      {data.quiz_start > 0 && (
        <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
          <div className="flex items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Quiz→Lead</span>
              <span className="font-semibold" style={{ color: 'var(--premium-gold-bright)', fontFamily: "'JetBrains Mono', monospace" }}>
                {((data.lead / data.quiz_start) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <div className="flex items-center gap-2">
              <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>Lead→Purchase</span>
              <span className="font-semibold" style={{ color: 'var(--premium-emerald-bright)', fontFamily: "'JetBrains Mono', monospace" }}>
                {data.lead > 0 ? ((data.purchase / data.lead) * 100).toFixed(1) : "0.0"}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Revenue card component (green theme) - Premium styled
function RevenueCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`premium-card metric-card ${accent ? "glow-emerald" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="metric-label">{label}</p>
          <p
            className={`metric-value ${accent ? "accent-emerald" : ""}`}
          >
            {value}
          </p>
        </div>
        <div
          className="metric-icon"
          style={{
            background: accent
              ? "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)",
            color: accent ? "var(--premium-emerald)" : "rgba(255, 255, 255, 0.5)",
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// Revenue by source table component
function RevenueBySourceTable({ data }: { data: RevenueBySource[] }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Revenue by Source
        </h3>
        <p className="text-xs text-[var(--text-faint)] mt-1">See which traffic sources bring the most revenue</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-black/20">
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Source
              </th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden sm:table-cell">
                Purchases
              </th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider hidden sm:table-cell">
                Leads
              </th>
              <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Conv %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((row) => (
              <tr key={row.source} className="hover:bg-white/5 transition-colors">
                <td className="px-4 sm:px-6 py-4">
                  <span className="inline-flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      row.source === "direct" ? "bg-blue-400" :
                      row.source === "fb" ? "bg-blue-500" :
                      row.source === "ig" ? "bg-pink-500" :
                      "bg-gray-400"
                    }`} />
                    <span className="text-sm font-medium text-white capitalize">
                      {row.source === "fb" ? "Facebook" :
                       row.source === "ig" ? "Instagram" :
                       row.source === "direct" ? "Direct" :
                       row.source}
                    </span>
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 text-right">
                  <span className="text-sm font-semibold text-green-400">
                    ${(row.revenue / 100).toFixed(2)}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 text-right hidden sm:table-cell">
                  <span className="text-sm text-white">
                    {row.purchases}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 text-right hidden sm:table-cell">
                  <span className="text-sm text-[var(--text-muted)]">
                    {row.leads}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 text-right">
                  <span className={`text-sm font-medium ${
                    row.conversionRate > 0.1 ? "text-green-400" :
                    row.conversionRate > 0.05 ? "text-yellow-400" :
                    "text-[var(--text-muted)]"
                  }`}>
                    {(row.conversionRate * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Subscription stat card component - Premium styled
function SubscriptionStatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "blue" | "green" | "red" | "purple" | "yellow" | "gray";
}) {
  const colorMap = {
    blue: "var(--premium-sapphire)",
    green: "var(--premium-emerald)",
    red: "var(--premium-ruby)",
    purple: "var(--premium-amethyst)",
    yellow: "var(--premium-amber)",
    gray: "rgba(255, 255, 255, 0.4)",
  };

  const bgColorMap = {
    blue: "rgba(59, 130, 246, 0.15)",
    green: "rgba(16, 185, 129, 0.15)",
    red: "rgba(239, 68, 68, 0.15)",
    purple: "rgba(168, 85, 247, 0.15)",
    yellow: "rgba(245, 158, 11, 0.15)",
    gray: "rgba(255, 255, 255, 0.05)",
  };

  return (
    <div
      className="status-card"
      style={{
        background: bgColorMap[color],
        borderColor: `${colorMap[color]}33`,
        color: colorMap[color],
      }}
    >
      <div className="status-value" style={{ color: colorMap[color] }}>{value}</div>
      <div className="status-label">{label}</div>
    </div>
  );
}

// Subscription badge component for table
function SubscriptionBadge({ status }: { status: string | null }) {
  if (!status || status === "none") {
    return <span className="text-xs text-gray-500">—</span>;
  }

  const styles: Record<string, string> = {
    trialing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    grandfathered: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    past_due: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    paused: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border ${styles[status] || styles.paused}`}>
      {status.replace("_", " ")}
    </span>
  );
}
