"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import type {
  LifetimeTransit,
  TransitRarity,
} from "@/lib/astro/lifetime-transits-types";

interface TransitCardProps {
  transit: LifetimeTransit;
  isNext?: boolean;
  index: number;
}

// Planet symbols for display
const PLANET_SYMBOLS: Record<string, string> = {
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
  chiron: "⚷",
};

// Rarity badge configurations
const RARITY_CONFIG: Record<
  TransitRarity,
  { label: string; bg: string; border: string; glow?: string }
> = {
  common: {
    label: "Common",
    bg: "rgba(148, 163, 184, 0.1)",
    border: "rgba(148, 163, 184, 0.3)",
  },
  rare: {
    label: "Rare",
    bg: "rgba(201, 162, 39, 0.15)",
    border: "rgba(201, 162, 39, 0.4)",
  },
  "very-rare": {
    label: "Very Rare",
    bg: "rgba(201, 162, 39, 0.2)",
    border: "rgba(232, 197, 71, 0.5)",
    glow: "0 0 15px rgba(201, 162, 39, 0.2)",
  },
  "once-in-lifetime": {
    label: "Once in a Lifetime",
    bg: "linear-gradient(135deg, rgba(201, 162, 39, 0.3) 0%, rgba(232, 197, 71, 0.2) 100%)",
    border: "rgba(232, 197, 71, 0.6)",
    glow: "0 0 25px rgba(201, 162, 39, 0.3)",
  },
};

/**
 * TransitCard
 *
 * Displays a single lifetime transit with expandable details.
 * Shows rarity badge, countdown, and triple-pass information.
 */
export default function TransitCard({
  transit,
  isNext = false,
  index,
}: TransitCardProps) {
  const [isExpanded, setIsExpanded] = useState(isNext);

  const today = new Date();
  const exactDate = new Date(transit.exactDate);
  const isPast = exactDate < today;
  const daysUntil = Math.ceil(
    (exactDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const rarityConfig = RARITY_CONFIG[transit.rarity];
  const transitSymbol = PLANET_SYMBOLS[transit.transitPlanet] || "★";

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="relative"
    >
      {/* Timeline connector */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />

      {/* Timeline dot */}
      <motion.div
        className="absolute left-4 top-6 w-5 h-5 rounded-full flex items-center justify-center z-10"
        style={{
          background: isPast
            ? "rgba(74, 222, 128, 0.2)"
            : isNext
              ? "linear-gradient(135deg, #C9A227 0%, #E8C547 100%)"
              : "rgba(255, 255, 255, 0.1)",
          border: isPast
            ? "2px solid rgba(74, 222, 128, 0.5)"
            : isNext
              ? "2px solid rgba(232, 197, 71, 0.8)"
              : "2px solid rgba(255, 255, 255, 0.2)",
          boxShadow: isNext ? "0 0 15px rgba(201, 162, 39, 0.4)" : "none",
        }}
        animate={
          isNext
            ? {
                boxShadow: [
                  "0 0 15px rgba(201, 162, 39, 0.4)",
                  "0 0 25px rgba(201, 162, 39, 0.6)",
                  "0 0 15px rgba(201, 162, 39, 0.4)",
                ],
              }
            : {}
        }
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isPast ? (
          <Check size={10} className="text-green-400" />
        ) : (
          <span className="text-[10px]">{transitSymbol}</span>
        )}
      </motion.div>

      {/* Card content */}
      <div className="ml-14 mb-4">
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left rounded-2xl p-4 transition-all"
          style={{
            background: isNext
              ? "rgba(201, 162, 39, 0.08)"
              : "rgba(255, 255, 255, 0.03)",
            border: isNext
              ? "1px solid rgba(201, 162, 39, 0.2)"
              : "1px solid rgba(255, 255, 255, 0.06)",
            opacity: isPast ? 0.6 : 1,
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Next badge */}
              {isNext && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium mb-2"
                  style={{
                    background: "linear-gradient(135deg, #C9A227 0%, #E8C547 100%)",
                    color: "#0a0a0f",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  NEXT
                </motion.div>
              )}

              {/* Transit label */}
              <h3
                className="font-medium text-base mb-1 truncate"
                style={{
                  color: isPast ? "rgba(255, 255, 255, 0.5)" : "#fff",
                }}
              >
                {transit.label}
              </h3>

              {/* Date and age */}
              <div className="flex items-center gap-2 text-sm">
                <span
                  style={{
                    color: isPast
                      ? "rgba(255, 255, 255, 0.3)"
                      : "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  {formatDate(transit.exactDate)}
                </span>
                <span className="text-white/20">·</span>
                <span className="text-white/40">Age {transit.ageAtTransit}</span>
              </div>
            </div>

            {/* Right side: countdown + chevron */}
            <div className="flex items-center gap-2">
              {!isPast && (
                <div
                  className="text-right"
                  style={{ color: isNext ? "#E8C547" : "rgba(255, 255, 255, 0.4)" }}
                >
                  <div className="text-lg font-semibold tabular-nums">
                    {daysUntil}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider opacity-70">
                    days
                  </div>
                </div>
              )}
              {isPast && (
                <div className="text-green-400/60 text-xs font-medium">
                  Completed
                </div>
              )}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={18} className="text-white/30" />
              </motion.div>
            </div>
          </div>

          {/* Rarity badge */}
          <div className="mt-3">
            <span
              className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium"
              style={{
                background: rarityConfig.bg,
                border: `1px solid ${rarityConfig.border}`,
                boxShadow: rarityConfig.glow,
                color:
                  transit.rarity === "once-in-lifetime" || transit.rarity === "very-rare"
                    ? "#E8C547"
                    : transit.rarity === "rare"
                      ? "#C9A227"
                      : "rgba(255, 255, 255, 0.6)",
              }}
            >
              {transit.rarity === "once-in-lifetime" && "✦ "}
              {transit.rarity === "very-rare" && "★ "}
              {transit.rarity === "rare" && "◈ "}
              {transit.rarity === "common" && "◇ "}
              {rarityConfig.label}
            </span>
          </div>
        </motion.button>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className="mt-2 p-4 rounded-2xl"
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                }}
              >
                {/* Description */}
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  {transit.description}
                </p>

                {/* Triple pass info (if multiple hits) */}
                {transit.hits.length > 1 && (
                  <div className="mb-4">
                    <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                      Triple Pass
                    </div>
                    <div className="space-y-1.5">
                      {transit.hits.map((hit, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background:
                                hit.phase === "first"
                                  ? "#4ADE80"
                                  : hit.phase === "retrograde"
                                    ? "#F59E0B"
                                    : "#60A5FA",
                            }}
                          />
                          <span className="text-white/50">
                            {formatDate(hit.date)}
                          </span>
                          <span className="text-white/30 capitalize">
                            ({hit.phase}
                            {hit.isRetrograde && ", retrograde"})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Influence period */}
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <div>
                    <span className="text-white/30">From:</span>{" "}
                    {formatDate(transit.startDate)}
                  </div>
                  <div>
                    <span className="text-white/30">To:</span>{" "}
                    {formatDate(transit.endDate)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
