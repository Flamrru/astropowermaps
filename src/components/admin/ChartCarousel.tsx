"use client";

import { useState, useCallback } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

// Comparison day data structure
interface ComparisonDayData {
  label: string; // "Yesterday", "2 days ago", etc.
  data: { date: string; label: string; value: number }[];
  total: number;
}

interface CarouselChart {
  id: string;
  title: string;
  subtitle: string;
  data: { date: string; label: string; value: number | null }[];
  total: number;
  changePercent: number;
  color: string;
  valueFormatter: "currency" | "number";
  // Comparison data for overlay lines
  comparisonDays?: ComparisonDayData[];
}

interface ChartCarouselProps {
  charts: CarouselChart[];
}

// Colors for comparison days (progressively more transparent)
const COMPARISON_COLORS = [
  { stroke: "rgba(255, 255, 255, 0.35)", fill: "rgba(255, 255, 255, 0.08)", label: "Yesterday" },
  { stroke: "rgba(255, 255, 255, 0.22)", fill: "rgba(255, 255, 255, 0.04)", label: "2 days ago" },
  { stroke: "rgba(255, 255, 255, 0.12)", fill: "rgba(255, 255, 255, 0.02)", label: "3 days ago" },
];

// Custom tooltip for multi-line chart
const CustomTooltip = ({
  active,
  payload,
  label,
  formatter,
  comparisonLabels,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string; name?: string }>;
  label?: string;
  formatter: (value: number) => string;
  comparisonLabels?: string[];
}) => {
  if (!active || !payload?.length) return null;

  // Sort: "value" (today) first, then comparison days
  const sorted = [...payload].sort((a, b) => {
    if (a.dataKey === "value") return -1;
    if (b.dataKey === "value") return 1;
    return 0;
  });

  return (
    <div
      className="px-3 py-2 rounded-lg text-sm backdrop-blur-sm"
      style={{
        background: "rgba(10, 10, 20, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
      }}
    >
      <p className="text-white/50 text-xs mb-1.5">{label}</p>
      {sorted.map((entry, i) => {
        const isToday = entry.dataKey === "value";
        const dayLabel = isToday
          ? "Today"
          : comparisonLabels?.[parseInt(entry.dataKey.replace("comp", ""))] || entry.dataKey;
        return (
          <div key={entry.dataKey} className="flex items-center justify-between gap-3">
            <span className={`text-xs ${isToday ? "text-white/70" : "text-white/40"}`}>
              {dayLabel}
            </span>
            <span className={`font-medium ${isToday ? "text-white" : "text-white/50"}`}>
              {formatter(entry.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function ChartCarousel({ charts }: ChartCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Track which comparison days are enabled (up to 3)
  const [enabledComparisons, setEnabledComparisons] = useState<boolean[]>([true, false, false]);

  const goToPrevious = useCallback(() => {
    if (isTransitioning || currentIndex === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
    setTimeout(() => setIsTransitioning(false), 350);
  }, [currentIndex, isTransitioning]);

  const goToNext = useCallback(() => {
    if (isTransitioning || currentIndex === charts.length - 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
    setTimeout(() => setIsTransitioning(false), 350);
  }, [currentIndex, charts.length, isTransitioning]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 350);
    },
    [currentIndex, isTransitioning]
  );

  const toggleComparison = (index: number) => {
    setEnabledComparisons((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  if (!charts.length) return null;

  const currentChart = charts[currentIndex];
  const hasComparisonData = currentChart.comparisonDays && currentChart.comparisonDays.length > 0;

  const formatValue =
    currentChart.valueFormatter === "currency"
      ? (v: number) => `$${(v / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : (v: number) => v.toLocaleString();

  const formatTotal =
    currentChart.valueFormatter === "currency"
      ? `$${(currentChart.total / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : currentChart.total.toLocaleString();

  const isPositive = currentChart.changePercent > 0;
  const isNeutral = currentChart.changePercent === 0;

  // Merge today's data with comparison days for the chart
  const mergeDataWithComparisons = (chart: CarouselChart) => {
    if (!chart.comparisonDays || chart.comparisonDays.length === 0) {
      return chart.data;
    }

    // Create merged data with all comparison values
    // Today's data may have null for future hours, comparison days have full 24h
    return chart.data.map((point, i) => {
      const merged: Record<string, number | string | null> = {
        date: point.date,
        label: point.label,
        value: point.value, // Can be null for future hours
      };

      // Add comparison data (aligned by index = same hour of day)
      chart.comparisonDays?.forEach((compDay, dayIndex) => {
        if (compDay.data[i]) {
          merged[`comp${dayIndex}`] = compDay.data[i].value;
        }
      });

      return merged;
    });
  };

  return (
    <div
      className="rounded-xl overflow-hidden relative"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Header with arrows */}
      <div className="flex items-center justify-between p-4 pb-0">
        {/* Left arrow */}
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0 || isTransitioning}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            currentIndex === 0
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-white/10 active:scale-95"
          }`}
          style={{
            background: currentIndex === 0 ? "transparent" : "rgba(255, 255, 255, 0.05)",
          }}
          aria-label="Previous chart"
        >
          <ChevronLeft className="w-5 h-5 text-white/70" />
        </button>

        {/* Title and subtitle */}
        <div className="text-center flex-1 px-4">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-base font-medium text-white">{currentChart.title}</h3>
            <span className="text-xs text-white/40">•</span>
            <span className="text-sm text-white/50">{currentChart.subtitle}</span>
          </div>
        </div>

        {/* Right arrow */}
        <button
          onClick={goToNext}
          disabled={currentIndex === charts.length - 1 || isTransitioning}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            currentIndex === charts.length - 1
              ? "opacity-30 cursor-not-allowed"
              : "hover:bg-white/10 active:scale-95"
          }`}
          style={{
            background: currentIndex === charts.length - 1 ? "transparent" : "rgba(255, 255, 255, 0.05)",
          }}
          aria-label="Next chart"
        >
          <ChevronRight className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-center gap-4 px-4 pt-3 pb-2">
        <span className="text-2xl font-semibold text-white">{formatTotal}</span>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            isNeutral
              ? "bg-white/10 text-white/60"
              : isPositive
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {isNeutral ? (
            <Minus className="w-3 h-3" />
          ) : isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>
            {isPositive ? "+" : ""}
            {currentChart.changePercent.toFixed(1)}%
          </span>
        </div>
        <span className="text-xs text-white/40">vs yesterday</span>
      </div>

      {/* Comparison day toggles */}
      {hasComparisonData && (
        <div className="flex items-center justify-center gap-2 px-4 pb-2">
          <span className="text-[10px] text-white/30 uppercase tracking-wide mr-1">Compare:</span>
          {currentChart.comparisonDays?.slice(0, 3).map((compDay, index) => (
            <button
              key={index}
              onClick={() => toggleComparison(index)}
              className={`px-2 py-0.5 rounded text-[10px] transition-all duration-200 ${
                enabledComparisons[index]
                  ? "bg-white/15 text-white/70 border border-white/20"
                  : "bg-white/5 text-white/30 border border-transparent hover:bg-white/10"
              }`}
            >
              {compDay.label}
            </button>
          ))}
        </div>
      )}

      {/* Chart area with slide animation */}
      <div className="relative h-52 overflow-hidden">
        <div
          className="absolute inset-0 flex transition-transform duration-300 ease-out"
          style={{
            width: `${charts.length * 100}%`,
            transform: `translateX(-${(currentIndex / charts.length) * 100}%)`,
          }}
        >
          {charts.map((chart) => {
            const mergedData = mergeDataWithComparisons(chart);
            const compLabels = chart.comparisonDays?.map((d) => d.label) || [];

            return (
              <div
                key={chart.id}
                className="h-full px-4"
                style={{ width: `${100 / charts.length}%` }}
              >
                {chart.data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={mergedData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                    >
                      <defs>
                        {/* Gradient for today's line */}
                        <linearGradient id={`gradient-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chart.color} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={chart.color} stopOpacity={0} />
                        </linearGradient>
                        {/* Gradients for comparison days */}
                        {COMPARISON_COLORS.map((_, i) => (
                          <linearGradient key={i} id={`gradient-comp-${chart.id}-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" stopOpacity={0.1} />
                            <stop offset="100%" stopColor="rgba(255,255,255,0)" stopOpacity={0} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255, 255, 255, 0.05)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 10 }}
                        axisLine={{ stroke: "rgba(255, 255, 255, 0.08)" }}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        width={45}
                        tickFormatter={(value) => {
                          if (chart.valueFormatter === "currency") {
                            if (value >= 100000) return `$${(value / 100000).toFixed(0)}k`;
                            if (value >= 100) return `$${(value / 100).toFixed(0)}`;
                            return `$${(value / 100).toFixed(2)}`;
                          }
                          if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                          return value.toString();
                        }}
                      />
                      <Tooltip
                        content={
                          <CustomTooltip
                            formatter={
                              chart.valueFormatter === "currency"
                                ? (v) => `$${(v / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : (v) => v.toLocaleString()
                            }
                            comparisonLabels={compLabels}
                          />
                        }
                      />

                      {/* Render comparison days FIRST (so they appear behind today's line) */}
                      {chart.comparisonDays?.slice(0, 3).map((_, dayIndex) => {
                        // Render in reverse order so older days are furthest back
                        const reverseIndex = (chart.comparisonDays?.length || 0) - 1 - dayIndex;
                        const compConfig = COMPARISON_COLORS[reverseIndex] || COMPARISON_COLORS[0];
                        const isEnabled = enabledComparisons[reverseIndex];

                        if (!isEnabled) return null;

                        return (
                          <Area
                            key={`comp-${reverseIndex}`}
                            type="monotone"
                            dataKey={`comp${reverseIndex}`}
                            stroke={compConfig.stroke}
                            strokeWidth={1.5}
                            strokeDasharray="4 2"
                            fill="transparent"
                            dot={false}
                            activeDot={false}
                            isAnimationActive={false}
                          />
                        );
                      })}

                      {/* Today's line (on top, most prominent) */}
                      {/* connectNulls=false makes line stop at current hour */}
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={chart.color}
                        strokeWidth={2}
                        fill={`url(#gradient-${chart.id})`}
                        dot={false}
                        connectNulls={false}
                        activeDot={{
                          r: 5,
                          fill: chart.color,
                          stroke: "rgba(255,255,255,0.2)",
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-white/40 text-sm">
                    No data available
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 py-4">
        {charts.map((chart, index) => (
          <button
            key={chart.id}
            onClick={() => goToSlide(index)}
            disabled={isTransitioning}
            className={`transition-all duration-200 rounded-full ${
              index === currentIndex
                ? "w-6 h-2"
                : "w-2 h-2 hover:bg-white/30"
            }`}
            style={{
              background:
                index === currentIndex
                  ? charts[currentIndex].color
                  : "rgba(255, 255, 255, 0.2)",
            }}
            aria-label={`Go to ${chart.title} - ${chart.subtitle}`}
          />
        ))}
      </div>
    </div>
  );
}
