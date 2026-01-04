"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { DayTransit } from "@/lib/dashboard-types";

interface CosmosTabProps {
  transits: DayTransit[];
}

/**
 * CosmosTab
 *
 * Shows transit aspects with expandable cards:
 * - Aspect symbols (☉ △ ♃)
 * - Plain English label
 * - Short interpretation (visible)
 * - Full interpretation (expandable)
 */
export default function CosmosTab({ transits }: CosmosTabProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Show top 3 by default, or all if expanded
  const visibleCount = showAll ? transits.length : Math.min(3, transits.length);
  const visibleTransits = transits.slice(0, visibleCount);
  const hasMore = transits.length > 3;

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (transits.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <div className="text-3xl mb-3">✨</div>
        <p className="text-white/50 text-sm">
          No major transits today.
          <br />
          A quiet day to follow your own rhythm.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-3">
      <h4 className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3">
        Active Transits
      </h4>

      {visibleTransits.map((transit, index) => (
        <motion.div
          key={`${transit.planet1}-${transit.aspect}-${transit.planet2}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Header - always visible */}
            <button
              onClick={() => toggleExpand(index)}
              className="w-full p-3 flex items-start justify-between text-left"
            >
              <div className="flex-1">
                {/* Symbol */}
                <div
                  className="text-lg font-light tracking-wider mb-1"
                  style={{ color: "#E8C547" }}
                >
                  {transit.symbol}
                </div>

                {/* Label */}
                <div className="text-white/90 text-sm font-medium">
                  {transit.label}
                </div>

                {/* Short interpretation */}
                <div className="text-white/50 text-xs mt-1 leading-relaxed">
                  {transit.shortText}
                </div>
              </div>

              {/* Expand/collapse icon */}
              <div className="flex-shrink-0 ml-2 mt-1 text-white/30">
                {expandedIndex === index ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>
            </button>

            {/* Expanded content */}
            <AnimatePresence>
              {expandedIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="px-3 pb-3 pt-0 border-t"
                    style={{ borderColor: "rgba(255, 255, 255, 0.05)" }}
                  >
                    <p className="text-white/60 text-xs leading-relaxed pt-3">
                      {transit.fullText}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}

      {/* Show more button */}
      {hasMore && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 text-center text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          {showAll
            ? "Show less"
            : `See ${transits.length - 3} more transit${transits.length - 3 > 1 ? "s" : ""}`}
        </motion.button>
      )}
    </div>
  );
}
