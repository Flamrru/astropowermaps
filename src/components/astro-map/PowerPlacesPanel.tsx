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

const CATEGORY_TABS: { id: LifeCategory; label: string; icon: string }[] = [
  { id: "love", label: "Love", icon: "💕" },
  { id: "career", label: "Career", icon: "💼" },
  { id: "growth", label: "Growth", icon: "🌟" },
  { id: "home", label: "Home", icon: "🏠" },
];

export default function PowerPlacesPanel({
  lines,
  onFlyToCity,
  defaultExpanded = false,
}: PowerPlacesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<LifeCategory>("love");
  const [isMobile, setIsMobile] = useState(false);

  // Update expanded state when defaultExpanded changes
  useEffect(() => {
    if (defaultExpanded) {
      setIsExpanded(true);
    }
  }, [defaultExpanded]);

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
        {/* Toggle Button - Premium floating button */}
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-4 right-4 z-30 flex items-center gap-2 px-5 py-3.5 rounded-2xl"
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
                className="absolute inset-x-0 bottom-0 rounded-t-[2rem] max-h-[80vh] overflow-hidden"
                style={{
                  background: "linear-gradient(180deg, rgba(15, 15, 35, 0.98) 0%, rgba(5, 5, 16, 0.99) 100%)",
                  boxShadow: "0 -8px 50px rgba(0,0,0,0.6), 0 0 100px rgba(201, 162, 39, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
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

                {/* Tabs with glow effect */}
                <div className="flex gap-2 px-6 pb-4 overflow-x-auto scrollbar-hide">
                  {CATEGORY_TABS.map((tab) => (
                    <TabButton
                      key={tab.id}
                      tab={tab}
                      isActive={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      count={powerPlaces[tab.id].places.length}
                      colors={CATEGORY_COLORS[tab.id]}
                    />
                  ))}
                </div>

                {/* Divider */}
                <div
                  className="h-px mx-6 mb-4"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${activeColors.primary}40, transparent)`,
                  }}
                />

                {/* Content */}
                <div className="px-6 pb-10 overflow-y-auto max-h-[55vh]">
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

              {/* Tabs */}
              <div className="flex gap-1.5 px-3 py-3">
                {CATEGORY_TABS.map((tab) => (
                  <TabButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    count={powerPlaces[tab.id].places.length}
                    colors={CATEGORY_COLORS[tab.id]}
                    compact
                  />
                ))}
              </div>

              {/* Content */}
              <div className="px-3 pb-4 max-h-72 overflow-y-auto custom-scrollbar">
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

// Tab Button Component
interface TabButtonProps {
  tab: { id: LifeCategory; label: string; icon: string };
  isActive: boolean;
  onClick: () => void;
  count: number;
  colors: { primary: string; glow: string; bg: string };
  compact?: boolean;
}

function TabButton({ tab, isActive, onClick, count, colors, compact }: TabButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center gap-1.5 px-3 py-2 rounded-xl whitespace-nowrap transition-all relative overflow-hidden
        ${compact ? "text-xs" : "text-sm"}
      `}
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
      {/* Glow effect when active */}
      {isActive && (
        <motion.div
          layoutId="activeTabGlow"
          className="absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(circle at center, ${colors.glow} 0%, transparent 70%)`,
            opacity: 0.3,
          }}
        />
      )}
      <span className="relative z-10">{tab.icon}</span>
      <span className="font-semibold relative z-10">{tab.label}</span>
      {count > 0 && (
        <span
          className="px-1.5 py-0.5 rounded-md text-[10px] font-bold relative z-10"
          style={{
            background: isActive ? `${colors.primary}30` : "rgba(255, 255, 255, 0.08)",
            color: isActive ? colors.primary : "rgba(255, 255, 255, 0.4)",
          }}
        >
          {count}
        </span>
      )}
    </motion.button>
  );
}

// Category Content Component
interface CategoryContentProps {
  category: CategoryResult;
  onFlyToCity: (lat: number, lng: number, cityName: string) => void;
  colors: { primary: string; glow: string; bg: string };
  compact?: boolean;
}

function CategoryContent({ category, onFlyToCity, colors, compact }: CategoryContentProps) {
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

  return (
    <div className="space-y-2">
      <p className="text-white/40 text-xs mb-3 px-1">{category.description}</p>

      {category.places.map((place, index) => (
        <PlaceCard
          key={`${place.city.name}-${place.planet}-${place.lineType}`}
          place={place}
          index={index}
          onFlyTo={() => onFlyToCity(place.city.lat, place.city.lng, place.city.name)}
          colors={colors}
          compact={compact}
        />
      ))}
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
      transition={{ delay: index * 0.08, type: "spring", stiffness: 300 }}
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

      <div className="flex items-center gap-3 min-w-0 relative z-10">
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
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm truncate group-hover:text-white">
              {place.city.name}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-md font-medium"
              style={{
                background: `${planetConfig.color}20`,
                color: planetConfig.color,
                border: `1px solid ${planetConfig.color}30`,
              }}
            >
              {planetConfig.symbol} {place.lineType}
            </span>
          </div>
          <p className="text-white/40 text-xs truncate mt-0.5 group-hover:text-white/50 transition-colors">
            {place.interpretation}
          </p>
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

// Export content component for use in mobile bottom sheet
interface PowerPlacesContentProps {
  lines: PlanetaryLine[];
  onFlyToCity: (lat: number, lng: number, cityName: string) => void;
}

export function PowerPlacesContent({ lines, onFlyToCity }: PowerPlacesContentProps) {
  const [activeTab, setActiveTab] = useState<LifeCategory>("love");

  const powerPlaces = useMemo(() => {
    return calculateAllPowerPlaces(lines);
  }, [lines]);

  const activeCategory = powerPlaces[activeTab];
  const activeColors = CATEGORY_COLORS[activeTab];

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 px-6 pb-4 overflow-x-auto scrollbar-hide">
        {CATEGORY_TABS.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            count={powerPlaces[tab.id].places.length}
            colors={CATEGORY_COLORS[tab.id]}
          />
        ))}
      </div>

      {/* Divider */}
      <div
        className="h-px mx-6 mb-4"
        style={{
          background: `linear-gradient(90deg, transparent, ${activeColors.primary}40, transparent)`,
        }}
      />

      {/* Content */}
      <div className="px-6">
        <CategoryContent
          category={activeCategory}
          onFlyToCity={onFlyToCity}
          colors={activeColors}
        />
      </div>
    </div>
  );
}
