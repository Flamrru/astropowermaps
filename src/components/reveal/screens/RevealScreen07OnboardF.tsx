"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import { SlideUpPanel } from "@/components/reveal";
import GoldButton from "@/components/GoldButton";
import { ArrowRight } from "lucide-react";

// Calculate days until or into 2026
function get2026Countdown() {
  const now = new Date();
  const target = new Date("2026-01-01T00:00:00");
  const diff = target.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return { type: "until" as const, days };
  } else {
    return { type: "into" as const, days: Math.abs(days) };
  }
}

export default function RevealScreen09OnboardF() {
  const { dispatch } = useReveal();

  const countdown = useMemo(() => get2026Countdown(), []);

  return (
    <div className="flex-1 flex flex-col relative">
      <SlideUpPanel isVisible={true} height="100%">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="h-full flex flex-col"
        >
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto min-h-0 pb-4">
            {/* Large Countdown Number */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", damping: 15 }}
              className="text-center mb-6"
            >
              <div
                className="inline-flex flex-col items-center px-8 py-6 rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(232, 197, 71, 0.15), rgba(201, 162, 39, 0.08))",
                  border: "1px solid rgba(232, 197, 71, 0.3)",
                  boxShadow: "0 0 50px rgba(201, 162, 39, 0.15)",
                }}
              >
                <span className="text-gold-glow text-[64px] font-bold leading-none">
                  {countdown.days}
                </span>
                <span className="text-white/60 text-sm mt-2">
                  {countdown.type === "until" ? "days until 2026" : "days into 2026"}
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <h2 className="text-[22px] font-bold text-white text-center mb-5">
              {countdown.type === "until"
                ? `2026 is ${countdown.days} days away.`
                : `We're ${countdown.days} days into 2026.`
              }
            </h2>

            {/* Body */}
            <div className="space-y-4 text-white/70 text-[15px] leading-relaxed">
              <p>
                Your first power window could be January.
              </p>

              <p>
                A month where something you start gains traction. A trip that shifts something. A decision that finally sticks.
              </p>

              <div
                className="p-4 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 100, 100, 0.08), rgba(255, 100, 100, 0.04))",
                  border: "1px solid rgba(255, 100, 100, 0.15)",
                }}
              >
                <p className="text-white/80 text-[14px] leading-relaxed">
                  Or it could pass — unmarked, unused — because you didn&apos;t know it was there.
                </p>
              </div>

              <p className="text-white/90 font-medium">
                The windows open whether you&apos;re watching or not.
              </p>
            </div>

            {/* Final line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-gold-glow text-[17px] font-medium text-center mt-6"
            >
              See which months are yours.
            </motion.p>
          </div>

          {/* Pinned CTA */}
          <div className="flex-shrink-0 pt-4 pb-2">
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
