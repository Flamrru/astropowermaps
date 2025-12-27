"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, MapPin, Plane, X } from "lucide-react";
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
}

const CATEGORY_TABS: { id: LifeCategory; label: string; icon: string }[] = [
  { id: "love", label: "Love", icon: "💕" },
  { id: "career", label: "Career", icon: "💼" },
  { id: "growth", label: "Growth", icon: "🌟" },
  { id: "home", label: "Home", icon: "🏠" },
];

export default function PowerPlacesPanel({
  lines,
  onFlyToCity,
}: PowerPlacesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<LifeCategory>("love");
  const [isMobile, setIsMobile] = useState(false);

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

  // Mobile: Bottom drawer
  if (isMobile) {
    return (
      <>
        {/* Toggle Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-4 right-4 z-30 flex items-center gap-2 px-4 py-3 rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(201, 162, 39, 0.9) 0%, rgba(139, 105, 20, 0.9) 100%)",
            boxShadow: "0 4px 20px rgba(201, 162, 39, 0.4)",
          }}
        >
          <MapPin size={18} className="text-white" />
          <span className="text-white font-medium text-sm">Power Places</span>
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
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50"
                onClick={() => setIsExpanded(false)}
              />

              {/* Sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute inset-x-0 bottom-0 bg-[#0a0a1e] rounded-t-3xl max-h-[75vh] overflow-hidden"
                style={{
                  boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
                }}
              >
                {/* Handle */}
                <div className="flex justify-center py-3">
                  <div className="w-12 h-1 bg-white/20 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-3">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <MapPin size={20} className="text-[#C9A227]" />
                    Your Power Places
                  </h3>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2 rounded-full hover:bg-white/10"
                  >
                    <X size={18} className="text-white/50" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 px-5 pb-3 overflow-x-auto scrollbar-hide">
                  {CATEGORY_TABS.map((tab) => (
                    <TabButton
                      key={tab.id}
                      tab={tab}
                      isActive={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      count={powerPlaces[tab.id].places.length}
                    />
                  ))}
                </div>

                {/* Content */}
                <div className="px-5 pb-8 overflow-y-auto max-h-[50vh]">
                  <CategoryContent
                    category={activeCategory}
                    onFlyToCity={onFlyToCity}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop: Side panel
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 }}
      className="absolute bottom-4 right-4 z-20"
    >
      <div
        className="w-72 rounded-2xl overflow-hidden"
        style={{
          background: "rgba(10, 10, 30, 0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-[#C9A227]" />
            <span className="text-white font-medium">Power Places</span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronUp size={18} className="text-white/50" />
          </motion.div>
        </button>

        {/* Expandable Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {/* Tabs */}
              <div className="flex gap-1 px-3 pb-2">
                {CATEGORY_TABS.map((tab) => (
                  <TabButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    count={powerPlaces[tab.id].places.length}
                    compact
                  />
                ))}
              </div>

              {/* Content */}
              <div className="px-3 pb-3 max-h-64 overflow-y-auto">
                <CategoryContent
                  category={activeCategory}
                  onFlyToCity={onFlyToCity}
                  compact
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Tab Button Component
interface TabButtonProps {
  tab: { id: LifeCategory; label: string; icon: string };
  isActive: boolean;
  onClick: () => void;
  count: number;
  compact?: boolean;
}

function TabButton({ tab, isActive, onClick, count, compact }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all
        ${compact ? "text-xs" : "text-sm"}
      `}
      style={{
        background: isActive
          ? "linear-gradient(135deg, rgba(201, 162, 39, 0.25) 0%, rgba(232, 197, 71, 0.15) 100%)"
          : "rgba(255, 255, 255, 0.05)",
        border: isActive
          ? "1px solid rgba(201, 162, 39, 0.4)"
          : "1px solid transparent",
        color: isActive ? "#E8C547" : "rgba(255, 255, 255, 0.6)",
      }}
    >
      <span>{tab.icon}</span>
      <span className="font-medium">{tab.label}</span>
      {count > 0 && (
        <span
          className="px-1.5 py-0.5 rounded-full text-xs"
          style={{
            background: isActive ? "rgba(232, 197, 71, 0.2)" : "rgba(255, 255, 255, 0.1)",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// Category Content Component
interface CategoryContentProps {
  category: CategoryResult;
  onFlyToCity: (lat: number, lng: number, cityName: string) => void;
  compact?: boolean;
}

function CategoryContent({ category, onFlyToCity, compact }: CategoryContentProps) {
  if (category.places.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-white/40 text-sm">
          No cities found near your {category.label.toLowerCase()} lines.
        </p>
        <p className="text-white/30 text-xs mt-1">
          Try zooming out on the map to explore.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-white/50 text-xs mb-3">{category.description}</p>

      {category.places.map((place, index) => (
        <PlaceCard
          key={`${place.city.name}-${place.planet}-${place.lineType}`}
          place={place}
          index={index}
          onFlyTo={() => onFlyToCity(place.city.lat, place.city.lng, place.city.name)}
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
  compact?: boolean;
}

function PlaceCard({ place, index, onFlyTo, compact }: PlaceCardProps) {
  const planetConfig = PLANETS[place.planet];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        flex items-center justify-between p-2.5 rounded-xl transition-colors hover:bg-white/5
        ${compact ? "gap-2" : "gap-3"}
      `}
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Flag */}
        <span className="text-lg flex-shrink-0">{place.flag}</span>

        {/* City Info */}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-white font-medium text-sm truncate">
              {place.city.name}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                background: `${planetConfig.color}20`,
                color: planetConfig.color,
              }}
            >
              {planetConfig.symbol}
            </span>
          </div>
          <p className="text-white/40 text-xs truncate">
            {place.interpretation}
          </p>
        </div>
      </div>

      {/* Fly To Button */}
      <button
        onClick={onFlyTo}
        className="flex-shrink-0 p-2 rounded-lg transition-colors hover:bg-white/10"
        style={{
          color: "#C9A227",
        }}
        title={`Fly to ${place.city.name}`}
      >
        <Plane size={16} />
      </button>
    </motion.div>
  );
}
