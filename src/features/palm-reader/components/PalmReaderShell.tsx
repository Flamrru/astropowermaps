"use client";

import { useReducer, useEffect, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PalmContext,
  palmReducer,
  createInitialState,
  PALM_STEP_LABELS,
} from "../lib/palm-state";
import type { PalmStep } from "../types";

interface PalmReaderShellProps {
  children: ReactNode;
}

export default function PalmReaderShell({ children }: PalmReaderShellProps) {
  const [state, dispatch] = useReducer(palmReducer, createInitialState());
  const [mounted, setMounted] = useState(false);

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Back navigation handler
  const handleBack = useCallback(() => {
    if (state.step > 1) {
      // Skip analyzing screen when going back
      if (state.step === 4) {
        // Results → back to Capture (skip analyzing)
        dispatch({ type: "SET_STEP", payload: 2 });
      } else if (state.step === 3) {
        // Analyzing → back to Capture
        dispatch({ type: "SET_STEP", payload: 2 });
      } else {
        dispatch({ type: "PREV_STEP" });
      }
    }
  }, [state.step]);

  // Calculate progress (steps 1-5, so progress = (step-1) / 4 * 100)
  const progress = ((state.step - 1) / 4) * 100;

  // Show progress bar for steps 2-4 (not on welcome or chat)
  const showProgress = state.step >= 2 && state.step <= 4;

  return (
    <PalmContext.Provider value={{ state, dispatch }}>
      {/* Outer cosmic gradient wrapper */}
      <div
        className="min-h-screen min-h-dvh flex items-center justify-center"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 50%, rgba(201, 162, 39, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 60% 80% at 30% 20%, rgba(60, 50, 120, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 70% 80%, rgba(80, 60, 140, 0.1) 0%, transparent 50%),
            linear-gradient(180deg, #030308 0%, #050510 30%, #0a0a1e 70%, #050510 100%)
          `,
          position: "fixed",
          inset: 0,
          overscrollBehavior: "none",
        }}
      >
        {/* Subtle animated stars layer */}
        <div className="fixed inset-0 pointer-events-none opacity-30 stars-layer" />

        {/* Golden glow behind app container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute w-full max-w-[850px] h-full max-h-[900px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 100% 100% at 50% 50%, rgba(201, 162, 39, 0.05) 0%, transparent 60%)",
            filter: "blur(50px)",
          }}
        />

        {/* Main app container - mobile-first */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[768px] min-h-screen min-h-dvh flex flex-col relative"
          style={{
            background: "#050510",
            boxShadow: `
              0 0 80px rgba(201, 162, 39, 0.08),
              0 0 120px rgba(60, 50, 120, 0.06)
            `,
          }}
        >
          {/* Header with back button and progress */}
          <header className="flex items-center justify-between px-4 py-4 relative z-20">
            {/* Back button - hidden on step 1 */}
            <AnimatePresence>
              {state.step > 1 && state.step !== 3 && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={handleBack}
                  className="p-2 rounded-xl transition-colors hover:bg-white/5 active:bg-white/10"
                  aria-label="Go back"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white/60"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Progress indicator */}
            <AnimatePresence>
              {showProgress && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 mx-4 max-w-[200px]"
                >
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: "linear-gradient(90deg, #C9A227, #E8C547)",
                      }}
                    />
                  </div>
                  {/* Step label */}
                  <p className="text-center text-xs text-white/40 mt-1">
                    {PALM_STEP_LABELS[state.step as PalmStep]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Spacer to balance back button */}
            <div className="w-10" />
          </header>

          {/* Screen content with transitions */}
          <main className="flex-1 flex flex-col relative z-10 safe-area-padding">
            <AnimatePresence mode="wait">
              <motion.div
                key={state.step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </motion.div>
      </div>
    </PalmContext.Provider>
  );
}
