"use client";

import { motion } from "framer-motion";
import GoldButton from "@/components/GoldButton";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";

export default function Screen02Insight() {
  const { state, dispatch } = useQuiz();

  const handleNext = () => {
    dispatch({ type: "NEXT_STEP" });
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col px-6 pt-6 pb-6">
        {/* Main content - positioned towards top */}
        <div className="flex flex-col max-w-md mx-auto w-full">
          {/* First paragraph: Large headline style */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="font-display text-[26px] md:text-[30px] text-white font-bold leading-[1.3] text-center mb-6"
          >
            You&apos;re going to travel somewhere in <span className="text-gold-glow">2026</span>. A trip, a vacation, maybe a few.
          </motion.h1>

          {/* Second paragraph: Smaller, muted body text with accents */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-body text-[16px] md:text-[17px] text-white/75 leading-relaxed text-center"
          >
            But where you go matters <span className="font-bold text-white/80">more than you think</span>. Not just for the photos — <span className="italic">for what happens after.</span>
          </motion.p>
        </div>

        {/* Spacer to push button down */}
        <div className="flex-1 min-h-[60px]" />

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
