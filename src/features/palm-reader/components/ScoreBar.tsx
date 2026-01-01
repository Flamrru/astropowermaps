"use client";

import { motion } from "framer-motion";

interface ScoreBarProps {
  label: string;
  score: number; // 0-100
  delay?: number;
  icon?: React.ReactNode;
}

export default function ScoreBar({ label, score, delay = 0, icon }: ScoreBarProps) {
  // Color based on score ranges
  const getColor = () => {
    if (score >= 80) return { main: "#E8C547", glow: "rgba(232,197,71,0.5)" }; // Gold - exceptional
    if (score >= 65) return { main: "#C9A227", glow: "rgba(201,162,39,0.4)" }; // Dark gold - strong
    if (score >= 50) return { main: "#9B7ED9", glow: "rgba(155,126,217,0.4)" }; // Purple - moderate
    return { main: "#E8A4C9", glow: "rgba(232,164,201,0.4)" }; // Pink - developing
  };

  const colors = getColor();

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
    >
      {/* Icon */}
      {icon && (
        <motion.div
          className="w-8 h-8 flex items-center justify-center flex-shrink-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
        >
          {icon}
        </motion.div>
      )}

      {/* Label */}
      <span className="w-28 text-sm text-white/70 flex-shrink-0 truncate">
        {label}
      </span>

      {/* Bar container */}
      <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden relative">
        {/* Animated fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{
            delay: delay + 0.3,
            duration: 1.2,
            ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for organic feel
          }}
          style={{
            background: `linear-gradient(90deg, ${colors.main}dd, ${colors.main})`,
            boxShadow: `0 0 12px ${colors.glow}, 0 0 4px ${colors.glow}`,
          }}
        />

        {/* Shimmer overlay */}
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            delay: delay + 1.2,
            duration: 1,
            ease: "easeInOut",
          }}
          style={{
            background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
            width: "50%",
          }}
        />
      </div>

      {/* Score value */}
      <motion.span
        className="w-12 text-right text-sm font-medium tabular-nums"
        style={{ color: colors.main }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 1, duration: 0.5 }}
      >
        {score}%
      </motion.span>
    </motion.div>
  );
}
