"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  Users,
  TrendingUp,
  Trophy,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { InfoHint } from "./InfoHint";

// ============================================
// Types
// ============================================

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
  generated_at: string;
}

// Variant colors for consistency
const VARIANT_COLORS: Record<string, string> = {
  "$19.99 (Control)": "#10B981", // emerald
  "$14.99": "#14B8A6", // teal
  "$24.99": "#06B6D4", // cyan
  "$29.99": "#F59E0B", // amber
};

// ============================================
// Main Component
// ============================================

export function ABPriceTestTab() {
  const [data, setData] = useState<ABPriceTestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async (isAutoRefresh = false) => {
    if (isAutoRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch("/api/tracking/ab-price-test");
      if (!response.ok) throw new Error("Failed to fetch A/B test data");
      const abData = await response.json();
      setData(abData);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 45 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 45000);

    return () => clearInterval(interval);
  }, [fetchData]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <DollarSign className="w-12 h-12 text-red-400/50 mb-4" />
        <p className="text-red-400 mb-2">{error}</p>
        <button
          onClick={() => fetchData()}
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  const winner = data?.variants.find((v) => v.is_winner);
  const hasReliableData = data?.variants.some((v) => v.confidence === "reliable");

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">A/B Price Testing</h2>
            <p className="text-xs text-white/40">
              Compare price variant performance • Auto-refreshes every 45s
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-white/30">
              Updated {formatTimeAgo(lastRefresh)}
            </span>
          )}
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className={`
              p-2 rounded-lg transition-all duration-300
              ${isRefreshing
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
              }
            `}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="Total Leads"
          value={data?.totals.leads || 0}
          icon={<Users className="w-5 h-5" />}
          color="emerald"
          hint="Total leads across all price variants being tested"
        />
        <SummaryCard
          label="Total Revenue"
          value={`$${((data?.totals.revenue_cents || 0) / 100).toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="teal"
          hint="Sum of all completed purchases from A/B test variants"
        />
        <SummaryCard
          label="Best Performer"
          value={winner?.label || "—"}
          sublabel={winner ? `$${winner.revenue_per_lead.toFixed(2)}/lead` : undefined}
          icon={<Trophy className="w-5 h-5" />}
          color={hasReliableData ? "amber" : "cyan"}
          hint="Variant with highest revenue per lead. Winner is only declared with 100+ leads for statistical confidence."
          isWinner={Boolean(winner)}
        />
      </div>

      {/* Data Confidence Banner */}
      {!hasReliableData && data && data.variants.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-amber-200 font-medium">Need more data for confidence</p>
            <p className="text-xs text-amber-200/60">
              Each variant needs 100+ leads for statistically reliable results.
              Current best performer may change as more data comes in.
            </p>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="font-semibold text-white">Variant Comparison</h3>
          <p className="text-sm text-white/40">Performance metrics by price point</p>
        </div>
        <div className="overflow-x-auto">
          <ComparisonTable variants={data?.variants || []} />
        </div>
      </div>

      {/* Trend Chart */}
      {data && data.daily_trends.length > 0 && (
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="font-semibold text-white">Revenue per Lead Trend</h3>
            <p className="text-sm text-white/40">Daily performance over time (last 30 days)</p>
          </div>
          <div className="p-6">
            <TrendChart dailyTrends={data.daily_trends} />
          </div>
        </div>
      )}

      {/* No Data State */}
      {data && data.variants.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40">No A/B test data yet</p>
          <p className="text-white/30 text-sm mt-1">
            Leads with price variant codes will appear here
          </p>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

// ============================================
// Sub-Components
// ============================================

function SummaryCard({
  label,
  value,
  sublabel,
  icon,
  color,
  hint,
  isWinner,
}: {
  label: string;
  value: number | string;
  sublabel?: string;
  icon: React.ReactNode;
  color: "emerald" | "teal" | "cyan" | "amber";
  hint?: string;
  isWinner?: boolean;
}) {
  const colorClasses = {
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    teal: "from-teal-500/20 to-teal-500/5 border-teal-500/20 text-teal-400",
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400",
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl bg-gradient-to-br ${colorClasses[color]}
        border p-4 transition-all duration-300 hover:scale-[1.02] group
        ${isWinner ? "ring-2 ring-amber-500/30" : ""}
      `}
    >
      {/* Background pulse effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
            {hint && <InfoHint text={hint} />}
          </div>
          <p className="text-2xl font-bold font-mono">{value}</p>
          {sublabel && (
            <p className="text-xs text-white/50 mt-0.5">{sublabel}</p>
          )}
        </div>
        <div className={`p-2 rounded-lg bg-white/5 ${colorClasses[color].split(" ").pop()}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function ComparisonTable({ variants }: { variants: VariantData[] }) {
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
          <th className="px-6 py-3 font-medium">Variant</th>
          <th className="px-4 py-3 font-medium text-right">Price</th>
          <th className="px-4 py-3 font-medium text-right">Leads</th>
          <th className="px-4 py-3 font-medium text-right">Purchases</th>
          <th className="px-4 py-3 font-medium text-right">Conv %</th>
          <th className="px-4 py-3 font-medium text-right">Rev/Lead</th>
          <th className="px-4 py-3 font-medium text-right">Total Rev</th>
          <th className="px-6 py-3 font-medium text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        {variants.map((variant, i) => (
          <tr
            key={variant.code}
            className={`
              border-b border-white/5 transition-colors
              ${variant.is_winner
                ? "bg-emerald-500/10 border-l-2 border-l-emerald-500"
                : "hover:bg-white/[0.02]"
              }
            `}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: VARIANT_COLORS[variant.label] || "#6B7280" }}
                />
                <span className="font-medium text-white">{variant.label}</span>
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
              <span className={variant.conversion_rate > 10 ? "text-emerald-400" : "text-white/70"}>
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
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  Winner
                </span>
              ) : variant.confidence === "reliable" ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10">
                  <TrendingUp className="w-3 h-3" />
                  Reliable
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
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

function TrendChart({ dailyTrends }: { dailyTrends: DailyTrend[] }) {
  // Transform data for Recharts: group by date with each variant as a column
  const chartData: Array<Record<string, number | string>> = [];
  const dateMap = new Map<string, Record<string, number | string>>();

  for (const trend of dailyTrends) {
    if (!dateMap.has(trend.date)) {
      dateMap.set(trend.date, { date: trend.date });
    }
    const entry = dateMap.get(trend.date)!;
    entry[trend.variant] = trend.revenue_per_lead;
  }

  // Convert map to array and sort by date
  const sortedDates = Array.from(dateMap.keys()).sort();
  for (const date of sortedDates) {
    chartData.push(dateMap.get(date)!);
  }

  // Get unique variant labels
  const variantLabels = [...new Set(dailyTrends.map((t) => t.variant))];

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-white/30">
        No trend data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(12, 12, 18, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fff",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.6)" }}
            formatter={(value) => [`$${Number(value || 0).toFixed(2)}`, "Rev/Lead"]}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            formatter={(value) => <span style={{ color: "rgba(255,255,255,0.7)" }}>{value}</span>}
          />
          {variantLabels.map((label) => (
            <Line
              key={label}
              type="monotone"
              dataKey={label}
              stroke={VARIANT_COLORS[label] || "#6B7280"}
              strokeWidth={2}
              dot={{ fill: VARIANT_COLORS[label] || "#6B7280", r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded bg-white/10" />
        <div className="space-y-2">
          <div className="w-32 h-5 rounded bg-white/10" />
          <div className="w-56 h-3 rounded bg-white/5" />
        </div>
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-white/[0.02] border border-white/10 p-4">
            <div className="w-20 h-3 rounded bg-white/10 mb-2" />
            <div className="w-16 h-8 rounded bg-white/10 mb-2" />
            <div className="w-24 h-3 rounded bg-white/5" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
        <div className="w-40 h-5 rounded bg-white/10 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-24 h-4 rounded bg-white/5" />
              <div className="w-16 h-4 rounded bg-white/5" />
              <div className="w-12 h-4 rounded bg-white/5" />
              <div className="w-16 h-4 rounded bg-white/5" />
              <div className="flex-1" />
              <div className="w-20 h-4 rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
        <div className="w-48 h-5 rounded bg-white/10 mb-6" />
        <div className="h-64 bg-white/5 rounded-lg" />
      </div>
    </div>
  );
}

// ============================================
// Helpers
// ============================================

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);

  if (diffSecs < 10) return "just now";
  if (diffSecs < 60) return `${diffSecs}s ago`;
  return `${diffMins}m ago`;
}
