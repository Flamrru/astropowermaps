"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import { saveAstroData } from "@/lib/astro-storage";

// Technical-sounding loading messages
const LOADING_MESSAGES = [
  "Converting birth time to UTC...",
  "Accessing planetary ephemeris database...",
  "Calculating planetary positions at your birth...",
  "Computing Earth's rotation at coordinates...",
  "Determining house cusps and angles...",
  "Mapping celestial bodies to geographic lines...",
  "Matching your lines to 100+ world cities...",
  "Rendering your personal birth sky...",
];

export default function RevealScreen02Generation() {
  const { state, dispatch } = useReveal();
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasCalledApiRef = useRef(false);
  const [apiComplete, setApiComplete] = useState(false);

  // Rotate loading text
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  // Progress animation (5 seconds minimum)
  useEffect(() => {
    const startTime = Date.now();
    const duration = 5000;

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
            // Save to localStorage so /map can access it without re-entering data
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

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm w-full rounded-3xl py-10 px-8 text-center relative overflow-hidden"
        style={{
          background: "rgba(10, 10, 20, 0.6)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Gold accent line */}
        <div
          className="absolute top-0 left-1/4 right-1/4 h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(232, 197, 71, 0.5), transparent)",
          }}
        />

        {/* Decorative stars */}
        {[
          { x: 15, y: 20, size: 2, delay: 0 },
          { x: 85, y: 25, size: 1.5, delay: 0.5 },
          { x: 10, y: 75, size: 1.5, delay: 1 },
          { x: 90, y: 80, size: 2, delay: 1.5 },
        ].map((star, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, delay: star.delay }}
            className="absolute"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: "radial-gradient(circle, rgba(232, 197, 71, 0.9) 0%, transparent 70%)",
              borderRadius: "50%",
              boxShadow: `0 0 ${star.size * 3}px rgba(232, 197, 71, 0.5)`,
            }}
          />
        ))}

        {/* Orbital animation */}
        <div className="mb-8">
          <div className="relative w-32 h-32 mx-auto">
            {/* Outer glow */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(201, 162, 39, 0.15) 0%, transparent 70%)",
                filter: "blur(10px)",
              }}
            />

            {/* Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full"
              style={{
                border: "1px solid rgba(232, 197, 71, 0.25)",
              }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-4 rounded-full"
              style={{ border: "1px solid rgba(201, 162, 39, 0.35)" }}
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-8 rounded-full"
              style={{ border: "2px solid rgba(201, 162, 39, 0.5)" }}
            />

            {/* Center core */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="w-5 h-5 rounded-full"
                style={{
                  background: "radial-gradient(circle, #E8C547 0%, #C9A227 60%, #8B6914 100%)",
                  boxShadow: "0 0 20px rgba(232, 197, 71, 0.8), 0 0 40px rgba(201, 162, 39, 0.5)",
                }}
              />
            </motion.div>

            {/* Orbiting particles */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ rotate: 360 }}
                transition={{ duration: 4 + i * 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
                style={{ rotate: i * 120 }}
              >
                <div
                  className="absolute rounded-full"
                  style={{
                    top: "5%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "6px",
                    height: "6px",
                    background: "linear-gradient(135deg, #E8C547, #C9A227)",
                    boxShadow: "0 0 8px rgba(232, 197, 71, 0.6)",
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Rotating text */}
        <div className="h-12 mb-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={textIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-[14px] text-white/70 leading-relaxed"
            >
              {LOADING_MESSAGES[textIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-[200px] mx-auto">
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
