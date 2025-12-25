"use client";

import { useReducer, useEffect, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QuizContext, quizReducer, initialQuizState } from "@/lib/quiz-state";
import { parseUTMParams } from "@/lib/utm";

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

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      <div className="min-h-screen min-h-dvh flex flex-col relative overflow-hidden bg-[#050510]">
        {/* Animated nebula background - responsive */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          {/* Mobile background (portrait) - hidden on desktop */}
          <img
            src="/nebula-mobile.webp"
            alt=""
            className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] object-cover object-center md:hidden"
          />
          {/* Desktop background (landscape) - hidden on mobile */}
          <img
            src="/nebula-desktop.webp"
            alt=""
            className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] object-cover object-center hidden md:block"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/60 via-transparent to-[#050510]/70" />
        </div>

        {/* Main content area */}
        <main className="flex-1 flex flex-col relative z-10 safe-area-padding">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.stepIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
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
