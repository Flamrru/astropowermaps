"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import MatrixCodeEffect from "../MatrixCodeEffect";

// PRD-specified loading messages for 2026 forecast generation
const LOADING_MESSAGES = [
  "Scanning 2026 planetary transits...",
  "This is the year everything can shift.",
  "Finding your power months...",
  "Calculating when to move vs. when to wait...",
  "Your first power window might be sooner than you think...",
];

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

  // Check if current message is "emotional" (doesn't end with ... and is a statement)
  const isEmotionalMessage = !LOADING_MESSAGES[textIndex].endsWith("...");

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Layer 1: Cosmic nebula background (inherited from parent) */}

      {/* Layer 2: Matrix code effect */}
      <div className="absolute inset-0">
        <MatrixCodeEffect opacity={0.15} speed={0.8} />
      </div>

      {/* Layer 3: Content - centered status display */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">
        {/* Vignette for focus */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, transparent 0%, rgba(5, 5, 16, 0.4) 100%)",
          }}
        />

        {/* Main content container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center max-w-md w-full"
        >
          {/* 2026 Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{
              background: "linear-gradient(135deg, rgba(232, 197, 71, 0.15), rgba(201, 162, 39, 0.08))",
              border: "1px solid rgba(232, 197, 71, 0.25)",
              boxShadow: "0 0 30px rgba(201, 162, 39, 0.15)",
            }}
          >
            <span className="text-gold text-[15px] font-semibold tracking-wide">2026</span>
          </motion.div>

          {/* Status indicator glow */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(201, 162, 39, 0.3)",
                "0 0 40px rgba(201, 162, 39, 0.5)",
                "0 0 20px rgba(201, 162, 39, 0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-3 h-3 rounded-full mx-auto mb-8"
            style={{
              background: "radial-gradient(circle, #E8C547 0%, #C9A227 100%)",
            }}
          />

          {/* Single bright status line */}
          <div className="min-h-[60px] flex items-center justify-center mb-8">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className={`text-[16px] sm:text-[18px] leading-relaxed ${
                  isEmotionalMessage
                    ? "text-white font-medium"
                    : "text-white/70 font-mono"
                }`}
                style={{
                  textShadow: isEmotionalMessage
                    ? "0 0 30px rgba(232, 197, 71, 0.4), 0 2px 10px rgba(0, 0, 0, 0.5)"
                    : "0 2px 10px rgba(0, 0, 0, 0.5)",
                  letterSpacing: isEmotionalMessage ? "0.02em" : "0.05em",
                }}
              >
                {LOADING_MESSAGES[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Minimal progress indicator */}
          <div className="w-48 mx-auto">
            <div className="h-px rounded-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, rgba(201, 162, 39, 0.5), rgba(232, 197, 71, 0.8))",
                  boxShadow: "0 0 10px rgba(201, 162, 39, 0.5)",
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
