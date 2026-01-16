"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Map,
  Calendar,
  MessageCircle,
  User,
  Navigation,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { InfoHint } from "./InfoHint";

// ============================================
// Types
// ============================================

interface FeatureItem {
  name: string;
  count: number;
  prevCount: number;
  trend: number;
  uniqueUsers: number;
}

interface MapBreakdown {
  totalEvents: number;
  categoryFilters: Array<{ category: string; count: number }>;
  lineTapsByPlanet: Array<{ planet: string; count: number }>;
  lineTapsByType: Array<{ lineType: string; count: number }>;
  topCities: Array<{ city: string; count: number }>;
}

interface CalendarBreakdown {
  totalEvents: number;
  tabUsage: Array<{ tab: string; count: number }>;
  goalUsage: Array<{ goal: string; count: number }>;
  dayClicks: { powerDays: number; regularDays: number; powerDayRate: number };
}

interface StellaBreakdown {
  totalEvents: number;
  totalMessages: number;
  avgCharCount: number;
  avgSessionDuration: number;
  sessionsTracked: number;
}

interface ProfileBreakdown {
  totalEvents: number;
  birthDataEdits: Array<{ field: string; count: number }>;
  signOutClicks: number;
  deleteAccountClicks: number;
}

interface NavigationBreakdown {
  totalEvents: number;
  tabVisits: Array<{ tab: string; count: number }>;
  commonFlows: Array<{ flow: string; count: number }>;
}

interface FeaturesData {
  period: number;
  totalEvents: number;
  featureMatrix: FeatureItem[];
  map: MapBreakdown;
  calendar: CalendarBreakdown;
  stella: StellaBreakdown;
  profile: ProfileBreakdown;
  navigation: NavigationBreakdown;
  sparklines: Record<string, number[]>;
  generatedAt: string;
}

// ============================================
// Main Component
// ============================================

