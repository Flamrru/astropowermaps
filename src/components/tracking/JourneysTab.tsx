"use client";

import { useState, useEffect } from "react";
import { ArrowRight, LogIn, LogOut as LogOutIcon, Route, Sparkles } from "lucide-react";

interface PointData {
  point: string;
  count: number;
  percentage: number;
}

interface PathData {
  path: string;
  count: number;
  percentage: number;
}

interface ConversionData {
  category: string;
  sessions: number;
  stellaConversions: number;
  conversionRate: number;
}

interface JourneysData {
  entryPoints: PointData[];
  exitPoints: PointData[];
  commonPaths: PathData[];
  conversionFunnel: ConversionData[];
  stats: {
    totalSessions: number;
    avgEventsPerSession: number;
    avgCategoriesPerSession: string;
  };
  generatedAt: string;
}

// Category colors for visual consistency
const CATEGORY_COLORS: Record<string, string> = {
  home: "#10B981",
  dashboard: "#10B981",
  map: "#3B82F6",
  calendar: "#8B5CF6",
  profile: "#F59E0B",
  stella: "#EC4899",
  navigation: "#6366F1",
  engagement: "#14B8A6",
  unknown: "#6B7280",
};

const getColor = (category: string): string => {
  const lower = category.toLowerCase();
  return CATEGORY_COLORS[lower] || CATEGORY_COLORS.unknown;
};

export default function JourneysTab() {
  const [data, setData] = useState<JourneysData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/tracking/journeys");
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Failed to fetch journeys data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-zinc-900/60 rounded-xl p-4 h-20 border border-zinc-800/50" />
          ))}
        </div>
        {/* Entry/Exit Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/60 rounded-xl p-6 h-64 border border-zinc-800/50" />
          <div className="bg-zinc-900/60 rounded-xl p-6 h-64 border border-zinc-800/50" />
        </div>
        {/* Paths Skeleton */}
        <div className="bg-zinc-900/60 rounded-xl p-6 h-48 border border-zinc-800/50" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        Failed to load journeys data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white">User Journeys</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          How users navigate through the app
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 rounded-xl p-4 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Sessions</div>
          <div className="text-2xl font-bold text-white">{data.stats.totalSessions.toLocaleString()}</div>
          <div className="text-xs text-zinc-500 mt-1">Last 30 days</div>
        </div>
        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 rounded-xl p-4 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Avg Events</div>
          <div className="text-2xl font-bold text-white">{data.stats.avgEventsPerSession}</div>
          <div className="text-xs text-zinc-500 mt-1">Per session</div>
        </div>
        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 rounded-xl p-4 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Avg Features</div>
          <div className="text-2xl font-bold text-white">{data.stats.avgCategoriesPerSession}</div>
          <div className="text-xs text-zinc-500 mt-1">Used per session</div>
        </div>
      </div>

      {/* Entry and Exit Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Entry Points */}
        <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2">
            <LogIn className="w-4 h-4 text-emerald-400" />
            <div>
              <h3 className="text-sm font-medium text-white">Entry Points</h3>
              <p className="text-xs text-zinc-500">Where sessions start</p>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {data.entryPoints.length === 0 ? (
              <div className="text-center text-zinc-500 py-6 text-sm">No data yet</div>
            ) : (
              data.entryPoints.map((point, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getColor(point.point) }}
                  />
                  <span className="flex-1 text-sm text-zinc-300 capitalize">
                    {point.point.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-emerald-500/40"
                      style={{ width: `${Math.max(point.percentage * 2, 8)}px` }}
                    />
                    <span className="text-xs text-zinc-400 w-8 text-right">{point.percentage}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Exit Points */}
        <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/50 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2">
            <LogOutIcon className="w-4 h-4 text-amber-400" />
            <div>
              <h3 className="text-sm font-medium text-white">Exit Points</h3>
              <p className="text-xs text-zinc-500">Where sessions end</p>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {data.exitPoints.length === 0 ? (
              <div className="text-center text-zinc-500 py-6 text-sm">No data yet</div>
            ) : (
              data.exitPoints.map((point, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getColor(point.point) }}
                  />
                  <span className="flex-1 text-sm text-zinc-300 capitalize">
                    {point.point.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-amber-500/40"
                      style={{ width: `${Math.max(point.percentage * 2, 8)}px` }}
                    />
                    <span className="text-xs text-zinc-400 w-8 text-right">{point.percentage}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Common Paths */}
      <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2">
          <Route className="w-4 h-4 text-blue-400" />
          <div>
            <h3 className="text-sm font-medium text-white">Common Navigation Paths</h3>
            <p className="text-xs text-zinc-500">Most frequent 3-step journeys</p>
          </div>
        </div>
        <div className="p-4">
          {data.commonPaths.length === 0 ? (
            <div className="text-center text-zinc-500 py-6 text-sm">
              Not enough data for path analysis yet
            </div>
          ) : (
            <div className="space-y-3">
              {data.commonPaths.slice(0, 6).map((path, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex-1 flex items-center gap-2 text-sm overflow-x-auto">
                    {path.path.split(" → ").map((step, stepIdx, arr) => (
                      <span key={stepIdx} className="flex items-center gap-2 whitespace-nowrap">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium capitalize"
                          style={{
                            backgroundColor: `${getColor(step)}20`,
                            color: getColor(step),
                          }}
                        >
                          {step.replace(/_/g, " ")}
                        </span>
                        {stepIdx < arr.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-zinc-600" />
                        )}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-zinc-400">{path.count}×</span>
                    <span className="text-xs text-zinc-500">({path.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feature → Stella Conversion */}
      <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <div>
            <h3 className="text-sm font-medium text-white">Feature → Stella Conversion</h3>
            <p className="text-xs text-zinc-500">Which features lead users to chat with Stella</p>
          </div>
        </div>
        <div className="p-4">
          {data.conversionFunnel.length === 0 ? (
            <div className="text-center text-zinc-500 py-6 text-sm">
              Not enough Stella usage data yet
            </div>
          ) : (
            <div className="space-y-3">
              {data.conversionFunnel.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 w-28 flex-shrink-0">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getColor(item.category) }}
                    />
                    <span className="text-sm text-zinc-300 capitalize truncate">
                      {item.category.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="h-6 bg-zinc-800/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500/60 to-pink-500/30 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${Math.max(item.conversionRate, 5)}%` }}
                      >
                        {item.conversionRate >= 15 && (
                          <span className="text-[10px] text-white font-medium">
                            {item.conversionRate}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right w-20 flex-shrink-0">
                    <div className="text-sm font-medium text-pink-400">
                      {item.conversionRate}%
                    </div>
                    <div className="text-xs text-zinc-500">
                      {item.stellaConversions}/{item.sessions}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end text-xs text-zinc-600 px-1">
        <div>
          Updated {new Date(data.generatedAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
