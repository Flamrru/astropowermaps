"use client";

import { motion } from "framer-motion";
import GoldButton from "@/components/GoldButton";
import ProgressHeader from "@/components/ProgressHeader";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";

export default function Screen04Proof() {
  const { state, dispatch } = useQuiz();

  const handleNext = () => {
    dispatch({ type: "NEXT_STEP" });
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

      <div className="flex-1 flex flex-col px-6 pt-8 pb-6">
        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {/* Big stat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-5"
          >
            <span className="heading-display text-[64px] md:text-[72px] text-white">
              {COPY.screen4.stat}
            </span>
            <span className="text-body text-[22px] md:text-[26px] text-white/90 ml-2">
              {COPY.screen4.statText}
            </span>
          </motion.div>

          {/* Paragraphs */}
          {COPY.screen4.paragraphs.map((paragraph, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 + index * 0.12 }}
              className={`text-body text-[17px] text-white/75 leading-relaxed ${
                index < COPY.screen4.paragraphs.length - 1 ? "mb-5" : ""
              }`}
            >
              {paragraph}
            </motion.p>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="max-w-md mx-auto w-full"
        >
          <GoldButton onClick={handleNext}>
            {COPY.screen4.button}
          </GoldButton>
        </motion.div>
      </div>
    </div>
  );
}
