"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import GoldButton from "@/components/GoldButton";

export default function RevealScreen03MapReveal() {
  const { dispatch } = useReveal();
  const [showButton, setShowButton] = useState(false);

  // Show floating button after the map zoom-out animation completes (~3.5 seconds)
  useEffect(() => {
    const buttonTimer = setTimeout(() => setShowButton(true), 3500);
    return () => clearTimeout(buttonTimer);
  }, []);

  const handleContinue = () => {
    dispatch({ type: "NEXT_STEP" });
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Map is rendered via AstroMap in RevealShell - full screen, no panel */}

      {/* Floating Continue button at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{
          opacity: showButton ? 1 : 0,
          y: showButton ? 0 : 30
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute bottom-8 left-0 right-0 px-5 z-20"
      >
        <div className="max-w-md mx-auto">
          <GoldButton onClick={handleContinue}>
            Continue
          </GoldButton>
        </div>
      </motion.div>
    </div>
  );
}
