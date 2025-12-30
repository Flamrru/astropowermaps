"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Eye, EyeOff, RotateCcw, Info } from "lucide-react";
import { PlanetId, PlanetInfo } from "@/lib/astro/types";
import { PLANETS, LINE_TYPES } from "@/lib/astro/planets";

interface MapControlsProps {
  planets: PlanetInfo[];
  visiblePlanets: Set<PlanetId>;
  onTogglePlanet: (planetId: PlanetId) => void;
  onShowAll: () => void;
  onHideAll: () => void;
  onReset: () => void;
  // External control for expanded state
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export default function MapControls({
  planets,
  visiblePlanets,
  onTogglePlanet,
  onShowAll,
  onHideAll,
  onReset,
  isExpanded: externalExpanded,
  onExpandedChange,
}: MapControlsProps) {
  // Use external state if provided, otherwise internal
  const [internalExpanded, setInternalExpanded] = useState(false); // Default collapsed
  const isExpanded = externalExpanded !== undefined ? externalExpanded : internalExpanded;
  const setIsExpanded = (value: boolean) => {
    if (onExpandedChange) {
      onExpandedChange(value);
    } else {
      setInternalExpanded(value);
    }
  };
  const [showLegend, setShowLegend] = useState(false);

  return (
    <>
      {/* Main Controls Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="
          absolute left-4 bottom-4
          w-64 max-h-[70vh]
          bg-[#0a0a1e]/90 backdrop-blur-xl
          border border-white/10 rounded-xl
          shadow-[0_8px_32px_rgba(0,0,0,0.4)]
          overflow-hidden
          z-10
        "
      >
        {/* Header */}
        <div
          className="
            flex items-center justify-between
            px-4 py-3
            border-b border-white/10
            cursor-pointer
          "
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="text-white font-medium text-sm">Planetary Lines</h3>
          <motion.div
            animate={{ rotate: isExpanded ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronUp size={18} className="text-white/60" />
          </motion.div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Quick Actions */}
              <div className="flex gap-2 px-3 py-2 border-b border-white/10">
                <button
                  onClick={onShowAll}
                  className="
                    flex-1 flex items-center justify-center gap-1.5
                    py-1.5 px-2 rounded-lg
                    bg-white/5 hover:bg-white/10
                    text-white/70 hover:text-white
                    text-xs font-medium
                    transition-colors
                  "
                >
                  <Eye size={14} />
                  Show All
                </button>
                <button
                  onClick={onHideAll}
                  className="
                    flex-1 flex items-center justify-center gap-1.5
                    py-1.5 px-2 rounded-lg
                    bg-white/5 hover:bg-white/10
                    text-white/70 hover:text-white
                    text-xs font-medium
                    transition-colors
                  "
                >
                  <EyeOff size={14} />
                  Hide All
                </button>
              </div>

              {/* Planet List */}
              <div className="max-h-[40vh] overflow-y-auto p-2">
                {planets.map((planet) => {
                  const isVisible = visiblePlanets.has(planet.id);
                  const config = PLANETS[planet.id];

                  return (
                    <button
                      key={planet.id}
                      onClick={() => onTogglePlanet(planet.id)}
                      className={`
                        w-full flex items-center gap-3
                        px-3 py-2.5 rounded-lg
                        transition-all duration-200
                        ${isVisible ? "bg-white/10" : "bg-transparent hover:bg-white/5"}
                      `}
                    >
                      {/* Color Indicator */}
                      <div
                        className={`
                          w-3 h-3 rounded-full flex-shrink-0
                          transition-opacity duration-200
                          ${isVisible ? "opacity-100" : "opacity-30"}
                        `}
                        style={{ backgroundColor: config.color }}
                      />

                      {/* Symbol */}
                      <span
                        className={`
                          text-lg flex-shrink-0 transition-opacity duration-200
                          ${isVisible ? "opacity-100" : "opacity-30"}
                        `}
                        style={{ color: config.color }}
                      >
                        {config.symbol}
                      </span>

                      {/* Name */}
                      <span
                        className={`
                          flex-1 text-left text-sm
                          transition-colors duration-200
                          ${isVisible ? "text-white" : "text-white/40"}
                        `}
                      >
                        {config.name}
                      </span>

                      {/* Visibility Icon */}
                      {isVisible ? (
                        <Eye size={14} className="text-[#C9A227]" />
                      ) : (
                        <EyeOff size={14} className="text-white/30" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer Actions */}
              <div className="px-3 py-2 border-t border-white/10 flex gap-2">
                <button
                  onClick={() => setShowLegend(true)}
                  className="
                    flex-1 flex items-center justify-center gap-1.5
                    py-2 px-3 rounded-lg
                    bg-white/5 hover:bg-white/10
                    text-white/70 hover:text-white
                    text-xs font-medium
                    transition-colors
                  "
                >
                  <Info size={14} />
                  Legend
                </button>
                <button
                  onClick={onReset}
                  className="
                    flex-1 flex items-center justify-center gap-1.5
                    py-2 px-3 rounded-lg
                    bg-[#C9A227]/20 hover:bg-[#C9A227]/30
                    text-[#E8C547] hover:text-[#E8C547]
                    text-xs font-medium
                    transition-colors
                  "
                >
                  <RotateCcw size={14} />
                  New Map
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Legend Modal */}
      <AnimatePresence>
        {showLegend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLegend(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="
                w-full max-w-sm
                bg-[#0a0a1e]/95 backdrop-blur-xl
                border border-white/10 rounded-2xl
                shadow-[0_8px_32px_rgba(0,0,0,0.5)]
                overflow-hidden
              "
            >
              <div className="px-5 py-4 border-b border-white/10">
                <h3 className="text-white font-semibold text-lg">Line Types</h3>
                <p className="text-white/50 text-sm mt-1">
                  What each line represents
                </p>
              </div>

              <div className="p-4 space-y-4">
                {(["MC", "IC", "AC", "DC"] as const).map((lineType) => {
                  const config = LINE_TYPES[lineType];
                  const isDashed = !!config.dashArray;

                  return (
                    <div key={lineType} className="flex gap-3">
                      {/* Line Preview */}
                      <div className="flex-shrink-0 w-12 flex items-center justify-center">
                        <div
                          className={`
                            w-full h-0.5 bg-[#C9A227]
                            ${isDashed ? "border-t-2 border-dashed border-[#C9A227] bg-transparent" : ""}
                          `}
                        />
                      </div>

                      {/* Description */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[#E8C547] font-medium text-sm">
                            {lineType}
                          </span>
                          <span className="text-white/60 text-sm">
                            {config.name}
                          </span>
                        </div>
                        <p className="text-white/40 text-xs mt-0.5">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 pb-4">
                <button
                  onClick={() => setShowLegend(false)}
                  className="
                    w-full py-3 rounded-xl
                    bg-[#C9A227]/20 hover:bg-[#C9A227]/30
                    text-[#E8C547] font-medium
                    transition-colors
                  "
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
