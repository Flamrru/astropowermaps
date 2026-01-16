"use client";

import { useState, useEffect, useCallback } from "react";

interface CohortData {
  cohort: string;
  cohortStart: string;
  userCount: number;
  retention: number[];
}

interface FeatureCorrelation {
  category: string;
  retainedPct: number;
  churnedPct: number;
  lift: number;
}

interface RetentionData {
  cohortSize: string;
  cohorts: CohortData[];
  retentionRates: {
    day1: number;
    day7: number;
    day30: number;
  };
  featureCorrelation: FeatureCorrelation[];
  stats: {
    totalUsers: number;
    retainedUsers: number;
    churnedUsers: number;
    retentionRate: number;
  };
  generatedAt: string;
}

export default function RetentionTab() {
  const [data, setData] = useState<RetentionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cohortSize, setCohortSize] = useState<"week" | "month">("week");

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/tracking/retention?cohort_size=${cohortSize}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch retention data:", error);
    } finally {
      setLoading(false);
    }
  }, [cohortSize]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  // Get color for retention percentage
  const getRetentionColor = (value: number) => {
    if (value >= 80) return "bg-emerald-500/90";
    if (value >= 60) return "bg-emerald-500/70";
    if (value >= 40) return "bg-emerald-500/50";
    if (value >= 20) return "bg-emerald-500/30";
    if (value > 0) return "bg-emerald-500/15";
    return "bg-zinc-800/50";
  };

  // Get text color based on background
  const getTextColor = (value: number) => {
    if (value >= 60) return "text-white";
    if (value >= 20) return "text-zinc-200";
    return "text-zinc-400";
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-zinc-900/60 rounded-xl p-4 h-24 border border-zinc-800/50" />
          ))}
        </div>
        {/* Cohort Grid Skeleton */}
        <div className="bg-zinc-900/60 rounded-xl p-6 h-80 border border-zinc-800/50" />
        {/* Feature Correlation Skeleton */}
        <div className="bg-zinc-900/60 rounded-xl p-6 h-48 border border-zinc-800/50" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        Failed to load retention data
      </div>
    );
  }

  const maxPeriods = Math.max(...data.cohorts.map(c => c.retention.length), 1);

  return (
    <div className="space-y-6">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Retention Analysis</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Track how users return over time
          </p>
        </div>
        <div className="flex bg-zinc-800/60 rounded-lg p-1 border border-zinc-700/50">
          <button
            onClick={() => setCohortSize("week")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              cohortSize === "week"
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setCohortSize("month")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              cohortSize === "month"
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Return Rate KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Day 1 */}
        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 rounded-xl p-4 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Day 1 Return</div>
          <div className="text-2xl font-bold text-white">{data.retentionRates.day1}%</div>
          <div className="text-xs text-zinc-500 mt-1">Next day after signup</div>
        </div>

        {/* Day 7 */}
        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 rounded-xl p-4 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Day 7 Return</div>
          <div className="text-2xl font-bold text-white">{data.retentionRates.day7}%</div>
          <div className="text-xs text-zinc-500 mt-1">Active in first week</div>
        </div>

        {/* Day 30 */}
        <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 rounded-xl p-4 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Day 30 Return</div>
          <div className="text-2xl font-bold text-white">{data.retentionRates.day30}%</div>
          <div className="text-xs text-zinc-500 mt-1">Active in first month</div>
        </div>

        {/* Overall Retention */}
        <div className="bg-gradient-to-br from-emerald-900/30 to-zinc-900/40 rounded-xl p-4 border border-emerald-800/30">
          <div className="text-xs text-emerald-400/80 uppercase tracking-wider mb-1">Currently Active</div>
          <div className="text-2xl font-bold text-emerald-400">{data.stats.retentionRate}%</div>
          <div className="text-xs text-zinc-500 mt-1">
            {data.stats.retainedUsers} of {data.stats.totalUsers} users
          </div>
        </div>
      </div>

      {/* Cohort Retention Grid */}
      <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800/50">
          <h3 className="text-sm font-medium text-white">Cohort Retention Grid</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {cohortSize === "week" ? "Weekly" : "Monthly"} cohorts showing % of users active in each period
          </p>
        </div>

        {data.cohorts.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            Not enough data for cohort analysis yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Cohort
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Users
                  </th>
                  {[...Array(maxPeriods)].map((_, i) => (
                    <th key={i} className="px-3 py-3 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      {cohortSize === "week" ? `W${i}` : `M${i}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.cohorts.map((cohort, idx) => (
                  <tr key={idx} className="border-b border-zinc-800/30 last:border-0">
                    <td className="px-4 py-3 text-sm text-zinc-300 whitespace-nowrap">
                      {cohort.cohort}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-zinc-400">
                      {cohort.userCount}
                    </td>
                    {[...Array(maxPeriods)].map((_, i) => {
                      const value = cohort.retention[i];
                      const hasValue = value !== undefined;
                      return (
                        <td key={i} className="px-1 py-2">
                          <div
                            className={`mx-auto w-12 h-8 rounded flex items-center justify-center text-xs font-medium transition-all ${
                              hasValue
                                ? `${getRetentionColor(value)} ${getTextColor(value)}`
                                : "bg-zinc-800/20 text-zinc-600"
                            }`}
                          >
                            {hasValue ? `${value}%` : "–"}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Feature Correlation */}
      <div className="bg-zinc-900/60 rounded-xl border border-zinc-800/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800/50">
          <h3 className="text-sm font-medium text-white">What Keeps Users Coming Back</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Features used more by retained users vs churned users
          </p>
        </div>

        {data.featureCorrelation.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            Not enough data for correlation analysis
          </div>
        ) : (
          <div className="p-4">
            <div className="grid gap-3">
              {data.featureCorrelation.slice(0, 6).map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-200 capitalize">
                      {feature.category.replace(/_/g, " ")}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-emerald-400">
                        Retained: {feature.retainedPct}%
                      </span>
                      <span className="text-xs text-zinc-500">
                        Churned: {feature.churnedPct}%
                      </span>
                    </div>
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      feature.lift > 0
                        ? "bg-emerald-500/20 text-emerald-400"
                        : feature.lift < 0
                        ? "bg-red-500/20 text-red-400"
                        : "bg-zinc-700/50 text-zinc-400"
                    }`}
                  >
                    {feature.lift > 0 ? "+" : ""}{feature.lift}% lift
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-zinc-800/50 text-xs text-zinc-500">
              <span className="text-emerald-400">Positive lift</span> = feature is correlated with retention
            </div>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="flex items-center justify-between text-xs text-zinc-600 px-1">
        <div>
          {data.stats.retainedUsers} active • {data.stats.churnedUsers} churned
        </div>
        <div>
          Updated {new Date(data.generatedAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
