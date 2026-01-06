"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import type { EnhancedDayData } from "@/lib/dashboard-types";

interface EnergyTabProps {
  data: EnhancedDayData;
  formattedDate: string;
  onAskStella: () => void;
}

/**
 * EnergyTab
 *
 * Hero tab showing:
 * - Large power score with glow
 * - Score label (Power Day / Balanced / Rest Day)
 * - 1-2 sentence personalized summary
 * - Moon phase badge
 * - "Ask Stella" button
 */
export default function EnergyTab({
  data,
  formattedDate,
  onAskStella,
}: EnergyTabProps) {
  // Score color based on label
  const scoreColors = {
    power: {
      gradient: "linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)",
      glow: "rgba(74, 222, 128, 0.4)",
      text: "#4ADE80",
      label: "POWER DAY",
    },
    balanced: {
      gradient: "linear-gradient(135deg, #E8C547 0%, #C9A227 100%)",
      glow: "rgba(232, 197, 71, 0.4)",
      text: "#E8C547",
      label: "BALANCED",
    },
    rest: {
      gradient: "linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)",
      glow: "rgba(167, 139, 250, 0.4)",
      text: "#A78BFA",
      label: "REST DAY",
    },
  };

  const colors = scoreColors[data.scoreLabel];

  // Moon phase emoji
  const moonEmoji: Record<string, string> = {
    "New Moon": "🌑",
    "Waxing Crescent": "🌒",
    "First Quarter": "🌓",
    "Waxing Gibbous": "🌔",
    "Full Moon": "🌕",
    "Waning Gibbous": "🌖",
    "Last Quarter": "🌗",
    "Waning Crescent": "🌘",
  };

  return (
    <div className="px-6 py-5 space-y-6">
      {/* Score Circle */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="flex flex-col items-center"
      >
        {/* Outer glow */}
        <div className="relative">
          <motion.div
            className="absolute inset-[-20px] rounded-full"
            style={{
              background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Score circle */}
          <div
            className="relative w-28 h-28 rounded-full flex flex-col items-center justify-center"
            style={{
              background: `linear-gradient(135deg, rgba(20, 20, 35, 0.8), rgba(20, 20, 35, 0.95))`,
              border: `2px solid ${colors.text}40`,
              boxShadow: `0 0 30px ${colors.glow}, inset 0 0 20px rgba(0, 0, 0, 0.3)`,
            }}
          >
            {/* Score number */}
            <span
              className="text-4xl font-light"
              style={{ color: colors.text }}
            >
              {data.score}
            </span>

            {/* Divider line */}
            <div
              className="w-12 h-px my-1"
              style={{ background: `${colors.text}40` }}
            />

            {/* Label */}
            <span
              className="text-[10px] tracking-[0.15em] font-medium"
              style={{ color: colors.text }}
            >
              {colors.label}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center text-white/70 text-sm leading-relaxed px-2"
      >
        {data.summary}
      </motion.p>

      {/* Moon Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center"
      >
        <div
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <span className="text-lg">{moonEmoji[data.moon.phase] || "🌙"}</span>
          <div className="text-left">
            <div className="text-white/90 text-sm font-medium">
              {data.moon.phase} in {data.moon.sign}
            </div>
            <div className="text-white/40 text-xs">
              {data.moon.meaning}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Ask Stella Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={onAskStella}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
        style={{
          background: "linear-gradient(135deg, rgba(201, 162, 39, 0.15), rgba(139, 92, 246, 0.1))",
          border: "1px solid rgba(201, 162, 39, 0.3)",
        }}
      >
        <MessageCircle size={16} className="text-[#E8C547]" />
        <span className="text-[#E8C547] text-sm font-medium">
          Ask Stella about this day
        </span>
      </motion.button>
    </div>
  );
}
