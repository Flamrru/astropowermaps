"use client";

import { motion } from "framer-motion";
import GoldButton from "@/components/GoldButton";
import GlassCard from "@/components/GlassCard";
import ProgressHeader from "@/components/ProgressHeader";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";

export default function Screen07Testimonial() {
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
          <GlassCard className="py-8 px-6">
            {/* Quote mark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-5xl text-[#D4A574] mb-4 leading-none"
            >
              &ldquo;
            </motion.div>

            {/* Quote text */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="text-lg md:text-xl text-white leading-relaxed mb-6 italic"
            >
              {COPY.screen7.quote}
            </motion.p>

            {/* Attribution */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-base text-white/60"
            >
              {COPY.screen7.attribution}
            </motion.p>
          </GlassCard>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-md mx-auto w-full pb-4"
        >
          <GoldButton onClick={handleNext}>
            {COPY.screen7.button}
          </GoldButton>
        </motion.div>
      </div>
    </div>
  );
}
