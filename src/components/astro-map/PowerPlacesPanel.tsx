"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, MapPin, Plane, X, Sparkles } from "lucide-react";
import { PlanetaryLine } from "@/lib/astro/types";
import { PLANETS } from "@/lib/astro/planets";
import {
  calculateAllPowerPlaces,
  CategoryResult,
  LifeCategory,
  PowerPlace,
} from "@/lib/astro/power-places";

interface PowerPlacesPanelProps {
  lines: PlanetaryLine[];
  onFlyToCity: (lat: number, lng: number, cityName: string) => void;
  defaultExpanded?: boolean;
}

// Category colors for theming
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

// ============================================
// Celestial Category Icons - Tarot-inspired SVGs
// ============================================

interface CategoryIconProps {
  category: LifeCategory;
  color: string;
  size?: number;
  isActive?: boolean;
}

function CategoryIcon({ category, color, size = 18, isActive = false }: CategoryIconProps) {
  const strokeWidth = 1.5;
  const glowFilter = isActive ? `drop-shadow(0 0 4px ${color})` : "none";

  const iconStyle = {
    filter: glowFilter,
    transition: "filter 0.3s ease",
  };

  switch (category) {
    // Love: Twin crescent moons forming a heart - Venus energy
    case "love":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          style={iconStyle}
        >
          {/* Left crescent moon curving right */}
          <path
            d="M8 4C5.5 6 4 9 4 12C4 15 5.5 18 8 20"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Right crescent moon curving left */}
          <path
            d="M16 4C18.5 6 20 9 20 12C20 15 18.5 18 16 20"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Heart point at bottom where they meet */}
          <path
            d="M8 20Q12 24 16 20"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Small star at the heart center */}
          <circle
            cx="12"
            cy="12"
            r="1.5"
            fill={color}
            opacity={isActive ? 1 : 0.6}
          />
        </svg>
      );

    // Career: North Star with ascending trajectory - guiding ambition
    case "career":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          style={iconStyle}
        >
          {/* Main star - 4 pointed */}
          <path
            d="M12 3L13.5 9.5L20 11L13.5 12.5L12 19L10.5 12.5L4 11L10.5 9.5L12 3Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            fill={isActive ? `${color}20` : "none"}
          />
          {/* Ascending ray from star */}
          <path
            d="M12 3L12 1"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Small orbital dots */}
          <circle cx="6" cy="6" r="1" fill={color} opacity={0.4} />
          <circle cx="18" cy="6" r="1" fill={color} opacity={0.4} />
          {/* Base platform line */}
          <path
            d="M7 21L17 21"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.5}
          />
        </svg>
      );

    // Growth: Ascending lotus spiral - spiritual unfolding
    case "growth":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          style={iconStyle}
        >
          {/* Central ascending stem */}
          <path
            d="M12 22L12 10"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Left petal unfurling */}
          <path
            d="M12 10C12 10 8 8 6 4C8 6 10 7 12 7"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Right petal unfurling */}
          <path
            d="M12 10C12 10 16 8 18 4C16 6 14 7 12 7"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner left petal */}
          <path
            d="M12 8C12 8 10 6 9 3"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.6}
          />
          {/* Inner right petal */}
          <path
            d="M12 8C12 8 14 6 15 3"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.6}
          />
          {/* Crown point - the bloom */}
          <circle
            cx="12"
            cy="4"
            r="2"
            stroke={color}
            strokeWidth={strokeWidth}
            fill={isActive ? `${color}30` : "none"}
          />
          {/* Root lines */}
          <path
            d="M10 22C10 20 11 19 12 18C13 19 14 20 14 22"
            stroke={color}
            strokeWidth={1}
            strokeLinecap="round"
            opacity={0.4}
          />
        </svg>
      );

    // Home: Sanctuary with crescent moon - sacred shelter
    case "home":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          style={iconStyle}
        >
          {/* House roof - pointed like a temple */}
          <path
            d="M12 3L4 10L4 20L20 20L20 10L12 3Z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            fill={isActive ? `${color}10` : "none"}
          />
          {/* Door/entrance - arched */}
          <path
            d="M10 20L10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15L14 20"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Crescent moon in the roof/gable */}
          <path
            d="M11 8C11 8 10 7 10 6C10 6 11 6.5 12 6.5C12.5 6.5 13 6.3 13.5 6C13 7 12 8 11 8Z"
            stroke={color}
            strokeWidth={1.2}
            strokeLinecap="round"
            fill={color}
            opacity={isActive ? 1 : 0.7}
          />
        </svg>
      );

    default:
      return null;
  }
}

