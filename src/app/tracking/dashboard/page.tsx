"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { subDays } from "date-fns";
import {
  BarChart3,
  Sparkles,
  Users,
  DollarSign,
  RefreshCw,
  LogOut,
  Calendar,
  ChevronDown,
  Activity,
  Brain,
  Repeat,
  Route,
} from "lucide-react";
import { UserDetailModal } from "@/components/tracking/UserDetailModal";
import { ChatAnalysisTab } from "@/components/tracking/ChatAnalysisTab";
import { PulseTab } from "@/components/tracking/PulseTab";
import { FeaturesTab } from "@/components/tracking/FeaturesTab";
import { UsersTab } from "@/components/tracking/UsersTab";
import RetentionTab from "@/components/tracking/RetentionTab";
import JourneysTab from "@/components/tracking/JourneysTab";

// Types
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

type TabId = "pulse" | "features" | "retention" | "journeys" | "overview" | "stella" | "users" | "revenue" | "chat_analysis";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: "pulse", label: "Pulse", icon: <Activity className="w-4 h-4" /> },
  { id: "features", label: "Features", icon: <BarChart3 className="w-4 h-4" /> },
  { id: "retention", label: "Retention", icon: <Repeat className="w-4 h-4" /> },
  { id: "journeys", label: "Journeys", icon: <Route className="w-4 h-4" /> },
  { id: "chat_analysis", label: "Chat Analysis", icon: <Brain className="w-4 h-4" /> },
  { id: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
  { id: "stella", label: "Stella Insights", icon: <Sparkles className="w-4 h-4" /> },
  { id: "revenue", label: "Revenue", icon: <DollarSign className="w-4 h-4" /> },
];

const DATE_PRESETS = [
  { key: "today" as DatePreset, label: "Today" },
  { key: "last_7_days" as DatePreset, label: "Last 7 days" },
  { key: "last_30_days" as DatePreset, label: "Last 30 days" },
  { key: "last_90_days" as DatePreset, label: "Last 90 days" },
];

const AUTO_REFRESH_INTERVAL = 45000; // 45 seconds

export default function TrackingDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("pulse");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const from = subDays(new Date(), 30);
    from.setHours(0, 0, 0, 0);
    return { from, to: new Date(), preset: "last_30_days" };
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Data states
  const [overviewData, setOverviewData] = useState<Record<string, unknown> | null>(null);
  const [usersData, setUsersData] = useState<Record<string, unknown> | null>(null);
  const [revenueData, setRevenueData] = useState<Record<string, unknown> | null>(null);
  const [chatAnalysisData, setChatAnalysisData] = useState<Record<string, unknown> | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/tracking/auth");
        if (!res.ok) {
          router.replace("/tracking");
          return;
        }
      } catch {
        router.replace("/tracking");
      }
    };
    checkAuth();
  }, [router]);

  // Fetch data function
  const fetchData = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      setIsRefreshing(true);

      try {
        const fromISO = dateRange.from.toISOString();
        const toISO = dateRange.to.toISOString();

        // Fetch all data in parallel
        const [overviewRes, usersRes, revenueRes, chatAnalysisRes] = await Promise.all([
          fetch(`/api/tracking/data?from=${fromISO}&to=${toISO}`),
          fetch(`/api/tracking/users?limit=50`),
          fetch(`/api/tracking/revenue?segment_by=payment_type`),
          fetch(`/api/tracking/chat-analysis`),
        ]);

        if (overviewRes.ok) {
          const data = await overviewRes.json();
          setOverviewData(data);
        }

        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsersData(data);
        }

        if (revenueRes.ok) {
          const data = await revenueRes.json();
          setRevenueData(data);
        }

        if (chatAnalysisRes.ok) {
          const data = await chatAnalysisRes.json();
          setChatAnalysisData(data);
        }

        setLastUpdated(new Date());
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [dateRange]
  );

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(false);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Handle logout
  const handleLogout = async () => {
    await fetch("/api/tracking/auth", { method: "DELETE" });
    router.replace("/tracking");
  };

  // Handle date preset change
  const handleDatePresetChange = (preset: DatePreset) => {
    const now = new Date();
    let from: Date;

    switch (preset) {
      case "today":
        from = new Date();
        from.setHours(0, 0, 0, 0);
        break;
      case "last_7_days":
        from = subDays(now, 7);
        break;
      case "last_30_days":
        from = subDays(now, 30);
        break;
      case "last_90_days":
        from = subDays(now, 90);
        break;
      default:
        from = subDays(now, 30);
    }

    from.setHours(0, 0, 0, 0);
    setDateRange({ from, to: now, preset });
    setShowDatePicker(false);
  };

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="min-h-screen bg-[#060609] text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Product Analytics</h1>
                <p className="text-xs text-white/40 -mt-0.5">Stella+ Insights</p>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* Auto-refresh indicator */}
              {lastUpdated && (
                <div className="hidden sm:flex items-center gap-2 text-xs text-white/40">
                  <div className={`w-1.5 h-1.5 rounded-full ${isRefreshing ? "bg-emerald-400 animate-pulse" : "bg-emerald-500"}`} />
                  <span>Updated {formatTimeAgo(lastUpdated)}</span>
                </div>
              )}

              {/* Date Range Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>{DATE_PRESETS.find((p) => p.key === dateRange.preset)?.label || "Custom"}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showDatePicker ? "rotate-180" : ""}`} />
                </button>

                {showDatePicker && (
                  <div className="absolute right-0 mt-2 w-48 py-1 rounded-xl bg-[#0c0c12] border border-white/10 shadow-2xl z-50">
                    {DATE_PRESETS.map((preset) => (
                      <button
                        key={preset.key}
                        onClick={() => handleDatePresetChange(preset.key)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors ${
                          dateRange.preset === preset.key ? "text-emerald-400" : "text-white/70"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Refresh button */}
              <button
                onClick={() => fetchData(false)}
                disabled={isRefreshing}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-emerald-400" : "text-white/60"}`} />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 text-white/60 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="relative z-10 border-b border-white/5 bg-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 py-2 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            {activeTab === "pulse" && <PulseTab />}
            {activeTab === "features" && <FeaturesTab />}
            {activeTab === "retention" && <RetentionTab />}
            {activeTab === "journeys" && <JourneysTab />}
            {activeTab === "overview" && <OverviewTab data={overviewData} />}
            {activeTab === "stella" && <StellaInsightsTab data={overviewData} />}
            {activeTab === "chat_analysis" && (
              <ChatAnalysisTab
                data={chatAnalysisData as Parameters<typeof ChatAnalysisTab>[0]["data"]}
                onRunAnalysis={async () => {
                  const res = await fetch("/api/tracking/chat-analysis", { method: "POST" });
                  if (res.ok) {
                    // Refresh data after analysis
                    await fetchData(false);
                  }
                }}
                onViewUser={setSelectedUserId}
                onRefresh={async () => {
                  // Refetch just the chat analysis data
                  const res = await fetch("/api/tracking/chat-analysis");
                  if (res.ok) {
                    const data = await res.json();
                    setChatAnalysisData(data);
                  }
                }}
              />
            )}
            {activeTab === "users" && <UsersTab onSelectUser={setSelectedUserId} />}
            {activeTab === "revenue" && <RevenueTab data={revenueData} />}
          </>
        )}
      </main>

      {/* User Detail Modal */}
      {selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
}

