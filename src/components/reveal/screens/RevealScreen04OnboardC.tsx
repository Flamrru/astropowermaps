"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useReveal } from "@/lib/reveal-state";
import { SlideUpPanel } from "@/components/reveal";
import GoldButton from "@/components/GoldButton";
import { Quote } from "lucide-react";

// Golden Star Grid Component - represents 73% visually
function GoldenStarGrid() {
  const totalStars = 100;
  const litStars = 73;

  return (
    <div
      className="mx-auto rounded-xl px-4 py-3"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(20, 10px)",
        gap: "4px",
        width: "fit-content",
        background: "linear-gradient(135deg, rgba(232, 197, 71, 0.08), rgba(201, 162, 39, 0.04))",
        border: "1px solid rgba(232, 197, 71, 0.2)",
      }}
    >
      {Array.from({ length: totalStars }, (_, i) => {
        const isLit = i < litStars; // Sequential fill: first 73 dots are lit
        return (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.01, duration: 0.15 }}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: isLit
                ? "linear-gradient(135deg, #E8C547 0%, #C9A227 100%)"
                : "rgba(255, 255, 255, 0.15)",
              boxShadow: isLit
                ? "0 0 6px rgba(232, 197, 71, 0.5)"
                : "none",
            }}
          />
        );
      })}
    </div>
  );
}

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

            {/* Golden Star Grid - Visual representation of 73% */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", damping: 15 }}
              className="mb-5"
            >
              <GoldenStarGrid />
              <p className="text-center text-gold-glow text-[42px] font-bold mt-3">73%</p>
              <p className="text-center text-white/50 text-sm">of 2,400 people</p>
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

            {/* Testimonial with Profile Photo */}
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
              <p className="text-white/80 text-[14px] leading-relaxed italic mb-4">
                &ldquo;I&apos;d been to 30 countries and never understood why Tokyo felt like home and Paris felt like static. Then I saw my Jupiter line.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gold/30">
                  <Image
                    src="/testimonial-mk.png"
                    alt="M.K."
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-white/50 text-[13px]">
                  — M.K., Vancouver
                </p>
              </div>
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
