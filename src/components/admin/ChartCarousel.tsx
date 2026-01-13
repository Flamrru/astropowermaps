"use client";

import { useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CarouselChart {
  id: string;
  title: string;
  subtitle: string;
  data: { date: string; label: string; value: number }[];
  total: number;
  changePercent: number;
  color: string;
  valueFormatter: "currency" | "number";
}

interface ChartCarouselProps {
  charts: CarouselChart[];
}

// Custom tooltip for single-line chart
const CustomTooltip = ({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
  formatter: (value: number) => string;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="px-3 py-2 rounded-lg text-sm backdrop-blur-sm"
      style={{
        background: "rgba(10, 10, 20, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
      }}
    >
      <p className="text-white/50 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold">{formatter(payload[0].value)}</p>
    </div>
  );
};

export default function ChartCarousel({ charts }: ChartCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  if (!charts.length) return null;

  const currentChart = charts[currentIndex];
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
        <span className="text-xs text-white/40">vs previous</span>
      </div>

      {/* Chart area with slide animation */}
      <div className="relative h-52 overflow-hidden">
        <div
          className="absolute inset-0 flex transition-transform duration-300 ease-out"
          style={{
            width: `${charts.length * 100}%`,
            transform: `translateX(-${(currentIndex / charts.length) * 100}%)`,
          }}
        >
          {charts.map((chart) => (
            <div
              key={chart.id}
              className="h-full px-4"
              style={{ width: `${100 / charts.length}%` }}
            >
              {chart.data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chart.data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id={`gradient-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chart.color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={chart.color} stopOpacity={0} />
                      </linearGradient>
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
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={chart.color}
                      strokeWidth={2}
                      fill={`url(#gradient-${chart.id})`}
                      dot={false}
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
          ))}
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
