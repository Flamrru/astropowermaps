"use client";

import { motion } from "framer-motion";
import GoldButton from "@/components/GoldButton";
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

      <div className="flex-1 flex flex-col px-6 pt-8 pb-6">
        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {/* Testimonial card with gold left accent */}
          <div className="glass-card rounded-2xl py-8 px-6 border-l-4 border-l-[#C9A227]">
            {/* Quote mark - gold, large */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="heading-display text-[56px] text-gold mb-2 leading-none"
            >
              &ldquo;
            </motion.div>

            {/* Quote text - italic with styled words */}
            {/* "Lisbon" bold, "2 weeks" gold+bold, "5-figure client" bold */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-body text-[17px] md:text-[18px] text-white/90 leading-relaxed mb-6 italic"
            >
              I booked a trip to <span className="font-bold not-italic">Lisbon</span> during my power month. Within <span className="text-gold font-bold not-italic">2 weeks</span> of being there, I met my now-business partner and closed my first <span className="font-bold not-italic">5-figure client</span>.
            </motion.p>

            {/* Attribution with avatar placeholder */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="flex items-center gap-3"
            >
              {/* Avatar placeholder - circular with gradient */}
              <div
                className="w-12 h-12 rounded-full flex-shrink-0 border-2 border-white/20"
                style={{
                  background: 'linear-gradient(135deg, #3a3a5a 0%, #2a2a4a 100%)',
                }}
              >
                <div className="w-full h-full rounded-full flex items-center justify-center text-white/40 text-lg font-medium">
                  S
                </div>
              </div>
              <span className="text-body text-[14px] text-muted-custom">
                {COPY.screen7.attribution}
              </span>
            </motion.div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-md mx-auto w-full"
        >
          <GoldButton onClick={handleNext}>
            {COPY.screen7.button}
          </GoldButton>
        </motion.div>
      </div>
    </div>
  );
}
