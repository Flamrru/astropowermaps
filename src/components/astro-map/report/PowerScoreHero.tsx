"use client";

import { useEffect, useState, useMemo, startTransition } from "react";
import { motion } from "framer-motion";

// Seeded pseudo-random for deterministic particles (avoids hydration mismatch)
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface PowerScoreHeroProps {
  score: number;
  label: string;
}

// Generate constellation points with varying sizes (deterministic)
function generateConstellationPoints(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: seededRandom(i * 6) * 100,
    y: seededRandom(i * 6 + 1) * 100,
    size: seededRandom(i * 6 + 2) * 2.5 + 0.5,
    delay: seededRandom(i * 6 + 3) * 3,
    duration: 2 + seededRandom(i * 6 + 4) * 4,
    brightness: seededRandom(i * 6 + 5) * 0.4 + 0.3,
  }));
}

export default function PowerScoreHero({ score, label }: PowerScoreHeroProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [mounted, setMounted] = useState(false);
  const constellationPoints = useMemo(() => generateConstellationPoints(32), []);

  // Mount trigger for animations
  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  // Animate score counting up
  useEffect(() => {
    if (!mounted) return;

    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score, mounted]);

  // Color based on score
  const getScoreColor = () => {
    if (score >= 75) return "#E8C547"; // Gold
    if (score >= 50) return "#9B7ED9"; // Purple
    return "#E8A4C9"; // Pink
  };

  const scoreColor = getScoreColor();

  // Calculate arc path for the gauge
  // Semi-circle from left to right (180 degrees)
  const radius = 80;
  const strokeWidth = 10;
  const centerX = 100;
  const centerY = 90;

  // Arc goes from 180° to 0° (left to right, bottom half)
  const startAngle = Math.PI; // 180 degrees (left)
  const endAngle = 0; // 0 degrees (right)

  // Progress determines how much of the arc to show
  const progressAngle = startAngle - (animatedScore / 100) * Math.PI;

  // Create arc path for background (full semi-circle)
  const arcPath = `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`;

  // Calculate the length of the arc for dash animation
  const arcLength = Math.PI * radius;

  return (
    <div className="relative py-6 px-4 overflow-hidden">
      {/* Constellation background */}
      <div className="absolute inset-0 pointer-events-none">
        {constellationPoints.map((point) => (
          <motion.div
            key={point.id}
            className="absolute rounded-full"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: point.size,
              height: point.size,
              backgroundColor: `rgba(255, 255, 255, ${point.brightness})`,
            }}
            animate={{
              opacity: [point.brightness, point.brightness + 0.3, point.brightness],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: point.duration,
              delay: point.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Ambient glow behind gauge */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/3 w-64 h-32 pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: mounted ? 1 : 0, scale: mounted ? 1 : 0.8 }}
        transition={{ delay: 0.5, duration: 1.5 }}
        style={{
          background: `radial-gradient(ellipse at 50% 80%, ${scoreColor}25 0%, ${scoreColor}08 40%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />

      {/* Main content */}
      <div className="relative flex flex-col items-center">
        {/* Header label */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-3"
        >
          <span
            className="text-[10px] uppercase tracking-[0.25em] font-medium"
            style={{
              color: "rgba(255, 255, 255, 0.4)",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Your 2026 Power
          </span>
        </motion.div>

        {/* Gauge container */}
        <div className="relative" style={{ width: 200, height: 110 }}>
          {/* SVG Gauge */}
          <svg
            viewBox="0 0 200 95"
            className="w-full overflow-visible"
            style={{ filter: `drop-shadow(0 0 8px ${scoreColor}40)`, height: 95 }}
          >
            {/* Tick marks around the arc */}
            {Array.from({ length: 11 }, (_, i) => {
              const angle = Math.PI - (i / 10) * Math.PI;
              const innerRadius = radius - 18;
              const outerRadius = radius - 12;
              const x1 = centerX + Math.cos(angle) * innerRadius;
              const y1 = centerY + Math.sin(angle) * innerRadius;
              const x2 = centerX + Math.cos(angle) * outerRadius;
              const y2 = centerY + Math.sin(angle) * outerRadius;

              return (
                <motion.line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth={i % 5 === 0 ? 2 : 1}
                  strokeLinecap="round"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.03 }}
                />
              );
            })}

            {/* Background track */}
            <path
              d={arcPath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Progress arc */}
            <motion.path
              d={arcPath}
              fill="none"
              stroke={scoreColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={arcLength}
              initial={{ strokeDashoffset: arcLength }}
              animate={{ strokeDashoffset: arcLength * (1 - animatedScore / 100) }}
              transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
            />

            {/* Glow effect arc */}
            <motion.path
              d={arcPath}
              fill="none"
              stroke={scoreColor}
              strokeWidth={strokeWidth + 8}
              strokeLinecap="round"
              strokeDasharray={arcLength}
              initial={{ strokeDashoffset: arcLength, opacity: 0 }}
              animate={{
                strokeDashoffset: arcLength * (1 - animatedScore / 100),
                opacity: 0.25,
              }}
              transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
              style={{ filter: "blur(8px)" }}
            />

            {/* End cap glow indicator */}
            {mounted && animatedScore > 0 && (
              <motion.circle
                cx={centerX + Math.cos(progressAngle) * radius}
                cy={centerY + Math.sin(progressAngle) * radius}
                r={6}
                fill={scoreColor}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.4, type: "spring" }}
                style={{ filter: `drop-shadow(0 0 6px ${scoreColor})` }}
              />
            )}
          </svg>

        </div>

        {/* Score display - below the gauge */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 20 }}
          className="text-center -mt-2"
        >
          <span
            className="text-5xl font-light tabular-nums"
            style={{
              color: scoreColor,
              textShadow: `0 0 40px ${scoreColor}60, 0 2px 4px rgba(0,0,0,0.3)`,
              fontFamily: "'SF Pro Display', -apple-system, system-ui, sans-serif",
              fontWeight: 300,
              letterSpacing: "-0.02em",
            }}
          >
            {animatedScore}
          </span>
        </motion.div>

        {/* Score label */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="text-center mt-2"
        >
          <p
            className="text-base font-medium tracking-wide"
            style={{
              color: "rgba(255, 255, 255, 0.9)",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {label}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "rgba(255, 255, 255, 0.35)" }}
          >
            Based on your planetary alignments
          </p>
        </motion.div>

        {/* Decorative divider line */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-5 h-px w-20"
          style={{
            background: `linear-gradient(90deg, transparent, ${scoreColor}40, transparent)`,
          }}
        />
      </div>
    </div>
  );
}
