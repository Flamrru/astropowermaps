"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, MessageCircle } from "lucide-react";
import { PlanetId, LineType } from "@/lib/astro/types";
import { PLANETS } from "@/lib/astro/planets";
import {
  getInterpretation,
  getLineTypeName,
  getLineTypeDescription,
} from "@/lib/astro/interpretations";
import { useTrack } from "@/lib/hooks/useTrack";

/**
 * LineModal - V5 Glass Morphism Line Information Modal
 *
 * A cleaner, simpler modal that shows:
 * 1. Planet + Line type header with glow
 * 2. Brief interpretation (plainSummary)
 * 3. Line type description
 * 4. "Ask Stella" button for deeper insights
 *
 * Replaces the more complex LineTooltip in the V5 dashboard context.
 */

interface LineModalProps {
  planet: PlanetId;
  lineType: LineType;
  isOpen: boolean;
  onClose: () => void;
  onAskStella?: (context: { displayMessage: string; hiddenContext: string }) => void;
}

export default function LineModal({
  planet,
  lineType,
  isOpen,
  onClose,
  onAskStella,
}: LineModalProps) {
  const planetConfig = PLANETS[planet];
  const interpretation = getInterpretation(planet, lineType);
  const lineTypeName = getLineTypeName(lineType);
  const lineTypeDescription = getLineTypeDescription(lineType);
  const track = useTrack();

  const handleAskStella = () => {
    // Track Ask Stella from map
    track("ask_stella_from_map", { planet, line_type: lineType, context_type: "line" }, "map");

    if (onAskStella) {
      onAskStella({
        displayMessage: `Tell me about my ${planetConfig.name} ${lineTypeName}`,
        hiddenContext: `User is asking about their ${planetConfig.name} ${lineTypeName} (${lineType} line) in astrocartography.

Line interpretation: ${interpretation.title}
Summary: ${interpretation.plainSummary}
Full description: ${interpretation.description}

Tips for this line:
${interpretation.tips.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Provide personalized insights about what this planetary line means for them, considering their birth chart. Be warm and insightful. Reference their specific placement.`,
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="relative w-full md:w-[400px] md:max-w-[90vw] mx-4 md:mx-0 rounded-t-3xl md:rounded-3xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, rgba(15, 15, 35, 0.98) 0%, rgba(8, 8, 20, 0.99) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: `
                0 -8px 60px rgba(0, 0, 0, 0.5),
                0 0 80px ${planetConfig.color}20,
                inset 0 1px 0 rgba(255, 255, 255, 0.05)
              `,
            }}
          >
            {/* Top accent gradient */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: `linear-gradient(90deg, transparent 5%, ${planetConfig.color}80 30%, ${planetConfig.color} 50%, ${planetConfig.color}80 70%, transparent 95%)`,
              }}
            />

            {/* Handle (mobile) */}
            <div className="md:hidden flex justify-center py-3">
              <div
                className="w-12 h-1.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${planetConfig.color}60, transparent)`,
                }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 md:pt-5">
              <div className="flex items-center gap-3">
                {/* Planet symbol with orbital glow */}
                <motion.div
                  className="relative"
                  animate={{
                    boxShadow: [
                      `0 0 20px ${planetConfig.color}40`,
                      `0 0 35px ${planetConfig.color}60`,
                      `0 0 20px ${planetConfig.color}40`,
                    ],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${planetConfig.color}25 0%, ${planetConfig.color}10 100%)`,
                      border: `1px solid ${planetConfig.color}40`,
                    }}
                  >
                    <span
                      className="text-2xl"
                      style={{ color: planetConfig.color }}
                    >
                      {planetConfig.symbol}
                    </span>
                  </div>
                </motion.div>

                {/* Planet name + line type */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-lg">
                      {planetConfig.name}
                    </h3>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: `${planetConfig.color}20`,
                        color: planetConfig.color,
                        border: `1px solid ${planetConfig.color}30`,
                      }}
                    >
                      {lineType}
                    </span>
                  </div>
                  <p
                    className="text-sm"
                    style={{ color: "rgba(255, 255, 255, 0.5)" }}
                  >
                    {lineTypeName}
                  </p>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl transition-colors"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              >
                <X size={18} className="text-white/60" />
              </button>
            </div>

            {/* Divider */}
            <div
              className="h-px mx-5"
              style={{
                background: `linear-gradient(90deg, transparent, ${planetConfig.color}30, transparent)`,
              }}
            />

            {/* Content */}
            <div className="px-5 py-5 space-y-4">
              {/* Main insight box */}
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${planetConfig.color}12 0%, transparent 100%)`,
                  border: `1px solid ${planetConfig.color}20`,
                }}
              >
                <div className="flex items-start gap-3">
                  <Sparkles
                    size={18}
                    className="mt-0.5 flex-shrink-0"
                    style={{ color: planetConfig.color }}
                  />
                  <p className="text-white font-medium text-[15px] leading-relaxed">
                    {interpretation.plainSummary}
                  </p>
                </div>
              </div>

              {/* Line type description */}
              <p className="text-white/50 text-sm leading-relaxed px-1">
                {lineTypeDescription}
              </p>

              {/* Ask Stella Button */}
              {onAskStella && (
                <motion.button
                  onClick={handleAskStella}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-[15px] transition-all"
                  style={{
                    background: `linear-gradient(135deg, ${planetConfig.color}25 0%, ${planetConfig.color}15 100%)`,
                    border: `1px solid ${planetConfig.color}40`,
                    color: planetConfig.color,
                    boxShadow: `0 4px 20px ${planetConfig.color}25`,
                  }}
                >
                  <MessageCircle size={18} />
                  <span>Ask Stella for deeper insight</span>
                </motion.button>
              )}
            </div>

            {/* Bottom safe area (mobile) */}
            <div className="h-6 md:h-4" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