// Loading State
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      <p className="mt-4 text-white/40 text-sm">Loading analytics...</p>
    </div>
  );
}

// Overview Tab (placeholder - will be replaced with full component)
function OverviewTab({ data }: { data: Record<string, unknown> | null }) {
  const metrics = data?.metrics as Record<string, number> | undefined;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Daily Active"
          value={metrics?.dau || 0}
          icon={<Users className="w-5 h-5" />}
          color="emerald"
        />
        <MetricCard
          label="Weekly Active"
          value={metrics?.wau || 0}
          icon={<Activity className="w-5 h-5" />}
          color="teal"
        />
        <MetricCard
          label="Monthly Active"
          value={metrics?.mau || 0}
          icon={<BarChart3 className="w-5 h-5" />}
          color="cyan"
        />
        <MetricCard
          label="Total Users"
          value={metrics?.totalUsers || 0}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Feature Usage */}
      <GlassCard title="Feature Usage" subtitle="Which screens users visit most">
        <FeatureUsageChart data={data?.featureUsage as Record<string, number> | undefined} />
      </GlassCard>

      {/* Stella Volume */}
      <GlassCard title="Stella Chat Volume" subtitle="Messages over time">
        <StellaVolumeChart data={(data?.stella as Record<string, unknown>)?.byDay as Array<{ date: string; count: number }> | undefined} />
      </GlassCard>
    </div>
  );
}

