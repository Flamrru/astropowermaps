"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReveal, YearForecast as RevealYearForecast } from "@/lib/reveal-state";
import { calculatePowerMonths } from "@/lib/astro/power-months";
import { calculateNatalPositions } from "@/lib/astro/calculations";
import { YearForecast as TransitYearForecast } from "@/lib/astro/transit-types";

// Seeded pseudo-random for deterministic particles (avoids hydration mismatch)
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Convert full transit YearForecast to simplified reveal-state YearForecast
 * Transit has 48 entries (12 months × 4 categories)
 * Reveal needs 12 entries with combined scores
 */
function convertToRevealForecast(transit: TransitYearForecast): RevealYearForecast {
  const monthsMap = new Map<number, { love: number; career: number; growth: number; home: number }>();

  // Group scores by month
  for (const monthScore of transit.months) {
    const m = monthScore.month;
    if (!monthsMap.has(m)) {
      monthsMap.set(m, { love: 0, career: 0, growth: 0, home: 0 });
    }
    const scores = monthsMap.get(m)!;
    scores[monthScore.category] = monthScore.score;
  }

  // Convert to reveal format
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const scores = monthsMap.get(m) || { love: 50, career: 50, growth: 50, home: 50 };
    const overall = Math.round((scores.love + scores.career + scores.growth + scores.home) / 4);
    return {
      month: m,
      scores,
      overall,
      isPowerMonth: transit.overallPowerMonths.includes(m),
    };
  });

  // Find avoid months (lowest 3 overall scores)
  const sortedByScore = [...months].sort((a, b) => a.overall - b.overall);
  const avoidMonths = sortedByScore.slice(0, 3).map(m => m.month);

  return {
    year: transit.year,
    months,
    powerMonths: transit.overallPowerMonths.slice(0, 3),
    avoidMonths,
  };
}

// PRD-specified loading messages for 2026 forecast generation
const LOADING_MESSAGES = [
  "Scanning 2026 planetary transits...",
  "This is the year everything can shift.",
  "Finding your power months...",
  "Calculating when to move vs. when to wait...",
  "Your first power window might be sooner than you think...",
];

// Month data
const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

// Planetary symbols for inner ring
const PLANET_SYMBOLS = ["☉", "☽", "☿", "♀", "♂", "♃", "♄", "♅", "♆"];

// Transit calculation readouts
const TRANSIT_READOUTS = [
  { month: "MAR", transit: "Jupiter trine Sun", level: "HIGH", symbol: "▲" },
  { month: "JUL", transit: "Venus conjunct MC", level: "PEAK", symbol: "★" },
  { month: "OCT", transit: "Saturn sextile Moon", level: "GROWTH", symbol: "◆" },
  { month: "JAN", transit: "Mars square Neptune", level: "CAUTION", symbol: "◇" },
  { month: "SEP", transit: "Mercury trine Jupiter", level: "FLOW", symbol: "∿" },
  { month: "MAY", transit: "Sun opposite Pluto", level: "SHIFT", symbol: "⬡" },
];

// Power months (will glow gold when discovered)
const POWER_MONTHS = [2, 6, 9]; // MAR, JUL, OCT (0-indexed)

