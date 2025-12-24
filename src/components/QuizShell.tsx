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
      <div className="cosmic-bg stars min-h-screen min-h-dvh flex flex-col">
        {/* Main content area */}
        <main className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.stepIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
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
