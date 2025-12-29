"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";

// PRD-specified loading messages for 2026 forecast generation
const LOADING_MESSAGES = [
  "Scanning 2026 planetary transits...",
  "This is the year everything can shift.",
  "Finding your power months...",
  "Calculating when to move vs. when to wait...",
  "Your first power window might be sooner than you think...",
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

// Star field background
function StarField() {
  const stars = Array.from({ length: 50 }).map((_, i) => ({
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

// Floating particle component
function FloatingParticles() {
  const particles = Array.from({ length: 15 }).map((_, i) => ({
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
            y: [0, -800],
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

export default function RevealScreen08Generation2() {
  const { state, dispatch } = useReveal();
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasCalledApiRef = useRef(false);
  const [apiComplete, setApiComplete] = useState(false);

  // Rotate text every 0.8s (PRD spec)
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Progress animation (~4-5 seconds for 5 messages)
  useEffect(() => {
    const startTime = Date.now();
    const duration = 4000; // 5 messages × 0.8s

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

  // Calculate 2026 forecast
  useEffect(() => {
    if (!state.birthData || hasCalledApiRef.current) return;
    hasCalledApiRef.current = true;

    const generateForecast = async () => {
      // Simulate API call - in production, call actual forecast endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock forecast - replace with actual API call when ready
      const mockForecast = {
        year: 2026,
        months: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          scores: {
            love: 40 + Math.floor(Math.random() * 50),
            career: 40 + Math.floor(Math.random() * 50),
            growth: 40 + Math.floor(Math.random() * 50),
            home: 40 + Math.floor(Math.random() * 50),
          },
          overall: 50 + Math.floor(Math.random() * 40),
          isPowerMonth: false,
        })),
        powerMonths: [3, 7, 10],
        avoidMonths: [2, 6, 11],
      };

      // Mark power months
      mockForecast.powerMonths.forEach((m) => {
        mockForecast.months[m - 1].isPowerMonth = true;
      });

      dispatch({ type: "SET_FORECAST_DATA", payload: mockForecast });
      setApiComplete(true);
    };

    generateForecast();
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

      {/* Layer 3: Floating golden particles */}
      <FloatingParticles />

      {/* Layer 4: Central orrery (orbital rings) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer ring with zodiac */}
        <OrbitalRing
          radius={130}
          duration={55}
          direction={1}
          planetCount={4}
          planetSize={3}
          opacity={0.15}
          showZodiac={true}
        />
        {/* Middle ring */}
        <OrbitalRing
          radius={90}
          duration={35}
          direction={-1}
          planetCount={3}
          planetSize={4}
          opacity={0.25}
        />
        {/* Inner ring */}
        <OrbitalRing
          radius={55}
          duration={22}
          direction={1}
          planetCount={2}
          planetSize={5}
          opacity={0.35}
        />

        {/* Central 2026 badge */}
        <motion.div
          className="absolute flex items-center justify-center rounded-full"
          style={{
            width: 60,
            height: 60,
            background: `radial-gradient(circle, rgba(232, 197, 71, 0.15) 0%, rgba(201, 162, 39, 0.05) 60%, transparent 100%)`,
            border: "1px solid rgba(232, 197, 71, 0.3)",
          }}
          animate={{
            boxShadow: [
              "0 0 20px rgba(232, 197, 71, 0.2), 0 0 40px rgba(201, 162, 39, 0.1)",
              "0 0 30px rgba(232, 197, 71, 0.4), 0 0 60px rgba(201, 162, 39, 0.2)",
              "0 0 20px rgba(232, 197, 71, 0.2), 0 0 40px rgba(201, 162, 39, 0.1)",
            ],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <span
            className="text-gold text-[18px] font-bold tracking-wider"
            style={{
              textShadow: "0 0 20px rgba(232, 197, 71, 0.5)",
            }}
          >
            2026
          </span>
        </motion.div>
      </div>

      {/* Layer 5: Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, rgba(5, 5, 16, 0.6) 100%)",
        }}
      />

      {/* Layer 6: Content - status text */}
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
                fill="url(#progressGradient2026)"
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
                <linearGradient id="progressGradient2026" x1="0%" y1="0%" x2="100%" y2="0%">
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
