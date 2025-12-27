"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Lightbulb } from "lucide-react";
import { PlanetId, LineType } from "@/lib/astro/types";
import { PLANETS } from "@/lib/astro/planets";
import {
  getInterpretation,
  getLineTypeName,
  getLineTypeDescription,
} from "@/lib/astro/interpretations";
import { useState, useEffect } from "react";

interface LineTooltipProps {
  planet: PlanetId;
  lineType: LineType;
  interpretation: string; // Legacy prop, we'll use the enhanced version
  position: { x: number; y: number };
  onClose: () => void;
}

export default function LineTooltip({
  planet,
  lineType,
  position,
  onClose,
}: LineTooltipProps) {
  const planetConfig = PLANETS[planet];
  const fullInterpretation = getInterpretation(planet, lineType);
  const lineTypeName = getLineTypeName(lineType);
  const lineTypeDescription = getLineTypeDescription(lineType);

  // Detect mobile
  const [isMobile, setIsMobile] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Adjust position to keep tooltip on screen (desktop only)
  const adjustedX = Math.min(position.x, window.innerWidth - 340);
  const adjustedY = Math.min(position.y - 10, window.innerHeight - 400);

  // Mobile: Bottom sheet style
  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40"
          onClick={onClose}
        />

        {/* Sheet */}
        <motion.div
          className="relative bg-[#0a0a1e] rounded-t-3xl border-t border-white/15 max-h-[80vh] overflow-y-auto"
          style={{
            boxShadow: `0 -8px 40px rgba(0,0,0,0.5), 0 0 60px ${planetConfig.color}20`,
          }}
        >
          {/* Handle */}
          <div className="flex justify-center py-3">
            <div className="w-12 h-1 bg-white/20 rounded-full" />
          </div>

          <TooltipContent
            planetConfig={planetConfig}
            lineTypeName={lineTypeName}
            lineTypeDescription={lineTypeDescription}
            fullInterpretation={fullInterpretation}
            lineType={lineType}
            showDetails={showDetails}
            setShowDetails={setShowDetails}
            onClose={onClose}
          />
        </motion.div>
      </motion.div>
    );
  }

  // Desktop: Floating card
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{
        position: "absolute",
        left: adjustedX,
        top: adjustedY,
        zIndex: 100,
      }}
      className="w-80"
    >
      <div
        className="
          bg-[#0a0a1e]/95 backdrop-blur-xl
          border border-white/15 rounded-2xl
          shadow-[0_8px_32px_rgba(0,0,0,0.5)]
          overflow-hidden
        "
        style={{
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 40px ${planetConfig.color}15`,
        }}
      >
        <TooltipContent
          planetConfig={planetConfig}
          lineTypeName={lineTypeName}
          lineTypeDescription={lineTypeDescription}
          fullInterpretation={fullInterpretation}
          lineType={lineType}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
          onClose={onClose}
        />
      </div>
    </motion.div>
  );
}

// Shared content component
interface TooltipContentProps {
  planetConfig: typeof PLANETS[PlanetId];
  lineTypeName: string;
  lineTypeDescription: string;
  fullInterpretation: {
    title: string;
    description: string;
    plainSummary: string;
    tips: string[];
  };
  lineType: LineType;
  showDetails: boolean;
  setShowDetails: (show: boolean) => void;
  onClose: () => void;
}

function TooltipContent({
  planetConfig,
  lineTypeName,
  lineTypeDescription,
  fullInterpretation,
  lineType,
  showDetails,
  setShowDetails,
  onClose,
}: TooltipContentProps) {
  return (
    <>
      {/* Header */}
      <div
        className="px-5 py-4 border-b border-white/10 flex items-center justify-between"
        style={{ borderBottomColor: `${planetConfig.color}30` }}
      >
        <div className="flex items-center gap-3">
          {/* Planet Symbol */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${planetConfig.color}30 0%, ${planetConfig.color}10 100%)`,
              border: `1px solid ${planetConfig.color}40`,
            }}
          >
            <span
              className="text-xl"
              style={{ color: planetConfig.color }}
            >
              {planetConfig.symbol}
            </span>
          </div>

          {/* Planet Name + Line Type */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">
                {planetConfig.name}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: `${planetConfig.color}20`,
                  color: planetConfig.color,
                }}
              >
                {lineType}
              </span>
            </div>
            <span className="text-white/50 text-sm">
              {lineTypeName}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={18} className="text-white/50" />
        </button>
      </div>

      {/* Main Content */}
      <div className="px-5 py-4 space-y-4">
        {/* Plain Summary - The Hook */}
        <div
          className="flex items-start gap-3 p-3 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${planetConfig.color}15 0%, transparent 100%)`,
          }}
        >
          <Sparkles
            size={18}
            className="mt-0.5 flex-shrink-0"
            style={{ color: planetConfig.color }}
          />
          <p
            className="text-base font-medium"
            style={{ color: "#fff" }}
          >
            {fullInterpretation.plainSummary}
          </p>
        </div>

        {/* Line Type Description */}
        <p className="text-white/50 text-sm">
          {lineTypeDescription}
        </p>

        {/* Show More / Less */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Full Description */}
              <p className="text-white/70 text-sm leading-relaxed">
                {fullInterpretation.description}
              </p>

              {/* Tips */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/40 text-xs font-medium uppercase tracking-wider">
                  <Lightbulb size={12} />
                  <span>How to use this energy</span>
                </div>
                <ul className="space-y-1.5">
                  {fullInterpretation.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-white/60 text-sm"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: planetConfig.color }}
                      />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-2 text-sm font-medium rounded-lg transition-colors"
          style={{
            color: planetConfig.color,
            background: `${planetConfig.color}10`,
          }}
        >
          {showDetails ? "Show Less" : "Learn More"}
        </button>
      </div>

      {/* Accent bar at bottom */}
      <div
        className="h-1"
        style={{
          background: `linear-gradient(to right, ${planetConfig.color}, ${planetConfig.color}50, transparent)`,
        }}
      />
    </>
  );
}
