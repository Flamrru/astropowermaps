"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuiz } from "@/lib/quiz-state";

// PRD V4 loading messages (every 0.8 seconds)
const LOADING_MESSAGES = [
  "Converting birth time to UTC...",
  "Calculating planetary positions at your birth moment...",
  "This is unique to you — no one else has this map.",
  "Mapping celestial bodies to geographic lines...",
  "Finding where your energy naturally amplifies...",
  "Matching your lines to 100+ world cities...",
  "Almost ready...",
];

// Planetary calculation data for the readout
const CALCULATION_SEQUENCE = [
  { planet: "Sun", symbol: "☉", degree: "14°23'", sign: "Taurus", color: "#FFD700" },
  { planet: "Venus", symbol: "♀", degree: "23°42'", sign: "Gemini", color: "#E8A4C9" },
  { planet: "Jupiter", symbol: "♃", degree: "8°17'", sign: "Pisces", color: "#9B7ED9" },
  { planet: "Mars", symbol: "♂", degree: "19°55'", sign: "Aries", color: "#FF6B6B" },
  { planet: "Moon", symbol: "☽", degree: "2°08'", sign: "Cancer", color: "#C4C4C4" },
  { planet: "Saturn", symbol: "♄", degree: "27°31'", sign: "Aquarius", color: "#8B9DC3" },
];

