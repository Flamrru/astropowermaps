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
          {/* "3 months", "3 places", "2026" in Gold + Bold */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="heading-display text-[42px] md:text-[52px] text-white mb-5"
          >
            There are <span className="text-gold font-bold">3 months</span> and{" "}
            <span className="text-gold font-bold">3 places</span> that will define your{" "}
            <span className="text-gold font-bold">2026</span>.
          </motion.h1>

          {/* Subhead - "Most people never see it." in muted */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="text-body text-[17px] leading-relaxed mb-8"
          >
            <span className="text-white">Based on your birth chart, there&apos;s a map for your year.</span>{" "}
            <span className="text-muted-custom">Most people never see it.</span>
          </motion.div>

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
