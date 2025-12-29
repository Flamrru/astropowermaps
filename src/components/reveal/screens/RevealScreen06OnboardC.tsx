"use client";

import { motion } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import { SlideUpPanel } from "@/components/reveal";
import GoldButton from "@/components/GoldButton";
import { Quote } from "lucide-react";

export default function RevealScreen06OnboardC() {
  const { dispatch } = useReveal();

  // No map highlight for this screen

  return (
    <div className="flex-1 flex flex-col relative">
      <SlideUpPanel isVisible={true} height="90%">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="h-full flex flex-col"
        >
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto min-h-0 pb-4">
            {/* Headline */}
            <h2 className="text-[24px] font-bold text-white text-center mb-5">
              You&apos;re not imagining it.
            </h2>

            {/* Large Stat Callout */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", damping: 15 }}
              className="text-center mb-5"
            >
              <div
                className="inline-flex flex-col items-center px-8 py-5 rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(232, 197, 71, 0.15), rgba(201, 162, 39, 0.08))",
                  border: "1px solid rgba(232, 197, 71, 0.25)",
                  boxShadow: "0 0 40px rgba(201, 162, 39, 0.1)",
                }}
              >
                <span className="text-gold text-[56px] font-bold leading-none">73%</span>
                <span className="text-white/60 text-sm mt-1">of 2,400 people</span>
              </div>
            </motion.div>

            {/* Social Proof Text */}
            <div className="space-y-3 text-white/70 text-[15px] leading-relaxed mb-6">
              <p>
                In a study of 2,400 people, 73% reported feeling noticeably different in specific locations — more clarity, more energy, more &ldquo;things clicking.&rdquo;
              </p>
              <p>
                Most assumed it was coincidence. <span className="text-white/90">It wasn&apos;t.</span>
              </p>
            </div>

            {/* The Gap */}
            <div
              className="p-4 rounded-xl mb-5"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <p className="text-white/50 text-xs uppercase tracking-wider mb-3">
                Think about it
              </p>
              <div className="space-y-3 text-white/70 text-[14px] leading-relaxed">
                <p>
                  Think about how you&apos;ve chosen where to go until now.
                </p>
                <p>
                  What was trending. What was affordable. What someone else recommended.
                </p>
                <p>
                  Meanwhile, the places that actually resonate with your specific chart? They&apos;ve been sitting there. <span className="text-gold">Unmarked. Unvisited.</span>
                </p>
              </div>
            </div>

            {/* Testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-4 rounded-xl"
              style={{
                background: "linear-gradient(135deg, rgba(100, 100, 150, 0.1), rgba(60, 60, 100, 0.06))",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <Quote className="w-5 h-5 text-gold/50 mb-2" />
              <p className="text-white/80 text-[14px] leading-relaxed italic mb-3">
                &ldquo;I&apos;d been to 30 countries and never understood why Tokyo felt like home and Paris felt like static. Then I saw my Jupiter line.&rdquo;
              </p>
              <p className="text-white/40 text-[13px]">
                — M.K., Berlin
              </p>
            </motion.div>
          </div>

          {/* Pinned CTA */}
          <div className="flex-shrink-0 pt-4 pb-2">
            <GoldButton onClick={() => dispatch({ type: "NEXT_STEP" })}>
              Is location the only factor?
            </GoldButton>
          </div>
        </motion.div>
      </SlideUpPanel>
    </div>
  );
}