// Stella Insights Tab
function StellaInsightsTab({ data }: { data: Record<string, unknown> | null }) {
  const topics = data?.topicBreakdown as Array<{ topic: string; count: number; percentage: number }> | undefined;
  const questions = data?.commonQuestions as Array<{ question: string; count: number }> | undefined;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Topic Breakdown */}
        <GlassCard title="Topic Breakdown" subtitle="What users ask Stella about">
          <div className="space-y-3">
            {topics?.map((topic, i) => (
              <div key={topic.topic} className="flex items-center gap-3" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="w-24 text-sm text-white/60 capitalize">{topic.topic.replace("_", " ")}</div>
                <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                    style={{ width: `${topic.percentage}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm font-medium">{topic.percentage}%</div>
              </div>
            ))}
            {(!topics || topics.length === 0) && (
              <p className="text-white/40 text-sm text-center py-8">No topic data yet</p>
            )}
          </div>
        </GlassCard>

        {/* Common Questions */}
        <GlassCard title="Common Questions" subtitle="Most asked queries">
          <div className="space-y-2">
            {questions?.slice(0, 8).map((q, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs text-emerald-400 flex-shrink-0">
                  {q.count}
                </div>
                <p className="text-sm text-white/70 line-clamp-2">{q.question}</p>
              </div>
            ))}
            {(!questions || questions.length === 0) && (
              <p className="text-white/40 text-sm text-center py-8">No questions yet</p>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

// Revenue Tab
function RevenueTab({ data }: { data: Record<string, unknown> | null }) {
  const segments = data?.segments as Array<{
    segment: string;
    label: string;
    userCount: number;
    totalRevenue: number;
    avgLTV: number;
    color: string;
  }> | undefined;
  const total = data?.total as { users: number; revenue: number; avgLTV: number } | undefined;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Total Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Total Revenue"
          value={`$${total?.revenue?.toFixed(2) || "0.00"}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="emerald"
          isLarge
        />
        <MetricCard
          label="Paying Users"
          value={total?.users || 0}
          icon={<Users className="w-5 h-5" />}
          color="teal"
        />
        <MetricCard
          label="Avg LTV"
          value={`$${total?.avgLTV?.toFixed(2) || "0.00"}`}
          icon={<BarChart3 className="w-5 h-5" />}
          color="cyan"
        />
      </div>

      {/* Segments */}
      <GlassCard title="Revenue by Segment" subtitle="Breakdown by payment type">
        <div className="space-y-4">
          {segments?.map((seg, i) => (
            <div key={seg.segment} className="flex items-center gap-4" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{seg.label}</span>
                  <span className="text-sm text-white/60">{seg.userCount} users</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${total?.revenue ? (seg.totalRevenue / total.revenue) * 100 : 0}%`,
                      backgroundColor: seg.color,
                    }}
                  />
                </div>
              </div>
              <div className="text-right min-w-[80px]">
                <div className="text-sm font-mono font-medium">${seg.totalRevenue.toFixed(2)}</div>
                <div className="text-xs text-white/40">avg ${seg.avgLTV.toFixed(2)}</div>
              </div>
            </div>
          ))}
          {(!segments || segments.length === 0) && (
            <p className="text-white/40 text-sm text-center py-8">No revenue data yet</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

// Reusable Components

function MetricCard({
  label,
  value,
  icon,
  color,
  isLarge,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: "emerald" | "teal" | "cyan" | "blue";
  isLarge?: boolean;
}) {
  const colorClasses = {
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
    teal: "from-teal-500/20 to-teal-500/5 border-teal-500/20 text-teal-400",
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20 text-cyan-400",
    blue: "from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400",
  };

  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${colorClasses[color]} border p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/40 mb-1">{label}</p>
          <p className={`font-bold font-mono ${isLarge ? "text-3xl" : "text-2xl"}`}>{value}</p>
        </div>
        <div className={`p-2 rounded-lg bg-white/5 ${colorClasses[color].split(" ").pop()}`}>{icon}</div>
      </div>
    </div>
  );
}

function GlassCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-white/5">
        <h3 className="font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    subscription: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    one_time: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    grandfathered: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    none: "bg-white/10 text-white/40 border-white/10",
  };

  const labels: Record<string, string> = {
    subscription: "Subscriber",
    one_time: "One-Time",
    grandfathered: "Free",
    none: "Lead",
  };

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${styles[status] || styles.none}`}>
      {labels[status] || status}
    </span>
  );
}

function EngagementBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    high: "text-emerald-400",
    medium: "text-blue-400",
    low: "text-amber-400",
    dormant: "text-white/30",
  };

  const labels: Record<string, string> = {
    high: "Power User",
    medium: "Regular",
    low: "Light",
    dormant: "Dormant",
  };

  return <span className={`text-xs font-medium ${styles[level] || styles.dormant}`}>{labels[level] || level}</span>;
}

function FeatureUsageChart({ data }: { data: Record<string, number> | undefined }) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-white/40 text-sm text-center py-8">No feature data yet</p>;
  }

  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, v]) => v));

  return (
    <div className="space-y-3">
      {entries.map(([screen, count], i) => (
        <div key={screen} className="flex items-center gap-3" style={{ animationDelay: `${i * 50}ms` }}>
          <div className="w-20 text-sm text-white/60 capitalize">{screen}</div>
          <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <div className="w-12 text-right text-sm font-mono">{count}</div>
        </div>
      ))}
    </div>
  );
}

function StellaVolumeChart({ data }: { data: Array<{ date: string; count: number }> | undefined }) {
  if (!data || data.length === 0) {
    return <p className="text-white/40 text-sm text-center py-8">No message data yet</p>;
  }

  const max = Math.max(...data.map((d) => d.count));
  const recentData = data.slice(-14); // Last 14 days

  return (
    <div className="flex items-end gap-1 h-32">
      {recentData.map((day, i) => (
        <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t transition-all duration-300 hover:opacity-80"
            style={{
              height: `${(day.count / max) * 100}%`,
              minHeight: day.count > 0 ? "4px" : "0",
              animationDelay: `${i * 30}ms`,
            }}
            title={`${day.date}: ${day.count} messages`}
          />
          {i % 2 === 0 && (
            <span className="text-[10px] text-white/30 rotate-0">
              {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
