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
          {/* Big stat - 73% in gold, very large */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-5"
          >
            <span className="heading-display text-[64px] md:text-[72px] text-gold font-bold">
              {COPY.screen4.stat}
            </span>
            <span className="text-body text-[22px] md:text-[26px] text-white/90 ml-2">
              {COPY.screen4.statText}
            </span>
          </motion.div>

          {/* Paragraph 1: "That wasn't random." - Bold, section header */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="text-body text-[17px] text-white font-bold leading-relaxed mb-5"
          >
            That wasn&apos;t random.
          </motion.p>

          {/* Paragraph 2: "specific locations" and "appear" bold */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.27 }}
            className="text-body text-[17px] text-white/75 leading-relaxed mb-5"
          >
            Based on your birth chart, there are <span className="font-bold text-white">specific locations</span> on Earth where your energy amplifies. Where clarity comes easier. Where the right people and opportunities <span className="font-bold text-white">appear</span>.
          </motion.p>

          {/* Paragraph 3: Muted/italic */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.39 }}
            className="text-body text-[17px] text-muted-custom italic leading-relaxed"
          >
            You don&apos;t need to move there. You just need to visit — at the right time.
          </motion.p>
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
