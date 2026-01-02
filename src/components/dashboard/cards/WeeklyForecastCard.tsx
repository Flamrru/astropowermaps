"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "../DashboardShell";
import { Calendar, ChevronDown, Sparkles } from "lucide-react";

/**
 * WeeklyForecastCard
 *
 * Displays the weekly forecast theme, power days, and expandable summary.
 */
export default function WeeklyForecastCard() {
  const { state } = useDashboard();
  const { weeklyForecast } = state;
  const [isExpanded, setIsExpanded] = useState(false);

  if (!weeklyForecast) return null;

  return (
    <motion.div
      className="mx-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Main content */}
        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar
                size={18}
                style={{ color: "var(--element-primary, #E8C547)" }}
              />
              <span className="text-white/60 text-sm font-medium">
                This Week's Forecast
              </span>
            </div>
          </div>

          {/* Theme badge */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{
                background: "var(--element-bg, rgba(201, 162, 39, 0.1))",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Sparkles size={14} className="text-element" />
              <span className="text-white/90 text-sm font-medium">
                Theme:
              </span>
              <span
                className="font-display font-semibold"
                style={{ color: "var(--element-primary, #E8C547)" }}
              >
                {weeklyForecast.theme}
              </span>
            </div>
          </motion.div>

          {/* Power days */}
          <div className="mb-4">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-2">
              Power Days
            </p>
            <div className="flex flex-wrap gap-2">
              {weeklyForecast.powerDays.map((day, index) => (
                <motion.div
                  key={day.day}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <span className="text-white/90 text-sm font-medium">
                    {day.day.slice(0, 3)}
                  </span>
                  <span className="text-white/40 text-xs">—</span>
                  <span className="text-white/60 text-xs">{day.energy}</span>
                  <span
                    className="text-xs font-medium ml-1"
                    style={{ color: "var(--element-primary, #E8C547)" }}
                  >
                    {day.score}%
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Key insight preview */}
          <p className="text-white/70 text-sm leading-relaxed mb-4">
            {weeklyForecast.keyInsight}
          </p>

          {/* Expand button */}
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all"
            whileTap={{ scale: 0.98 }}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <span className="text-white/60 text-sm">
              {isExpanded ? "Show less" : "Read full forecast"}
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={16} className="text-white/40" />
            </motion.div>
          </motion.button>
        </div>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div
                className="px-5 pb-5 pt-2 border-t"
                style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
              >
                <div className="prose prose-sm prose-invert max-w-none">
                  {weeklyForecast.summary.split("\n\n").map((paragraph, i) => (
                    <motion.p
                      key={i}
                      className="text-white/70 text-sm leading-relaxed mb-3 last:mb-0"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>

                {/* Caution days */}
                {weeklyForecast.cautionDays.length > 0 && (
                  <motion.div
                    className="mt-4 p-3 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    style={{
                      background: "rgba(255, 200, 100, 0.05)",
                      border: "1px solid rgba(255, 200, 100, 0.1)",
                    }}
                  >
                    <p className="text-amber-300/60 text-xs">
                      <span className="mr-1">⚠️</span>
                      <span className="font-medium">Take it easy on:</span>{" "}
                      {weeklyForecast.cautionDays.join(", ")}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
