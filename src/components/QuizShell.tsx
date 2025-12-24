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
      <div className="cosmic-bg min-h-screen min-h-dvh flex flex-col relative overflow-hidden">
        {/* Stars overlay */}
        <div className="stars-layer" />

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