export function FeaturesTab() {
  const [data, setData] = useState<FeaturesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(30);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("overview");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tracking/features?period=${period}`);
      if (!response.ok) throw new Error("Failed to fetch features data");
      const featuresData = await response.json();
      setData(featuresData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
        <p className="text-white/40 text-sm">Loading feature analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <BarChart3 className="w-12 h-12 text-red-400/50 mb-4" />
        <p className="text-red-400 mb-2">{error}</p>
        <button
          onClick={fetchData}
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">Feature Analytics</h2>
              <InfoHint text="Shows which features people actually use. If a feature has 0 events, nobody is clicking on it. High numbers mean that feature is popular and valuable." />
            </div>
            <p className="text-xs text-white/40">
              {data?.totalEvents.toLocaleString()} events in the last {period} days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Period selector */}
          <div className="relative">
            <button
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <span>Last {period} days</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showPeriodDropdown ? "rotate-180" : ""}`} />
            </button>

            {showPeriodDropdown && (
              <div className="absolute right-0 mt-2 w-36 py-1 rounded-xl bg-[#0c0c12] border border-white/10 shadow-2xl z-50">
                {[7, 30, 90].map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPeriod(p);
                      setShowPeriodDropdown(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors ${
                      period === p ? "text-emerald-400" : "text-white/70"
                    }`}
                  >
                    Last {p} days
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* Category Sparklines */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SparklineCard
          label="Navigation"
          icon={<Navigation className="w-4 h-4" />}
          data={data?.sparklines?.navigation || []}
          total={data?.navigation.totalEvents || 0}
          color="blue"
        />
        <SparklineCard
          label="Map"
          icon={<Map className="w-4 h-4" />}
          data={data?.sparklines?.map || []}
          total={data?.map.totalEvents || 0}
          color="amber"
        />
        <SparklineCard
          label="Calendar"
          icon={<Calendar className="w-4 h-4" />}
          data={data?.sparklines?.calendar || []}
          total={data?.calendar.totalEvents || 0}
          color="purple"
        />
        <SparklineCard
          label="Stella"
          icon={<MessageCircle className="w-4 h-4" />}
          data={data?.sparklines?.stella || []}
          total={data?.stella.totalEvents || 0}
          color="teal"
        />
        <SparklineCard
          label="Profile"
          icon={<User className="w-4 h-4" />}
          data={data?.sparklines?.profile || []}
          total={data?.profile.totalEvents || 0}
          color="pink"
        />
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-4">
        {/* Feature Matrix */}
        <CollapsibleSection
          title="Top Events"
          subtitle="Most triggered events across the app"
          icon={<BarChart3 className="w-4 h-4 text-emerald-400" />}
          isExpanded={expandedSection === "overview"}
          onToggle={() => toggleSection("overview")}
        >
          <FeatureMatrixTable features={data?.featureMatrix || []} />
        </CollapsibleSection>

        {/* Map Section */}
        <CollapsibleSection
          title="Map Interactions"
          subtitle={`${data?.map.totalEvents || 0} events`}
          icon={<Map className="w-4 h-4 text-amber-400" />}
          isExpanded={expandedSection === "map"}
          onToggle={() => toggleSection("map")}
        >
          <MapBreakdownView data={data?.map} />
        </CollapsibleSection>

        {/* Calendar Section */}
        <CollapsibleSection
          title="Calendar Interactions"
          subtitle={`${data?.calendar.totalEvents || 0} events`}
          icon={<Calendar className="w-4 h-4 text-purple-400" />}
          isExpanded={expandedSection === "calendar"}
          onToggle={() => toggleSection("calendar")}
        >
          <CalendarBreakdownView data={data?.calendar} />
        </CollapsibleSection>

        {/* Stella Section */}
        <CollapsibleSection
          title="Stella Chat"
          subtitle={`${data?.stella.totalMessages || 0} messages`}
          icon={<MessageCircle className="w-4 h-4 text-teal-400" />}
          isExpanded={expandedSection === "stella"}
          onToggle={() => toggleSection("stella")}
        >
          <StellaBreakdownView data={data?.stella} />
        </CollapsibleSection>

        {/* Navigation Section */}
        <CollapsibleSection
          title="Navigation Patterns"
          subtitle={`${data?.navigation.totalEvents || 0} tab switches`}
          icon={<Navigation className="w-4 h-4 text-blue-400" />}
          isExpanded={expandedSection === "navigation"}
          onToggle={() => toggleSection("navigation")}
        >
          <NavigationBreakdownView data={data?.navigation} />
        </CollapsibleSection>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
}

// ============================================
// Sub-Components
// ============================================

function SparklineCard({
  label,
  icon,
  data,
  total,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  data: number[];
  total: number;
  color: "emerald" | "teal" | "blue" | "amber" | "purple" | "pink";
}) {
  const colorClasses = {
    emerald: "text-emerald-400 bg-emerald-400",
    teal: "text-teal-400 bg-teal-400",
    blue: "text-blue-400 bg-blue-400",
    amber: "text-amber-400 bg-amber-400",
    purple: "text-purple-400 bg-purple-400",
    pink: "text-pink-400 bg-pink-400",
  };

  const max = Math.max(...data, 1);

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className={colorClasses[color].split(" ")[0]}>{icon}</span>
        <span className="text-sm text-white/60">{label}</span>
      </div>
      <div className="text-xl font-bold font-mono text-white mb-2">
        {total.toLocaleString()}
      </div>
      <div className="flex items-end gap-0.5 h-8">
        {data.map((v, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t ${colorClasses[color].split(" ")[1]} opacity-60`}
            style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? "2px" : "0" }}
          />
        ))}
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  subtitle,
  icon,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/5">{icon}</div>
          <div className="text-left">
            <h3 className="font-medium text-white">{title}</h3>
            <p className="text-xs text-white/40">{subtitle}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-white/40 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-6 pt-0 border-t border-white/5">{children}</div>
      </div>
    </div>
  );
}

