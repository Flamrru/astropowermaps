"use client";

import { motion } from "framer-motion";
import { X, Calendar, TrendingUp, Sparkles, MapPin, Zap } from "lucide-react";
import {
  MonthScore,
  YearForecast,
  getMonthName,
  formatDateRange,
} from "@/lib/astro/transit-types";
import { PLANETS } from "@/lib/astro/planets";
import { getScoreLabel } from "@/lib/astro/power-months";
import {
  getAspectBrief,
  getPeakWindowInterpretation,
  getCategoryIcon,
} from "@/lib/astro/transit-interpretations";
import { ConfidenceBadge } from "./PowerMonthsPanel";

interface MonthDetailSheetProps {
  month: MonthScore;
  forecast: YearForecast;
  onClose: () => void;
  colors: { primary: string; glow: string; bg: string };
}

export default function MonthDetailSheet({
  month,
  forecast,
  onClose,
  colors,
}: MonthDetailSheetProps) {
  const monthName = getMonthName(month.month);
  const scoreLabel = getScoreLabel(month.score);
  const planetConfig = PLANETS[month.dominantPlanet];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-[2rem] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(15, 15, 35, 0.98) 0%, rgba(5, 5, 16, 0.99) 100%)",
          boxShadow: `0 -8px 50px rgba(0,0,0,0.6), 0 0 100px ${colors.glow}`,
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center py-4">
          <div
            className="w-14 h-1.5 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${colors.primary}60, transparent)`,
            }}
          />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pb-4">
          <div className="flex items-center gap-4">
            {/* Month badge */}
            <motion.div
              animate={{
                boxShadow: [`0 0 20px ${colors.glow}`, `0 0 40px ${colors.glow}`, `0 0 20px ${colors.glow}`],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${colors.bg} 0%, transparent 100%)`,
                border: `1px solid ${colors.primary}40`,
              }}
            >
              <Calendar size={18} style={{ color: colors.primary }} />
              <span className="text-[10px] font-bold text-white/60 mt-0.5">
                {monthName.slice(0, 3).toUpperCase()}
              </span>
            </motion.div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-xl">{monthName} 2026</h2>
                <span className="text-lg">{getCategoryIcon(month.category)}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-sm font-semibold"
                  style={{ color: colors.primary }}
                >
                  {scoreLabel}
                </span>
                <span className="text-white/40">•</span>
                <span className="text-white/40 text-sm">Score: {month.score}</span>
                {forecast.confidenceMode && (
                  <>
                    <span className="text-white/40">•</span>
                    <ConfidenceBadge confidence={month.confidence} />
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-white/10 transition-colors"
            style={{ background: "rgba(255, 255, 255, 0.05)" }}
          >
            <X size={18} className="text-white/60" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 pb-10 overflow-y-auto max-h-[60vh]">
          {/* Interpretation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-5"
          >
            <div
              className="p-4 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(255, 255, 255, 0.02) 100%)`,
                border: `1px solid ${colors.primary}20`,
              }}
            >
              <p className="text-white/80 text-sm leading-relaxed">
                {month.interpretation}
              </p>
            </div>
          </motion.div>

          {/* Dominant Planet */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-5"
          >
            <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">
              Dominant Influence
            </h3>
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: `1px solid ${planetConfig.color}30`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{
                  background: `${planetConfig.color}20`,
                  border: `1px solid ${planetConfig.color}40`,
                }}
              >
                {planetConfig.symbol}
              </div>
              <div>
                <p className="text-white font-medium">{planetConfig.name}</p>
                <p className="text-white/40 text-xs">Primary energy this month</p>
              </div>
            </div>
          </motion.div>

          {/* Peak Window */}
          {month.peakWindow && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-5"
            >
              <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                <TrendingUp size={12} />
                Best Window
              </h3>
              <div
                className="p-4 rounded-xl relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary}15 0%, transparent 100%)`,
                  border: `1px solid ${colors.primary}30`,
                }}
              >
                {/* Glow effect */}
                <motion.div
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at 30% 50%, ${colors.glow} 0%, transparent 50%)`,
                  }}
                />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={16} style={{ color: colors.primary }} />
                    <span
                      className="text-sm font-bold"
                      style={{ color: colors.primary }}
                    >
                      {formatDateRange(month.peakWindow.startDate, month.peakWindow.endDate)}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-md text-xs font-medium"
                      style={{
                        background: `${colors.primary}30`,
                        color: colors.primary,
                      }}
                    >
                      {month.peakWindow.intensity.replace("-", " ")}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm">
                    {getPeakWindowInterpretation(
                      month.category,
                      month.peakWindow.intensity,
                      month.peakWindow.reason
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Key Aspects */}
          {month.keyAspects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-5"
            >
              <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles size={12} />
                Key Transits
              </h3>
              <div className="space-y-2">
                {month.keyAspects.slice(0, 3).map((aspect, idx) => {
                  const transitPlanet = PLANETS[aspect.transitPlanet];
                  const natalPlanet = PLANETS[aspect.natalPlanet];

                  return (
                    <motion.div
                      key={`${aspect.transitPlanet}-${aspect.natalPlanet}-${aspect.aspectType}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      {/* Planet symbols */}
                      <div className="flex items-center gap-1">
                        <span
                          className="text-lg"
                          style={{ color: transitPlanet.color }}
                        >
                          {transitPlanet.symbol}
                        </span>
                        <span className="text-white/30 text-xs">→</span>
                        <span
                          className="text-lg"
                          style={{ color: natalPlanet.color }}
                        >
                          {natalPlanet.symbol}
                        </span>
                      </div>

                      {/* Aspect info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-sm truncate">
                          {getAspectBrief(
                            aspect.transitPlanet,
                            aspect.natalPlanet,
                            aspect.aspectType
                          )}
                        </p>
                      </div>

                      {/* Applying indicator */}
                      {aspect.isApplying && (
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                          style={{
                            background: "rgba(74, 222, 128, 0.15)",
                            color: "#4ADE80",
                            border: "1px solid rgba(74, 222, 128, 0.3)",
                          }}
                        >
                          Applying
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Score breakdown visualization */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h3 className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">
              Power Level
            </h3>
            <div className="relative h-4 rounded-full overflow-hidden bg-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${month.score}%` }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${colors.primary}80, ${colors.primary})`,
                  boxShadow: `0 0 20px ${colors.glow}`,
                }}
              />
              {/* Score markers */}
              <div className="absolute inset-0 flex justify-between px-2 items-center">
                {[20, 40, 60, 80].map((mark) => (
                  <div
                    key={mark}
                    className="w-px h-2 bg-white/20"
                    style={{ left: `${mark}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-white/30 text-xs">Quiet</span>
              <span className="text-white/30 text-xs">Exceptional</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
