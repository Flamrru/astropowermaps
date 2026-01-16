"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Activity,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Zap,
  BarChart3,
  ArrowRight,
} from "lucide-react";

// ============================================
// Types
// ============================================

interface PulseMetric {
  value: number;
  trend: number;
}

interface FeatureUsage {
  name: string;
  today: number;
  yesterday: number;
  trend: number;
}

interface SparklinePoint {
  date: string;
  dau: number;
  sessions: number;
}

interface PulseData {
  metrics: {
    dau: PulseMetric;
    wau: PulseMetric;
    mau: PulseMetric;
    sessionsToday: number;
    returnRate: number;
  };
  featureUsage: FeatureUsage[];
  categoryBreakdown: Record<string, number>;
  sparkline: SparklinePoint[];
  generatedAt: string;
}

// ============================================
// Main Component
// ============================================

export function PulseTab() {
  const [data, setData] = useState<PulseData | null>(null);
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
      const response = await fetch("/api/tracking/pulse");
      if (!response.ok) throw new Error("Failed to fetch pulse data");
      const pulseData = await response.json();
      setData(pulseData);
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
    return <PulseLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Activity className="w-12 h-12 text-red-400/50 mb-4" />
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Refresh Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="w-5 h-5 text-emerald-400" />
            {/* Pulse ring animation */}
            <span className="absolute inset-0 animate-ping">
              <Activity className="w-5 h-5 text-emerald-400/30" />
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Pulse</h2>
            <p className="text-xs text-white/40">
              Real-time app health • Auto-refreshes every 45s
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Daily Active"
          value={data?.metrics.dau.value || 0}
          trend={data?.metrics.dau.trend || 0}
          icon={<Users className="w-5 h-5" />}
          color="emerald"
        />
        <KPICard
          label="Weekly Active"
          value={data?.metrics.wau.value || 0}
          trend={data?.metrics.wau.trend || 0}
          icon={<Calendar className="w-5 h-5" />}
          color="teal"
        />
        <KPICard
          label="Monthly Active"
          value={data?.metrics.mau.value || 0}
          trend={data?.metrics.mau.trend || 0}
          icon={<BarChart3 className="w-5 h-5" />}
          color="cyan"
        />
        <KPICard
          label="Return Rate"
          value={`${data?.metrics.returnRate || 0}%`}
          sublabel="2+ days/week"
          icon={<Zap className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Sparkline + Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Sparkline */}
        <div className="lg:col-span-2 rounded-2xl bg-white/[0.02] border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-white">7-Day Activity</h3>
              <p className="text-sm text-white/40">Daily active users trend</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                DAU
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-400/50" />
                Sessions
              </span>
            </div>
          </div>
          <SparklineChart data={data?.sparkline || []} />
        </div>

        {/* Sessions Today Card */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-sm text-white/60">Sessions Today</span>
          </div>
          <div className="text-4xl font-bold font-mono text-emerald-400 mb-2">
            {data?.metrics.sessionsToday || 0}
          </div>
          <p className="text-xs text-white/40">
            Total app sessions started today
          </p>
        </div>
      </div>

      {/* Feature Usage + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Usage */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="font-semibold text-white">Top Events Today</h3>
            <p className="text-sm text-white/40">Most triggered events</p>
          </div>
          <div className="p-6">
            <FeatureUsageChart features={data?.featureUsage || []} />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="font-semibold text-white">Event Categories</h3>
            <p className="text-sm text-white/40">Today&apos;s activity by category</p>
          </div>
          <div className="p-6">
            <CategoryBreakdown categories={data?.categoryBreakdown || {}} />
          </div>
        </div>
      </div>

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

function KPICard({
  label,
  value,
  trend,
  sublabel,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  trend?: number;
  sublabel?: string;
  icon: React.ReactNode;
  color: "emerald" | "teal" | "cyan" | "amber";
}) {
  const colorClasses = {
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    teal: "from-teal-500/20 to-teal-500/5 border-teal-500/20 text-teal-400",
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400",
  };

  const isPositive = (trend || 0) >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? "text-emerald-400" : "text-red-400";

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl bg-gradient-to-br ${colorClasses[color]}
        border p-4 transition-all duration-300 hover:scale-[1.02] group
      `}
    >
      {/* Background pulse effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/40 mb-1">{label}</p>
          <p className="text-2xl font-bold font-mono">{value}</p>
          {sublabel && (
            <p className="text-xs text-white/30 mt-0.5">{sublabel}</p>
          )}
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trendColor}`}>
              <TrendIcon className="w-3 h-3" />
              <span>{Math.abs(Math.round(trend))}% vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg bg-white/5 ${colorClasses[color].split(" ").pop()}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SparklineChart({ data }: { data: SparklinePoint[] }) {
  if (data.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-white/30">
        No data available
      </div>
    );
  }

  const maxDau = Math.max(...data.map((d) => d.dau), 1);
  const maxSessions = Math.max(...data.map((d) => d.sessions), 1);

  return (
    <div className="h-32 flex items-end gap-2">
      {data.map((point, i) => {
        const dauHeight = (point.dau / maxDau) * 100;
        const sessionHeight = (point.sessions / maxSessions) * 100;
        const dayLabel = new Date(point.date).toLocaleDateString("en-US", { weekday: "short" });

        return (
          <div
            key={point.date}
            className="flex-1 flex flex-col items-center gap-1 group"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            {/* Bars container */}
            <div className="w-full h-24 flex items-end justify-center gap-1">
              {/* Sessions bar (background) */}
              <div
                className="w-1/3 bg-teal-400/30 rounded-t transition-all duration-500 group-hover:bg-teal-400/50"
                style={{ height: `${sessionHeight}%`, minHeight: "4px" }}
              />
              {/* DAU bar (foreground) */}
              <div
                className="w-1/2 bg-emerald-400 rounded-t transition-all duration-500 group-hover:bg-emerald-300 relative"
                style={{ height: `${dauHeight}%`, minHeight: "4px" }}
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {point.dau} users • {point.sessions} sessions
                  </div>
                </div>
              </div>
            </div>
            {/* Day label */}
            <span className="text-xs text-white/40">{dayLabel}</span>
          </div>
        );
      })}
    </div>
  );
}

function FeatureUsageChart({ features }: { features: FeatureUsage[] }) {
  if (features.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="w-10 h-10 text-white/20 mx-auto mb-3" />
        <p className="text-white/40 text-sm">No events recorded today</p>
      </div>
    );
  }

  const max = Math.max(...features.map((f) => f.today), 1);

  // Pretty-print event names
  const formatEventName = (name: string) => {
    return name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-3">
      {features.slice(0, 8).map((feature, i) => {
        const isPositive = feature.trend >= 0;
        return (
          <div
            key={feature.name}
            className="group"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-white/60 truncate max-w-[180px]">
                {formatEventName(feature.name)}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-medium text-white">
                  {feature.today}
                </span>
                {feature.trend !== 0 && (
                  <span className={`text-xs flex items-center gap-0.5 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(Math.round(feature.trend))}%
                  </span>
                )}
              </div>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${(feature.today / max) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CategoryBreakdown({ categories }: { categories: Record<string, number> }) {
  const entries = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="w-10 h-10 text-white/20 mx-auto mb-3" />
        <p className="text-white/40 text-sm">No categories recorded today</p>
      </div>
    );
  }

  const categoryConfig: Record<string, { color: string; icon: string }> = {
    navigation: { color: "bg-blue-400", icon: "🧭" },
    engagement: { color: "bg-emerald-400", icon: "💫" },
    map: { color: "bg-amber-400", icon: "🗺️" },
    calendar: { color: "bg-purple-400", icon: "📅" },
    profile: { color: "bg-pink-400", icon: "👤" },
    stella: { color: "bg-teal-400", icon: "✨" },
  };

  return (
    <div className="space-y-4">
      {entries.map(([category, count], i) => {
        const config = categoryConfig[category] || { color: "bg-slate-400", icon: "📊" };
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <div
            key={category}
            className="flex items-center gap-3 group"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span className="text-lg">{config.icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white/70 capitalize">{category}</span>
                <span className="text-sm font-mono text-white/50">{count}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${config.color} rounded-full transition-all duration-500 opacity-80 group-hover:opacity-100`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            <span className="text-xs text-white/40 w-10 text-right">{percentage}%</span>
          </div>
        );
      })}

      {/* Quick insight */}
      <div className="mt-6 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs text-white/40">
          <ArrowRight className="w-3 h-3" />
          <span>
            Most activity: <span className="text-emerald-400 capitalize">{entries[0]?.[0] || "—"}</span>
            {entries[0] && ` (${Math.round((entries[0][1] / total) * 100)}%)`}
          </span>
        </div>
      </div>
    </div>
  );
}

function PulseLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded bg-white/10" />
        <div className="space-y-2">
          <div className="w-24 h-5 rounded bg-white/10" />
          <div className="w-48 h-3 rounded bg-white/5" />
        </div>
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-white/[0.02] border border-white/10 p-4">
            <div className="w-16 h-3 rounded bg-white/10 mb-2" />
            <div className="w-12 h-8 rounded bg-white/10 mb-2" />
            <div className="w-20 h-3 rounded bg-white/5" />
          </div>
        ))}
      </div>

      {/* Sparkline skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white/[0.02] border border-white/10 p-6">
          <div className="w-32 h-5 rounded bg-white/10 mb-6" />
          <div className="h-32 flex items-end gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex-1 bg-white/5 rounded-t" style={{ height: `${30 + Math.random() * 50}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
          <div className="w-24 h-4 rounded bg-white/10 mb-4" />
          <div className="w-16 h-10 rounded bg-white/10" />
        </div>
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl bg-white/[0.02] border border-white/10 p-6">
            <div className="w-32 h-5 rounded bg-white/10 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-2 bg-white/5 rounded-full" style={{ width: `${50 + Math.random() * 50}%` }} />
              ))}
            </div>
          </div>
        ))}
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
