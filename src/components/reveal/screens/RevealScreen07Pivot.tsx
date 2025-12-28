"use client";

import { motion } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import { SlideUpPanel } from "@/components/reveal";
import GoldButton from "@/components/GoldButton";
import { Clock, Zap, ArrowRight } from "lucide-react";

export default function RevealScreen07Pivot() {
  const { state, dispatch } = useReveal();

  // Get user's focus from quiz answers
  const userFocus = state.quizAnswers.q2?.[0] || "growth";

  return (
    <div className="flex-1 flex flex-col relative">
      <SlideUpPanel isVisible={true} height="90%">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pb-20"
        >
          {/* Dramatic header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{
                background: "linear-gradient(135deg, rgba(232, 197, 71, 0.2), rgba(201, 162, 39, 0.1))",
                border: "1px solid rgba(232, 197, 71, 0.3)",
                boxShadow: "0 0 40px rgba(201, 162, 39, 0.2)",
              }}
            >
              <Clock className="w-8 h-8 text-gold" />
            </motion.div>

            <h2 className="text-[26px] font-bold text-white mb-2">
              But Here&apos;s the Thing...
            </h2>
          </div>

          {/* The pivot content */}
          <div className="space-y-6 text-white/70 text-[15px] leading-relaxed">
            <div
              className="p-5 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(100, 100, 150, 0.15), rgba(60, 60, 100, 0.1))",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <p className="text-white/90 text-[16px] mb-3">
                This birth chart is a <span className="text-gold font-medium">snapshot</span>.
              </p>
              <p>
                It shows your cosmic blueprint — where your energies are strongest. But the planets didn&apos;t stop moving after you were born.
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(232, 197, 71, 0.15)",
                  border: "1px solid rgba(232, 197, 71, 0.3)",
                }}
              >
                <Zap className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="text-white/90 font-medium mb-1">The sky keeps moving</p>
                <p className="text-[14px]">
                  In 2026, planets will form new angles with your birth chart. Some months will supercharge your power places. Others will require patience.
                </p>
              </div>
            </div>

            {/* The key question */}
            <div
              className="p-5 rounded-2xl text-center"
              style={{
                background: "linear-gradient(135deg, rgba(201, 162, 39, 0.15), rgba(201, 162, 39, 0.08))",
                border: "1px solid rgba(201, 162, 39, 0.25)",
                boxShadow: "0 0 40px rgba(201, 162, 39, 0.1)",
              }}
            >
              <p className="text-gold text-[17px] font-medium mb-2">
                What about 2026?
              </p>
              <p className="text-white/70 text-[14px]">
                Where should you be? When should you move?
                <br />
                For that, you need your <span className="text-white/90">2026 transits</span>.
              </p>
            </div>

            {/* Personalized hook */}
            {userFocus && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center pt-2"
              >
                <p className="text-white/50 text-[14px]">
                  You said you want 2026 to be about <span className="text-gold">{userFocus}</span>...
                </p>
              </motion.div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-8">
            <GoldButton onClick={() => dispatch({ type: "NEXT_STEP" })}>
              <span className="flex items-center gap-2">
                Generate My 2026 Map
                <ArrowRight className="w-4 h-4" />
              </span>
            </GoldButton>
          </div>
        </motion.div>
      </SlideUpPanel>
    </div>
  );
}
