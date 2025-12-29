"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import { saveAstroData } from "@/lib/astro-storage";

// PRD-specified loading messages
const LOADING_MESSAGES = [
  "Converting birth time to UTC...",
  "Calculating planetary positions at your birth...",
  "Most people never see this map.",
  "Mapping celestial bodies to geographic lines...",
  "Finding where your energy naturally amplifies...",
  "Matching your lines to 100+ world cities...",
  "Discovering what you've been missing...",
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

const COORDINATE_SEQUENCE = [
  "47.3742°N  122.4194°W",
  "51.5074°N  0.1278°W",
  "35.6762°N  139.6503°E",
  "48.8566°N  2.3522°E",
  "-33.8688°S  151.2093°E",
  "40.7128°N  74.0060°W",
];

// Wireframe Globe Component with CSS 3D transforms
function WireframeGlobe({ progress }: { progress: number }) {
  const latitudeLines = 7;
  const longitudeLines = 12;

  return (
    <motion.div
      className="relative"
      style={{
        width: 280,
        height: 280,
        perspective: "800px",
        transformStyle: "preserve-3d",
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
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
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Outer sphere glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(201, 162, 39, 0.1) 0%, transparent 60%)",
            boxShadow: `
              inset 0 0 60px rgba(201, 162, 39, 0.08),
              0 0 40px rgba(201, 162, 39, 0.05)
            `,
          }}
        />

        {/* Latitude lines (horizontal circles) */}
        {Array.from({ length: latitudeLines }).map((_, i) => {
          const angle = ((i + 1) / (latitudeLines + 1)) * 180 - 90;
          const scale = Math.cos((angle * Math.PI) / 180);
          const yOffset = Math.sin((angle * Math.PI) / 180) * 140;

          return (
            <motion.div
              key={`lat-${i}`}
              className="absolute rounded-full"
              style={{
                width: 280 * scale,
                height: 280 * scale,
                left: `calc(50% - ${140 * scale}px)`,
                top: `calc(50% - ${140 * scale}px)`,
                border: "1px solid rgba(201, 162, 39, 0.15)",
                transform: `translateY(${yOffset}px) rotateX(90deg)`,
                transformStyle: "preserve-3d",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
            />
          );
        })}

        {/* Longitude lines (vertical half-circles) */}
        {Array.from({ length: longitudeLines }).map((_, i) => {
          const rotateY = (i / longitudeLines) * 180;

          return (
            <motion.div
              key={`long-${i}`}
              className="absolute"
              style={{
                width: 280,
                height: 280,
                left: 0,
                top: 0,
                transformStyle: "preserve-3d",
                transform: `rotateY(${rotateY}deg)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.05 * i, duration: 0.5 }}
            >
              <div
                className="absolute rounded-full"
                style={{
                  width: 280,
                  height: 280,
                  border: "1px solid rgba(201, 162, 39, 0.12)",
                }}
              />
            </motion.div>
          );
        })}

        {/* Equator line - highlighted */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 280,
            height: 280,
            left: 0,
            top: 0,
            border: "1.5px solid rgba(201, 162, 39, 0.35)",
            transform: "rotateX(90deg)",
            transformStyle: "preserve-3d",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        />
      </motion.div>

      {/* Central birth point marker */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{
            background: "radial-gradient(circle, #FFD700 0%, #C9A227 60%, transparent 100%)",
            boxShadow: "0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(201, 162, 39, 0.4)",
          }}
        />
        <motion.div
          className="absolute -inset-3 rounded-full"
          style={{
            border: "1px solid rgba(255, 215, 0, 0.5)",
          }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// Planetary Line Drawing Animation - Lines drawn across the globe
function PlanetaryLines({ progress }: { progress: number }) {
  // Define curved paths that look like meridian lines on a globe
  // Each path curves around the sphere surface
  const lines = [
    {
      color: "#FFD700",
      delay: 1.0,
      duration: 1.8,
      label: "Sun MC",
      // Vertical meridian curving left
      path: "M 140 10 Q 80 70, 60 140 Q 40 210, 80 270 Q 120 330, 140 390",
    },
    {
      color: "#E8A4C9",
      delay: 1.4,
      duration: 1.6,
      label: "Venus AC",
      // Curved line going right
      path: "M 140 20 Q 200 80, 220 140 Q 240 200, 200 260 Q 160 320, 140 380",
    },
    {
      color: "#9B7ED9",
      delay: 1.8,
      duration: 1.5,
      label: "Jupiter DC",
      // Horizontal curve across
      path: "M 20 180 Q 70 140, 140 140 Q 210 140, 260 180 Q 280 220, 260 260",
    },
    {
      color: "#FF6B6B",
      delay: 2.2,
      duration: 1.4,
      label: "Mars IC",
      // Diagonal curve
      path: "M 30 80 Q 90 120, 140 180 Q 190 240, 250 300 Q 270 340, 250 370",
    },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg
        width="280"
        height="400"
        viewBox="0 0 280 400"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          overflow: "visible",
        }}
      >
        {/* Glow filter for lines */}
        <defs>
          {lines.map((line, i) => (
            <filter key={`filter-${i}`} id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
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
            strokeWidth="2.5"
            strokeLinecap="round"
            filter={`url(#glow-${i})`}
            initial={{
              pathLength: 0,
              opacity: 0,
            }}
            animate={{
              pathLength: 1,
              opacity: 0.85,
            }}
            transition={{
              pathLength: {
                delay: line.delay,
                duration: line.duration,
                ease: "easeInOut",
              },
              opacity: {
                delay: line.delay,
                duration: 0.3,
              },
            }}
          />
        ))}

        {/* Animated endpoint markers that appear when lines complete */}
        {lines.map((line, i) => {
          // Extract end point from path (last coordinates)
          const pathParts = line.path.split(" ");
          const endX = parseFloat(pathParts[pathParts.length - 2]);
          const endY = parseFloat(pathParts[pathParts.length - 1]);

          return (
            <motion.circle
              key={`endpoint-${i}`}
              cx={endX}
              cy={endY}
              r="4"
              fill={line.color}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: line.delay + line.duration - 0.2,
                duration: 0.4,
                type: "spring",
                stiffness: 300,
              }}
              style={{
                filter: `drop-shadow(0 0 6px ${line.color})`,
              }}
            />
          );
        })}
      </svg>

      {/* Line labels that appear as lines complete */}
      {lines.map((line, i) => {
        const positions = [
          { x: "20%", y: "35%" },
          { x: "75%", y: "40%" },
          { x: "80%", y: "55%" },
          { x: "78%", y: "72%" },
        ];
        return (
          <motion.div
            key={`label-${i}`}
            className="absolute text-[9px] font-mono tracking-wider"
            style={{
              left: positions[i].x,
              top: positions[i].y,
              color: line.color,
              textShadow: `0 0 8px ${line.color}`,
              fontFamily: "'SF Mono', 'Fira Code', monospace",
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 0.8, x: 0 }}
            transition={{
              delay: line.delay + line.duration,
              duration: 0.4,
            }}
          >
            {line.label}
          </motion.div>
        );
      })}
    </div>
  );
}

// Calculation Readout Component
function CalculationReadout({ progress }: { progress: number }) {
  const [calcIndex, setCalcIndex] = useState(0);
  const [coordIndex, setCoordIndex] = useState(0);

  useEffect(() => {
    const calcInterval = setInterval(() => {
      setCalcIndex((prev) => (prev + 1) % CALCULATION_SEQUENCE.length);
    }, 600);

    const coordInterval = setInterval(() => {
      setCoordIndex((prev) => (prev + 1) % COORDINATE_SEQUENCE.length);
    }, 800);

    return () => {
      clearInterval(calcInterval);
      clearInterval(coordInterval);
    };
  }, []);

  const currentCalc = CALCULATION_SEQUENCE[calcIndex];
  const currentCoord = COORDINATE_SEQUENCE[coordIndex];

  return (
    <motion.div
      className="absolute top-8 left-4 right-4 flex justify-between items-start pointer-events-none z-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8 }}
    >
      {/* Left side - Planetary positions */}
      <div
        className="text-left space-y-1"
        style={{ fontFamily: "'SF Mono', 'Fira Code', monospace" }}
      >
        <motion.div
          className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          Planetary Positions
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={calcIndex}
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <span
              className="text-lg"
              style={{ color: currentCalc.color, textShadow: `0 0 10px ${currentCalc.color}` }}
            >
              {currentCalc.symbol}
            </span>
            <span className="text-white/70 text-xs">
              {currentCalc.planet}
            </span>
            <span className="text-gold text-xs font-medium">
              {currentCalc.degree}
            </span>
            <span className="text-white/50 text-xs">
              {currentCalc.sign}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Secondary calculation lines */}
        <motion.div
          className="text-[9px] text-white/20 mt-1"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Calculating ascendant...
        </motion.div>
      </div>

      {/* Right side - Coordinates */}
      <div
        className="text-right space-y-1"
        style={{ fontFamily: "'SF Mono', 'Fira Code', monospace" }}
      >
        <motion.div
          className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          Mapping Lines
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={coordIndex}
            className="text-xs text-gold/80"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {currentCoord}
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="text-[9px] text-white/20 mt-1"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
        >
          Processing geodata...
        </motion.div>
      </div>
    </motion.div>
  );
}

// Scanning pulse effect
function ScanningPulse() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 280,
            height: 280,
            border: "1px solid rgba(201, 162, 39, 0.3)",
          }}
          animate={{
            scale: [1, 2.5],
            opacity: [0.4, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
}

// Star field background
function StarField() {
  const stars = useMemo(() =>
    Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
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
            opacity: [0.1, 0.6, 0.1],
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
    <div className="absolute inset-0 pointer-events-none">
      {/* Corner brackets */}
      <svg className="absolute top-4 left-4 w-8 h-8 text-gold/20" viewBox="0 0 32 32">
        <path d="M0 12 L0 0 L12 0" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className="absolute top-4 right-4 w-8 h-8 text-gold/20" viewBox="0 0 32 32">
        <path d="M20 0 L32 0 L32 12" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-4 left-4 w-8 h-8 text-gold/20" viewBox="0 0 32 32">
        <path d="M0 20 L0 32 L12 32" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <svg className="absolute bottom-4 right-4 w-8 h-8 text-gold/20" viewBox="0 0 32 32">
        <path d="M20 32 L32 32 L32 20" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(5, 5, 16, 0.8) 100%)",
        }}
      />
    </div>
  );
}

