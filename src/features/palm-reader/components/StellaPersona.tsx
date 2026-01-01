"use client";

import { motion } from "framer-motion";

interface StellaPersonaProps {
  quote: string;
  variant?: "full" | "compact" | "avatar-only";
  delay?: number;
}

// Constellation points for Stella's star symbol
const CONSTELLATION_POINTS = [
  { x: 50, y: 15 }, // Top star
  { x: 30, y: 35 }, // Left
  { x: 70, y: 35 }, // Right
  { x: 38, y: 60 }, // Bottom left
  { x: 62, y: 60 }, // Bottom right
];

const CONSTELLATION_LINES = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
  [3, 4],
  [1, 2],
];

function StellaAvatar({ size = 56 }: { size?: number }) {
  return (
    <motion.div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(232,197,71,0.3) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main circle */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(135deg, rgba(201,162,39,0.2) 0%, rgba(5,5,16,0.9) 100%)",
          border: "1px solid rgba(201,162,39,0.4)",
          boxShadow: "inset 0 0 20px rgba(201,162,39,0.1)",
        }}
      />

      {/* Constellation SVG */}
      <svg
        viewBox="0 0 100 80"
        className="absolute inset-0 w-full h-full p-2"
        style={{ transform: "translateY(10%)" }}
      >
        {/* Constellation lines */}
        {CONSTELLATION_LINES.map(([from, to], i) => (
          <motion.line
            key={i}
            x1={CONSTELLATION_POINTS[from].x}
            y1={CONSTELLATION_POINTS[from].y}
            x2={CONSTELLATION_POINTS[to].x}
            y2={CONSTELLATION_POINTS[to].y}
            stroke="rgba(232,197,71,0.4)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
          />
        ))}

        {/* Stars at each point */}
        {CONSTELLATION_POINTS.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={i === 0 ? 4 : 2.5}
            fill="#E8C547"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          />
        ))}

        {/* Central glow on main star */}
        <motion.circle
          cx={50}
          cy={15}
          r="8"
          fill="url(#stellaGlow)"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <defs>
          <radialGradient id="stellaGlow">
            <stop offset="0%" stopColor="rgba(232,197,71,0.6)" />
            <stop offset="100%" stopColor="rgba(232,197,71,0)" />
          </radialGradient>
        </defs>
      </svg>

      {/* Rotating ring */}
      <motion.div
        className="absolute inset-[-4px]"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="rgba(201,162,39,0.2)"
            strokeWidth="0.5"
            strokeDasharray="6 4"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

export default function StellaPersona({
  quote,
  variant = "full",
  delay = 0,
}: StellaPersonaProps) {
  if (variant === "avatar-only") {
    return <StellaAvatar />;
  }

  return (
    <motion.div
      className={`flex gap-4 ${variant === "compact" ? "items-center" : "items-start"}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
    >
      {/* Avatar */}
      <StellaAvatar size={variant === "compact" ? 40 : 56} />

      {/* Speech content */}
      <div className="flex-1 min-w-0">
        {/* Name badge */}
        {variant === "full" && (
          <motion.div
            className="flex items-center gap-2 mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3 }}
          >
            <span
              className="text-sm font-medium"
              style={{
                background: "linear-gradient(135deg, #E8C547, #C9A227)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Stella
            </span>
            <span className="text-xs text-white/40">says</span>
          </motion.div>
        )}

        {/* Quote bubble */}
        <motion.div
          className="relative rounded-2xl p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.2, duration: 0.5 }}
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(201,162,39,0.2)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          }}
        >
          {/* Quote marks */}
          <span
            className="absolute -top-2 left-3 text-2xl font-display"
            style={{ color: "rgba(201,162,39,0.4)" }}
          >
            "
          </span>

          <p
            className={`text-white/80 leading-relaxed italic ${
              variant === "compact" ? "text-sm" : "text-base"
            }`}
          >
            {quote}
          </p>

          <span
            className="absolute -bottom-3 right-3 text-2xl font-display"
            style={{ color: "rgba(201,162,39,0.4)" }}
          >
            "
          </span>

          {/* Subtle corner accent */}
          <div
            className="absolute top-0 right-0 w-8 h-8 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at top right, rgba(201,162,39,0.1) 0%, transparent 70%)",
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
