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
      {/* No header/back button during loading */}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="max-w-md mx-auto w-full text-center">
          {/* Cosmic spinner animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12"
          >
            <div className="relative w-32 h-32 mx-auto">
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-[#D4A574]/30"
              />
              {/* Middle ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 rounded-full border border-[#D4A574]/50"
              />
              {/* Inner ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-8 rounded-full border border-[#D4A574]/70"
              />
              {/* Center dot */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-4 h-4 rounded-full bg-[#D4A574] gold-glow" />
              </motion.div>
              {/* Orbiting dots */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: "linear",
                    delay: i * 0.5,
                  }}
                  className="absolute inset-0"
                >
                  <div
                    className="absolute w-2 h-2 rounded-full bg-white/80"
                    style={{
                      top: "10%",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Rotating text */}
          <div className="h-8 mb-8">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-lg text-white/80"
              >
                {COPY.screen8.loadingTexts[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full progress-bar rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
