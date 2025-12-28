"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import { SlideUpPanel } from "@/components/reveal";
import GoldButton from "@/components/GoldButton";

// Line type explanations - showing the 3 benefic planets
const LINE_TYPES = [
  {
    name: "Venus Line",
    symbol: "♀",
    color: "#E8A4C9",
    description: "Where love, beauty, and creativity flow easier.",
  },
  {
    name: "Jupiter Line",
    symbol: "♃",
    color: "#9B7ED9",
    description: "Where luck, expansion, and opportunity are amplified.",
  },
  {
    name: "Sun Line",
    symbol: "☉",
    color: "#FFD700",
    description: "Where you feel most yourself — vital and confident.",
  },
];

export default function RevealScreen05Onboard2() {
  const { dispatch } = useReveal();

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
          className="h-full flex flex-col"
        >
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Title */}
            <h2 className="text-[22px] font-bold text-white text-center mb-1">
              Your <span className="text-gold">Planetary Lines</span>
            </h2>
            <p className="text-white/50 text-center text-sm mb-4">
              Each line represents different life energies
            </p>

            {/* Line types */}
            <div className="space-y-2.5">
              {LINE_TYPES.map((line, index) => (
                <motion.div
                  key={line.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-3 rounded-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: `1px solid ${line.color}30`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${line.color}25, ${line.color}10)`,
                        border: `1px solid ${line.color}40`,
                      }}
                    >
                      <span className="text-base" style={{ color: line.color }}>
                        {line.symbol}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-[14px]">{line.name}</h3>
                      <p className="text-white/60 text-[12px] leading-snug">{line.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Note */}
            <p className="text-white/40 text-xs text-center mt-4">
              You have 40 lines total — 10 planets × 4 angles each
            </p>
          </div>

          {/* Pinned CTA - always visible */}
          <div className="flex-shrink-0 pt-4 pb-2">
            <GoldButton onClick={() => dispatch({ type: "NEXT_STEP" })}>
              See My Power Places
            </GoldButton>
          </div>
        </motion.div>
      </SlideUpPanel>
    </div>
  );
}
