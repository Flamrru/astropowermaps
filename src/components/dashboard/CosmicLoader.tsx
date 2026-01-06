"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Mystical loading messages that cycle
const LOADING_MESSAGES = [
  "Reading the stars...",
  "Aligning your cosmic map...",
  "Consulting the planets...",
  "Unveiling celestial secrets...",
  "Charting your destiny...",
];

// Star particle component
function StarParticle({ delay, size, x, y, duration }: {
  delay: number;
  size: number;
  x: number;
  y: number;
  duration: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: `radial-gradient(circle, rgba(232, 197, 71, ${0.6 + Math.random() * 0.4}) 0%, transparent 70%)`,
        boxShadow: `0 0 ${size * 2}px rgba(232, 197, 71, 0.3)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1.2, 0],
        y: [0, -20, -40],
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Constellation that draws itself
function ConstellationDrawing() {
  // Simple constellation path - like a small dipper pattern
  const points = [
    { x: 50, y: 30 },
    { x: 65, y: 35 },
    { x: 75, y: 50 },
    { x: 70, y: 65 },
    { x: 55, y: 70 },
    { x: 40, y: 60 },
    { x: 35, y: 45 },
  ];

  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full"
      style={{ filter: "drop-shadow(0 0 10px rgba(232, 197, 71, 0.5))" }}
    >
      {/* Connection lines that draw themselves */}
      {points.map((point, i) => {
        if (i === 0) return null;
        const prev = points[i - 1];
        return (
          <motion.line
            key={`line-${i}`}
            x1={prev.x}
            y1={prev.y}
            x2={point.x}
            y2={point.y}
            stroke="rgba(232, 197, 71, 0.4)"
            strokeWidth="0.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Stars at connection points */}
      {points.map((point, i) => (
        <motion.circle
          key={`star-${i}`}
          cx={point.x}
          cy={point.y}
          r="1.5"
          fill="#E8C547"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.5, 1],
            opacity: 1,
          }}
          transition={{
            duration: 0.5,
            delay: i * 0.3,
            ease: "backOut",
          }}
        />
      ))}

      {/* Glowing halos around stars */}
      {points.map((point, i) => (
        <motion.circle
          key={`halo-${i}`}
          cx={point.x}
          cy={point.y}
          r="3"
          fill="none"
          stroke="rgba(232, 197, 71, 0.3)"
          strokeWidth="0.5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            delay: i * 0.3 + 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}

// Rotating zodiac ring
function ZodiacRing() {
  const zodiacSymbols = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={{ rotate: 360 }}
      transition={{
        duration: 60,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <div className="relative w-64 h-64">
        {zodiacSymbols.map((symbol, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const radius = 120;
          const x = Math.cos(angle) * radius + 128;
          const y = Math.sin(angle) * radius + 128;

          return (
            <motion.span
              key={symbol}
              className="absolute text-lg select-none"
              style={{
                left: x,
                top: y,
                transform: "translate(-50%, -50%)",
                color: "rgba(232, 197, 71, 0.15)",
                textShadow: "0 0 10px rgba(232, 197, 71, 0.1)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              {symbol}
            </motion.span>
          );
        })}
      </div>
    </motion.div>
  );
}

// Inner glowing orb
function CelestialOrb() {
  return (
    <div className="relative w-32 h-32">
      {/* Outer glow rings */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(232, 197, 71, 0.1) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.2, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Middle ring */}
      <motion.div
        className="absolute inset-4 rounded-full"
        style={{
          border: "1px solid rgba(232, 197, 71, 0.2)",
          boxShadow: "0 0 30px rgba(232, 197, 71, 0.1), inset 0 0 30px rgba(232, 197, 71, 0.05)",
        }}
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Inner orb */}
      <motion.div
        className="absolute inset-8 rounded-full flex items-center justify-center"
        style={{
          background: "radial-gradient(circle at 30% 30%, rgba(232, 197, 71, 0.3) 0%, rgba(201, 162, 39, 0.1) 50%, rgba(139, 92, 246, 0.1) 100%)",
          boxShadow: `
            0 0 60px rgba(232, 197, 71, 0.3),
            inset 0 0 30px rgba(232, 197, 71, 0.2),
            0 0 100px rgba(139, 92, 246, 0.1)
          `,
        }}
        animate={{
          boxShadow: [
            "0 0 60px rgba(232, 197, 71, 0.3), inset 0 0 30px rgba(232, 197, 71, 0.2), 0 0 100px rgba(139, 92, 246, 0.1)",
            "0 0 80px rgba(232, 197, 71, 0.5), inset 0 0 40px rgba(232, 197, 71, 0.3), 0 0 120px rgba(139, 92, 246, 0.2)",
            "0 0 60px rgba(232, 197, 71, 0.3), inset 0 0 30px rgba(232, 197, 71, 0.2), 0 0 100px rgba(139, 92, 246, 0.1)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Central star icon */}
        <motion.svg
          viewBox="0 0 24 24"
          className="w-6 h-6"
          style={{ color: "#E8C547" }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <path
            fill="currentColor"
            d="M12 2L14.09 8.26L20.18 9.27L15.54 13.14L16.82 19.02L12 16.09L7.18 19.02L8.46 13.14L3.82 9.27L9.91 8.26L12 2Z"
          />
        </motion.svg>
      </motion.div>
    </div>
  );
}

export default function CosmicLoader() {
  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Generate random star particles
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 3,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2,
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(232, 197, 71, 0.08) 0%, transparent 40%),
          radial-gradient(ellipse at 20% 60%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
          linear-gradient(to bottom, #050510 0%, #0a0a1e 50%, #050510 100%)
        `,
      }}
    >
      {/* Floating star particles */}
      {stars.map((star) => (
        <StarParticle
          key={star.id}
          x={star.x}
          y={star.y}
          size={star.size}
          delay={star.delay}
          duration={star.duration}
        />
      ))}

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(232, 197, 71, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(232, 197, 71, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Main content container */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Zodiac ring (background) */}
        <div className="absolute w-72 h-72 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 opacity-50">
          <ZodiacRing />
        </div>

        {/* Constellation drawing area */}
        <div className="relative w-40 h-40 mb-8">
          <ConstellationDrawing />
          <div className="absolute inset-0 flex items-center justify-center">
            <CelestialOrb />
          </div>
        </div>

        {/* App name */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1
            className="text-2xl font-light tracking-[0.3em] uppercase"
            style={{
              background: "linear-gradient(135deg, #E8C547 0%, #FFFFFF 50%, #E8C547 100%)",
              backgroundSize: "200% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "0 0 40px rgba(232, 197, 71, 0.3)",
            }}
          >
            Stella+
          </h1>
        </motion.div>

        {/* Loading message with fade transition */}
        <div className="h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              className="text-sm tracking-wide"
              style={{ color: "rgba(232, 197, 71, 0.7)" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {LOADING_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Elegant loading bar */}
        <motion.div
          className="mt-8 w-48 h-[2px] rounded-full overflow-hidden"
          style={{ background: "rgba(255, 255, 255, 0.1)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent, #E8C547, transparent)",
              width: "40%",
            }}
            animate={{
              x: ["-100%", "350%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Bottom decorative element */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.8 }}
      >
        <div
          className="w-32 h-[1px]"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(232, 197, 71, 0.5), transparent)",
          }}
        />
      </motion.div>
    </div>
  );
}
