"use client";

import { motion } from "framer-motion";
import GoldButton from "@/components/GoldButton";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";

export default function Screen06Insight() {
  const { state, dispatch } = useQuiz();

  const handleNext = () => {
    dispatch({ type: "NEXT_STEP" });
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col px-6 pt-6 pb-6">
        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {/* Headline: "Timing matters as much as location." - Large, bold */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0 }}
            className="heading-display text-[24px] md:text-[28px] text-white font-bold leading-tight mb-6"
          >
            Timing matters as much as location.
          </motion.h2>

          {/* Body: "3 months" in gold, "momentum builds" bold */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-body text-[20px] md:text-[22px] text-white/90 leading-relaxed mb-6"
          >
            You have <span className="text-gold-glow">3 months</span> in 2026 where everything you start gains traction. Push during those windows, and <span className="font-bold text-white">momentum builds</span>.
          </motion.p>

          {/* Last line: muted/italic */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-body text-[20px] md:text-[22px] text-muted-custom italic leading-relaxed"
          >
            Push outside them? It feels like dragging a boulder uphill.
          </motion.p>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-md mx-auto w-full"
        >
          <GoldButton onClick={handleNext}>
            {COPY.screen6.button}
          </GoldButton>
        </motion.div>
      </div>
    </div>
  );
}
