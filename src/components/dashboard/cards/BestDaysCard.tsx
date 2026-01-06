"use client";

import { motion } from "framer-motion";
import { useDashboard } from "../DashboardShell";
import { Star, Heart, Briefcase, Palette, Compass, Sparkles } from "lucide-react";
import type { GoalCategory } from "@/lib/dashboard-types";

/**
 * BestDaysCard
 *
 * Shows upcoming power days with their recommended goals.
 * Quick glance at the best days in the next 30 days.
 */

const goalIcons: Record<GoalCategory, React.ReactNode> = {
  love: <Heart size={14} />,
  career: <Briefcase size={14} />,
  creativity: <Palette size={14} />,
  clarity: <Compass size={14} />,
  adventure: <Sparkles size={14} />,
};

const goalColors: Record<GoalCategory, string> = {
  love: "#EC4899",
  career: "#3B82F6",
  creativity: "#F59E0B",
  clarity: "#8B5CF6",
  adventure: "#10B981",
};

export default function BestDaysCard() {
  const { state } = useDashboard();
  const { bestDays } = state;

  if (!bestDays || bestDays.length === 0) return null;

  // Show first 3 best days
  const displayDays = bestDays.slice(0, 3);

  return (
    <motion.div
      className="mx-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <div
        className="relative overflow-hidden rounded-2xl p-5"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star
              size={18}
              style={{ color: "var(--element-primary, #E8C547)" }}
            />
            <span className="text-white/60 text-sm font-medium">
              Best Days Coming Up
            </span>
          </div>
          <span className="text-white/30 text-xs">Next 30 days</span>
        </div>

        {/* Best days list */}
        <div className="space-y-3">
          {displayDays.map((day, index) => (
            <motion.div
              key={day.date}
              className="flex items-center gap-3 p-3 rounded-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              {/* Date */}
              <div className="flex-shrink-0 w-16">
                <span className="text-white/90 text-sm font-medium">
                  {day.displayDate}
                </span>
              </div>

              {/* Goal badge */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                  background: `${goalColors[day.goal]}15`,
                  border: `1px solid ${goalColors[day.goal]}40`,
                }}
              >
                <span style={{ color: goalColors[day.goal] }}>
                  {goalIcons[day.goal]}
                </span>
                <span
                  className="text-xs font-medium capitalize"
                  style={{ color: goalColors[day.goal] }}
                >
                  {day.goal}
                </span>
              </div>

              {/* Score */}
              <div className="ml-auto flex items-center gap-2">
                <div
                  className="w-12 h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(255, 255, 255, 0.1)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${day.score}%` }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    style={{ background: goalColors[day.goal] }}
                  />
                </div>
                <span
                  className="text-xs font-medium"
                  style={{ color: goalColors[day.goal] }}
                >
                  {day.score}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.div>
  );
}
