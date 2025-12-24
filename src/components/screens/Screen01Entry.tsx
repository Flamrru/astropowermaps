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
    <div className="flex-1 flex flex-col">
      {/* Main content area */}
      <div className="flex-1 flex flex-col justify-end px-6 pb-6">
        <div className="max-w-md mx-auto w-full">
          {/* Headline - Large serif display font like mockup */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="heading-display text-[42px] md:text-[52px] text-white mb-5"
          >
            {COPY.screen1.headline}
          </motion.h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="text-body text-[17px] text-white/70 leading-relaxed mb-8"
          >
            {COPY.screen1.subhead}
          </motion.p>

          {/* Credibility bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="mb-8"
          >
            <CredibilityBar publications={COPY.screen1.credibilityBar} />
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
          >
            <GoldButton onClick={handleStart}>
              {COPY.screen1.button}
            </GoldButton>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
