"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import { SlideUpPanel } from "@/components/reveal";
import GoldButton from "@/components/GoldButton";
import { Sparkles } from "lucide-react";

export default function RevealScreen03MapReveal() {
  const { dispatch } = useReveal();
  const [showContent, setShowContent] = useState(false);

  // Show content after the map zoom-out animation completes (~3.5 seconds)
  useEffect(() => {
    const contentTimer = setTimeout(() => setShowContent(true), 3500);
    return () => clearTimeout(contentTimer);
  }, []);

  const handleContinue = () => {
    dispatch({ type: "NEXT_STEP" });
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Map is rendered via AstroMap in RevealShell */}

      {/* SlideUpPanel appears after zoom animation */}
      <SlideUpPanel isVisible={showContent} height="auto" showDragHandle={false}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col"
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(232, 197, 71, 0.2), rgba(201, 162, 39, 0.1))",
                border: "1px solid rgba(232, 197, 71, 0.3)",
                boxShadow: "0 0 30px rgba(201, 162, 39, 0.15)",
              }}
            >
              <Sparkles className="w-6 h-6 text-gold" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-[22px] font-bold text-white text-center mb-3">
            This is your <span className="text-gold">cosmic fingerprint.</span>
          </h2>

          {/* Content */}
          <p className="text-white/70 text-[14px] leading-relaxed text-center mb-2">
            Every line. Every crossing. Every place where something in you resonates with somewhere on Earth.
          </p>

          <p className="text-white/50 text-[13px] italic text-center mb-6">
            Notice where the lines cross...
          </p>

          {/* CTA Button */}
          <GoldButton onClick={handleContinue}>
            What am I seeing?
          </GoldButton>
        </motion.div>
      </SlideUpPanel>
    </div>
  );
}
