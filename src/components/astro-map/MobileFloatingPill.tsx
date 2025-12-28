"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Layers, Eye, EyeOff, Sparkles } from "lucide-react";
import { PlanetaryLine, PlanetId } from "@/lib/astro/types";
import { YearForecast } from "@/lib/astro/transit-types";
import { calculateAllPowerPlaces } from "@/lib/astro/power-places";
import { PowerPlacesContent } from "./PowerPlacesPanel";
import { PowerMonthsContent } from "./PowerMonthsPanel";
import MobileSheet from "./MobileSheet";

type ActiveSheet = "places" | "forecast" | "lines" | null;

interface MobileFloatingPillProps {
  lines: PlanetaryLine[];
  planets: { id: PlanetId; name: string; symbol: string; color: string }[];
  visiblePlanets: Set<PlanetId>;
  forecastData: YearForecast | null;
  forecastLoading: boolean;
  onTogglePlanet: (planetId: PlanetId) => void;
  onShowAllPlanets: () => void;
  onHideAllPlanets: () => void;
  onFlyToCity: (lat: number, lng: number, cityName: string) => void;
  onReset: () => void;
}

// Color palette
const COLORS = {
  gold: { accent: "#E8C547", glow: "rgba(232, 197, 71, 0.3)" },
  purple: { accent: "#9B7ED9", glow: "rgba(155, 126, 217, 0.3)" },
  pink: { accent: "#E8A4C9", glow: "rgba(232, 164, 201, 0.3)" },
};

export default function MobileFloatingPill({
  lines,
  planets,
  visiblePlanets,
  forecastData,
  forecastLoading,
  onTogglePlanet,
  onShowAllPlanets,
  onHideAllPlanets,
  onFlyToCity,
  onReset,
}: MobileFloatingPillProps) {
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const hasShownOnce = useRef(false);

  // Calculate places count
  const powerPlaces = useMemo(() => calculateAllPowerPlaces(lines), [lines]);
  const placesCount = useMemo(() => {
    return Object.values(powerPlaces).reduce((sum, cat) => sum + cat.places.length, 0);
  }, [powerPlaces]);

  // Handle city fly-to and close sheet
  const handleFlyToCity = useCallback(
    (lat: number, lng: number, cityName: string) => {
      onFlyToCity(lat, lng, cityName);
      setActiveSheet(null);
    },
    [onFlyToCity]
  );

  const closeSheet = useCallback(() => setActiveSheet(null), []);

  return (
    <>
      {/* Floating Pill - Only visible when no sheet is open */}
      <AnimatePresence mode="popLayout">
        {activeSheet === null && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 400,
              delay: hasShownOnce.current ? 0 : 0.4,
            }}
            onAnimationComplete={() => {
              hasShownOnce.current = true;
            }}
            className="fixed bottom-5 left-3 right-3 z-30 md:hidden"
          >
            {/* Main pill container */}
            <div
              className="relative rounded-[22px] overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(18, 18, 40, 0.92) 0%, rgba(10, 10, 26, 0.95) 100%)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                boxShadow: `
                  0 8px 40px rgba(0, 0, 0, 0.4),
                  0 0 0 1px rgba(255, 255, 255, 0.08),
                  0 0 80px rgba(232, 197, 71, 0.08),
                  inset 0 1px 0 rgba(255, 255, 255, 0.05)
                `,
              }}
            >
              {/* Top accent gradient */}
              <div
                className="absolute top-0 left-0 right-0 h-[1px]"
                style={{
                  background: "linear-gradient(90deg, transparent 5%, rgba(232, 197, 71, 0.4) 50%, transparent 95%)",
                }}
              />

              {/* Ambient glow animation */}
              <motion.div
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at 50% 100%, rgba(232, 197, 71, 0.12) 0%, transparent 60%)",
                }}
              />

              {/* Buttons row */}
              <div className="relative flex items-stretch p-2 gap-2">
                {/* Places Button */}
                <PillButton
                  onClick={() => setActiveSheet("places")}
                  icon={<MapPin size={18} />}
                  label={`${placesCount} Places`}
                  sublabel="Discover"
                  color={COLORS.gold}
                  flex={1}
                />

                {/* Forecast Button - only show if data exists */}
                {forecastData && (
                  <PillButton
                    onClick={() => setActiveSheet("forecast")}
                    icon={<Calendar size={18} />}
                    label="2026"
                    sublabel="Forecast"
                    color={COLORS.purple}
                    flex={1}
                  />
                )}

                {/* Lines Button - compact */}
                <PillButton
                  onClick={() => setActiveSheet("lines")}
                  icon={<Layers size={18} />}
                  color={COLORS.pink}
                  compact
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Places Sheet */}
      <MobileSheet
        isOpen={activeSheet === "places"}
        onClose={closeSheet}
        title="Power Places"
        subtitle="Your cosmic destinations"
        icon={<MapPin size={22} />}
        accentColor={COLORS.gold.accent}
        glowColor={COLORS.gold.glow}
      >
        <PowerPlacesContent lines={lines} onFlyToCity={handleFlyToCity} />
      </MobileSheet>

      {/* Forecast Sheet */}
      {forecastData && (
        <MobileSheet
          isOpen={activeSheet === "forecast"}
          onClose={closeSheet}
          title="2026 Forecast"
          subtitle="Your power months"
          icon={<Calendar size={22} />}
          accentColor={COLORS.purple.accent}
          glowColor={COLORS.purple.glow}
        >
          <PowerMonthsContent forecast={forecastData} loading={forecastLoading} />
        </MobileSheet>
      )}

      {/* Lines Sheet */}
      <MobileSheet
        isOpen={activeSheet === "lines"}
        onClose={closeSheet}
        title="Planetary Lines"
        subtitle="Toggle visibility"
        icon={<Layers size={22} />}
        accentColor={COLORS.pink.accent}
        glowColor={COLORS.pink.glow}
      >
        <LinesSheetContent
          planets={planets}
          visiblePlanets={visiblePlanets}
          onTogglePlanet={onTogglePlanet}
          onShowAll={onShowAllPlanets}
          onHideAll={onHideAllPlanets}
          onReset={onReset}
        />
      </MobileSheet>
    </>
  );
}

// Pill Button Component
interface PillButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  sublabel?: string;
  color: { accent: string; glow: string };
  flex?: number;
  compact?: boolean;
}

function PillButton({ onClick, icon, label, sublabel, color, flex, compact }: PillButtonProps) {
  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${color.accent}15 0%, ${color.accent}05 100%)`,
          border: `1px solid ${color.accent}25`,
        }}
      >
        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at center, ${color.glow} 0%, transparent 70%)`,
          }}
        />
        <span style={{ color: color.accent }} className="relative z-10">
          {icon}
        </span>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative flex items-center gap-3 px-4 py-3 rounded-2xl overflow-hidden"
      style={{
        flex,
        background: `linear-gradient(135deg, ${color.accent}12 0%, ${color.accent}04 100%)`,
        border: `1px solid ${color.accent}22`,
      }}
    >
      {/* Subtle inner glow */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${color.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Icon container */}
      <div
        className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${color.accent}20 0%, ${color.accent}08 100%)`,
          boxShadow: `0 0 16px ${color.glow}`,
        }}
      >
        <span style={{ color: color.accent }}>{icon}</span>
      </div>

      {/* Text */}
      <div className="text-left min-w-0 relative z-10">
        <p
          className="text-[15px] font-semibold truncate"
          style={{ color: "rgba(255, 255, 255, 0.95)" }}
        >
          {label}
        </p>
        {sublabel && (
          <p
            className="text-[11px] truncate"
            style={{ color: "rgba(255, 255, 255, 0.4)" }}
          >
            {sublabel}
          </p>
        )}
      </div>
    </motion.button>
  );
}

