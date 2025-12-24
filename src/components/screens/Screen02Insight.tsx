"use client";

import { motion } from "framer-motion";
import GoldButton from "@/components/GoldButton";
import ProgressHeader from "@/components/ProgressHeader";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";

export default function Screen02Insight() {
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
        {/* Main content - centered */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {COPY.screen2.text.map((paragraph, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={`text-xl md:text-2xl text-white leading-relaxed ${
                index < COPY.screen2.text.length - 1 ? "mb-6" : ""
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
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-md mx-auto w-full pb-4"
        >
          <GoldButton onClick={handleNext}>
            {COPY.screen2.button}
          </GoldButton>
        </motion.div>
      </div>
    </div>
  );
}
