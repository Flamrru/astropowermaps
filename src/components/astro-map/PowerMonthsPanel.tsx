"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Calendar, X, Sparkles, Star, TrendingUp } from "lucide-react";
import {
  YearForecast,
  MonthScore,
  ConfidenceLevel,
  MONTH_NAMES,
  getMonthName,
} from "@/lib/astro/transit-types";
import { LifeCategory } from "@/lib/astro/power-places";
import { getScoreLabel } from "@/lib/astro/power-months";
import MonthDetailSheet from "./MonthDetailSheet";

interface PowerMonthsPanelProps {
  forecast: YearForecast | null;
  loading?: boolean;
  onMonthSelect?: (month: number, category: LifeCategory) => void;
}

// Category colors (matching PowerPlacesPanel)
const CATEGORY_COLORS: Record<LifeCategory, { primary: string; glow: string; bg: string }> = {
  love: {
    primary: "#E8A4C9",
    glow: "rgba(232, 164, 201, 0.4)",
    bg: "rgba(232, 164, 201, 0.1)",
  },
  career: {
    primary: "#E8C547",
    glow: "rgba(232, 197, 71, 0.4)",
    bg: "rgba(232, 197, 71, 0.1)",
  },
  growth: {
    primary: "#9B7ED9",
    glow: "rgba(155, 126, 217, 0.4)",
    bg: "rgba(155, 126, 217, 0.1)",
  },
  home: {
    primary: "#C4C4C4",
    glow: "rgba(196, 196, 196, 0.3)",
    bg: "rgba(196, 196, 196, 0.1)",
  },
};

const CATEGORY_TABS: { id: LifeCategory; label: string; icon: string }[] = [
  { id: "love", label: "Love", icon: "💕" },
  { id: "career", label: "Career", icon: "💼" },
  { id: "growth", label: "Growth", icon: "🌟" },
  { id: "home", label: "Home", icon: "🏠" },
];

export default function PowerMonthsPanel({
  forecast,
  loading = false,
  onMonthSelect,
}: PowerMonthsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<LifeCategory>("love");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<MonthScore | null>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const activeColors = CATEGORY_COLORS[activeTab];

  // Get months for active category
  const categoryMonths = forecast?.months.filter((m) => m.category === activeTab) || [];
  const bestMonths = forecast?.bestMonths[activeTab] || [];

  // Handle month click
  const handleMonthClick = (month: MonthScore) => {
    setSelectedMonth(month);
    onMonthSelect?.(month.month, month.category);
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
          className="w-72 p-4 rounded-2xl"
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
              className="w-8 h-8 rounded-xl bg-[#C9A227]/20 flex items-center justify-center"
            >
              <Calendar size={16} className="text-[#C9A227]" />
            </motion.div>
            <div>
              <p className="text-white/60 text-sm">Calculating your</p>
              <p className="text-[#E8C547] font-semibold">2026 Power Forecast</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // No forecast yet
  if (!forecast) {
    return null;
  }

  // Mobile: Bottom drawer pattern
  if (isMobile) {
    return (
      <>
        {/* Month Detail Sheet */}
        <AnimatePresence>
          {selectedMonth && (
            <MonthDetailSheet
              month={selectedMonth}
              forecast={forecast}
              onClose={() => setSelectedMonth(null)}
              colors={activeColors}
            />
          )}
        </AnimatePresence>

        {/* The mobile bottom sheet is handled by MobileBottomSheet component */}
        {/* This component provides the content that goes inside it */}
      </>
    );
  }

  // Desktop: Side panel
  return (
    <>
      {/* Month Detail Sheet */}
      <AnimatePresence>
        {selectedMonth && (
          <MonthDetailSheet
            month={selectedMonth}
            forecast={forecast}
            onClose={() => setSelectedMonth(null)}
            colors={activeColors}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
        className="absolute top-4 left-4 z-20"
      >
        <div
          className="w-80 rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(15, 15, 35, 0.92) 0%, rgba(5, 5, 16, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: `0 8px 40px rgba(0, 0, 0, 0.5), 0 0 80px ${isExpanded ? activeColors.glow : "rgba(201, 162, 39, 0.1)"}`,
          }}
        >
          {/* Header */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={isExpanded ? {
                  boxShadow: [`0 0 15px ${activeColors.glow}`, `0 0 25px ${activeColors.glow}`, `0 0 15px ${activeColors.glow}`]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: isExpanded
                    ? `linear-gradient(135deg, ${activeColors.bg} 0%, transparent 100%)`
                    : "linear-gradient(135deg, rgba(201, 162, 39, 0.15) 0%, transparent 100%)",
                  border: isExpanded
                    ? `1px solid ${activeColors.primary}40`
                    : "1px solid rgba(201, 162, 39, 0.3)",
                }}
              >
                <Calendar
                  size={18}
                  style={{ color: isExpanded ? activeColors.primary : "#C9A227" }}
                />
              </motion.div>
              <div className="text-left">
                <span className="text-white font-semibold text-sm block">2026 Forecast</span>
                {!isExpanded && (
                  <span className="text-white/40 text-xs">Your power months</span>
                )}
              </div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(255, 255, 255, 0.05)" }}
            >
              <ChevronUp size={16} className="text-white/50" />
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
                className="overflow-hidden"
              >
                {/* Divider */}
                <div
                  className="h-px mx-4"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${activeColors.primary}30, transparent)`,
                  }}
                />

                {/* Confidence indicator */}
                {forecast.confidenceMode && (
                  <div className="px-4 pt-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#C9A227]/10 border border-[#C9A227]/20">
                      <Sparkles size={12} className="text-[#E8C547]" />
                      <p className="text-[#E8C547]/80 text-xs">
                        Results show confidence ratings based on time window
                      </p>
                    </div>
                  </div>
                )}

                {/* Category Tabs */}
                <div className="flex gap-1.5 px-3 py-3">
                  {CATEGORY_TABS.map((tab) => (
                    <TabButton
                      key={tab.id}
                      tab={tab}
                      isActive={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      colors={CATEGORY_COLORS[tab.id]}
                      isBest={forecast.bestMonths[tab.id]?.length > 0}
                    />
                  ))}
                </div>

                {/* Month Grid */}
                <div className="px-3 pb-4 max-h-80 overflow-y-auto custom-scrollbar">
                  <MonthGrid
                    months={categoryMonths}
                    bestMonths={bestMonths}
                    colors={activeColors}
                    onMonthClick={handleMonthClick}
                    confidenceMode={forecast.confidenceMode}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Custom scrollbar styles */}
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(201, 162, 39, 0.3);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(201, 162, 39, 0.5);
          }
        `}</style>
      </motion.div>
    </>
  );
}

