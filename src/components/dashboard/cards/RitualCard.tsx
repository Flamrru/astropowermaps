"use client";

import { motion } from "framer-motion";
import { useDashboard } from "../DashboardShell";
import { Moon, PenLine } from "lucide-react";

/**
 * RitualCard
 *
 * Displays today's ritual/journal prompt personalized to the user's chart.
 */
export default function RitualCard() {
  const { state } = useDashboard();
  const { todayRitual, bigThree } = state;

  if (!todayRitual) return null;

  const signReference = todayRitual.signReference;
  const signInfo = signReference
    ? bigThree?.[
        signReference === bigThree?.sun?.sign
          ? "sun"
          : signReference === bigThree?.moon?.sign
            ? "moon"
            : "rising"
      ]
    : null;

  return (
    <motion.div
      className="mx-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
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
        {/* Decorative moon glow in corner */}
        <div
          className="absolute -top-8 -right-8 w-20 h-20 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)",
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Moon
              size={18}
              className="text-purple-400"
              style={{
                filter: "drop-shadow(0 0 6px rgba(139, 92, 246, 0.5))",
              }}
            />
            <span className="text-white/60 text-sm font-medium">
              Today's Ritual
            </span>
          </div>
          {todayRitual.category && (
            <span
              className="text-xs px-2.5 py-1 rounded-full capitalize"
              style={{
                background: "rgba(139, 92, 246, 0.15)",
                color: "#A78BFA",
                border: "1px solid rgba(139, 92, 246, 0.3)",
              }}
            >
              {todayRitual.category}
            </span>
          )}
        </div>

        {/* Sign reference badge */}
        {signReference && (
          <motion.div
            className="inline-flex items-center gap-1.5 mb-3 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <span className="text-white/40">Inspired by your</span>
            <span
              className="px-2 py-0.5 rounded-full"
              style={{
                background: "var(--element-bg, rgba(201, 162, 39, 0.1))",
                color: "var(--element-primary, #E8C547)",
              }}
            >
              {signReference} {signInfo?.symbol}
            </span>
          </motion.div>
        )}

        {/* Prompt text */}
        <motion.blockquote
          className="relative pl-4 mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          style={{
            borderLeft: "2px solid rgba(139, 92, 246, 0.4)",
          }}
        >
          <p className="text-white/80 text-sm leading-relaxed italic">
            "{todayRitual.personalizedPrompt}"
          </p>
        </motion.blockquote>

        {/* Write button */}
        <motion.button
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
          style={{
            background:
              "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)",
            border: "1px solid rgba(139, 92, 246, 0.4)",
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.15)",
          }}
        >
          <PenLine size={16} className="text-purple-300" />
          <span className="text-purple-200 text-sm font-medium">
            Write in journal
          </span>
        </motion.button>

        {/* Subtle star decoration */}
        <div className="absolute bottom-3 right-5 flex gap-1.5 opacity-30">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-purple-300"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
