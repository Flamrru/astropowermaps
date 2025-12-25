"use client";

import { motion } from "framer-motion";
import GoldButton from "@/components/GoldButton";
import OptionCard from "@/components/OptionCard";
import ProgressHeader from "@/components/ProgressHeader";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";
import { Briefcase, Lightbulb, Heart, Compass, Mountain, LucideIcon } from "lucide-react";

// Map options to their icons
const optionIcons: Record<string, LucideIcon> = {
  "Career / business growth": Briefcase,
  "Creativity / new ideas": Lightbulb,
  "Love / relationships": Heart,
  "Clarity / finding direction": Compass,
  "Adventure / feeling alive": Mountain,
};

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

      <div className="flex-1 flex flex-col px-6 pt-6 pb-6">
        {/* Main content */}
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
          {/* Question - "2026" in gold */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="heading-display text-[28px] md:text-[32px] text-white mb-2"
          >
            What do you want <span className="text-gold">2026</span> to be about?
          </motion.h2>

          {/* Helper text - muted */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-body text-[13px] text-muted-custom mb-6"
          >
            Select all that apply
          </motion.p>

          {/* Options with icons */}
          <div className="flex flex-col gap-3">
            {COPY.screen5.options.map((option, index) => (
              <OptionCard
                key={option}
                text={option}
                selected={state.answer_q2 === option}
                onClick={() => handleSelect(option)}
                index={index}
                icon={optionIcons[option]}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: state.answer_q2 ? 1 : 0.5, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md mx-auto w-full pt-6"
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