function FeatureMatrixTable({ features }: { features: FeatureItem[] }) {
  if (features.length === 0) {
    return <p className="text-white/40 text-sm text-center py-8">No events recorded</p>;
  }

  const formatEventName = (name: string) => {
    return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const max = Math.max(...features.map((f) => f.count), 1);

  return (
    <div className="space-y-3 mt-4">
      {features.slice(0, 12).map((feature, i) => {
        const isPositive = feature.trend >= 0;
        return (
          <div key={feature.name} className="group" style={{ animationDelay: `${i * 30}ms` }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-white/70">{formatEventName(feature.name)}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/40">{feature.uniqueUsers} users</span>
                <span className="text-sm font-mono text-white">{feature.count}</span>
                {feature.trend !== 0 && (
                  <span className={`text-xs flex items-center gap-0.5 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(feature.trend)}%
                  </span>
                )}
              </div>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${(feature.count / max) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MapBreakdownView({ data }: { data?: MapBreakdown }) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      {/* Line Taps by Planet */}
      <div>
        <h4 className="text-sm font-medium text-white/60 mb-3">Line Taps by Planet</h4>
        <div className="space-y-2">
          {data.lineTapsByPlanet.slice(0, 6).map((item) => (
            <div key={item.planet} className="flex items-center justify-between">
              <span className="text-sm text-white/70 capitalize">{item.planet}</span>
              <span className="text-sm font-mono text-white">{item.count}</span>
            </div>
          ))}
          {data.lineTapsByPlanet.length === 0 && (
            <p className="text-white/30 text-sm">No line taps recorded</p>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div>
        <h4 className="text-sm font-medium text-white/60 mb-3">Category Filters Used</h4>
        <div className="space-y-2">
          {data.categoryFilters.slice(0, 6).map((item) => (
            <div key={item.category} className="flex items-center justify-between">
              <span className="text-sm text-white/70 capitalize">{item.category}</span>
              <span className="text-sm font-mono text-white">{item.count}</span>
            </div>
          ))}
          {data.categoryFilters.length === 0 && (
            <p className="text-white/30 text-sm">No filters used</p>
          )}
        </div>
      </div>

      {/* Top Cities */}
      {data.topCities.length > 0 && (
        <div className="md:col-span-2">
          <h4 className="text-sm font-medium text-white/60 mb-3">Top Power Places Explored</h4>
          <div className="flex flex-wrap gap-2">
            {data.topCities.map((item) => (
              <span
                key={item.city}
                className="px-3 py-1 rounded-full text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20"
              >
                {item.city} ({item.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarBreakdownView({ data }: { data?: CalendarBreakdown }) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
      {/* Tab Usage */}
      <div>
        <h4 className="text-sm font-medium text-white/60 mb-3">Tab Usage</h4>
        <div className="space-y-2">
          {data.tabUsage.map((item) => (
            <div key={item.tab} className="flex items-center justify-between">
              <span className="text-sm text-white/70 capitalize">{item.tab}</span>
              <span className="text-sm font-mono text-white">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Goal Usage */}
      <div>
        <h4 className="text-sm font-medium text-white/60 mb-3">Goal Selections</h4>
        <div className="space-y-2">
          {data.goalUsage.map((item) => (
            <div key={item.goal} className="flex items-center justify-between">
              <span className="text-sm text-white/70 capitalize">{item.goal}</span>
              <span className="text-sm font-mono text-white">{item.count}</span>
            </div>
          ))}
          {data.goalUsage.length === 0 && (
            <p className="text-white/30 text-sm">No goals selected</p>
          )}
        </div>
      </div>

      {/* Day Clicks */}
      <div>
        <h4 className="text-sm font-medium text-white/60 mb-3">Day Clicks</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Power Days</span>
            <span className="text-sm font-mono text-emerald-400">{data.dayClicks.powerDays}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Regular Days</span>
            <span className="text-sm font-mono text-white">{data.dayClicks.regularDays}</span>
          </div>
          <div className="pt-2 border-t border-white/5">
            <span className="text-xs text-white/40">
              Power day click rate: <span className="text-emerald-400">{data.dayClicks.powerDayRate}%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StellaBreakdownView({ data }: { data?: StellaBreakdown }) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      <MetricBox label="Total Messages" value={data.totalMessages} />
      <MetricBox label="Avg. Characters" value={data.avgCharCount} />
      <MetricBox label="Avg. Session" value={`${data.avgSessionDuration}s`} />
      <MetricBox label="Sessions Tracked" value={data.sessionsTracked} />
    </div>
  );
}

function NavigationBreakdownView({ data }: { data?: NavigationBreakdown }) {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      {/* Tab Visits */}
      <div>
        <h4 className="text-sm font-medium text-white/60 mb-3">Tab Visits</h4>
        <div className="space-y-2">
          {data.tabVisits.map((item) => (
            <div key={item.tab} className="flex items-center justify-between">
              <span className="text-sm text-white/70 capitalize">{item.tab}</span>
              <span className="text-sm font-mono text-white">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Common Flows */}
      <div>
        <h4 className="text-sm font-medium text-white/60 mb-3">Common Navigation Flows</h4>
        <div className="space-y-2">
          {data.commonFlows.slice(0, 6).map((item) => (
            <div key={item.flow} className="flex items-center justify-between">
              <span className="text-sm text-white/70">{item.flow}</span>
              <span className="text-sm font-mono text-white">{item.count}</span>
            </div>
          ))}
          {data.commonFlows.length === 0 && (
            <p className="text-white/30 text-sm">No flows recorded</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 text-center">
      <div className="text-2xl font-bold font-mono text-white mb-1">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
    </div>
  );
}
