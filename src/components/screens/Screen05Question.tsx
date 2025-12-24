"use client";

import { motion } from "framer-motion";
import GoldButton from "@/components/GoldButton";
import OptionCard from "@/components/OptionCard";
import ProgressHeader from "@/components/ProgressHeader";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";

export default function Screen05Question() {
  const { state, dispatch } = useQuiz();

  const handleSelect = (option: string) => {
    dispatch({ type: "SET_ANSWER_Q2", payload: option });
  };

  const handleNext = () => {
    if (state.answer_q2) {
      dispatch({ type: "NEXT_STEP" });
    }
  };

  const handleBack = () => {
    dispatch({ type: "PREV_STEP" });
  };

  return (
    <div className="flex-1 flex flex-col">
      <ProgressHeader
        currentStep={state.stepIndex}
        showBack={true}
        onBack={handleBack}
      />

      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Main content */}
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
          {/* Question */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-white leading-tight mb-8"
          >
            {COPY.screen5.question}
          </motion.h2>

          {/* Options */}
          <div className="flex flex-col gap-3 mb-8">
            {COPY.screen5.options.map((option, index) => (
              <OptionCard
                key={option}
                text={option}
                selected={state.answer_q2 === option}
                onClick={() => handleSelect(option)}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="max-w-md mx-auto w-full pb-4"
        >
          <GoldButton
            onClick={handleNext}
            disabled={!state.answer_q2}
          >
            {COPY.screen2.button}
          </GoldButton>
        </motion.div>
      </div>
    </div>
  );
}
