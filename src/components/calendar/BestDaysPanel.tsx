"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { BestDay, GoalCategory } from "@/lib/dashboard-types";
import { GOAL_CONFIG } from "./GoalPicker";

interface BestDaysPanelProps {
  bestDays: BestDay[];
  goal: GoalCategory;
  onDayClick?: (date: string) => void;
}

/**
 * BestDaysPanel
 *
 * Shows a ranked list of the best days for the selected goal.
 * Appears below the calendar when a goal is selected.
 */
export default function BestDaysPanel({ bestDays, goal, onDayClick }: BestDaysPanelProps) {
  const config = GOAL_CONFIG[goal];

  if (bestDays.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: 20, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6 px-4"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: `${config.color}20` }}
          >
            <config.Icon size={12} style={{ color: config.color }} />
          </div>
          <span className="text-white/60 text-xs">
            Best days for <span style={{ color: config.color }}>{config.label.toLowerCase()}</span>
          </span>
        </div>

        {/* Best Days List */}
        <div className="divide-y divide-white/5">
          {bestDays.map((day, index) => (
            <motion.button
              key={day.date}
              onClick={() => onDayClick?.(day.date)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left"
            >
              {/* Rank Badge */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                style={{
                  background: index === 0 ? `${config.color}30` : "rgba(255, 255, 255, 0.05)",
                  color: index === 0 ? config.color : "rgba(255, 255, 255, 0.4)",
                }}
              >
                {index + 1}
              </div>

              {/* Date & Reason */}
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium">{day.displayDate}</div>
                <div className="text-white/40 text-xs truncate">{day.reason}</div>
              </div>

              {/* Score */}
              <div className="flex-shrink-0 flex items-center gap-2">
                {/* Score bar */}
                <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${day.score}%` }}
                    transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ background: config.color }}
                  />
                </div>
                {/* Score number */}
                <span
                  className="text-xs font-medium tabular-nums"
                  style={{ color: config.color }}
                >
                  {day.score}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
