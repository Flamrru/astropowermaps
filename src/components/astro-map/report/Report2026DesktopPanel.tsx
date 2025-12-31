"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Sparkles } from "lucide-react";
import { PlanetaryLine } from "@/lib/astro/types";
import { YearForecast } from "@/lib/astro/transit-types";
import Report2026Panel from "./Report2026Panel";

interface Report2026DesktopPanelProps {
  forecast: YearForecast;
  lines: PlanetaryLine[];
  onFlyToCity: (lat: number, lng: number, cityName: string) => void;
  loading?: boolean;
  // External control for expanded state
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export default function Report2026DesktopPanel({
  forecast,
  lines,
  onFlyToCity,
  loading = false,
  isExpanded: externalExpanded,
  onExpandedChange,
}: Report2026DesktopPanelProps) {
  // Use external state if provided, otherwise internal (default expanded)
  const [internalExpanded, setInternalExpanded] = useState(true);
  const isExpanded = externalExpanded !== undefined ? externalExpanded : internalExpanded;

  // Handle expand/collapse
  const handleExpandedChange = (expanded: boolean) => {
    if (onExpandedChange) {
      onExpandedChange(expanded);
    } else {
      setInternalExpanded(expanded);
    }
  };

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute top-4 left-4 z-20"
      >
        <div
          className="w-80 p-4 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(15, 15, 35, 0.92) 0%, rgba(5, 5, 16, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 rounded-xl bg-[#9B7ED9]/20 flex items-center justify-center"
            >
              <Sparkles size={16} className="text-[#9B7ED9]" />
            </motion.div>
            <div>
              <p className="text-white/60 text-sm">Generating your</p>
              <p className="text-[#9B7ED9] font-semibold">2026 Report</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const accentColor = "#9B7ED9";
  const glowColor = "rgba(155, 126, 217, 0.3)";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
      className="absolute top-4 left-4 z-20"
    >
      <div
        className="w-[360px] rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(5, 5, 16, 0.98) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: `0 8px 40px rgba(0, 0, 0, 0.5), 0 0 80px ${isExpanded ? glowColor : "rgba(155, 126, 217, 0.1)"}`,
        }}
      >
        {/* Header - Premium & Prominent */}
        <button
          onClick={() => handleExpandedChange(!isExpanded)}
          className="w-full flex items-center justify-between px-5 py-4 transition-all hover:bg-white/5"
          style={{
            background: isExpanded
              ? "transparent"
              : `linear-gradient(135deg, ${accentColor}15 0%, transparent 100%)`,
          }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 20px ${glowColor}`,
                  `0 0 35px ${glowColor}`,
                  `0 0 20px ${glowColor}`,
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${accentColor}30 0%, ${accentColor}10 100%)`,
                border: `1px solid ${accentColor}50`,
              }}
            >
              <Sparkles size={20} style={{ color: accentColor }} />
            </motion.div>
            <div className="text-left">
              <span
                className="text-base font-bold block"
                style={{
                  color: isExpanded ? "rgba(255, 255, 255, 0.95)" : accentColor,
                  textShadow: !isExpanded ? `0 0 20px ${glowColor}` : "none",
                }}
              >
                2026 Report
              </span>
              <span className="text-white/50 text-xs">
                {isExpanded ? "Personal forecast & insights" : "Tap to view your cosmic forecast"}
              </span>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, type: "spring" }}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: isExpanded ? "rgba(255, 255, 255, 0.05)" : `${accentColor}20`,
              border: isExpanded ? "none" : `1px solid ${accentColor}30`,
            }}
          >
            <ChevronUp size={18} style={{ color: isExpanded ? "rgba(255,255,255,0.5)" : accentColor }} />
          </motion.div>
        </button>

        {/* Expandable Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              style={{ overflow: "hidden" }}
            >
              {/* Divider */}
              <div
                className="h-px mx-4"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accentColor}30, transparent)`,
                }}
              />

              {/* Scrollable Report Content */}
              <div
                className="custom-scrollbar"
                style={{
                  maxHeight: "calc(100vh - 180px)",
                  overflowY: "auto",
                  overflowX: "hidden",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(155, 126, 217, 0.3) transparent",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <Report2026Panel
                  forecast={forecast}
                  lines={lines}
                  onFlyToCity={onFlyToCity}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(155, 126, 217, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(155, 126, 217, 0.5);
        }
      `}</style>
    </motion.div>
  );
}
