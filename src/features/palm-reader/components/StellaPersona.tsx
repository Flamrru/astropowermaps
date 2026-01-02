"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface StellaPersonaProps {
  quote: string;
  variant?: "full" | "compact" | "avatar-only";
  delay?: number;
}

function StellaAvatar({ size = 56 }: { size?: number }) {
  return (
    <motion.div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute inset-[-4px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(232,197,71,0.4) 0%, transparent 70%)",
          filter: "blur(8px)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Main image circle */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          border: "2px solid rgba(201,162,39,0.5)",
          boxShadow: "0 0 20px rgba(201,162,39,0.3)",
        }}
      >
        <Image
          src="/images/stella.png"
          alt="Stella"
          width={size}
          height={size}
          className="w-full h-full object-cover object-top"
          style={{ transform: "scale(1.2)" }}
        />
      </div>

      {/* Rotating ring */}
      <motion.div
        className="absolute inset-[-6px]"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="rgba(201,162,39,0.3)"
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
