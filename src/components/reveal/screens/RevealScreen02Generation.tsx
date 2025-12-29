"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import { saveAstroData } from "@/lib/astro-storage";
import MatrixCodeEffect from "../MatrixCodeEffect";

// PRD-specified loading messages - mix of technical and emotional
const LOADING_MESSAGES = [
  "Converting birth time to UTC...",
  "Calculating planetary positions at your birth...",
  "Most people never see this map.",
  "Mapping celestial bodies to geographic lines...",
  "Finding where your energy naturally amplifies...",
  "Matching your lines to 100+ world cities...",
  "Discovering what you've been missing...",
];

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

  // Check if current message is "emotional" (no ellipsis, makes a statement)
  const isEmotionalMessage = !LOADING_MESSAGES[textIndex].endsWith("...");

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Layer 1: Cosmic nebula background (inherited from parent) */}

      {/* Layer 2: Matrix code effect (~20% opacity) */}
      <div className="absolute inset-0">
        <MatrixCodeEffect opacity={0.15} speed={0.8} />
      </div>

      {/* Layer 3: Content - centered status display */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">
        {/* Subtle vignette for focus */}
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

          {/* Single bright status line - the center of attention */}
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
