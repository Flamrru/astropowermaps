"use client";

import { motion } from "framer-motion";
import { Sparkles, AlertTriangle } from "lucide-react";

interface ActionsTabProps {
  bestFor: string[];
  avoid: string[];
}

/**
 * ActionsTab
 *
 * Practical guidance for the day:
 * - "Best For Today" section (green accent)
 * - "Approach with Care" section (amber accent)
 */
export default function ActionsTab({ bestFor, avoid }: ActionsTabProps) {
  return (
    <div className="px-6 py-4 space-y-5">
      {/* Best For Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-emerald-400" />
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/80">
            Best For Today
          </h4>
        </div>

        <div
          className="rounded-xl p-4 space-y-2.5"
          style={{
            background: "rgba(74, 222, 128, 0.05)",
            border: "1px solid rgba(74, 222, 128, 0.15)",
          }}
        >
          {bestFor.map((activity, index) => (
            <motion.div
              key={activity}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="flex items-start gap-2"
            >
              <span className="text-emerald-400 mt-0.5 text-xs">•</span>
              <span className="text-white/80 text-sm">{activity}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Avoid Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} className="text-amber-400" />
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-amber-400/80">
            Approach with Care
          </h4>
        </div>

        <div
          className="rounded-xl p-4 space-y-2.5"
          style={{
            background: "rgba(251, 191, 36, 0.05)",
            border: "1px solid rgba(251, 191, 36, 0.15)",
          }}
        >
          {avoid.map((activity, index) => (
            <motion.div
              key={activity}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + index * 0.05 }}
              className="flex items-start gap-2"
            >
              <span className="text-amber-400 mt-0.5 text-xs">•</span>
              <span className="text-white/70 text-sm">{activity}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