const CATEGORY_TABS: { id: LifeCategory; label: string }[] = [
  { id: "love", label: "Love" },
  { id: "career", label: "Career" },
  { id: "growth", label: "Growth" },
  { id: "home", label: "Home" },
];

// ============================================
// Star Rating Component - Celestial SVG Stars
// ============================================

interface StarRatingProps {
  stars: number; // 0-5 with 0.5 precision
  color: string;
  size?: number;
  showValue?: boolean;
}

/**
 * Elegant star rating component with half-star precision
 * Uses custom SVG celestial stars (not emoji)
 */
function StarRating({ stars, color, size = 14, showValue = false }: StarRatingProps) {
  // Create array of 5 stars with their fill status
  const starStates = Array.from({ length: 5 }, (_, i) => {
    const position = i + 1;
    if (stars >= position) return "full";
    if (stars >= position - 0.5) return "half";
    return "empty";
  });

  return (
    <div className="flex items-center gap-0.5">
      {starStates.map((state, i) => (
        <div key={i} className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            fill="none"
            style={{
              filter: state !== "empty" ? `drop-shadow(0 0 3px ${color}80)` : "none",
            }}
          >
            {/* Define gradient for half-star */}
            {state === "half" && (
              <defs>
                <linearGradient id={`halfGrad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="50%" stopColor={color} />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            )}

            {/* 4-pointed star path - celestial elegance */}
            <path
              d="M8 1L9.2 5.8L14 7L9.2 8.2L8 13L6.8 8.2L2 7L6.8 5.8L8 1Z"
              fill={
                state === "full"
                  ? color
                  : state === "half"
                  ? `url(#halfGrad-${i})`
                  : "transparent"
              }
              stroke={state === "empty" ? "rgba(255,255,255,0.2)" : color}
              strokeWidth={state === "empty" ? 0.8 : 0.5}
              strokeLinejoin="round"
            />

            {/* Tiny sparkle at center for filled/half stars */}
            {state !== "empty" && (
              <circle
                cx="8"
                cy="7"
                r="0.8"
                fill="rgba(255,255,255,0.9)"
              />
            )}
          </svg>
        </div>
      ))}

      {/* Optional numeric value display */}
      {showValue && (
        <span
          className="ml-1 text-xs font-medium"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {stars.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default function PowerPlacesPanel({
  lines,
  onFlyToCity,
  defaultExpanded = false,
}: PowerPlacesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<LifeCategory>("love");
  const [isMobile, setIsMobile] = useState(false);
  // Track previous defaultExpanded to detect changes
  const [prevDefaultExpanded, setPrevDefaultExpanded] = useState(defaultExpanded);

  // Sync expanded state when defaultExpanded changes (derived state pattern)
  if (defaultExpanded !== prevDefaultExpanded) {
    setPrevDefaultExpanded(defaultExpanded);
    if (defaultExpanded) {
      setIsExpanded(true);
    }
  }

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Calculate power places for all categories
  const powerPlaces = useMemo(() => {
    return calculateAllPowerPlaces(lines);
  }, [lines]);

  const activeCategory = powerPlaces[activeTab];
  const activeColors = CATEGORY_COLORS[activeTab];

  // Mobile: Bottom drawer
  if (isMobile) {
    return (
      <>
        {/* Toggle Button - Premium floating button (positioned above nav) */}
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-24 right-4 z-30 flex items-center gap-2 px-5 py-3.5 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(201, 162, 39, 0.95) 0%, rgba(139, 105, 20, 0.95) 100%)",
            boxShadow: "0 4px 30px rgba(201, 162, 39, 0.5), 0 0 60px rgba(201, 162, 39, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <Sparkles size={18} className="text-white" />
          <span className="text-white font-semibold text-sm tracking-wide">Power Places</span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-white/80"
          />
        </motion.button>

        {/* Bottom Sheet */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
            >
              {/* Backdrop with blur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsExpanded(false)}
              />

              {/* Sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="absolute inset-x-0 bottom-0 rounded-t-[2rem] max-h-[80vh] flex flex-col"
                style={{
                  background: "linear-gradient(180deg, rgba(15, 15, 35, 0.98) 0%, rgba(5, 5, 16, 0.99) 100%)",
                  boxShadow: "0 -8px 50px rgba(0,0,0,0.6), 0 0 100px rgba(201, 162, 39, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                {/* Fixed Header Section */}
                <div className="flex-shrink-0">
                  {/* Handle with glow */}
                  <div className="flex justify-center py-4">
                    <div
                      className="w-14 h-1.5 rounded-full"
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(201, 162, 39, 0.6), transparent)",
                      }}
                    />
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between px-6 pb-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{
                          boxShadow: [`0 0 20px ${activeColors.glow}`, `0 0 40px ${activeColors.glow}`, `0 0 20px ${activeColors.glow}`]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${activeColors.bg} 0%, transparent 100%)`,
                          border: `1px solid ${activeColors.primary}40`,
                        }}
                      >
                        <MapPin size={20} style={{ color: activeColors.primary }} />
                      </motion.div>
                      <div>
                        <h3 className="text-white font-bold text-lg">Power Places</h3>
                        <p className="text-white/40 text-xs">Your cosmic destinations</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="p-2.5 rounded-xl hover:bg-white/10 transition-colors"
                      style={{ background: "rgba(255, 255, 255, 0.05)" }}
                    >
                      <X size={18} className="text-white/60" />
                    </button>
                  </div>

                  {/* Tabs - Full-width celestial navigation (STICKY) */}
                  <MobileTabBar
                    tabs={CATEGORY_TABS}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    powerPlaces={powerPlaces}
                  />

                  {/* Divider */}
                  <div
                    className="h-px mx-6"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${activeColors.primary}40, transparent)`,
                    }}
                  />
                </div>

                {/* Scrollable Content */}
                <div
                  className="flex-1 overflow-y-auto px-6 py-4 pb-10"
                  style={{
                    WebkitOverflowScrolling: "touch",
                    touchAction: "pan-y",
                  }}
                >
                  <CategoryContent
                    category={activeCategory}
                    onFlyToCity={onFlyToCity}
                    colors={activeColors}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop: Premium side panel
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
      className="absolute bottom-4 right-4 z-20"
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
              <Sparkles
                size={18}
                style={{ color: isExpanded ? activeColors.primary : "#C9A227" }}
              />
            </motion.div>
            <div className="text-left">
              <span className="text-white font-semibold text-sm block">Power Places</span>
              {!isExpanded && (
                <span className="text-white/40 text-xs">Discover your destinations</span>
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

              {/* Tabs - Full-width elegant design */}
              <DesktopTabBar
                tabs={CATEGORY_TABS}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                powerPlaces={powerPlaces}
              />

              {/* Content */}
              <div
                className="px-3 pb-4 max-h-72 overflow-y-auto custom-scrollbar"
                style={{
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-y",
                }}
              >
                <CategoryContent
                  category={activeCategory}
                  onFlyToCity={onFlyToCity}
                  colors={activeColors}
                  compact
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
  );
}

// ============================================
// Tab Components - Celestial Navigation Design
// ============================================

interface TabButtonProps {
  tab: { id: LifeCategory; label: string };
  isActive: boolean;
  onClick: () => void;
  count: number;
  colors: { primary: string; glow: string; bg: string };
  compact?: boolean;
}

// Desktop: Expansive horizontal tabs with orbital glow
function TabButton({ tab, isActive, onClick, count, colors, compact }: TabButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="flex-1 relative py-3 px-2 rounded-2xl transition-all overflow-hidden"
      style={{
        background: isActive
          ? `linear-gradient(180deg, ${colors.bg} 0%, ${colors.primary}08 100%)`
          : "rgba(255, 255, 255, 0.02)",
        border: isActive
          ? `1px solid ${colors.primary}40`
          : "1px solid rgba(255, 255, 255, 0.04)",
        boxShadow: isActive
          ? `0 4px 24px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`
          : "none",
      }}
    >
      {/* Orbital ring animation when active */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Inner glow pulse */}
          <motion.div
            className="absolute inset-0 rounded-2xl"
            animate={{
              boxShadow: [
                `inset 0 0 20px ${colors.primary}20`,
                `inset 0 0 40px ${colors.primary}30`,
                `inset 0 0 20px ${colors.primary}20`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Top highlight line */}
          <div
            className="absolute top-0 left-4 right-4 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${colors.primary}60, transparent)`,
            }}
          />
        </motion.div>
      )}

      {/* Content - vertical stack for breathing room */}
      <div className="relative z-10 flex flex-col items-center gap-1">
        {/* Icon with glow */}
        <motion.div
          animate={isActive ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <CategoryIcon
            category={tab.id}
            color={isActive ? colors.primary : "rgba(255, 255, 255, 0.5)"}
            size={20}
            isActive={isActive}
          />
        </motion.div>

        {/* Label */}
        <span
          className={`font-semibold tracking-wide ${compact ? "text-[10px]" : "text-xs"}`}
          style={{
            color: isActive ? colors.primary : "rgba(255, 255, 255, 0.5)",
            textShadow: isActive ? `0 0 16px ${colors.glow}` : "none",
          }}
        >
          {tab.label}
        </span>
      </div>
    </motion.button>
  );
}

// Mobile: Horizontal segmented tabs - clean and simple
function MobileTabBar({
  tabs,
  activeTab,
  onTabChange,
  powerPlaces,
}: {
  tabs: typeof CATEGORY_TABS;
  activeTab: LifeCategory;
  onTabChange: (tab: LifeCategory) => void;
  powerPlaces: Record<LifeCategory, CategoryResult>;
}) {
  return (
    <div className="px-4 pb-4">
      {/* Tab row - horizontal flex with equal widths */}
      <div
        className="flex gap-2 p-1.5 rounded-2xl"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const colors = CATEGORY_COLORS[tab.id];
          const count = powerPlaces[tab.id].places.length;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              whileTap={{ scale: 0.95 }}
              className="flex-1 relative py-2.5 px-1 rounded-xl transition-all"
              style={{
                background: isActive
                  ? `linear-gradient(180deg, ${colors.bg} 0%, transparent 100%)`
                  : "transparent",
                border: isActive ? `1px solid ${colors.primary}30` : "1px solid transparent",
                boxShadow: isActive ? `0 2px 12px ${colors.glow}` : "none",
              }}
            >
              {/* Content - horizontal with icon and label */}
              <div className="flex items-center justify-center gap-1.5">
                <CategoryIcon
                  category={tab.id}
                  color={isActive ? colors.primary : "rgba(255, 255, 255, 0.5)"}
                  size={16}
                  isActive={isActive}
                />
                <span
                  className="text-[11px] font-semibold"
                  style={{
                    color: isActive ? colors.primary : "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  {tab.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Desktop: Elegant full-width tab bar
function DesktopTabBar({
  tabs,
  activeTab,
  onTabChange,
  powerPlaces,
}: {
  tabs: typeof CATEGORY_TABS;
  activeTab: LifeCategory;
  onTabChange: (tab: LifeCategory) => void;
  powerPlaces: Record<LifeCategory, CategoryResult>;
}) {
  return (
    <div className="px-3 py-3">
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            count={powerPlaces[tab.id].places.length}
            colors={CATEGORY_COLORS[tab.id]}
            compact
          />
        ))}
      </div>
    </div>
  );
}

// Category Content Component
interface CategoryContentProps {
  category: CategoryResult;
  onFlyToCity: (lat: number, lng: number, cityName: string) => void;
  colors: { primary: string; glow: string; bg: string };
  compact?: boolean;
}

const INITIAL_DISPLAY_COUNT = 10;
const MAX_DISPLAY_COUNT = 20;

function CategoryContent({ category, onFlyToCity, colors, compact }: CategoryContentProps) {
  const [showAll, setShowAll] = useState(false);
  // Track previous category to reset showAll (derived state pattern)
  const [prevCategory, setPrevCategory] = useState(category.category);

  // Reset showAll when category changes
  if (category.category !== prevCategory) {
    setPrevCategory(category.category);
    setShowAll(false);
  }

  if (category.places.length === 0) {
    return (
      <div className="py-8 text-center">
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: "rgba(255, 255, 255, 0.03)" }}
        >
          <MapPin size={24} className="text-white/20" />
        </div>
        <p className="text-white/40 text-sm">
          No cities found near your {category.label.toLowerCase()} lines.
        </p>
        <p className="text-white/25 text-xs mt-2">
          Try zooming out on the map to explore more.
        </p>
      </div>
    );
  }

  // Limit displayed places
  const displayCount = showAll ? MAX_DISPLAY_COUNT : INITIAL_DISPLAY_COUNT;
  const visiblePlaces = category.places.slice(0, displayCount);
  const hasMore = category.places.length > INITIAL_DISPLAY_COUNT && !showAll;
  const remainingCount = Math.min(
    category.places.length - INITIAL_DISPLAY_COUNT,
    MAX_DISPLAY_COUNT - INITIAL_DISPLAY_COUNT
  );

  return (
    <div className="space-y-2">
      <p className="text-white/40 text-xs mb-3 px-1">{category.description}</p>

      {visiblePlaces.map((place, index) => (
        <PlaceCard
          key={`${place.city.name}-${place.planet}-${place.lineType}`}
          place={place}
          index={index}
          onFlyTo={() => onFlyToCity(place.city.lat, place.city.lng, place.city.name)}
          colors={colors}
          compact={compact}
        />
      ))}

      {/* Show More Button */}
      {hasMore && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => setShowAll(true)}
          className="w-full py-3 mt-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${colors.bg} 0%, transparent 100%)`,
            border: `1px solid ${colors.primary}30`,
            color: colors.primary,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ChevronUp size={16} className="rotate-180" />
          <span>Show {remainingCount} more cities</span>
        </motion.button>
      )}
    </div>
  );
}

// Place Card Component
interface PlaceCardProps {
  place: PowerPlace;
  index: number;
  onFlyTo: () => void;
  colors: { primary: string; glow: string; bg: string };
  compact?: boolean;
}

function PlaceCard({ place, index, onFlyTo, colors, compact }: PlaceCardProps) {
  const planetConfig = PLANETS[place.planet];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 300 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`
        relative flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group
        ${compact ? "gap-2" : "gap-3"}
      `}
      style={{
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
      onClick={onFlyTo}
    >
      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${colors.glow} 0%, transparent 70%)`,
          opacity: 0.15,
        }}
      />

      <div className="flex items-center gap-3 min-w-0 relative z-10 flex-1">
        {/* Flag with glow ring */}
        <motion.div
          className="relative flex-shrink-0"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <span className="text-2xl">{place.flag}</span>
          <div
            className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
            }}
          />
        </motion.div>

        {/* City Info */}
        <div className="min-w-0 flex-1">
          {/* Row 1: City name and star rating */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-white font-semibold text-sm truncate group-hover:text-white">
              {place.city.name}
            </span>
            {/* Star Rating */}
            <div className="flex-shrink-0">
              <StarRating
                stars={place.stars}
                color={colors.primary}
                size={compact ? 12 : 14}
              />
            </div>
          </div>

          {/* Row 2: Planet badge and distance */}
          <div className="flex items-center gap-2 mt-1">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{
                background: `${planetConfig.color}20`,
                color: planetConfig.color,
                border: `1px solid ${planetConfig.color}30`,
              }}
            >
              {planetConfig.symbol} {place.lineType}
            </span>
            <span className="text-white/30 text-[10px]">
              {place.distance} km
            </span>
            {/* Multi-line bonus indicator */}
            {place.multiLineBonus && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                style={{
                  background: `${colors.primary}15`,
                  color: colors.primary,
                  border: `1px solid ${colors.primary}20`,
                }}
              >
                +bonus
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Fly To Button */}
      <motion.button
        whileHover={{ scale: 1.15, rotate: -15 }}
        whileTap={{ scale: 0.9 }}
        className="flex-shrink-0 p-2.5 rounded-xl transition-all relative z-10"
        style={{
          background: `linear-gradient(135deg, ${colors.bg} 0%, transparent 100%)`,
          border: `1px solid ${colors.primary}30`,
          color: colors.primary,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onFlyTo();
        }}
        title={`Fly to ${place.city.name}`}
      >
        <Plane size={16} />
      </motion.button>
    </motion.div>
  );
}

// ============================================
// Exported Components for MobileSheet Integration
// ============================================

// Hook to manage power places state (shared between tabs and content)
export function usePowerPlacesState(lines: PlanetaryLine[]) {
  const [activeTab, setActiveTab] = useState<LifeCategory>("love");

  const powerPlaces = useMemo(() => {
    return calculateAllPowerPlaces(lines);
  }, [lines]);

  const activeCategory = powerPlaces[activeTab];
  const activeColors = CATEGORY_COLORS[activeTab];

  return {
    activeTab,
    setActiveTab,
    powerPlaces,
    activeCategory,
    activeColors,
  };
}

// Tabs component - rendered in MobileSheet's stickyHeader slot
interface PowerPlacesTabsProps {
  activeTab: LifeCategory;
  setActiveTab: (tab: LifeCategory) => void;
  powerPlaces: Record<LifeCategory, CategoryResult>;
  activeColors: { primary: string; glow: string; bg: string };
}

export function PowerPlacesTabs({
  activeTab,
  setActiveTab,
  powerPlaces,
  activeColors,
}: PowerPlacesTabsProps) {
  return (
    <div className="px-4 pb-3 pt-2">
      <MobileTabBar
        tabs={CATEGORY_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        powerPlaces={powerPlaces}
      />
      {/* Divider */}
      <div
        className="h-px mx-2 mt-3"
        style={{
          background: `linear-gradient(90deg, transparent, ${activeColors.primary}40, transparent)`,
        }}
      />
    </div>
  );
}

// Scrollable content component - rendered in MobileSheet's children slot
interface PowerPlacesScrollContentProps {
  activeCategory: CategoryResult;
  activeColors: { primary: string; glow: string; bg: string };
  onFlyToCity: (lat: number, lng: number, cityName: string) => void;
}

export function PowerPlacesScrollContent({
  activeCategory,
  activeColors,
  onFlyToCity,
}: PowerPlacesScrollContentProps) {
  return (
    <div className="px-5 pt-2 pb-4">
      <CategoryContent
        category={activeCategory}
        onFlyToCity={onFlyToCity}
        colors={activeColors}
      />
    </div>
  );
}

// Legacy export for backwards compatibility (if used elsewhere)
interface PowerPlacesContentProps {
  lines: PlanetaryLine[];
  onFlyToCity: (lat: number, lng: number, cityName: string) => void;
}

export function PowerPlacesContent({ lines, onFlyToCity }: PowerPlacesContentProps) {
  const { activeTab, setActiveTab, powerPlaces, activeCategory, activeColors } =
    usePowerPlacesState(lines);

  return (
    <div>
      {/* Tabs */}
      <div className="mb-3">
        <MobileTabBar
          tabs={CATEGORY_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          powerPlaces={powerPlaces}
        />
        <div
          className="h-px mx-2 mt-2"
          style={{
            background: `linear-gradient(90deg, transparent, ${activeColors.primary}40, transparent)`,
          }}
        />
      </div>

      {/* Content */}
      <div className="px-5">
        <CategoryContent
          category={activeCategory}
          onFlyToCity={onFlyToCity}
          colors={activeColors}
        />
      </div>
    </div>
  );
}
