"use client";

import { useEffect, useState, useRef } from "react";
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

// Zodiac symbols for the outer ring
const ZODIAC_SYMBOLS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

// Orbital ring component
function OrbitalRing({
  radius,
  duration,
  direction = 1,
  planetCount = 3,
  planetSize = 4,
  opacity = 0.3,
  showZodiac = false,
}: {
  radius: number;
  duration: number;
  direction?: number;
  planetCount?: number;
  planetSize?: number;
  opacity?: number;
  showZodiac?: boolean;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: radius * 2,
        height: radius * 2,
        left: `calc(50% - ${radius}px)`,
        top: `calc(50% - ${radius}px)`,
        border: `1px solid rgba(201, 162, 39, ${opacity})`,
      }}
      animate={{ rotate: direction * 360 }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {/* Planets on this orbit */}
      {Array.from({ length: planetCount }).map((_, i) => {
        const angle = (i / planetCount) * 360;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: planetSize,
              height: planetSize,
              background: `radial-gradient(circle, #E8C547 0%, #C9A227 60%, transparent 100%)`,
              boxShadow: `0 0 ${planetSize * 2}px rgba(232, 197, 71, 0.6)`,
              left: `calc(50% - ${planetSize / 2}px + ${Math.cos((angle * Math.PI) / 180) * radius}px)`,
              top: `calc(50% - ${planetSize / 2}px + ${Math.sin((angle * Math.PI) / 180) * radius}px)`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Zodiac symbols on outer ring */}
      {showZodiac && ZODIAC_SYMBOLS.map((symbol, i) => {
        const angle = (i / 12) * 360 - 90;
        return (
          <motion.span
            key={i}
            className="absolute text-[10px]"
            style={{
              color: `rgba(201, 162, 39, 0.4)`,
              left: `calc(50% - 6px + ${Math.cos((angle * Math.PI) / 180) * (radius - 2)}px)`,
              top: `calc(50% - 6px + ${Math.sin((angle * Math.PI) / 180) * (radius - 2)}px)`,
              textShadow: `0 0 8px rgba(201, 162, 39, 0.3)`,
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              delay: i * 0.25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {symbol}
          </motion.span>
        );
      })}
    </motion.div>
  );
}

// Constellation line component
function ConstellationLines() {
  const lines = [
    { x1: 20, y1: 15, x2: 35, y2: 25 },
    { x1: 35, y1: 25, x2: 28, y2: 40 },
    { x1: 28, y1: 40, x2: 45, y2: 50 },
    { x1: 65, y1: 20, x2: 75, y2: 35 },
    { x1: 75, y1: 35, x2: 70, y2: 55 },
    { x1: 70, y1: 55, x2: 85, y2: 60 },
    { x1: 15, y1: 70, x2: 30, y2: 75 },
    { x1: 30, y1: 75, x2: 25, y2: 90 },
    { x1: 80, y1: 75, x2: 90, y2: 85 },
  ];

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.4 }}>
      {lines.map((line, i) => (
        <motion.line
          key={i}
          x1={`${line.x1}%`}
          y1={`${line.y1}%`}
          x2={`${line.x2}%`}
          y2={`${line.y2}%`}
          stroke="url(#goldGradient)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 1, 0],
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: 4,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Star points at constellation vertices */}
      {lines.flatMap((line, i) => [
        <motion.circle
          key={`start-${i}`}
          cx={`${line.x1}%`}
          cy={`${line.y1}%`}
          r="2"
          fill="#E8C547"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0.8, 0],
            scale: [0, 1, 1, 0],
          }}
          transition={{
            duration: 4,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />,
      ])}
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C9A227" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#E8C547" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#C9A227" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Floating particle component
function FloatingParticles() {
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 6,
    size: 1 + Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            bottom: -10,
            background: `radial-gradient(circle, rgba(232, 197, 71, 0.8) 0%, transparent 70%)`,
            boxShadow: `0 0 ${p.size * 3}px rgba(232, 197, 71, 0.4)`,
          }}
          animate={{
            y: [0, -window.innerHeight - 50],
            opacity: [0, 0.8, 0.8, 0],
            x: [0, (Math.random() - 0.5) * 50],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// Star field background
function StarField() {
  const stars = Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 0.5 + Math.random() * 1.5,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            width: star.size,
            height: star.size,
            left: `${star.x}%`,
            top: `${star.y}%`,
            background: "#fff",
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function RevealScreen02Generation() {
  const { state, dispatch } = useReveal();
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasCalledApiRef = useRef(false);
  const [apiComplete, setApiComplete] = useState(false);

  // Rotate loading text every 0.8s (PRD spec)
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Progress animation (~5-6 seconds for 7 messages)
  useEffect(() => {
    const startTime = Date.now();
    const duration = 5600; // 7 messages × 0.8s

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
      {/* Layer 1: Deep cosmic background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 50%, rgba(201, 162, 39, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse 60% 80% at 30% 20%, rgba(60, 50, 120, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 70% 80%, rgba(80, 60, 140, 0.06) 0%, transparent 50%),
            #050510
          `,
        }}
      />

      {/* Layer 2: Star field */}
      <StarField />

      {/* Layer 3: Constellation lines */}
      <ConstellationLines />

      {/* Layer 4: Floating golden particles */}
      <FloatingParticles />

      {/* Layer 5: Central orrery (orbital rings) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer ring with zodiac */}
        <OrbitalRing
          radius={140}
          duration={60}
          direction={1}
          planetCount={4}
          planetSize={3}
          opacity={0.15}
          showZodiac={true}
        />
        {/* Middle ring */}
        <OrbitalRing
          radius={100}
          duration={40}
          direction={-1}
          planetCount={3}
          planetSize={4}
          opacity={0.25}
        />
        {/* Inner ring */}
        <OrbitalRing
          radius={60}
          duration={25}
          direction={1}
          planetCount={2}
          planetSize={5}
          opacity={0.35}
        />

        {/* Central sun/birth moment */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 24,
            height: 24,
            background: `radial-gradient(circle, #E8C547 0%, #C9A227 40%, rgba(201, 162, 39, 0.3) 70%, transparent 100%)`,
          }}
          animate={{
            boxShadow: [
              "0 0 20px rgba(232, 197, 71, 0.4), 0 0 40px rgba(201, 162, 39, 0.2)",
              "0 0 30px rgba(232, 197, 71, 0.6), 0 0 60px rgba(201, 162, 39, 0.3)",
              "0 0 20px rgba(232, 197, 71, 0.4), 0 0 40px rgba(201, 162, 39, 0.2)",
            ],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Layer 6: Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(5, 5, 16, 0.6) 100%)",
        }}
      />

      {/* Layer 7: Content - status text */}
      <div className="flex-1 flex flex-col items-center justify-end pb-24 relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-md w-full"
        >
          {/* Status text with crossfade */}
          <div className="min-h-[80px] flex items-center justify-center mb-6">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`text-[15px] sm:text-[17px] leading-relaxed ${
                  isEmotionalMessage
                    ? "text-white font-medium tracking-wide"
                    : "text-white/60 tracking-wider"
                }`}
                style={{
                  textShadow: isEmotionalMessage
                    ? "0 0 30px rgba(232, 197, 71, 0.5), 0 2px 15px rgba(0, 0, 0, 0.8)"
                    : "0 2px 15px rgba(0, 0, 0, 0.8)",
                  fontFamily: isEmotionalMessage ? "inherit" : "monospace",
                  fontSize: isEmotionalMessage ? undefined : "14px",
                }}
              >
                {LOADING_MESSAGES[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Elegant progress arc */}
          <div className="flex justify-center">
            <svg width="200" height="8" viewBox="0 0 200 8">
              {/* Background track */}
              <rect
                x="0"
                y="3"
                width="200"
                height="2"
                rx="1"
                fill="rgba(255, 255, 255, 0.1)"
              />
              {/* Progress fill */}
              <motion.rect
                x="0"
                y="3"
                height="2"
                rx="1"
                fill="url(#progressGradient)"
                style={{ width: `${progress * 2}` }}
              />
              {/* Glow at progress tip */}
              <motion.circle
                cx={progress * 2}
                cy="4"
                r="3"
                fill="#E8C547"
                style={{
                  filter: "blur(2px)",
                  opacity: progress > 0 ? 0.8 : 0,
                }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(201, 162, 39, 0.3)" />
                  <stop offset="100%" stopColor="#E8C547" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