// Wireframe Globe Component
function WireframeGlobe() {
  const latitudeLines = 6;
  const longitudeLines = 10;

  return (
    <motion.div
      className="relative"
      style={{
        width: 220,
        height: 220,
        perspective: "600px",
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Globe container with rotation */}
      <motion.div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(-15deg)",
        }}
        animate={{ rotateY: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Outer sphere glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(201, 162, 39, 0.1) 0%, transparent 60%)",
            boxShadow: "inset 0 0 40px rgba(201, 162, 39, 0.08), 0 0 30px rgba(201, 162, 39, 0.05)",
          }}
        />

        {/* Latitude lines */}
        {Array.from({ length: latitudeLines }).map((_, i) => {
          const angle = ((i + 1) / (latitudeLines + 1)) * 180 - 90;
          const scale = Math.cos((angle * Math.PI) / 180);
          const yOffset = Math.sin((angle * Math.PI) / 180) * 110;

          return (
            <motion.div
              key={`lat-${i}`}
              className="absolute rounded-full"
              style={{
                width: 220 * scale,
                height: 220 * scale,
                left: `calc(50% - ${110 * scale}px)`,
                top: `calc(50% - ${110 * scale}px)`,
                border: "1px solid rgba(201, 162, 39, 0.15)",
                transform: `translateY(${yOffset}px) rotateX(90deg)`,
                transformStyle: "preserve-3d",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08 * i, duration: 0.4 }}
            />
          );
        })}

        {/* Longitude lines */}
        {Array.from({ length: longitudeLines }).map((_, i) => {
          const rotateY = (i / longitudeLines) * 180;

          return (
            <motion.div
              key={`long-${i}`}
              className="absolute"
              style={{
                width: 220,
                height: 220,
                left: 0,
                top: 0,
                transformStyle: "preserve-3d",
                transform: `rotateY(${rotateY}deg)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.04 * i, duration: 0.4 }}
            >
              <div
                className="absolute rounded-full"
                style={{
                  width: 220,
                  height: 220,
                  border: "1px solid rgba(201, 162, 39, 0.12)",
                }}
              />
            </motion.div>
          );
        })}

        {/* Equator - highlighted */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 220,
            height: 220,
            left: 0,
            top: 0,
            border: "1.5px solid rgba(201, 162, 39, 0.35)",
            transform: "rotateX(90deg)",
            transformStyle: "preserve-3d",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        />
      </motion.div>

      {/* Central birth point marker */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
      >
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{
            background: "radial-gradient(circle, #FFD700 0%, #C9A227 60%, transparent 100%)",
            boxShadow: "0 0 15px rgba(255, 215, 0, 0.8), 0 0 30px rgba(201, 162, 39, 0.4)",
          }}
        />
        <motion.div
          className="absolute -inset-2 rounded-full"
          style={{
            border: "1px solid rgba(255, 215, 0, 0.5)",
          }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// Planetary Lines Animation
function PlanetaryLines() {
  const lines = [
    { color: "#FFD700", delay: 0.5, duration: 2, path: "M 110 10 Q 60 50, 45 110 Q 30 170, 60 220" },
    { color: "#E8A4C9", delay: 1.2, duration: 1.8, path: "M 110 15 Q 160 55, 175 110 Q 190 165, 160 215" },
    { color: "#9B7ED9", delay: 1.9, duration: 1.6, path: "M 15 140 Q 55 110, 110 110 Q 165 110, 205 140" },
    { color: "#FF6B6B", delay: 2.6, duration: 1.4, path: "M 25 60 Q 70 90, 110 140 Q 150 190, 195 230" },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg
        width="220"
        height="280"
        viewBox="0 0 220 280"
        style={{ position: "absolute", overflow: "visible" }}
      >
        <defs>
          {lines.map((_, i) => (
            <filter key={`filter-${i}`} id={`glow-quiz-${i}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {lines.map((line, i) => (
          <motion.path
            key={i}
            d={line.path}
            fill="none"
            stroke={line.color}
            strokeWidth="2"
            strokeLinecap="round"
            filter={`url(#glow-quiz-${i})`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{
              pathLength: { delay: line.delay, duration: line.duration, ease: "easeInOut" },
              opacity: { delay: line.delay, duration: 0.2 },
            }}
          />
        ))}
      </svg>
    </div>
  );
}

// Calculation Readout
function CalculationReadout() {
  const [calcIndex, setCalcIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCalcIndex((prev) => (prev + 1) % CALCULATION_SEQUENCE.length);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  const currentCalc = CALCULATION_SEQUENCE[calcIndex];

  return (
    <motion.div
      className="absolute top-6 left-0 right-0 flex justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
    >
      <div
        className="px-4 py-2 rounded-lg"
        style={{
          background: "rgba(10, 10, 25, 0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          fontFamily: "'SF Mono', 'Fira Code', monospace",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={calcIndex}
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <span
              className="text-base"
              style={{ color: currentCalc.color, textShadow: `0 0 8px ${currentCalc.color}` }}
            >
              {currentCalc.symbol}
            </span>
            <span className="text-white/60 text-[11px]">{currentCalc.planet}</span>
            <span className="text-gold text-[11px] font-medium">{currentCalc.degree}</span>
            <span className="text-white/40 text-[11px]">{currentCalc.sign}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Scanning pulse
function ScanningPulse() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 220,
            height: 220,
            border: "1px solid rgba(201, 162, 39, 0.25)",
          }}
          animate={{ scale: [1, 2], opacity: [0.3, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// Star field
function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 1.5 + 0.5,
        delay: Math.random() * 2,
        duration: Math.random() * 1.5 + 1.5,
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
          animate={{ opacity: [0.1, 0.5, 0.1] }}
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

export default function Screen09RealLoading() {
  const { state, dispatch } = useQuiz();
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasCalledApiRef = useRef(false);
  const [apiComplete, setApiComplete] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Rotate loading text every 800ms (PRD V4 spec)
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Progress animation - 5.6s duration
  useEffect(() => {
    const startTime = Date.now();
    const duration = 5600;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      // Only advance when both timer and API are complete
      if (elapsed >= duration && apiComplete && !apiError) {
        clearInterval(interval);
        dispatch({ type: "NEXT_STEP" });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [apiComplete, apiError, dispatch]);

  // Call astrocartography API
  useEffect(() => {
    if (!state.birthData || hasCalledApiRef.current) return;
    hasCalledApiRef.current = true;

    const fetchAstroData = async () => {
      try {
        const res = await fetch("/api/astrocartography", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            birthData: {
              date: state.birthData!.date,
              time: state.birthData!.time,
              timeUnknown: state.birthData!.timeUnknown,
              location: {
                name: state.birthData!.location.name,
                lat: state.birthData!.location.lat,
                lng: state.birthData!.location.lng,
                timezone: state.birthData!.location.timezone,
              },
            },
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to calculate chart");
        }

        const response = await res.json();
        if (response.success && response.data) {
          // Store in quiz state
          dispatch({ type: "SET_ASTRO_DATA", payload: response.data });

          // Also store in localStorage for reveal flow
          localStorage.setItem("astro_quiz_result", JSON.stringify(response.data));
        } else {
          throw new Error("Invalid response from API");
        }
      } catch (error) {
        console.error("Failed to fetch astro data:", error);
        setApiError("Failed to generate your chart. Please try again.");
      } finally {
        setApiComplete(true);
      }
    };

    fetchAstroData();
  }, [state.birthData, dispatch]);

  // Determine if current message is emotional (no ellipsis)
  const isEmotionalMessage = !LOADING_MESSAGES[textIndex].endsWith("...");

  // Show error state
  if (apiError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-red-400 text-[15px] mb-4">{apiError}</p>
          <button
            onClick={() => {
              setApiError(null);
              hasCalledApiRef.current = false;
              setApiComplete(false);
              setProgress(0);
            }}
            className="px-6 py-3 rounded-xl bg-gold/20 text-gold border border-gold/30 text-[14px] font-medium hover:bg-gold/30 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 40%, rgba(20, 15, 40, 1) 0%, #050510 70%),
            linear-gradient(180deg, #0a0815 0%, #050510 100%)
          `,
        }}
      />

      {/* Stars */}
      <StarField />

      {/* Nebula glow */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 400,
          height: 400,
          left: "calc(50% - 200px)",
          top: "calc(50% - 250px)",
          background: "radial-gradient(ellipse at center, rgba(80, 50, 140, 0.12) 0%, transparent 60%)",
          filter: "blur(40px)",
        }}
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Calculation readout */}
      <CalculationReadout />

      {/* Central globe area */}
      <div className="flex-1 flex items-center justify-center relative" style={{ marginTop: "-20px" }}>
        <ScanningPulse />
        <PlanetaryLines />
        <WireframeGlobe />
      </div>

      {/* Bottom content */}
      <div className="relative z-10 px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center max-w-md mx-auto"
        >
          {/* Status text */}
          <div className="min-h-[50px] flex items-center justify-center mb-5">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`text-[14px] leading-relaxed ${
                  isEmotionalMessage ? "text-white/90 font-medium" : "text-white/50"
                }`}
              >
                {LOADING_MESSAGES[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-44 h-[3px] rounded-full overflow-hidden bg-white/5">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, rgba(201, 162, 39, 0.3), #E8C547, rgba(255, 215, 0, 0.8))",
                  boxShadow: "0 0 8px rgba(232, 197, 71, 0.5)",
                }}
              />
            </div>
            <span
              className="text-[10px] text-white/25 font-mono"
              style={{ fontFamily: "'SF Mono', 'Fira Code', monospace" }}
            >
              {Math.round(progress)}%
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