// Tab Button Component
interface TabButtonProps {
  tab: { id: LifeCategory; label: string; icon: string };
  isActive: boolean;
  onClick: () => void;
  colors: { primary: string; glow: string; bg: string };
  isBest?: boolean;
}

function TabButton({ tab, isActive, onClick, colors, isBest }: TabButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-xl whitespace-nowrap transition-all relative overflow-hidden text-xs"
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${colors.bg} 0%, transparent 100%)`
          : "rgba(255, 255, 255, 0.03)",
        border: isActive
          ? `1px solid ${colors.primary}50`
          : "1px solid transparent",
        color: isActive ? colors.primary : "rgba(255, 255, 255, 0.5)",
        boxShadow: isActive ? `0 0 20px ${colors.glow}` : "none",
      }}
    >
      {isActive && (
        <motion.div
          layoutId="activeMonthTabGlow"
          className="absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(circle at center, ${colors.glow} 0%, transparent 70%)`,
            opacity: 0.3,
          }}
        />
      )}
      <span className="relative z-10">{tab.icon}</span>
      <span className="font-semibold relative z-10">{tab.label}</span>
    </motion.button>
  );
}

// Month Grid Component
interface MonthGridProps {
  months: MonthScore[];
  bestMonths: number[];
  colors: { primary: string; glow: string; bg: string };
  onMonthClick: (month: MonthScore) => void;
  confidenceMode: boolean;
}

function MonthGrid({ months, bestMonths, colors, onMonthClick, confidenceMode }: MonthGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {months.map((month, index) => (
        <MonthCard
          key={month.month}
          month={month}
          index={index}
          isBest={bestMonths.includes(month.month)}
          colors={colors}
          onClick={() => onMonthClick(month)}
          showConfidence={confidenceMode}
        />
      ))}
    </div>
  );
}

// Month Card Component
interface MonthCardProps {
  month: MonthScore;
  index: number;
  isBest: boolean;
  colors: { primary: string; glow: string; bg: string };
  onClick: () => void;
  showConfidence: boolean;
}

