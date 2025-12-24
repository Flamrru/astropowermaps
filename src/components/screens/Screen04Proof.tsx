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

      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {/* Big stat */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-4"
          >
            <span className="text-6xl md:text-7xl font-bold text-white">
              {COPY.screen4.stat}
            </span>
            <span className="text-2xl md:text-3xl text-white ml-2">
              {COPY.screen4.statText}
            </span>
          </motion.div>

          {/* Paragraphs */}
          {COPY.screen4.paragraphs.map((paragraph, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
              className={`text-lg text-white/80 leading-relaxed ${
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
          transition={{ duration: 0.5, delay: 0.7 }}
          className="max-w-md mx-auto w-full pb-4"
        >
          <GoldButton onClick={handleNext}>
            {COPY.screen4.button}
          </GoldButton>
        </motion.div>
      </div>
    </div>
  );
}
