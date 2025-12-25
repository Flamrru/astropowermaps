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

      <div className="flex-1 flex flex-col px-6 pt-8 pb-6">
        {/* Main content - centered */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {/* First paragraph: "2026" in gold */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="text-body text-[20px] md:text-[22px] text-white/90 leading-relaxed mb-6"
          >
            You&apos;re going to travel somewhere in <span className="text-gold">2026</span>. A trip, a vacation, maybe a few.
          </motion.p>

          {/* Second paragraph: "more than you think" bold, "for what happens after." muted/italic */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-body text-[20px] md:text-[22px] leading-relaxed"
          >
            <span className="text-white/90">But where you go matters </span>
            <span className="text-white font-bold">more than you think</span>
            <span className="text-white/90">. Not just for the photos — </span>
            <span className="text-muted-custom italic">for what happens after.</span>
          </motion.p>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-md mx-auto w-full"
        >
          <GoldButton onClick={handleNext}>
            {COPY.screen2.button}
          </GoldButton>
        </motion.div>
      </div>
    </div>
  );
}
