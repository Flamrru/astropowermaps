"use client";

import { motion } from "framer-motion";
import GoldButton from "@/components/GoldButton";
import OptionCard from "@/components/OptionCard";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";

export default function Screen03Question() {
  const { state, dispatch } = useQuiz();

  const handleSelect = (option: string) => {
    dispatch({ type: "SET_ANSWER_Q1", payload: option });
  };

  const handleNext = () => {
    if (state.answer_q1) {
      dispatch({ type: "NEXT_STEP" });
    }
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

          {/* Options */}
          <div className="flex flex-col gap-3">
            {COPY.screen3.options.map((option, index) => (
              <OptionCard
                key={option}
                text={option}
                selected={state.answer_q1 === option}
                onClick={() => handleSelect(option)}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* CTA - only show when option selected */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: state.answer_q1 ? 1 : 0.5, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md mx-auto w-full pt-6"
        >
          <GoldButton
            onClick={handleNext}
            disabled={!state.answer_q1}
          >
            {COPY.screen2.button}
          </GoldButton>
        </motion.div>
      </div>
    </div>
  );
}
