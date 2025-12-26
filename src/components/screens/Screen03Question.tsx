"use client";

import { motion } from "framer-motion";
import OptionCard from "@/components/OptionCard";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";

export default function Screen03Question() {
  const { dispatch } = useQuiz();

  // Auto-advance on selection (single-select question)
  const handleSelect = (option: string) => {
    dispatch({ type: "SET_ANSWER_Q1", payload: option });
    // Small delay for visual feedback before advancing
    setTimeout(() => {
      dispatch({ type: "NEXT_STEP" });
    }, 200);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col px-6 pt-6 pb-6">
        {/* Main content */}
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
          {/* Question - "right" in gold + bold */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="heading-display text-[28px] md:text-[32px] text-white mb-3"
          >
            Have you ever visited a place that just felt... <span className="text-gold font-bold">right</span>?
          </motion.h2>

          {/* Supporting text - muted */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-body text-[15px] text-white/75 mb-8"
          >
            {COPY.screen3.supportingText}
          </motion.p>

          {/* Options - auto-advances on tap */}
          <div className="flex flex-col gap-3">
            {COPY.screen3.options.map((option, index) => (
              <OptionCard
                key={option}
                text={option}
                selected={false}
                onClick={() => handleSelect(option)}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
