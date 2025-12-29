"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import { SlideUpPanel } from "@/components/reveal";
import GoldButton from "@/components/GoldButton";
import { Shield } from "lucide-react";

// Planet line cards with exact colors from document
const PLANET_LINES = [
  {
    name: "Venus",
    symbol: "♀",
    color: "#E8A4C9", // pink accent
    description: "Where connection, creativity, and attraction come easier. Relationships tend to spark here.",
  },
  {
    name: "Jupiter",
    symbol: "♃",
    color: "#9B7ED9", // purple accent
    description: "Where doors open. Expansion, opportunity, and luck concentrate along this line.",
  },
  {
    name: "Sun",
    symbol: "☉",
    color: "#FFD700", // gold accent
    description: "Where you feel most like yourself. Confidence, visibility, and energy peak here.",
  },
];

export default function RevealScreen05OnboardB() {
  const { dispatch } = useReveal();

  // Highlight Venus, Jupiter, and Sun lines on the map
  useEffect(() => {
    dispatch({
      type: "SET_MAP_HIGHLIGHT",
      payload: {
        kind: "planetLine",
        ids: ["venus", "jupiter", "sun"],
        pulse: true,
      },
    });

    // Clear highlight when leaving this screen
    return () => {
      dispatch({ type: "SET_MAP_HIGHLIGHT", payload: null });
    };
  }, [dispatch]);

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
            <h2 className="text-[24px] font-bold text-white text-center mb-4">
              This isn&apos;t your horoscope.
            </h2>

            {/* Credibility Block */}
            <div
              className="p-4 rounded-xl mb-5"
              style={{
                background: "linear-gradient(135deg, rgba(100, 100, 150, 0.12), rgba(60, 60, 100, 0.08))",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <Shield className="w-5 h-5 text-white/60 mt-0.5 flex-shrink-0" />
                <p className="text-white/60 text-xs uppercase tracking-wider font-medium">
                  Astronomical Precision
                </p>
              </div>
              <div className="space-y-3 text-white/70 text-[14px] leading-relaxed">
                <p>
                  At the exact moment you were born, ten planets occupied specific positions in the sky. That&apos;s not mystical — it&apos;s astronomy.
                </p>
                <p>
                  Astrocartography takes those positions and maps them onto Earth&apos;s geography. The calculations use VSOP87 algorithms — the same data NASA and observatories use to track planetary movement.
                </p>
                <p>
                  The result: <span className="text-white/90">40 lines across the globe</span> where each planet&apos;s influence is strongest — for you specifically.
                </p>
              </div>
            </div>

            {/* Lines Explanation */}
            <p className="text-white/50 text-xs uppercase tracking-wider mb-3">
              Three lines matter most
            </p>

            {/* Planet Cards */}
            <div className="space-y-2.5 mb-4">
              {PLANET_LINES.map((line, index) => (
                <motion.div
                  key={line.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-3 rounded-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: `1px solid ${line.color}30`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${line.color}25, ${line.color}10)`,
                        border: `1px solid ${line.color}40`,
                      }}
                    >
                      <span className="text-lg" style={{ color: line.color }}>
                        {line.symbol}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-[15px] mb-0.5">
                        {line.name}
                      </h3>
                      <p className="text-white/60 text-[13px] leading-snug">
                        {line.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer Note */}
            <p className="text-white/40 text-[13px] text-center italic">
              You have 40 lines total. Some places amplify you. Others quietly drain you.
            </p>
          </div>

          {/* Pinned CTA */}
          <div className="flex-shrink-0 pt-4 pb-2">
            <GoldButton onClick={() => dispatch({ type: "NEXT_STEP" })}>
              Where do my lines cross?
            </GoldButton>
          </div>
        </motion.div>
      </SlideUpPanel>
    </div>
  );
}
