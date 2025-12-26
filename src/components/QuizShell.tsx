"use client";

import { useReducer, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QuizContext, quizReducer, initialQuizState } from "@/lib/quiz-state";
import { parseUTMParams } from "@/lib/utm";
import ProgressHeader from "@/components/ProgressHeader";

interface QuizShellProps {
  children: ReactNode;
}

export default function QuizShell({ children }: QuizShellProps) {
  const [state, dispatch] = useReducer(quizReducer, initialQuizState);

  // Capture UTM parameters on mount
  useEffect(() => {
    const utm = parseUTMParams();
    if (Object.keys(utm).length > 0) {
      dispatch({ type: "SET_UTM", payload: utm });
    }
  }, []);

  // Background logic: step 1 = celestial, step 2 = globe, rest = nebula
  const useEntryBg = state.stepIndex === 1;
  const useGlobeBg = state.stepIndex === 2;
  const useNebulaBg = state.stepIndex > 2;

  // Back button handler - special case for step 9 (skip loading screen)
  const handleBack = () => {
    if (state.stepIndex === 9) {
      dispatch({ type: "SET_STEP", payload: 7 });
    } else {
      dispatch({ type: "PREV_STEP" });
    }
  };

  // Show back button on all screens except step 1
  const showBack = state.stepIndex > 1;

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      <div className="min-h-screen min-h-dvh flex flex-col relative overflow-hidden bg-[#050510]">
        {/* Background layer with crossfade transitions - edge to edge */}
        <div
          className="fixed z-0"
          style={{
            top: '-50px',
            left: '-50px',
            right: '-50px',
            bottom: '-50px',
            width: 'calc(100% + 100px)',
            height: 'calc(100% + 100px)',
          }}
        >
          {/* Entry background (step 1) - celestial astrolabe */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: useEntryBg ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img
              src="/question-bg.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </motion.div>

          {/* Globe background (step 2) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: useGlobeBg ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img
              src="/globe-bg.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </motion.div>

          {/* Nebula background (all other steps) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: useNebulaBg ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {/* Mobile background (portrait) */}
            <img
              src="/nebula-mobile.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center md:hidden"
            />
            {/* Desktop background (landscape) */}
            <img
              src="/nebula-desktop.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center hidden md:block"
            />
          </motion.div>

          {/* Light overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/55 via-[#050510]/5 to-[#050510]/30" />
        </div>

        {/* Main content area */}
        <main className="flex-1 flex flex-col relative z-10 safe-area-padding">
          {/* Persistent progress header - stays visible during transitions */}
          <ProgressHeader
            currentStep={state.stepIndex}
            showBack={showBack}
            onBack={handleBack}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={state.stepIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </QuizContext.Provider>
  );
}
