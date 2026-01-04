"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useQuiz } from "@/lib/quiz-state";
import { ArrowRight } from "lucide-react";

export default function Screen01Entry() {
  const { dispatch } = useQuiz();

  const handleStart = () => {
    dispatch({ type: "NEXT_STEP" });
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header with glowing moon */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex items-center justify-center gap-2.5 pt-5 pb-3"
      >
        {/* Crescent moon SVG with glow */}
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 moon-glow"
          fill="#E8C547"
        >
          <path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
        </svg>
        <span className="text-[15px] text-gold-subtle tracking-[0.08em] font-medium uppercase">
          2026 Power Map
        </span>
      </motion.header>

      {/* Main content area */}
      <div className="flex-1 flex flex-col px-6 pb-6">
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full">

          {/* Headline section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="text-center mt-6"
          >
            <h1 className="font-display text-[30px] md:text-[36px] text-white leading-[1.2] tracking-tight">
              There are{" "}
              <span className="text-gold-glow font-bold">3 months</span>
              <br />
              and{" "}
              <span className="text-gold-glow font-bold">3 places</span>
              {" "}that will
              <br />
              define your{" "}
              <span className="text-gold-glow font-bold">2026</span>.
            </h1>
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="text-center mt-5 text-[15px] leading-relaxed max-w-[320px] mx-auto"
          >
            <span className="text-white/80">Based on your birth chart, there&apos;s a map for your year.</span>
            {" "}
            <span className="text-gold-glow font-medium italic">Most people never see it.</span>
          </motion.p>

          {/* Spacer - pushes content to edges */}
          <div className="flex-1 min-h-[40px]" />

          {/* Credibility bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
            className="credibility-bar-premium rounded-2xl py-4 px-4"
          >
            <p className="text-white/80 text-[10px] text-center mb-3 uppercase tracking-[0.2em] font-medium">
              As featured in
            </p>
            {/* Top row */}
            <div className="flex items-center justify-center gap-5 mb-2">
              {/* NYTimes - Gothic style */}
              <span className="text-white/90 text-[16px] font-serif tracking-tight" style={{ fontFamily: 'Georgia, Times, serif', fontStyle: 'italic' }}>
                The New York Times
              </span>
              {/* WIRED - blocky style */}
              <span className="text-white/90 text-[15px] font-bold tracking-widest uppercase">
                WIRED
              </span>
            </div>
            {/* Bottom row */}
            <div className="flex items-center justify-center gap-6">
              {/* Forbes */}
              <span className="text-white/90 text-[16px] font-serif font-bold tracking-tight">
                Forbes
              </span>
              {/* healthline */}
              <span className="text-white/90 text-[15px] font-sans font-medium">
                healthline
              </span>
              {/* girlboss */}
              <span className="text-white/90 text-[15px] font-sans font-bold lowercase">
                girlboss
              </span>
            </div>
          </motion.div>

          {/* ================================================================
              ⚠️⚠️⚠️ TESTING ONLY - DELETE BEFORE PRODUCTION ⚠️⚠️⚠️
              ================================================================ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex gap-3 mb-4"
          >
            <Link
              href="/dashboard?dev=true"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 text-white text-center font-bold text-sm shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
            >
              ⭐ Stella+
              <span className="block text-[10px] font-normal opacity-80 mt-0.5">DEV ONLY</span>
            </Link>
            <Link
              href="/reveal?d=9"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center font-bold text-sm shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all"
            >
              💳 Paywall
              <span className="block text-[10px] font-normal opacity-80 mt-0.5">DEV ONLY</span>
            </Link>
          </motion.div>
          {/* ================================================================
              END OF TESTING BLOCK
              ================================================================ */}

          {/* CTA Button with premium glow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55, ease: "easeOut" }}
            className="mt-5 mb-8"
          >
            <motion.button
              onClick={handleStart}
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              className="gold-button-premium gold-button-shimmer animate-pulse-glow w-full py-4 px-8 rounded-full text-[16px] flex items-center justify-center gap-2"
            >
              <span>See My Map</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </motion.button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
