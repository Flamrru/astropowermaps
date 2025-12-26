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
    const duration = 5000;

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
        {/* Dark glass container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm w-full rounded-3xl py-10 px-8 text-center relative overflow-hidden"
          style={{
            background: 'rgba(10, 10, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Gold accent line at top */}
          <div
            className="absolute top-0 left-1/4 right-1/4 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(232,197,71,0.5) 50%, transparent 100%)',
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
                background: 'radial-gradient(circle, rgba(232,197,71,0.9) 0%, transparent 70%)',
                borderRadius: '50%',
                boxShadow: `0 0 ${star.size * 3}px rgba(232,197,71,0.5)`,
              }}
            />
          ))}

          {/* Cosmic orbital animation */}
          <div className="mb-8">
            <div className="relative w-32 h-32 mx-auto">
              {/* Outer glow */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(201,162,39,0.15) 0%, transparent 70%)',
                  filter: 'blur(10px)',
                }}
              />

              {/* Outer ring - gold gradient */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full"
                style={{
                  border: '1px solid transparent',
                  background: 'linear-gradient(135deg, rgba(232,197,71,0.3) 0%, rgba(201,162,39,0.1) 50%, rgba(232,197,71,0.3) 100%) border-box',
                  WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
              />

              {/* Middle ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 rounded-full"
                style={{
                  border: '1px solid rgba(201, 162, 39, 0.35)',
                }}
              />

              {/* Inner ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-8 rounded-full"
                style={{
                  border: '2px solid rgba(201, 162, 39, 0.5)',
                }}
              />

              {/* Center core - pulsing */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div
                  className="w-5 h-5 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, #E8C547 0%, #C9A227 60%, #8B6914 100%)',
                    boxShadow: '0 0 20px rgba(232, 197, 71, 0.8), 0 0 40px rgba(201, 162, 39, 0.5), 0 0 60px rgba(201, 162, 39, 0.3)',
                  }}
                />
              </motion.div>

              {/* Orbiting particles */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 4 + i * 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
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
                      background: 'linear-gradient(135deg, #E8C547 0%, #C9A227 100%)',
                      boxShadow: '0 0 8px rgba(232, 197, 71, 0.6)',
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Rotating text */}
          <div className="h-8 mb-8">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-body text-[15px] text-white/80"
              >
                {COPY.screen8.loadingTexts[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-[180px] mx-auto">
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #8B6914, #C9A227, #E8C547)',
                  boxShadow: '0 0 10px rgba(201, 162, 39, 0.5)',
                }}
              />
            </div>
            {/* Percentage text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-[12px] text-gold/60 mt-3 tabular-nums"
            >
              {Math.round(progress)}%
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
