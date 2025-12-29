"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import { ArrowRight } from "lucide-react";

export default function RevealScreen03MapReveal() {
  const { dispatch } = useReveal();
  const [showContent, setShowContent] = useState(false);

  // Show content after the map zoom-out animation completes (~3.5 seconds)
  useEffect(() => {
    const contentTimer = setTimeout(() => setShowContent(true), 3500);
    return () => clearTimeout(contentTimer);
  }, []);

  const handleContinue = () => {
    dispatch({ type: "NEXT_STEP" });
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Map is rendered via AstroMap in RevealShell */}

      {/* Subtle gradient overlay for text readability - covers bottom portion */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(
              to top,
              rgba(5, 5, 16, 0.95) 0%,
              rgba(5, 5, 16, 0.7) 20%,
              rgba(5, 5, 16, 0.3) 40%,
              transparent 60%
            )
          `,
        }}
      />

      {/* Content overlay - appears after zoom animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-6"
      >
        <div
          className="relative z-10 text-center max-w-sm w-full px-6 py-8 rounded-3xl"
          style={{
            background: "rgba(5, 5, 16, 0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Main headline with elegant styling */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{
              opacity: showContent ? 1 : 0,
              y: showContent ? 0 : 30
            }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-[28px] sm:text-[32px] font-semibold text-white mb-5 leading-tight tracking-tight"
            style={{
              textShadow: `
                0 0 60px rgba(0, 0, 0, 0.9),
                0 4px 30px rgba(0, 0, 0, 0.7),
                0 0 120px rgba(201, 162, 39, 0.15)
              `,
            }}
          >
            This is your{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #E8C547 0%, #C9A227 50%, #E8C547 100%)",
              }}
            >
              cosmic fingerprint.
            </span>
          </motion.h1>

          {/* Body text */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{
              opacity: showContent ? 1 : 0,
              y: showContent ? 0 : 25
            }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-white/75 text-[15px] sm:text-[16px] leading-relaxed mb-3"
            style={{
              textShadow: "0 2px 20px rgba(0, 0, 0, 0.9)",
            }}
          >
            Every line. Every crossing. Every place where something in you resonates with somewhere on Earth.
          </motion.p>

          {/* Subtext - more subtle, italic */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: showContent ? 1 : 0,
              y: showContent ? 0 : 20
            }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-white/50 text-[14px] italic mb-8"
            style={{
              textShadow: "0 2px 15px rgba(0, 0, 0, 0.8)",
            }}
          >
            Notice where the lines cross…
          </motion.p>

          {/* CTA Button with glow effect */}
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: showContent ? 1 : 0,
              y: showContent ? 0 : 20,
              scale: showContent ? 1 : 0.95
            }}
            transition={{ duration: 0.6, delay: 1.0, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={handleContinue}
            className="group relative inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-medium transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, rgba(232, 197, 71, 0.15) 0%, rgba(201, 162, 39, 0.1) 100%)",
              border: "1px solid rgba(232, 197, 71, 0.4)",
              color: "#E8C547",
              boxShadow: `
                0 0 30px rgba(201, 162, 39, 0.2),
                0 0 60px rgba(201, 162, 39, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `,
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: `
                0 0 40px rgba(201, 162, 39, 0.35),
                0 0 80px rgba(201, 162, 39, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.15)
              `,
            }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Animated glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(232, 197, 71, 0.3) 0%, transparent 50%, rgba(232, 197, 71, 0.3) 100%)",
                opacity: 0,
              }}
              animate={{
                opacity: [0, 0.5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <span className="relative z-10">What am I seeing?</span>
            <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </motion.button>

          {/* Subtle decorative element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showContent ? 0.4 : 0 }}
            transition={{ duration: 1, delay: 1.3 }}
            className="mt-8 flex justify-center"
          >
            <div
              className="w-16 h-px"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(232, 197, 71, 0.5), transparent)",
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
