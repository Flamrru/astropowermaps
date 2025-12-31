"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MapPin, Calendar, ExternalLink } from "lucide-react";

// ============================================
// Types
// ============================================

interface InsightCardProps {
  // Required
  title: string;
  value: string;
  icon: ReactNode;
  accentColor: string;

  // Optional content
  subtitle?: string;
  badge?: string;
  why?: string;
  details?: ReactNode;

  // City-specific
  cityData?: {
    name: string;
    flag: string;
    lat: number;
    lng: number;
  };
  onFlyToCity?: (lat: number, lng: number, cityName: string) => void;

  // Layout
  size?: "normal" | "compact" | "featured";
  delay?: number;
  equalHeight?: boolean;

  // Controlled mode (for Trio - expansion handled externally)
  controlledExpanded?: boolean;
  onToggleExpand?: () => void;
  hideExpandedContent?: boolean; // When true, don't render expanded content inline
}

// ============================================
// Component
// ============================================

export default function InsightCard({
  title,
  value,
  icon,
  accentColor,
  subtitle,
  badge,
  why,
  details,
  cityData,
  onFlyToCity,
  size = "normal",
  delay = 0,
  equalHeight = false,
  controlledExpanded,
  onToggleExpand,
  hideExpandedContent = false,
}: InsightCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);

  // Use controlled mode if props are provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const hasExpandableContent = !!(why || details || cityData);

  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const handleFlyToCity = () => {
    if (cityData && onFlyToCity) {
      onFlyToCity(cityData.lat, cityData.lng, cityData.name);
    }
  };

  // Size variants
  const isFeatured = size === "featured";
  const isCompact = size === "compact";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 30 }}
      className={`relative ${equalHeight ? "h-full" : ""}`}
    >
      {/* Main card */}
      <motion.button
        onClick={() => hasExpandableContent && handleToggle()}
        className={`
          w-full text-left rounded-2xl overflow-hidden transition-all
          ${hasExpandableContent ? "cursor-pointer" : "cursor-default"}
          ${isFeatured ? "p-5" : isCompact ? "p-3" : "p-4"}
          ${equalHeight ? "h-full flex flex-col" : ""}
        `}
        style={{
          background: isFeatured
            ? `linear-gradient(135deg, ${accentColor}12 0%, ${accentColor}04 100%)`
            : "rgba(255, 255, 255, 0.03)",
          border: `1px solid ${isFeatured ? `${accentColor}30` : "rgba(255, 255, 255, 0.06)"}`,
          boxShadow: isFeatured ? `0 0 30px ${accentColor}10` : "none",
        }}
        whileHover={{ scale: hasExpandableContent ? 1.01 : 1 }}
        whileTap={{ scale: hasExpandableContent ? 0.99 : 1 }}
      >
        {/* Badge */}
        {badge && (
          <div
            className="absolute top-0 right-0 px-2.5 py-1 rounded-bl-xl rounded-tr-2xl text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}90)`,
              color: "#000",
            }}
          >
            {badge}
          </div>
        )}

        {/* Content row */}
        <div className="flex items-center gap-3">
          {/* Icon container */}
          <div
            className={`
              flex-shrink-0 rounded-xl flex items-center justify-center
              ${isFeatured ? "w-12 h-12" : isCompact ? "w-9 h-9" : "w-10 h-10"}
            `}
            style={{
              background: `linear-gradient(135deg, ${accentColor}25 0%, ${accentColor}10 100%)`,
              boxShadow: `0 0 20px ${accentColor}20`,
            }}
          >
            <span style={{ color: accentColor }}>{icon}</span>
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <p
              className={`font-medium ${isFeatured ? "text-xs" : "text-[11px]"} uppercase tracking-wider`}
              style={{ color: "rgba(255, 255, 255, 0.45)" }}
            >
              {title}
            </p>
            <p
              className={`font-semibold ${isFeatured ? "text-lg" : isCompact ? "text-sm" : "text-base"}`}
              style={{ color: "rgba(255, 255, 255, 0.95)" }}
            >
              {value}
              {cityData && (
                <span className="ml-1.5 text-sm">{cityData.flag}</span>
              )}
            </p>
            {subtitle && (
              <p
                className="text-xs mt-0.5 truncate"
                style={{ color: "rgba(255, 255, 255, 0.4)" }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Expand indicator */}
          {hasExpandableContent && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <ChevronDown
                size={18}
                style={{ color: "rgba(255, 255, 255, 0.3)" }}
              />
            </motion.div>
          )}
        </div>
      </motion.button>

      {/* Expanded content - Celestial Unfold Animation */}
      {/* When hideExpandedContent is true (Trio mode), content is rendered externally */}
      {!hideExpandedContent && (
      <AnimatePresence mode="wait">
        {isExpanded && hasExpandableContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: {
                  type: "spring",
                  stiffness: 500,
                  damping: 40,
                  mass: 1,
                },
                opacity: {
                  duration: 0.25,
                  ease: "easeOut",
                },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  type: "spring",
                  stiffness: 500,
                  damping: 50,
                  mass: 0.8,
                },
                opacity: {
                  duration: 0.2,
                  ease: "easeIn",
                },
              },
            }}
            className="overflow-hidden"
          >
            {/* Expanding glow effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute inset-x-0 -bottom-2 h-16 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 80% 100% at 50% 0%, ${accentColor}15 0%, transparent 70%)`,
                filter: "blur(8px)",
              }}
            />

            <motion.div
              className="px-4 pb-4 pt-3 rounded-b-2xl -mt-1 relative"
              style={{
                background: `linear-gradient(180deg, ${accentColor}08 0%, rgba(255, 255, 255, 0.02) 100%)`,
                borderLeft: `1px solid ${accentColor}25`,
                borderRight: `1px solid ${accentColor}25`,
                borderBottom: `1px solid ${accentColor}25`,
              }}
            >
              {/* Subtle inner glow */}
              <div
                className="absolute inset-0 rounded-b-2xl pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 100% 60% at 50% 0%, ${accentColor}10 0%, transparent 60%)`,
                }}
              />

              {/* Why explanation - staggered reveal */}
              {why && (
                <motion.div
                  className="mb-3 relative"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    delay: 0.08,
                  }}
                >
                  {/* Header with glow effect */}
                  <motion.p
                    className="text-[11px] uppercase tracking-wider mb-2 font-semibold flex items-center gap-2"
                    style={{ color: accentColor }}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 35,
                      delay: 0.12,
                    }}
                  >
                    <motion.span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: accentColor }}
                      animate={{
                        boxShadow: [
                          `0 0 4px ${accentColor}60`,
                          `0 0 8px ${accentColor}80`,
                          `0 0 4px ${accentColor}60`,
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    Why this matters
                  </motion.p>

                  {/* Content text with fade-in */}
                  <motion.p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "rgba(255, 255, 255, 0.75)" }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 35,
                      delay: 0.18,
                    }}
                  >
                    {why}
                  </motion.p>
                </motion.div>
              )}

              {/* Additional details */}
              {details && (
                <motion.div
                  className="mb-3"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    delay: 0.22,
                  }}
                >
                  {details}
                </motion.div>
              )}

              {/* City fly-to action - slides up elegantly */}
              {cityData && onFlyToCity && (
                <motion.button
                  onClick={handleFlyToCity}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mt-2 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 100%)`,
                    border: `1px solid ${accentColor}30`,
                  }}
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 28,
                    delay: 0.26,
                  }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: `0 0 20px ${accentColor}25`,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Hover shimmer effect */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ x: "-100%", opacity: 0 }}
                    whileHover={{
                      x: "100%",
                      opacity: 1,
                      transition: { duration: 0.6, ease: "easeInOut" },
                    }}
                    style={{
                      background: `linear-gradient(90deg, transparent, ${accentColor}20, transparent)`,
                    }}
                  />
                  <MapPin size={16} style={{ color: accentColor }} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: accentColor }}
                  >
                    View on Map
                  </span>
                  <ExternalLink size={14} style={{ color: accentColor, opacity: 0.6 }} />
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      )}
    </motion.div>
  );
}

// ============================================
// Duo Card (Two cards side by side)
// Expansion handled at Duo level - content renders below grid
// ============================================

interface DuoCardProps {
  left: InsightCardProps;
  right: InsightCardProps;
  delay?: number;
}

export function InsightCardDuo({ left, right, delay = 0 }: DuoCardProps) {
  const [expandedSide, setExpandedSide] = useState<"left" | "right" | null>(null);
  const cards = { left, right };

  const handleToggle = (side: "left" | "right") => {
    setExpandedSide(expandedSide === side ? null : side);
  };

  const expandedCard = expandedSide ? cards[expandedSide] : null;
  const hasExpandableContent = expandedCard && (expandedCard.why || expandedCard.cityData);

  return (
    <div className="space-y-0">
      {/* Card grid - always 2 columns */}
      <div className="grid grid-cols-2 gap-3 items-stretch">
        <InsightCard
          {...left}
          size="featured"
          delay={delay}
          equalHeight
          controlledExpanded={expandedSide === "left"}
          onToggleExpand={() => handleToggle("left")}
          hideExpandedContent
        />
        <InsightCard
          {...right}
          size="featured"
          delay={delay + 0.05}
          equalHeight
          controlledExpanded={expandedSide === "right"}
          onToggleExpand={() => handleToggle("right")}
          hideExpandedContent
        />
      </div>

      {/* Expanded content - full width below grid */}
      <AnimatePresence mode="wait">
        {expandedCard && hasExpandableContent && (
          <motion.div
            key={expandedSide}
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { type: "spring", stiffness: 400, damping: 35, mass: 0.8 },
                opacity: { duration: 0.25, ease: "easeOut" },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { type: "spring", stiffness: 500, damping: 45, mass: 0.6 },
                opacity: { duration: 0.15, ease: "easeIn" },
              },
            }}
            className="overflow-hidden"
          >
            <motion.div
              className="mt-3 px-4 py-4 rounded-xl relative"
              style={{
                background: `linear-gradient(135deg, ${expandedCard.accentColor}10 0%, rgba(255, 255, 255, 0.02) 100%)`,
                border: `1px solid ${expandedCard.accentColor}25`,
              }}
            >
              {/* Subtle inner glow */}
              <div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 100% 60% at 50% 0%, ${expandedCard.accentColor}10 0%, transparent 60%)`,
                }}
              />

              {/* Why explanation */}
              {expandedCard.why && (
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.08 }}
                >
                  <motion.p
                    className="text-[11px] uppercase tracking-wider mb-2 font-semibold flex items-center gap-2"
                    style={{ color: expandedCard.accentColor }}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 35, delay: 0.1 }}
                  >
                    <motion.span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: expandedCard.accentColor }}
                      animate={{
                        boxShadow: [
                          `0 0 4px ${expandedCard.accentColor}60`,
                          `0 0 8px ${expandedCard.accentColor}80`,
                          `0 0 4px ${expandedCard.accentColor}60`,
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    Why this matters
                  </motion.p>
                  <motion.p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "rgba(255, 255, 255, 0.75)" }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 35, delay: 0.15 }}
                  >
                    {expandedCard.why}
                  </motion.p>
                </motion.div>
              )}

              {/* City fly-to action */}
              {expandedCard.cityData && expandedCard.onFlyToCity && (
                <motion.button
                  onClick={() => {
                    if (expandedCard.cityData && expandedCard.onFlyToCity) {
                      expandedCard.onFlyToCity(
                        expandedCard.cityData.lat,
                        expandedCard.cityData.lng,
                        expandedCard.cityData.name
                      );
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mt-3 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${expandedCard.accentColor}18 0%, ${expandedCard.accentColor}08 100%)`,
                    border: `1px solid ${expandedCard.accentColor}30`,
                  }}
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28, delay: 0.2 }}
                  whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${expandedCard.accentColor}25` }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MapPin size={16} style={{ color: expandedCard.accentColor }} />
                  <span className="text-sm font-medium" style={{ color: expandedCard.accentColor }}>
                    View on Map
                  </span>
                  <ExternalLink size={14} style={{ color: expandedCard.accentColor, opacity: 0.6 }} />
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Trio Card (Three compact cards)
// Expansion handled at Trio level - content renders below grid
// ============================================

interface TrioCardProps {
  cards: [InsightCardProps, InsightCardProps, InsightCardProps];
  delay?: number;
}

export function InsightCardTrio({ cards, delay = 0 }: TrioCardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const expandedCard = expandedIndex !== null ? cards[expandedIndex] : null;

  return (
    <div className="space-y-0">
      {/* Card grid - always 3 columns */}
      <div className="grid grid-cols-3 gap-2">
        {cards.map((card, i) => (
          <InsightCard
            key={i}
            {...card}
            size="compact"
            delay={delay + i * 0.05}
            controlledExpanded={expandedIndex === i}
            onToggleExpand={() => handleToggle(i)}
            hideExpandedContent // Content rendered below instead
          />
        ))}
      </div>

      {/* Expanded content - full width below grid */}
      <AnimatePresence mode="wait">
        {expandedCard && expandedCard.why && (
          <motion.div
            key={expandedIndex}
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: { type: "spring", stiffness: 400, damping: 35, mass: 0.8 },
                opacity: { duration: 0.25, ease: "easeOut" },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: { type: "spring", stiffness: 500, damping: 45, mass: 0.6 },
                opacity: { duration: 0.15, ease: "easeIn" },
              },
            }}
            className="overflow-hidden"
          >
            <motion.div
              className="mt-2 px-4 py-3 rounded-xl relative"
              style={{
                background: `linear-gradient(135deg, ${expandedCard.accentColor}08 0%, rgba(255, 255, 255, 0.02) 100%)`,
                border: `1px solid ${expandedCard.accentColor}20`,
              }}
            >
              {/* Subtle inner glow */}
              <div
                className="absolute inset-0 rounded-xl pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 100% 60% at 50% 0%, ${expandedCard.accentColor}08 0%, transparent 60%)`,
                }}
              />

              {/* Header */}
              <motion.p
                className="text-[11px] uppercase tracking-wider mb-2 font-semibold flex items-center gap-2 relative"
                style={{ color: expandedCard.accentColor }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 35, delay: 0.1 }}
              >
                <motion.span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: expandedCard.accentColor }}
                  animate={{
                    boxShadow: [
                      `0 0 4px ${expandedCard.accentColor}60`,
                      `0 0 8px ${expandedCard.accentColor}80`,
                      `0 0 4px ${expandedCard.accentColor}60`,
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                Why this matters
              </motion.p>

              {/* Content */}
              <motion.p
                className="text-[13px] leading-relaxed relative"
                style={{ color: "rgba(255, 255, 255, 0.75)" }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 35, delay: 0.15 }}
              >
                {expandedCard.why}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
