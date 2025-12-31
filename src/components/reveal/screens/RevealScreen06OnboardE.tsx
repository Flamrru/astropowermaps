"use client";

import { motion } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import { SlideUpPanel } from "@/components/reveal";
import GoldButton from "@/components/GoldButton";
import { Clock } from "lucide-react";

// Map quiz answers to display-friendly labels
const FOCUS_MAP: Record<string, string> = {
  "Career / business growth": "career",
  "Creativity / new ideas": "creativity",
  "Love / relationships": "love",
  "Clarity / finding direction": "clarity",
  "Adventure / feeling alive": "adventure",
};

export default function RevealScreen08OnboardE() {
  const { state, dispatch } = useReveal();

  // Get user's focus from quiz answers and map to display label
  const rawFocus = state.quizAnswers.q2?.[0] || "";
  const userFocus = FOCUS_MAP[rawFocus] || "growth";

  return (
    <div className="flex-1 flex flex-col relative">
      <SlideUpPanel isVisible={true} height="70%">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="h-full flex flex-col"
        >
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto min-h-0 pb-4">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(232, 197, 71, 0.2), rgba(201, 162, 39, 0.1))",
                  border: "1px solid rgba(232, 197, 71, 0.3)",
                  boxShadow: "0 0 40px rgba(201, 162, 39, 0.2)",
                }}
              >
                <Clock className="w-7 h-7 text-gold" />
              </motion.div>
            </div>

            {/* Headline */}
            <h2 className="text-[24px] font-bold text-white text-center mb-5">
              <span className="text-gold-glow">This</span> is what&apos;s missing.
            </h2>

            {/* Body */}
            <div className="space-y-4 text-white/70 text-[15px] leading-relaxed">
              <div
                className="p-4 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(100, 100, 150, 0.12), rgba(60, 60, 100, 0.08))",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <p className="text-white/90 mb-3">
                  What you just saw is your birth chart. Your permanent blueprint. Where your energy lives on the map.
                </p>
                <p className="text-gold font-medium">
                  But it&apos;s frozen.
                </p>
              </div>

              <p>
                It doesn&apos;t tell you what happens when Saturn crosses your Venus line in March. Or when Jupiter lights up your Sun line in September.
              </p>

              <p className="text-white/90">
                It doesn&apos;t answer the real questions:
              </p>

              <div
                className="p-4 rounded-xl"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <p className="text-white/80 text-[14px] italic leading-relaxed">
                  When should you launch? When should you wait? When does your power city become a power month?
                </p>
              </div>

              {/* Bridge */}
              <p className="text-white/80">
                For that, you need your <span className="text-gold-glow font-medium">2026 transits</span> — how the moving sky interacts with YOUR chart, month by month, location by location.
              </p>

              {/* Personalized Hook */}
              {userFocus && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="p-4 rounded-xl mt-4"
                  style={{
                    background: "linear-gradient(135deg, rgba(232, 197, 71, 0.12), rgba(201, 162, 39, 0.06))",
                    border: "1px solid rgba(232, 197, 71, 0.25)",
                  }}
                >
                  <p className="text-white/70 text-[14px]">
                    You said you want 2026 to be about <span className="text-gold font-semibold">{userFocus}</span>.
                  </p>
                  <p className="text-white/80 text-[14px] mt-2">
                    Your 2026 map shows exactly when and where that becomes most possible.
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Pinned CTA */}
          <div className="flex-shrink-0 pt-4 pb-2">
            <GoldButton onClick={() => dispatch({ type: "NEXT_STEP" })}>
              Generate My 2026 Map
            </GoldButton>
          </div>
        </motion.div>
      </SlideUpPanel>
    </div>
  );
}
