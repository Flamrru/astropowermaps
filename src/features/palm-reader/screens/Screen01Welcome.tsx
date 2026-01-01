"use client";

import { motion } from "framer-motion";
import { usePalm } from "../lib/palm-state";

// Floating star particle component
function StarParticle({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: "radial-gradient(circle, rgba(232,197,71,0.8) 0%, rgba(201,162,39,0) 70%)",
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0.6, 1, 0],
        scale: [0, 1, 0.8, 1, 0],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
      }}
    />
  );
}

// Constellation line component
function ConstellationLine({ x1, y1, x2, y2, delay }: { x1: number; y1: number; x2: number; y2: number; delay: number }) {
  return (
    <motion.line
      x1={`${x1}%`}
      y1={`${y1}%`}
      x2={`${x2}%`}
      y2={`${y2}%`}
      stroke="rgba(201,162,39,0.3)"
      strokeWidth="1"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.5, delay, ease: "easeOut" }}
    />
  );
}

export default function Screen01Welcome() {
  const { dispatch } = usePalm();

  const handleBegin = async () => {
    // Request camera permission early
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
    } catch {
      // Permission will be handled in capture screen
    }
    dispatch({ type: "NEXT_STEP" });
  };

  // Star positions for the background
  const stars = [
    { x: 15, y: 20, size: 3, delay: 0 },
    { x: 85, y: 15, size: 4, delay: 0.5 },
    { x: 25, y: 75, size: 2, delay: 1 },
    { x: 75, y: 80, size: 3, delay: 1.5 },
    { x: 10, y: 50, size: 2, delay: 2 },
    { x: 90, y: 45, size: 3, delay: 0.3 },
    { x: 50, y: 10, size: 4, delay: 0.8 },
    { x: 35, y: 35, size: 2, delay: 1.2 },
    { x: 65, y: 65, size: 2, delay: 1.8 },
  ];

  // Constellation points for Stella's symbol
  const constellationPoints = [
    { x: 50, y: 30 }, // top
    { x: 35, y: 45 }, // left
    { x: 65, y: 45 }, // right
    { x: 42, y: 60 }, // bottom left
    { x: 58, y: 60 }, // bottom right
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Floating stars background */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star, i) => (
          <StarParticle key={i} {...star} />
        ))}
      </div>

      {/* Radial glow behind Stella */}
      <motion.div
        className="absolute w-80 h-80 pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(201,162,39,0.15) 0%, rgba(201,162,39,0.05) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      {/* Stella's constellation symbol */}
      <motion.div
        className="relative w-40 h-40 mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* SVG constellation */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Constellation lines */}
          <ConstellationLine x1={50} y1={30} x2={35} y2={45} delay={0.3} />
          <ConstellationLine x1={50} y1={30} x2={65} y2={45} delay={0.5} />
          <ConstellationLine x1={35} y1={45} x2={42} y2={60} delay={0.7} />
          <ConstellationLine x1={65} y1={45} x2={58} y2={60} delay={0.9} />
          <ConstellationLine x1={42} y1={60} x2={58} y2={60} delay={1.1} />
          <ConstellationLine x1={35} y1={45} x2={65} y2={45} delay={1.3} />

          {/* Star points */}
          {constellationPoints.map((point, i) => (
            <motion.circle
              key={i}
              cx={`${point.x}%`}
              cy={`${point.y}%`}
              r="3"
              fill="#E8C547"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
            />
          ))}

          {/* Central star glow */}
          <motion.circle
            cx="50%"
            cy="30%"
            r="8"
            fill="url(#starGlow)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Gradient definitions */}
          <defs>
            <radialGradient id="starGlow">
              <stop offset="0%" stopColor="rgba(232,197,71,0.8)" />
              <stop offset="100%" stopColor="rgba(232,197,71,0)" />
            </radialGradient>
          </defs>
        </svg>

        {/* Rotating ring */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(201,162,39,0.2)"
              strokeWidth="0.5"
              strokeDasharray="4 8"
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-3xl font-display text-white text-center mb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        style={{
          textShadow: "0 0 30px rgba(201,162,39,0.3)",
        }}
      >
        Meet{" "}
        <span
          className="text-transparent bg-clip-text"
          style={{
            backgroundImage: "linear-gradient(135deg, #E8C547 0%, #C9A227 50%, #E8C547 100%)",
          }}
        >
          Stella
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm text-white/50 tracking-[0.2em] uppercase mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
      >
        Your Celestial Palm Reader
      </motion.p>

      {/* Speech bubble / intro text */}
      <motion.div
        className="glass-card rounded-2xl p-5 max-w-sm mb-10 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(201,162,39,0.2)",
        }}
      >
        {/* Quote marks */}
        <span
          className="absolute -top-3 -left-1 text-4xl font-display"
          style={{ color: "rgba(201,162,39,0.3)" }}
        >
          "
        </span>
        <p className="text-white/80 text-center leading-relaxed italic">
          The lines on your palm are a map written by the stars.
          Let me guide you through the secrets they hold.
        </p>
        <span
          className="absolute -bottom-5 -right-1 text-4xl font-display"
          style={{ color: "rgba(201,162,39,0.3)" }}
        >
          "
        </span>
      </motion.div>

      {/* Instructions */}
      <motion.div
        className="flex items-center gap-3 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <div className="flex items-center gap-2 text-white/50 text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span>Camera required</span>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        onClick={handleBegin}
        className="relative px-10 py-4 rounded-full font-medium text-cosmic-black overflow-hidden group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          background: "linear-gradient(135deg, #E8C547 0%, #C9A227 100%)",
          boxShadow: "0 0 30px rgba(201,162,39,0.4), 0 10px 40px rgba(0,0,0,0.3)",
        }}
      >
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
          }}
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        />
        <span className="relative z-10 flex items-center gap-2">
          Begin Your Reading
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </motion.button>

      {/* Bottom decorative element */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <svg width="60" height="20" viewBox="0 0 60 20">
          <path
            d="M0 10 L20 10 M40 10 L60 10"
            stroke="#C9A227"
            strokeWidth="1"
          />
          <circle cx="30" cy="10" r="3" fill="#C9A227" />
        </svg>
      </motion.div>
    </div>
  );
}
