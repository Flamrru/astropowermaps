"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import OptionCard from "@/components/OptionCard";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";

export default function Screen03Question() {
  const { dispatch } = useQuiz();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Auto-advance on selection (single-select question)
  const handleSelect = (option: string) => {
    // Show selection immediately
    setSelectedOption(option);
    dispatch({ type: "SET_ANSWER_Q1", payload: option });

    // Brief delay to show the highlight before advancing
    setTimeout(() => {
      dispatch({ type: "NEXT_STEP" });
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col px-6 pb-6">
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full">

          {/* Header section - pushed down slightly */}
          <div className="pt-8">
            {/* Question - "right" in gold + bold */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="heading-display text-[26px] md:text-[30px] text-white mb-2"
            >
              Have you ever visited a place that just felt... <span className="text-gold font-bold">right</span>?
            </motion.h2>

            {/* Supporting text - muted */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-body text-[14px] text-white/70"
            >
              {COPY.screen3.supportingText}
            </motion.p>
          </div>

          {/* Spacer - allows orb background to show through */}
          <div className="flex-1" />

          {/* Options - pushed up slightly from bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-3 mb-4"
          >
            {COPY.screen3.options.map((option, index) => (
              <OptionCard
                key={option}
                text={option}
                selected={selectedOption === option}
                onClick={() => handleSelect(option)}
                index={index}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