export default function RevealScreen02Generation() {
  const { state, dispatch } = useReveal();
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasCalledApiRef = useRef(false);
  const [apiComplete, setApiComplete] = useState(false);

  // Rotate loading text every 0.8s
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Progress animation
  useEffect(() => {
    const startTime = Date.now();
    const duration = 5600;

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

        if (res.ok) {
          const response = await res.json();
          if (response.success && response.data) {
            dispatch({ type: "SET_ASTRO_DATA", payload: response.data });
            saveAstroData(response.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch astro data:", error);
      } finally {
        setApiComplete(true);
      }
    };

    fetchAstroData();
  }, [state.birthData, dispatch]);

  const isEmotionalMessage = !LOADING_MESSAGES[textIndex].endsWith("...");

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Layer 1: Deep space background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 40%, rgba(20, 15, 40, 1) 0%, #050510 70%),
            linear-gradient(180deg, #0a0815 0%, #050510 100%)
          `,
        }}
      />

      {/* Layer 2: Star field */}
      <StarField />

      {/* Layer 3: Subtle nebula glow */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 500,
          height: 500,
          left: "calc(50% - 250px)",
          top: "calc(50% - 280px)",
          background: "radial-gradient(ellipse at center, rgba(80, 50, 140, 0.15) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Layer 4: Calculation readout */}
      <CalculationReadout progress={progress} />

      {/* Layer 5: Central globe area */}
      <div className="flex-1 flex items-center justify-center relative" style={{ marginTop: "-40px" }}>
        {/* Scanning pulse */}
        <ScanningPulse />

        {/* Planetary lines */}
        <PlanetaryLines progress={progress} />

        {/* Wireframe globe */}
        <WireframeGlobe progress={progress} />
      </div>

      {/* Layer 6: Observatory frame */}
      <ObservatoryFrame />

      {/* Layer 7: Bottom content */}
      <div className="relative z-10 px-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-center max-w-md mx-auto"
        >
          {/* Status text */}
          <div className="min-h-[60px] flex items-center justify-center mb-6">
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
              className="text-[10px] text-white/30 font-mono"
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
