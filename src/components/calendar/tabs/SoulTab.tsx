"use client";

import { motion } from "framer-motion";
import { Flame, PenLine } from "lucide-react";
import type { DayRitual } from "@/lib/dashboard-types";

interface SoulTabProps {
  ritual?: DayRitual;
  journalPrompt?: string;
}

/**
 * SoulTab
 *
 * AI-generated ritual and journaling prompt:
 * - Ritual card with title, context, steps, timing
 * - Journaling prompt for reflection
 */
export default function SoulTab({ ritual, journalPrompt }: SoulTabProps) {
  // Show placeholder if no ritual generated yet
  if (!ritual && !journalPrompt) {
    return (
      <div className="px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-3xl mb-3">🕯️</div>
          <p className="text-white/50 text-sm mb-2">
            Your personalized ritual is being prepared...
          </p>
          <p className="text-white/30 text-xs">
            Check back soon for cosmic guidance.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-5">
      {/* Ritual Card */}
      {ritual && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Flame size={14} className="text-orange-400" />
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-orange-400/80">
              Today's Practice
            </h4>
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              background: "linear-gradient(135deg, rgba(251, 146, 60, 0.08), rgba(139, 92, 246, 0.05))",
              border: "1px solid rgba(251, 146, 60, 0.2)",
            }}
          >
            {/* Ritual title */}
            <h3 className="text-white font-medium text-base mb-2">
              {ritual.title}
            </h3>

            {/* Context */}
            <p className="text-white/60 text-sm mb-4 leading-relaxed">
              {ritual.context}
            </p>

            {/* Steps */}
            <div className="space-y-2 mb-4">
              {ritual.steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{
                      background: "rgba(251, 146, 60, 0.2)",
                      color: "#FB923C",
                    }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-white/70 text-sm pt-0.5">{step}</span>
                </motion.div>
              ))}
            </div>

            {/* Timing */}
            <div
              className="text-xs text-white/40 pt-3 border-t"
              style={{ borderColor: "rgba(255, 255, 255, 0.08)" }}
            >
              <span className="text-orange-400/60">Best timing:</span>{" "}
              {ritual.timing}
            </div>
          </div>
        </motion.div>
      )}

      {/* Journal Prompt */}
      {journalPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ritual ? 0.4 : 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <PenLine size={14} className="text-violet-400" />
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-violet-400/80">
              Journaling Prompt
            </h4>
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(139, 92, 246, 0.05)",
              border: "1px solid rgba(139, 92, 246, 0.15)",
            }}
          >
            <p className="text-white/80 text-sm italic leading-relaxed">
              "{journalPrompt}"
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
