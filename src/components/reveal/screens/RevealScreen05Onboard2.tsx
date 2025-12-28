"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import { SlideUpPanel } from "@/components/reveal";
import GoldButton from "@/components/GoldButton";

// Line type explanations
const LINE_TYPES = [
  {
    name: "Venus Line",
    symbol: "♀",
    color: "#E8A4C9",
    description: "Where love, beauty, and creativity flow easier. Romance and artistic inspiration thrive here.",
  },
  {
    name: "Jupiter Line",
    symbol: "♃",
    color: "#9B7ED9",
    description: "Where luck, expansion, and opportunity are amplified. Growth and abundance await.",
  },
  {
    name: "Sun Line",
    symbol: "☉",
    color: "#FFD700",
    description: "Where you feel most yourself — vital, recognized, and confident. Your core identity shines.",
  },
  {
    name: "Saturn Line",
    symbol: "♄",
    color: "#8B7355",
    description: "Where you build lasting structures. Challenging but rewarding for discipline and mastery.",
  },
];

export default function RevealScreen05Onboard2() {
  const { state, dispatch } = useReveal();

  // Highlight Venus lines on the map
  useEffect(() => {
    dispatch({
      type: "SET_MAP_HIGHLIGHT",
      payload: { kind: "planetLine", ids: ["venus"], pulse: true },
    });

    return () => {
      dispatch({ type: "SET_MAP_HIGHLIGHT", payload: null });
    };
  }, [dispatch]);

  return (
    <div className="flex-1 flex flex-col relative">
      <SlideUpPanel isVisible={true} height="80%">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pb-20"
        >
          {/* Title */}
          <h2 className="text-[24px] font-bold text-white text-center mb-2">
            Your <span className="text-gold">Planetary Lines</span>
          </h2>
          <p className="text-white/50 text-center text-sm mb-6">
            Each line represents different life energies
          </p>

          {/* Line types */}
          <div className="space-y-3">
            {LINE_TYPES.map((line, index) => (
              <motion.div
                key={line.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 rounded-xl"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
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
                    <h3 className="text-white font-medium text-[15px] mb-1">{line.name}</h3>
                    <p className="text-white/60 text-[13px] leading-relaxed">{line.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Note */}
          <p className="text-white/40 text-xs text-center mt-6">
            You have 40 lines total — 10 planets × 4 angles each
          </p>

          {/* CTA */}
          <div className="mt-6">
            <GoldButton onClick={() => dispatch({ type: "NEXT_STEP" })}>
              See My Power Places
            </GoldButton>
          </div>
        </motion.div>
      </SlideUpPanel>
    </div>
  );
}