function MonthCard({ month, index, isBest, colors, onClick, showConfidence }: MonthCardProps) {
  const monthName = getMonthName(month.month).slice(0, 3);
  const scoreLabel = getScoreLabel(month.score);

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.03, type: "spring", stiffness: 300 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="relative p-3 rounded-xl text-center transition-all group"
      style={{
        background: isBest
          ? `linear-gradient(135deg, ${colors.bg} 0%, rgba(255, 255, 255, 0.02) 100%)`
          : "linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)",
        border: isBest
          ? `1px solid ${colors.primary}40`
          : "1px solid rgba(255, 255, 255, 0.06)",
        boxShadow: isBest ? `0 0 15px ${colors.glow}` : "none",
      }}
    >
      {/* Best month indicator */}
      {isBest && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}80 100%)`,
            boxShadow: `0 0 10px ${colors.glow}`,
          }}
        >
          <Star size={10} className="text-black" fill="currentColor" />
        </motion.div>
      )}

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${colors.glow} 0%, transparent 70%)`,
          opacity: 0.2,
        }}
      />

      {/* Month name */}
      <p className="text-white/60 text-xs font-medium mb-1 relative z-10">{monthName}</p>

      {/* Power bar */}
      <div className="relative h-12 w-full flex items-end justify-center mb-1">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(month.score, 5)}%` }}
          transition={{ delay: index * 0.05 + 0.2, duration: 0.5, ease: "easeOut" }}
          className="w-full rounded-t-md relative overflow-hidden"
          style={{
            background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primary}60 100%)`,
            boxShadow: month.score > 50 ? `0 0 10px ${colors.glow}` : "none",
          }}
        >
          {/* Shimmer effect on high scores */}
          {month.score >= 60 && (
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
              }}
            />
          )}
        </motion.div>
      </div>

      {/* Score */}
      <p
        className="text-sm font-bold relative z-10"
        style={{ color: month.score >= 60 ? colors.primary : "rgba(255, 255, 255, 0.7)" }}
      >
        {month.score}
      </p>

      {/* Confidence badge */}
      {showConfidence && (
        <ConfidenceBadge confidence={month.confidence} compact />
      )}

      {/* Peak indicator */}
      {month.peakWindow && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
          <TrendingUp size={10} style={{ color: colors.primary }} />
        </div>
      )}
    </motion.button>
  );
}

// Confidence Badge Component
interface ConfidenceBadgeProps {
  confidence: ConfidenceLevel;
  compact?: boolean;
}

export function ConfidenceBadge({ confidence, compact = false }: ConfidenceBadgeProps) {
  const config = {
    high: { stars: 3, color: "#4ADE80", label: "High" },
    medium: { stars: 2, color: "#FBBF24", label: "Medium" },
    low: { stars: 1, color: "#F87171", label: "Low" },
  };

  const { stars, color, label } = config[confidence];

  if (compact) {
    return (
      <div className="flex justify-center gap-0.5 mt-1">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="text-[8px]"
            style={{ color: i <= stars ? color : "rgba(255, 255, 255, 0.2)" }}
          >
            ★
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs"
      style={{
        background: `${color}15`,
        border: `1px solid ${color}30`,
      }}
    >
      <div className="flex gap-0.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="text-[10px]"
            style={{ color: i <= stars ? color : "rgba(255, 255, 255, 0.2)" }}
          >
            ★
          </span>
        ))}
      </div>
      <span style={{ color }}>{label}</span>
    </div>
  );
}

// Export for mobile content - self-contained with internal state
interface PowerMonthsContentProps {
  forecast: YearForecast;
  loading?: boolean;
  // Optional external state management
  activeTab?: LifeCategory;
  setActiveTab?: (tab: LifeCategory) => void;
  onMonthClick?: (month: MonthScore) => void;
}

export function PowerMonthsContent({
  forecast,
  loading = false,
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab,
  onMonthClick: externalOnMonthClick,
}: PowerMonthsContentProps) {
  // Internal state for standalone usage
  const [internalActiveTab, setInternalActiveTab] = useState<LifeCategory>("love");
  const [selectedMonth, setSelectedMonth] = useState<MonthScore | null>(null);

  // Use external or internal state
  const activeTab = externalActiveTab ?? internalActiveTab;
  const setActiveTab = externalSetActiveTab ?? setInternalActiveTab;
  const onMonthClick = externalOnMonthClick ?? setSelectedMonth;

  const activeColors = CATEGORY_COLORS[activeTab];
  const categoryMonths = forecast.months.filter((m) => m.category === activeTab);
  const bestMonths = forecast.bestMonths[activeTab] || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-[#C9A227] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      {/* Confidence indicator */}
      {forecast.confidenceMode && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#C9A227]/10 border border-[#C9A227]/20">
            <Sparkles size={12} className="text-[#E8C547]" />
            <p className="text-[#E8C547]/80 text-xs">
              Results show confidence ratings
            </p>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-2 px-4 pb-4">
        {CATEGORY_TABS.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            colors={CATEGORY_COLORS[tab.id]}
            isBest={forecast.bestMonths[tab.id]?.length > 0}
          />
        ))}
      </div>

      {/* Divider */}
      <div
        className="h-px mx-4 mb-4"
        style={{
          background: `linear-gradient(90deg, transparent, ${activeColors.primary}40, transparent)`,
        }}
      />

      {/* Month Grid */}
      <div className="px-4 pb-4">
        <MonthGrid
          months={categoryMonths}
          bestMonths={bestMonths}
          colors={activeColors}
          onMonthClick={onMonthClick}
          confidenceMode={forecast.confidenceMode}
        />
      </div>

      {/* Month Detail Sheet (for internal state only) */}
      <AnimatePresence>
        {selectedMonth && !externalOnMonthClick && (
          <MonthDetailSheet
            month={selectedMonth}
            forecast={forecast}
            onClose={() => setSelectedMonth(null)}
            colors={CATEGORY_COLORS[selectedMonth.category]}
          />
        )}
      </AnimatePresence>
    </>
  );
}