// Star field background
function StarField() {
  const stars = useMemo(() =>
    Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: seededRandom(i * 5) * 100,
      y: seededRandom(i * 5 + 1) * 100,
      size: seededRandom(i * 5 + 2) * 1.5 + 0.5,
      delay: seededRandom(i * 5 + 3) * 3,
      duration: seededRandom(i * 5 + 4) * 2 + 2,
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.x}%`,
            top: `${star.y}%`,
          }}
          animate={{
            opacity: [0.1, 0.5, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Observatory frame overlay
function ObservatoryFrame() {
  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Corner brackets */}
      <svg className="absolute top-4 left-4 w-10 h-10 text-gold/25" viewBox="0 0 40 40">
        <path d="M0 15 L0 0 L15 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <svg className="absolute top-4 right-4 w-10 h-10 text-gold/25" viewBox="0 0 40 40">
        <path d="M25 0 L40 0 L40 15" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <svg className="absolute bottom-4 left-4 w-10 h-10 text-gold/25" viewBox="0 0 40 40">
        <path d="M0 25 L0 40 L15 40" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <svg className="absolute bottom-4 right-4 w-10 h-10 text-gold/25" viewBox="0 0 40 40">
        <path d="M25 40 L40 40 L40 25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// Circular Calendar Wheel
function CalendarWheel({
  scannedMonths,
  powerMonthsFound
}: {
  scannedMonths: Set<number>;
  powerMonthsFound: Set<number>;
}) {
  const radius = 120;
  const innerRadius = 85;
  const centerX = 150;
  const centerY = 150;

  return (
    <motion.svg
      width="300"
      height="300"
      viewBox="0 0 300 300"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
    >
      <defs>
        {/* Glow filters */}
        <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="scanGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Gradient for scanning beam */}
        <linearGradient id="scanBeamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="rgba(232, 197, 71, 0.6)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Outer decorative ring */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius + 15}
        fill="none"
        stroke="rgba(201, 162, 39, 0.1)"
        strokeWidth="1"
      />

      {/* Main wheel ring */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke="rgba(201, 162, 39, 0.2)"
        strokeWidth="2"
      />

      {/* Month segments */}
      {MONTHS.map((month, i) => {
        const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
        const nextAngle = ((i + 1) / 12) * 2 * Math.PI - Math.PI / 2;
        const midAngle = (angle + nextAngle) / 2;

        const textRadius = radius + 8;
        const textX = centerX + Math.cos(midAngle) * textRadius;
        const textY = centerY + Math.sin(midAngle) * textRadius;

        const isScanned = scannedMonths.has(i);
        const isPowerMonth = powerMonthsFound.has(i);

        // Arc path for segment highlight
        const arcRadius = radius - 8;
        const startX = centerX + Math.cos(angle + 0.05) * arcRadius;
        const startY = centerY + Math.sin(angle + 0.05) * arcRadius;
        const endX = centerX + Math.cos(nextAngle - 0.05) * arcRadius;
        const endY = centerY + Math.sin(nextAngle - 0.05) * arcRadius;

        return (
          <g key={month}>
            {/* Segment divider lines */}
            <line
              x1={centerX + Math.cos(angle) * innerRadius}
              y1={centerY + Math.sin(angle) * innerRadius}
              x2={centerX + Math.cos(angle) * radius}
              y2={centerY + Math.sin(angle) * radius}
              stroke="rgba(201, 162, 39, 0.15)"
              strokeWidth="1"
            />

            {/* Segment highlight arc when scanned */}
            {isScanned && (
              <motion.path
                d={`M ${startX} ${startY} A ${arcRadius} ${arcRadius} 0 0 1 ${endX} ${endY}`}
                fill="none"
                stroke={isPowerMonth ? "#FFD700" : "rgba(255, 255, 255, 0.3)"}
                strokeWidth={isPowerMonth ? "4" : "2"}
                strokeLinecap="round"
                filter={isPowerMonth ? "url(#goldGlow)" : undefined}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Month label */}
            <motion.text
              x={textX}
              y={textY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9"
              fontFamily="'SF Mono', 'Fira Code', monospace"
              letterSpacing="0.05em"
              fill={
                isPowerMonth
                  ? "#FFD700"
                  : isScanned
                    ? "rgba(255, 255, 255, 0.8)"
                    : "rgba(255, 255, 255, 0.3)"
              }
              filter={isPowerMonth ? "url(#goldGlow)" : undefined}
              animate={{
                fill: isPowerMonth
                  ? "#FFD700"
                  : isScanned
                    ? "rgba(255, 255, 255, 0.8)"
                    : "rgba(255, 255, 255, 0.3)",
              }}
              transition={{ duration: 0.3 }}
              style={{
                transform: `rotate(${(midAngle * 180) / Math.PI + 90}deg)`,
                transformOrigin: `${textX}px ${textY}px`,
              }}
            >
              {month}
            </motion.text>

            {/* Power month indicator dot */}
            {isPowerMonth && (
              <motion.circle
                cx={centerX + Math.cos(midAngle) * (radius - 20)}
                cy={centerY + Math.sin(midAngle) * (radius - 20)}
                r="3"
                fill="#FFD700"
                filter="url(#goldGlow)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
              />
            )}
          </g>
        );
      })}

      {/* Inner ring */}
      <circle
        cx={centerX}
        cy={centerY}
        r={innerRadius}
        fill="none"
        stroke="rgba(201, 162, 39, 0.15)"
        strokeWidth="1"
      />

      {/* Center circle */}
      <circle
        cx={centerX}
        cy={centerY}
        r="35"
        fill="rgba(10, 8, 20, 0.8)"
        stroke="rgba(201, 162, 39, 0.3)"
        strokeWidth="1.5"
      />
    </motion.svg>
  );
}

// Inner planetary ring that rotates opposite
function PlanetaryRing() {
  return (
    <motion.div
      className="absolute"
      style={{
        width: 170,
        height: 170,
        left: "calc(50% - 85px)",
        top: "calc(50% - 85px)",
      }}
      animate={{ rotate: -360 }}
      transition={{
        duration: 40,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {PLANET_SYMBOLS.map((symbol, i) => {
        const angle = (i / PLANET_SYMBOLS.length) * 2 * Math.PI - Math.PI / 2;
        const radius = 68;
        const x = 85 + Math.cos(angle) * radius;
        const y = 85 + Math.sin(angle) * radius;

        return (
          <motion.div
            key={i}
            className="absolute text-[11px]"
            style={{
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
              color: "rgba(232, 197, 71, 0.5)",
              textShadow: "0 0 8px rgba(232, 197, 71, 0.3)",
            }}
            animate={{ rotate: 360 }} // Counter-rotate to stay upright
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {symbol}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// Scanning beam that sweeps around
function ScanningBeam() {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        width: 300,
        height: 300,
        left: "calc(50% - 150px)",
        top: "calc(50% - 150px)",
      }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {/* Beam */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "50%",
          height: "2px",
          background: "linear-gradient(90deg, rgba(232, 197, 71, 0.8) 0%, transparent 100%)",
          transformOrigin: "left center",
          filter: "blur(1px)",
          boxShadow: "0 0 10px rgba(232, 197, 71, 0.5)",
        }}
      />
      {/* Beam tip glow */}
      <motion.div
        style={{
          position: "absolute",
          left: "calc(50% + 130px)",
          top: "calc(50% - 4px)",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#FFD700",
          boxShadow: "0 0 15px #FFD700, 0 0 30px rgba(232, 197, 71, 0.5)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
        }}
      />
    </motion.div>
  );
}

// Transit calculation readout
function TransitReadout({ transitIndex }: { transitIndex: number }) {
  const transit = TRANSIT_READOUTS[transitIndex];

  return (
    <motion.div
      className="absolute top-12 left-4 right-4 pointer-events-none z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div
        className="mx-auto max-w-[280px] p-3 rounded-lg"
        style={{
          background: "rgba(10, 8, 20, 0.7)",
          border: "1px solid rgba(201, 162, 39, 0.2)",
          backdropFilter: "blur(10px)",
          fontFamily: "'SF Mono', 'Fira Code', monospace",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={transitIndex}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="space-y-1"
          >
            {/* Month and transit */}
            <div className="flex items-center justify-between">
              <span className="text-gold text-xs font-semibold tracking-wider">
                {transit.month} 2026
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded"
                style={{
                  background: transit.level === "PEAK" || transit.level === "HIGH"
                    ? "rgba(255, 215, 0, 0.2)"
                    : transit.level === "CAUTION"
                    ? "rgba(255, 100, 100, 0.2)"
                    : "rgba(255, 255, 255, 0.1)",
                  color: transit.level === "PEAK" || transit.level === "HIGH"
                    ? "#FFD700"
                    : transit.level === "CAUTION"
                    ? "#FF6B6B"
                    : "rgba(255, 255, 255, 0.7)",
                }}
              >
                {transit.symbol} {transit.level}
              </span>
            </div>

            {/* Transit description */}
            <div className="text-white/60 text-[11px]">
              {transit.transit}
            </div>

            {/* Fake calculation line */}
            <motion.div
              className="text-[9px] text-white/30 pt-1"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              Processing transit aspects...
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Center year display
function CenterDisplay() {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <motion.span
        className="text-[22px] font-bold tracking-[0.15em]"
        style={{
          color: "#E8C547",
          textShadow: "0 0 20px rgba(232, 197, 71, 0.6), 0 0 40px rgba(201, 162, 39, 0.3)",
          fontFamily: "'SF Mono', 'Fira Code', monospace",
        }}
        animate={{
          textShadow: [
            "0 0 20px rgba(232, 197, 71, 0.6), 0 0 40px rgba(201, 162, 39, 0.3)",
            "0 0 30px rgba(232, 197, 71, 0.8), 0 0 60px rgba(201, 162, 39, 0.5)",
            "0 0 20px rgba(232, 197, 71, 0.6), 0 0 40px rgba(201, 162, 39, 0.3)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        2026
      </motion.span>
      <span
        className="text-[8px] text-white/40 tracking-[0.3em] mt-1"
        style={{ fontFamily: "'SF Mono', 'Fira Code', monospace" }}
      >
        FORECAST
      </span>
    </motion.div>
  );
}

export default function RevealScreen10Generation2() {
  const { state, dispatch } = useReveal();
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasCalledApiRef = useRef(false);
  const [apiComplete, setApiComplete] = useState(false);

  // Scanning state
  const [scannedMonths, setScannedMonths] = useState<Set<number>>(new Set());
  const [powerMonthsFound, setPowerMonthsFound] = useState<Set<number>>(new Set());
  const [transitIndex, setTransitIndex] = useState(0);

  // Generate random scan order
  const scanOrder = useMemo(() => {
    const order = Array.from({ length: 12 }, (_, i) => i);
    // Shuffle array
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  }, []);

  // Random month scanning effect - slowed down (~2.5x) to match 10s duration
  useEffect(() => {
    let scanIndex = 0;
    const scanInterval = setInterval(() => {
      if (scanIndex < scanOrder.length) {
        const monthToScan = scanOrder[scanIndex];
        setScannedMonths(prev => new Set([...prev, monthToScan]));

        // Check if it's a power month
        if (POWER_MONTHS.includes(monthToScan)) {
          setTimeout(() => {
            setPowerMonthsFound(prev => new Set([...prev, monthToScan]));
          }, 400);
        }

        scanIndex++;
      }
    }, 700);

    return () => clearInterval(scanInterval);
  }, [scanOrder]);

  // Cycle transit readouts - slowed down (~2.5x) to match 10s duration
  useEffect(() => {
    const interval = setInterval(() => {
      setTransitIndex(prev => (prev + 1) % TRANSIT_READOUTS.length);
    }, 1750);
    return () => clearInterval(interval);
  }, []);

  // Rotate text every 2s (slowed down for anticipation before paywall)
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Progress animation - 10s total for anticipation build
  useEffect(() => {
    const startTime = Date.now();
    const duration = 10000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (elapsed >= duration && apiComplete) {
        clearInterval(interval);
        dispatch({ type: "NEXT_STEP" });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [apiComplete, dispatch]);

  // Calculate 2026 forecast using real transit calculations
  useEffect(() => {
    if (!state.birthData || hasCalledApiRef.current) return;
    hasCalledApiRef.current = true;

    const birthData = state.birthData; // Capture for closure

    const generateForecast = async () => {
      try {
        // Small delay for UX (animation needs time to show)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Calculate with exact time (reveal flow always has time)
        const natalPositions = calculateNatalPositions(birthData);
        const transitForecast = calculatePowerMonths(natalPositions);

        // Convert to reveal-state format
        const revealForecast = convertToRevealForecast(transitForecast);

        dispatch({ type: "SET_FORECAST_DATA", payload: revealForecast });
        setApiComplete(true);
      } catch (error) {
        console.error("Error calculating forecast:", error);
        // Fallback to simple mock if calculation fails
        const fallbackForecast: RevealYearForecast = {
          year: 2026,
          months: Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            scores: { love: 60, career: 60, growth: 60, home: 60 },
            overall: 60,
            isPowerMonth: [3, 7, 10].includes(i + 1),
          })),
          powerMonths: [3, 7, 10],
          avoidMonths: [2, 6, 11],
        };
        dispatch({ type: "SET_FORECAST_DATA", payload: fallbackForecast });
        setApiComplete(true);
      }
    };

    generateForecast();
  }, [state.birthData, dispatch]);

  const isEmotionalMessage = !LOADING_MESSAGES[textIndex].endsWith("...");

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Layer 1: Deep space background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 50% 40%, rgba(20, 15, 45, 1) 0%, #050510 70%),
            linear-gradient(180deg, #0a0815 0%, #050510 100%)
          `,
        }}
      />

      {/* Layer 2: Star field */}
      <StarField />

      {/* Layer 3: Ambient glow behind wheel */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 400,
          height: 400,
          left: "calc(50% - 200px)",
          top: "calc(50% - 220px)",
          background: "radial-gradient(ellipse at center, rgba(201, 162, 39, 0.08) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Layer 4: Transit readout */}
      <TransitReadout transitIndex={transitIndex} />

      {/* Layer 5: Calendar wheel system */}
      <div className="flex-1 flex items-center justify-center relative" style={{ marginTop: "-30px" }}>
        {/* Scanning beam */}
        <ScanningBeam />

        {/* Calendar wheel */}
        <CalendarWheel
          scannedMonths={scannedMonths}
          powerMonthsFound={powerMonthsFound}
        />

        {/* Inner planetary ring */}
        <PlanetaryRing />

        {/* Center display */}
        <CenterDisplay />
      </div>

      {/* Layer 6: Observatory frame */}
      <ObservatoryFrame />

      {/* Layer 7: Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 35%, rgba(5, 5, 16, 0.8) 100%)",
        }}
      />

      {/* Layer 8: Bottom content */}
      <div className="relative z-10 px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center max-w-md mx-auto"
        >
          {/* Status text */}
          <div className="min-h-[60px] flex items-center justify-center mb-5">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`text-[14px] sm:text-[16px] leading-relaxed ${
                  isEmotionalMessage
                    ? "text-white/90 font-medium"
                    : "text-white/50"
                }`}
                style={{
                  letterSpacing: "0.02em",
                }}
              >
                {LOADING_MESSAGES[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-48 h-[3px] rounded-full overflow-hidden bg-white/5 backdrop-blur-sm">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, rgba(201, 162, 39, 0.3), #E8C547, rgba(255, 215, 0, 0.8))",
                  boxShadow: "0 0 10px rgba(232, 197, 71, 0.5)",
                }}
              />
            </div>
            <motion.span
              className="text-[10px] text-white/30"
              style={{ fontFamily: "'SF Mono', 'Fira Code', monospace" }}
            >
              {Math.round(progress)}% complete
            </motion.span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
