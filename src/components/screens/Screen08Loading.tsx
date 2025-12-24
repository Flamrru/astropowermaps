"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";

export default function Screen08Loading() {
  const { dispatch } = useQuiz();
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Rotate loading text every second
  useEffect(() => {
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % COPY.screen8.loadingTexts.length);
    }, 1000);

    return () => clearInterval(textInterval);
  }, []);

  // Animate progress bar and auto-advance after 3 seconds
  useEffect(() => {
    const startTime = Date.now();
    const duration = 3000;

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (elapsed >= duration) {
        clearInterval(progressInterval);
        dispatch({ type: "NEXT_STEP" });
      }
    }, 50);

    return () => clearInterval(progressInterval);
  }, [dispatch]);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="max-w-md mx-auto w-full text-center">
          {/* Cosmic orbital animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-14"
          >
            <div className="relative w-28 h-28 mx-auto">
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-[#C9A227]/20"
              />
              {/* Middle ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-3 rounded-full border border-[#C9A227]/30"
              />
              {/* Inner ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-6 rounded-full border border-[#C9A227]/50"
              />
              {/* Center glow */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-3 h-3 rounded-full bg-[#C9A227]" style={{
                  boxShadow: '0 0 20px rgba(201, 162, 39, 0.6), 0 0 40px rgba(201, 162, 39, 0.3)'
                }} />
              </motion.div>
              {/* Orbiting dots */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 4 + i * 1.5,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.3,
                  }}
                  className="absolute inset-0"
                >
                  <div
                    className="absolute w-1.5 h-1.5 rounded-full bg-white/70"
                    style={{
                      top: "8%",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Rotating text */}
          <div className="h-7 mb-10">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="text-body text-[16px] text-white/70"
              >
                {COPY.screen8.loadingTexts[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-[200px] mx-auto h-[3px] bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full progress-bar rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