// Lines Sheet Content
interface LinesSheetContentProps {
  planets: { id: PlanetId; name: string; symbol: string; color: string }[];
  visiblePlanets: Set<PlanetId>;
  onTogglePlanet: (planetId: PlanetId) => void;
  onShowAll: () => void;
  onHideAll: () => void;
  onReset: () => void;
}

function LinesSheetContent({
  planets,
  visiblePlanets,
  onTogglePlanet,
  onShowAll,
  onHideAll,
  onReset,
}: LinesSheetContentProps) {
  return (
    <div className="px-5 space-y-2.5">
      {/* Quick actions */}
      <div className="flex gap-2 mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onShowAll}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <Eye size={16} className="text-white/60" />
          <span className="text-white/70 text-sm font-medium">Show All</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onHideAll}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-colors"
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <EyeOff size={16} className="text-white/60" />
          <span className="text-white/70 text-sm font-medium">Hide All</span>
        </motion.button>
      </div>

      {/* Planet toggles */}
      {planets.map((planet, index) => {
        const isVisible = visiblePlanets.has(planet.id);
        return (
          <motion.button
            key={planet.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, type: "spring", stiffness: 300 }}
            onClick={() => onTogglePlanet(planet.id)}
            className="w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all"
            style={{
              background: isVisible
                ? `linear-gradient(135deg, ${planet.color}14 0%, transparent 100%)`
                : "rgba(255, 255, 255, 0.02)",
              border: isVisible
                ? `1px solid ${planet.color}30`
                : "1px solid rgba(255, 255, 255, 0.05)",
              boxShadow: isVisible ? `0 0 24px ${planet.color}15` : "none",
            }}
          >
            {/* Planet symbol */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all"
              style={{
                background: isVisible ? `${planet.color}20` : "rgba(255, 255, 255, 0.04)",
                color: isVisible ? planet.color : "rgba(255, 255, 255, 0.25)",
                boxShadow: isVisible ? `0 0 20px ${planet.color}25` : "none",
              }}
            >
              {planet.symbol}
            </div>

            {/* Planet name */}
            <span
              className="flex-1 text-left font-medium text-[15px] transition-colors"
              style={{ color: isVisible ? "rgba(255, 255, 255, 0.95)" : "rgba(255, 255, 255, 0.4)" }}
            >
              {planet.name}
            </span>

            {/* Toggle switch */}
            <div
              className="w-12 h-7 rounded-full flex items-center px-1 transition-all duration-200"
              style={{
                background: isVisible
                  ? `linear-gradient(90deg, ${planet.color}70, ${planet.color})`
                  : "rgba(255, 255, 255, 0.1)",
                boxShadow: isVisible ? `0 0 12px ${planet.color}40` : "none",
              }}
            >
              <motion.div
                animate={{ x: isVisible ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-5 h-5 rounded-full bg-white"
                style={{
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                }}
              />
            </div>
          </motion.button>
        );
      })}

    </div>
  );
}
