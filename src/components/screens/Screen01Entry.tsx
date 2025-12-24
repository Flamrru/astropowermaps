"use client";

import { motion } from "framer-motion";
import GoldButton from "@/components/GoldButton";
import CredibilityBar from "@/components/CredibilityBar";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";

export default function Screen01Entry() {
  const { dispatch } = useQuiz();

  const handleStart = () => {
    dispatch({ type: "NEXT_STEP" });
  };

  return (
    <div className="flex-1 flex flex-col px-6 py-8">
      {/* Main content - centered */}
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6"
        >
          {COPY.screen1.headline}
        </motion.h1>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-lg text-white/75 leading-relaxed mb-8"
        >
          {COPY.screen1.subhead}
        </motion.p>

        {/* Credibility bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <CredibilityBar publications={COPY.screen1.credibilityBar} />
        </motion.div>
      </div>

      {/* CTA - pinned to bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="max-w-md mx-auto w-full pb-4"
      >
        <GoldButton onClick={handleStart}>
          {COPY.screen1.button}
        </GoldButton>
      </motion.div>
    </div>
  );
}
