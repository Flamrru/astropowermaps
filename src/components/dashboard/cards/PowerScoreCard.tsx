"use client";

import { motion } from "framer-motion";
import { useDashboard } from "../DashboardShell";
import { Sparkles } from "lucide-react";

/**
 * PowerScoreCard
 *
 * Displays today's power score (0-100) with an element-colored progress bar
 * and personalized guidance message.
 */
export default function PowerScoreCard() {
  const { state } = useDashboard();
  const { dailyScore, bigThree } = state;

  if (!dailyScore) return null;

  const sunSign = bigThree?.sun?.sign ?? "your sign";
  const element = bigThree?.sun?.element ?? "fire";

  // Determine score tier for visual feedback
  const scoreTier =
    dailyScore.score >= 80
      ? "excellent"
      : dailyScore.score >= 60
        ? "good"
        : dailyScore.score >= 40
          ? "moderate"
          : "rest";

  const tierConfig = {
    excellent: { label: "Power Day", emoji: "⚡" },
    good: { label: "Flowing Energy", emoji: "✨" },
    moderate: { label: "Steady Energy", emoji: "🌊" },
    rest: { label: "Rest & Reflect", emoji: "🌙" },
  };

  const tier = tierConfig[scoreTier];

  return (
    <motion.div
      className="mx-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
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
            <Sparkles
              size={18}
              style={{ color: "var(--element-primary, #E8C547)" }}
            />
            <span className="text-white/60 text-sm font-medium">
              Today's Power Score
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
              background: "var(--element-bg, rgba(201, 162, 39, 0.1))",
              color: "var(--element-primary, #E8C547)",
              border: "1px solid var(--element-primary, #C9A227)",
              opacity: 0.9,
            }}
          >
            <span>{tier.emoji}</span>
            <span>{tier.label}</span>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex items-end gap-4 mb-4">
          {/* Large score number */}
          <motion.div
            className="relative"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="text-5xl font-display font-bold tracking-tight"
              style={{
                background: "var(--element-gradient, linear-gradient(135deg, #F59E0B 0%, #DC2626 100%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 20px var(--element-glow, rgba(245, 158, 11, 0.4)))",
              }}
            >
              {dailyScore.score}
            </span>
            <span className="text-white/40 text-lg ml-1">/100</span>
          </motion.div>

          {/* Progress bar */}
          <div className="flex-1 pb-2">
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
              }}
            >
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${dailyScore.score}%` }}
                transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: "var(--element-gradient, linear-gradient(90deg, #F59E0B 0%, #DC2626 100%))",
                  boxShadow: "0 0 12px var(--element-glow, rgba(245, 158, 11, 0.5))",
                }}
              />
            </div>
          </div>
        </div>

        {/* Main message */}
        <motion.p
          className="text-white/80 text-sm leading-relaxed mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {dailyScore.message}
        </motion.p>

        {/* Avoid tip (if present) */}
        {dailyScore.avoid && (
          <motion.div
            className="flex items-start gap-2 p-3 rounded-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <span className="text-amber-400/80 text-sm">⚠️</span>
            <p className="text-white/50 text-xs leading-relaxed">
              {dailyScore.avoid}
            </p>
          </motion.div>
        )}

        {/* Subtle corner decoration */}
        <div
          className="absolute -top-12 -right-12 w-24 h-24 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, var(--element-glow, rgba(245, 158, 11, 0.15)) 0%, transparent 70%)",
          }}
        />
      </div>
    </motion.div>
  );
}
