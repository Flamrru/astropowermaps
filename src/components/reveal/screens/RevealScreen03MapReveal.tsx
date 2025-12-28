"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";

export default function RevealScreen03MapReveal() {
  const { state } = useReveal();
  const [showText, setShowText] = useState(false);

  // Show text after a brief delay
  // Note: Auto-advance is now handled by the map animation callback in RevealShell
  useEffect(() => {
    // Show text after the map begins its fly animation (~2.5s into the sequence)
    const textTimer = setTimeout(() => setShowText(true), 2500);

    return () => {
      clearTimeout(textTimer);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Map is shown via AstroMap in RevealShell */}

      {/* Overlay text - appears after reveal animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showText ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 flex flex-col items-center justify-end pb-32 px-6 pointer-events-none"
      >
        {/* Gradient overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, rgba(5, 5, 16, 0.9) 0%, rgba(5, 5, 16, 0.4) 30%, transparent 60%)",
          }}
        />

        <div className="relative z-10 text-center max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[32px] font-bold text-white mb-3"
            style={{
              textShadow: "0 0 40px rgba(0, 0, 0, 0.8), 0 4px 20px rgba(0, 0, 0, 0.5)",
            }}
          >
            Your <span className="text-gold">Birth Chart</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-white/70 text-[15px]"
            style={{
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.8)",
            }}
          >
            The sky at your birth — mapped to Earth
          </motion.p>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: showText ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-24 h-px mx-auto mt-6"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(232, 197, 71, 0.6), transparent)",
            }}
          />

          {/* Auto-advance indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showText ? 0.6 : 0 }}
            transition={{ delay: 1 }}
            className="mt-8 flex items-center justify-center gap-2"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-white/60"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
