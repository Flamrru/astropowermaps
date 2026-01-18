"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/admin/AdminNavbar";
import {
  DollarSign,
  Users,
  TrendingUp,
  Trophy,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Target,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  FlaskConical,
  BarChart3,
  Lightbulb,
  Calendar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";
import "../dashboard/premium-dashboard.css";

// Types
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

interface ABPriceTestData {
  variants: VariantData[];
  daily_trends: DailyTrend[];
  totals: {
    leads: number;
    purchases: number;
    revenue_cents: number;
  };
  date_range: {
    start: string | null;
    end: string | null;
    first_lead: string | null;
    last_lead: string | null;
  };
  generated_at: string;
}

// Preset date ranges
const DATE_PRESETS = [
  { label: "All Time", value: "all" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 14 Days", value: "14d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Custom", value: "custom" },
];

// Variant colors
const VARIANT_COLORS: Record<string, string> = {
  "$19.99 (Control)": "#10B981",
  "$14.99": "#14B8A6",
  "$24.99": "#06B6D4",
  "$29.99": "#F59E0B",
};

const VARIANT_COLORS_ARRAY = ["#10B981", "#14B8A6", "#06B6D4", "#F59E0B"];

export default function ABTestingPage() {
  const router = useRouter();
  const [data, setData] = useState<ABPriceTestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const fetchData = useCallback(async (isAutoRefresh = false) => {
    if (isAutoRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Build URL with date filters
      let url = "/api/tracking/ab-price-test";
      const params = new URLSearchParams();

      if (datePreset === "7d") {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        params.set("startDate", startDate.toISOString());
      } else if (datePreset === "14d") {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 14);
        params.set("startDate", startDate.toISOString());
      } else if (datePreset === "30d") {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        params.set("startDate", startDate.toISOString());
      } else if (datePreset === "custom") {
        if (customStartDate) params.set("startDate", new Date(customStartDate).toISOString());
        if (customEndDate) params.set("endDate", new Date(customEndDate + "T23:59:59").toISOString());
      }

      if (params.toString()) {
        url += "?" + params.toString();
      }

      const response = await fetch(url);
      if (response.status === 401) {
        router.push("/admin");
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch A/B test data");
      const abData = await response.json();
      setData(abData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router, datePreset, customStartDate, customEndDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const winner = data?.variants.find((v) => v.is_winner);
  const hasReliableData = data?.variants.some((v) => v.confidence === "reliable");
  const overallConversion = data?.totals.leads
    ? ((data.totals.purchases / data.totals.leads) * 100).toFixed(1)
    : "0.0";

  // Prepare bar chart data
  const barChartData = data?.variants.map((v) => ({
    name: v.label.replace(" (Control)", ""),
    "Revenue/Lead": v.revenue_per_lead,
    "Conv %": v.conversion_rate,
    leads: v.leads,
    isWinner: v.is_winner,
  })) || [];

  // Prepare trend chart data
  const trendChartData = prepareTrendData(data?.daily_trends || []);

  return (
    <div className="premium-dashboard min-h-screen bg-[#0a0a0f]">
      {/* Animated Background */}
      <div className="constellation-bg">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${20 + i * 15}%`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="relative z-10 px-6 py-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.05) 100%)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
              }}
            >
              <FlaskConical className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                A/B Price Testing
              </h1>
              <p className="text-sm text-white/40">
                Analyze price variant performance and identify the optimal price point
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white/40" />
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-purple-500/50"
                style={{ fontFamily: "Outfit, sans-serif" }}
              >
                {DATE_PRESETS.map((preset) => (
                  <option key={preset.value} value={preset.value} className="bg-[#0a0a0f]">
                    {preset.label}
                  </option>
                ))}
              </select>

              {/* Custom date inputs */}
              {datePreset === "custom" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-purple-500/50"
                  />
                  <span className="text-white/40">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              )}
            </div>

            <button
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
                ${isRefreshing
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                }
              `}
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState error={error} onRetry={() => fetchData()} />
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Total Leads"
                value={data?.totals.leads.toLocaleString() || "0"}
                icon={<Users className="w-5 h-5" />}
                color="emerald"
                subtitle="Across all variants"
              />
              <MetricCard
                label="Total Revenue"
                value={`$${((data?.totals.revenue_cents || 0) / 100).toFixed(2)}`}
                icon={<DollarSign className="w-5 h-5" />}
                color="gold"
                subtitle="Completed purchases"
              />
              <MetricCard
                label="Overall Conversion"
                value={`${overallConversion}%`}
                icon={<Percent className="w-5 h-5" />}
                color="sapphire"
                subtitle="Lead to purchase"
              />
              <MetricCard
                label="Best Performer"
                value={winner?.label.replace(" (Control)", "") || "—"}
                icon={<Trophy className="w-5 h-5" />}
                color="amethyst"
                subtitle={winner ? `$${winner.revenue_per_lead.toFixed(2)}/lead` : "Needs more data"}
                highlight={Boolean(winner && hasReliableData)}
              />
            </div>

            {/* Data Confidence Alert */}
            {!hasReliableData && data && data.variants.length > 0 && (
              <div
                className="flex items-start gap-4 px-5 py-4 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.02) 100%)",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                }}
              >
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-200" style={{ fontFamily: "Outfit, sans-serif" }}>
                    Collecting data for statistical confidence
                  </p>
                  <p className="text-xs text-amber-200/60 mt-1">
                    Each variant needs 100+ leads for reliable results. Current winner may change as more data is collected.
                  </p>
                </div>
              </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue per Lead Comparison */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div className="px-6 py-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-semibold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                      Revenue per Lead by Variant
                    </h3>
                  </div>
                  <p className="text-xs text-white/40 mt-1">Higher is better • Winner highlighted</p>
                </div>
                <div className="p-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `$${v.toFixed(2)}`}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload;
                            return (
                              <div
                                className="px-3 py-2 rounded-lg"
                                style={{
                                  background: "rgba(10, 10, 20, 0.95)",
                                  border: "1px solid rgba(255,255,255,0.15)",
                                }}
                              >
                                <p className="text-white font-medium text-sm">{d.name}</p>
                                <p className="text-emerald-400 text-sm">${d["Revenue/Lead"].toFixed(2)}/lead</p>
                                <p className="text-white/50 text-xs mt-1">{d.leads} leads</p>
                              </div>
                            );
                          }}
                        />
                        <Bar dataKey="Revenue/Lead" radius={[4, 4, 0, 0]}>
                          {barChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.isWinner ? "#10B981" : "rgba(255,255,255,0.15)"}
                              stroke={entry.isWinner ? "#10B981" : "transparent"}
                              strokeWidth={entry.isWinner ? 2 : 0}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Daily Trend Chart */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div className="px-6 py-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-semibold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                      Daily Performance Trend
                    </h3>
                  </div>
                  <p className="text-xs text-white/40 mt-1">Revenue per lead over time • Last 30 days</p>
                </div>
                <div className="p-6">
                  <div className="h-64">
                    {trendChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            {Object.entries(VARIANT_COLORS).map(([name, color]) => (
                              <linearGradient key={name} id={`gradient-${name.replace(/[^a-z0-9]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={color} stopOpacity={0} />
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis
                            dataKey="date"
                            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                            tickLine={false}
                            tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          />
                          <YAxis
                            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => `$${v.toFixed(2)}`}
                            width={50}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "rgba(10, 10, 20, 0.95)",
                              border: "1px solid rgba(255,255,255,0.15)",
                              borderRadius: "8px",
                            }}
                            labelFormatter={(v) => new Date(v).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            formatter={(value) => [`$${Number(value || 0).toFixed(2)}`, "Rev/Lead"]}
                          />
                          <Legend
                            wrapperStyle={{ paddingTop: "10px" }}
                            formatter={(value) => <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>{value}</span>}
                          />
                          {Object.entries(VARIANT_COLORS).map(([name, color]) => (
                            <Area
                              key={name}
                              type="monotone"
                              dataKey={name}
                              stroke={color}
                              strokeWidth={2}
                              fill={`url(#gradient-${name.replace(/[^a-z0-9]/gi, "")})`}
                              dot={false}
                              connectNulls
                            />
                          ))}
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-white/30">
                        No trend data available yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Comparison Table */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div className="px-6 py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <h3 className="font-semibold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                    Variant Performance Details
                  </h3>
                </div>
                <p className="text-xs text-white/40 mt-1">Complete breakdown of each price point</p>
              </div>
              <div className="overflow-x-auto">
                <VariantTable variants={data?.variants || []} />
              </div>
            </div>

            {/* Insights & Recommendations */}
            {data && data.variants.length > 0 && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(139, 92, 246, 0.02) 100%)",
                  border: "1px solid rgba(168, 85, 247, 0.15)",
                }}
              >
                <div className="px-6 py-4 border-b border-purple-500/10">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-purple-400" />
                    <h3 className="font-semibold text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                      Insights & Recommendations
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <InsightsSection data={data} winner={winner} hasReliableData={hasReliableData || false} />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Helper function to prepare trend data
function prepareTrendData(dailyTrends: DailyTrend[]) {
  const dateMap = new Map<string, Record<string, string | number>>();

  for (const trend of dailyTrends) {
    if (!dateMap.has(trend.date)) {
      dateMap.set(trend.date, { date: trend.date });
    }
    const entry = dateMap.get(trend.date)!;
    entry[trend.variant] = trend.revenue_per_lead;
  }

  return Array.from(dateMap.values()).sort((a, b) =>
    String(a.date).localeCompare(String(b.date))
  );
}

// Metric Card Component
function MetricCard({
  label,
  value,
  icon,
  color,
  subtitle,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: "emerald" | "gold" | "sapphire" | "amethyst";
  subtitle?: string;
  highlight?: boolean;
}) {
  const colorMap = {
    emerald: { bg: "rgba(16, 185, 129, 0.1)", border: "rgba(16, 185, 129, 0.2)", text: "#10B981" },
    gold: { bg: "rgba(232, 197, 71, 0.1)", border: "rgba(232, 197, 71, 0.2)", text: "#E8C547" },
    sapphire: { bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.2)", text: "#3B82F6" },
    amethyst: { bg: "rgba(168, 85, 247, 0.1)", border: "rgba(168, 85, 247, 0.2)", text: "#A855F7" },
  };

  const colors = colorMap[color];

  return (
    <div
      className={`relative rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] ${highlight ? "ring-2 ring-emerald-500/30" : ""}`}
      style={{
        background: `linear-gradient(135deg, ${colors.bg} 0%, transparent 100%)`,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/40 mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
            {label}
          </p>
          <p className="text-2xl font-bold text-white" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-white/40 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className="p-2.5 rounded-lg"
          style={{ background: colors.bg, color: colors.text }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// Variant Table Component
function VariantTable({ variants }: { variants: VariantData[] }) {
  if (variants.length === 0) {
    return (
      <div className="p-8 text-center text-white/40">
        No variant data available
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wider text-white/40 border-b border-white/5">
          <th className="px-6 py-4 font-medium">Variant</th>
          <th className="px-4 py-4 font-medium text-right">Price</th>
          <th className="px-4 py-4 font-medium text-right">Leads</th>
          <th className="px-4 py-4 font-medium text-right">Purchases</th>
          <th className="px-4 py-4 font-medium text-right">Conversion</th>
          <th className="px-4 py-4 font-medium text-right">Rev/Lead</th>
          <th className="px-4 py-4 font-medium text-right">Total Revenue</th>
          <th className="px-6 py-4 font-medium text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        {variants.map((variant, i) => (
          <tr
            key={variant.code}
            className={`
              border-b border-white/5 transition-colors
              ${variant.is_winner ? "bg-emerald-500/5" : "hover:bg-white/[0.02]"}
            `}
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: VARIANT_COLORS[variant.label] || VARIANT_COLORS_ARRAY[i % 4] }}
                />
                <span className="font-medium text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {variant.label}
                </span>
                {variant.is_winner && (
                  <Trophy className="w-4 h-4 text-amber-400" />
                )}
              </div>
            </td>
            <td className="px-4 py-4 text-right font-mono text-white/70">
              ${(variant.price_cents / 100).toFixed(2)}
            </td>
            <td className="px-4 py-4 text-right font-mono text-white/70">
              {variant.leads.toLocaleString()}
            </td>
            <td className="px-4 py-4 text-right font-mono text-white/70">
              {variant.purchases.toLocaleString()}
            </td>
            <td className="px-4 py-4 text-right font-mono">
              <span className={variant.conversion_rate >= 10 ? "text-emerald-400" : "text-white/70"}>
                {variant.conversion_rate.toFixed(1)}%
              </span>
            </td>
            <td className="px-4 py-4 text-right">
              <span className={`font-mono font-medium ${variant.is_winner ? "text-emerald-400" : "text-white"}`}>
                ${variant.revenue_per_lead.toFixed(2)}
              </span>
            </td>
            <td className="px-4 py-4 text-right font-mono text-white/70">
              ${(variant.total_revenue_cents / 100).toFixed(2)}
            </td>
            <td className="px-6 py-4 text-center">
              {variant.is_winner ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Winner
                </span>
              ) : variant.confidence === "reliable" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10">
                  <TrendingUp className="w-3 h-3" />
                  Reliable
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="w-3 h-3" />
                  Need data
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Insights Section Component
function InsightsSection({
  data,
  winner,
  hasReliableData,
}: {
  data: ABPriceTestData;
  winner?: VariantData;
  hasReliableData: boolean;
}) {
  const insights: { icon: React.ReactNode; title: string; description: string; type: "success" | "warning" | "info" }[] = [];

  // Winner insight
  if (winner && hasReliableData) {
    const revenueAdvantage = data.variants
      .filter((v) => !v.is_winner && v.confidence === "reliable")
      .map((v) => ((winner.revenue_per_lead - v.revenue_per_lead) / v.revenue_per_lead) * 100);
    const avgAdvantage = revenueAdvantage.length > 0
      ? (revenueAdvantage.reduce((a, b) => a + b, 0) / revenueAdvantage.length).toFixed(0)
      : 0;

    insights.push({
      icon: <Trophy className="w-4 h-4" />,
      title: `${winner.label} is the clear winner`,
      description: `Generates ${avgAdvantage}% more revenue per lead than other variants. Consider scaling this price point.`,
      type: "success",
    });
  }

  // Conversion insight
  const highestConversion = data.variants.reduce((max, v) => v.conversion_rate > max.conversion_rate ? v : max, data.variants[0]);
  const lowestConversion = data.variants.reduce((min, v) => v.conversion_rate < min.conversion_rate ? v : min, data.variants[0]);

  if (highestConversion && lowestConversion && highestConversion.code !== lowestConversion.code) {
    const diff = (highestConversion.conversion_rate - lowestConversion.conversion_rate).toFixed(1);
    insights.push({
      icon: <Percent className="w-4 h-4" />,
      title: "Conversion rate varies by price",
      description: `${highestConversion.label} converts at ${highestConversion.conversion_rate.toFixed(1)}% vs ${lowestConversion.label} at ${lowestConversion.conversion_rate.toFixed(1)}% (${diff}pp difference).`,
      type: "info",
    });
  }

  // Data collection insight
  const variantsNeedingData = data.variants.filter((v) => v.confidence === "needs_data");
  if (variantsNeedingData.length > 0) {
    const leadsNeeded = variantsNeedingData.map((v) => 100 - v.leads);
    const totalNeeded = leadsNeeded.reduce((a, b) => a + Math.max(0, b), 0);
    insights.push({
      icon: <AlertTriangle className="w-4 h-4" />,
      title: `${variantsNeedingData.length} variant(s) need more data`,
      description: `Approximately ${totalNeeded} more leads needed across variants for statistical confidence.`,
      type: "warning",
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {insights.map((insight, i) => {
        const colors = {
          success: { bg: "rgba(16, 185, 129, 0.1)", border: "rgba(16, 185, 129, 0.2)", icon: "text-emerald-400" },
          warning: { bg: "rgba(245, 158, 11, 0.1)", border: "rgba(245, 158, 11, 0.2)", icon: "text-amber-400" },
          info: { bg: "rgba(59, 130, 246, 0.1)", border: "rgba(59, 130, 246, 0.2)", icon: "text-blue-400" },
        }[insight.type];

        return (
          <div
            key={i}
            className="p-4 rounded-xl"
            style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${colors.icon}`}>{insight.icon}</div>
              <div>
                <p className="text-sm font-medium text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {insight.title}
                </p>
                <p className="text-xs text-white/50 mt-1">{insight.description}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-white/[0.02] border border-white/10 p-5">
            <div className="w-20 h-3 rounded bg-white/10 mb-3" />
            <div className="w-24 h-8 rounded bg-white/10" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
            <div className="w-40 h-5 rounded bg-white/10 mb-6" />
            <div className="h-64 bg-white/5 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Error State
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <FlaskConical className="w-12 h-12 text-red-400/50 mb-4" />
      <p className="text-red-400 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2 rounded-lg bg-white/5 border border-white/10"
      >
        Try again
      </button>
    </div>
  );
}
