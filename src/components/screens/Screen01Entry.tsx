"use client";

import { motion } from "framer-motion";
import GoldButton from "@/components/GoldButton";
import CredibilityBar from "@/components/CredibilityBar";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";
import { Moon, Sparkles } from "lucide-react";

export default function Screen01Entry() {
  const { dispatch } = useQuiz();

  const handleStart = () => {
    dispatch({ type: "NEXT_STEP" });
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header with logo */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center gap-2 pt-4 pb-2"
      >
        <Moon className="w-5 h-5 text-gold" fill="currentColor" />
        <span className="text-[14px] text-white/80 tracking-wide font-medium">
          2026 Power Map
        </span>
        <Sparkles className="w-4 h-4 text-gold/70" />
      </motion.header>

      {/* Main content area */}
      <div className="flex-1 flex flex-col px-6 pb-6">
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full">

          {/* Headline section - top */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center mt-4"
          >
            <h1 className="heading-display text-[32px] md:text-[38px] text-white mb-4 leading-tight">
              There are <span className="text-gold font-bold">3 months</span> and{" "}
              <span className="text-gold font-bold">3 places</span> that will define your{" "}
              <span className="text-gold font-bold">2026</span>.
            </h1>

            <p className="text-body text-[15px] leading-relaxed">
              <span className="text-white/90">Based on your birth chart, there&apos;s a map for your year.</span>{" "}
              <span className="text-muted-custom">Most people never see it.</span>
            </p>
          </motion.div>

          {/* Celestial Device - center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-1 flex items-center justify-center py-6"
          >
            <div className="relative">
              {/* Glow effect behind */}
              <div
                className="absolute inset-0 blur-2xl opacity-30"
                style={{
                  background: 'radial-gradient(circle, rgba(201, 162, 39, 0.4) 0%, transparent 70%)'
                }}
              />
              {/* Celestial device image with animations */}
              <img
                src="/celestial-device.png"
                alt="Celestial navigation device"
                className="celestial-device relative z-10 w-[280px] h-auto md:w-[320px]"
              />
            </div>
          </motion.div>

          {/* Bottom section - Credibility bar + CTA */}
          <div className="space-y-5">
            {/* Credibility bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <CredibilityBar publications={COPY.screen1.credibilityBar} />
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <GoldButton onClick={handleStart}>
                {COPY.screen1.button}
              </GoldButton>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
