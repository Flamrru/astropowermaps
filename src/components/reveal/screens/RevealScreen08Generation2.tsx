"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";

// 2026-specific loading messages
const LOADING_MESSAGES = [
  "Scanning 2026 planetary alignments...",
  "Finding your power months...",
  "Calculating transit intensities...",
  "Mapping optimal timing windows...",
  "Generating your year ahead...",
];

export default function RevealScreen08Generation2() {
  const { state, dispatch } = useReveal();
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasCalledApiRef = useRef(false);
  const [apiComplete, setApiComplete] = useState(false);

  // Rotate text
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Progress (4 seconds)
  useEffect(() => {
    const startTime = Date.now();
    const duration = 4000;

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

  // Calculate 2026 forecast (simulated for now)
  useEffect(() => {
    if (!state.birthData || hasCalledApiRef.current) return;
    hasCalledApiRef.current = true;

    // Simulate API call - in production, call actual forecast endpoint
    const generateForecast = async () => {
      // For now, generate mock forecast data
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock forecast - replace with actual API call
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

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full rounded-3xl py-10 px-8 text-center relative overflow-hidden"
        style={{
          background: "rgba(10, 10, 20, 0.7)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* 2026 Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
          style={{
            background: "linear-gradient(135deg, rgba(232, 197, 71, 0.2), rgba(201, 162, 39, 0.1))",
            border: "1px solid rgba(232, 197, 71, 0.3)",
          }}
        >
          <span className="text-gold text-[15px] font-semibold">2026</span>
        </motion.div>

        {/* Orbital animation - smaller version */}
        <div className="mb-6">
          <div className="relative w-24 h-24 mx-auto">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(201, 162, 39, 0.2) 0%, transparent 70%)",
                filter: "blur(8px)",
              }}
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full"
              style={{ border: "1px solid rgba(232, 197, 71, 0.3)" }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 rounded-full"
              style={{ border: "2px solid rgba(201, 162, 39, 0.5)" }}
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  background: "radial-gradient(circle, #E8C547, #C9A227)",
                  boxShadow: "0 0 20px rgba(232, 197, 71, 0.8)",
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* Rotating text */}
        <div className="h-10 mb-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={textIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-[14px] text-white/70"
            >
              {LOADING_MESSAGES[textIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress */}
        <div className="w-full max-w-[180px] mx-auto">
          <div className="h-1.5 rounded-full overflow-hidden bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #8B6914, #C9A227, #E8C547)",
                boxShadow: "0 0 10px rgba(201, 162, 39, 0.5)",
              }}
            />
          </div>
          <p className="text-xs text-gold/60 mt-2 tabular-nums">{Math.round(progress)}%</p>
        </div>
      </motion.div>
    </div>
  );
}
