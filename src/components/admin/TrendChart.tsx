"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendDataPoint {
  date: string;
  label: string;
  current: number;
  previous: number;
}

interface ComparisonData {
  current: number;
  previous: number;
  changePercent: number;
}

interface TrendChartProps {
  title: string;
  data: TrendDataPoint[];
  comparison: ComparisonData;
  valueFormatter?: (value: number) => string;
  color?: string;
}

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
  valueFormatter?: (value: number) => string;
}) => {
  if (!active || !payload?.length) return null;

  const formatValue = valueFormatter || ((v: number) => v.toLocaleString());

  return (
    <div
      className="px-3 py-2 rounded-lg text-sm"
      style={{
        background: "rgba(20, 20, 40, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
      }}
    >
      <p className="text-white/60 text-xs mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className={entry.dataKey === "current" ? "text-white" : "text-white/50"}>
            {entry.dataKey === "current" ? "Current" : "Previous"}:
          </span>
          <span className={entry.dataKey === "current" ? "text-white font-medium" : "text-white/50"}>
            {formatValue(entry.value)}
          </span>
        </p>
      ))}
    </div>
  );
};

export default function TrendChart({
  title,
  data,
  comparison,
  valueFormatter = (v) => v.toLocaleString(),
  color = "var(--gold-main)",
}: TrendChartProps) {
  const changePercent = comparison.changePercent;
  const isPositive = changePercent > 0;
  const isNeutral = changePercent === 0;

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white/80">{title}</h3>
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
            {changePercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={(value) => {
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                  return value.toString();
                }}
              />
              <Tooltip
                content={<CustomTooltip valueFormatter={valueFormatter} />}
              />
              <Line
                type="monotone"
                dataKey="current"
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: color }}
              />
              <Line
                type="monotone"
                dataKey="previous"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 3, fill: "rgba(255, 255, 255, 0.5)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-white/40 text-sm">
            No data for this period
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-white/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 rounded" style={{ background: color }} />
          <span>Current period</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-0.5 rounded"
            style={{
              background: "rgba(255, 255, 255, 0.3)",
              backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)",
            }}
          />
          <span>Previous period</span>
        </div>
      </div>
    </div>
  );
}
