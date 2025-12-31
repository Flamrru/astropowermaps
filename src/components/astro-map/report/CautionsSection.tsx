"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertTriangle, Calendar, MapPin, Skull } from "lucide-react";
import { MonthInsight, CityInsight } from "@/lib/astro/report-derivations";

// ============================================
// Types
// ============================================

interface CautionsSectionProps {
  avoidMonths: MonthInsight[];
  lowestMonth: MonthInsight;
  drainingCities: CityInsight[];
  onFlyToCity?: (lat: number, lng: number, cityName: string) => void;
  delay?: number;
}

// Colors for caution theme
const CAUTION_COLORS = {
  amber: "#F59E0B",
  red: "#EF4444",
  muted: "rgba(245, 158, 11, 0.6)",
};

// ============================================
// Component
// ============================================

export default function CautionsSection({
  avoidMonths,
  lowestMonth,
  drainingCities,
  onFlyToCity,
  delay = 0,
}: CautionsSectionProps) {
  const hasContent = avoidMonths.length > 0 || drainingCities.length > 0;

  if (!hasContent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Section header - always visible, not clickable */}
      <div
        className="flex items-center gap-3 py-3 px-4 rounded-t-xl"
        style={{
          background: `linear-gradient(135deg, ${CAUTION_COLORS.amber}10 0%, transparent 100%)`,
          border: `1px solid ${CAUTION_COLORS.amber}20`,
          borderBottom: "none",
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${CAUTION_COLORS.amber}20 0%, ${CAUTION_COLORS.amber}08 100%)`,
          }}
        >
          <AlertTriangle size={16} style={{ color: CAUTION_COLORS.amber }} />
        </div>
        <div className="text-left">
          <p
            className="text-sm font-medium"
            style={{ color: "rgba(255, 255, 255, 0.8)" }}
          >
            Cautions & Low Energy
          </p>
          <p
            className="text-xs"
            style={{ color: "rgba(255, 255, 255, 0.4)" }}
          >
            {avoidMonths.length} months · {drainingCities.length} locations
          </p>
        </div>
      </div>

      {/* Content - always visible */}
      <div
        className="px-4 pb-4 pt-3 rounded-b-xl space-y-4"
        style={{
          background: `linear-gradient(180deg, ${CAUTION_COLORS.amber}05 0%, transparent 100%)`,
          border: `1px solid ${CAUTION_COLORS.amber}15`,
          borderTop: "none",
        }}
      >
        {/* Months to Avoid */}
        {avoidMonths.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2.5 px-1">
              <Calendar size={14} style={{ color: CAUTION_COLORS.amber }} />
              <span
                className="text-xs uppercase tracking-wider font-medium"
                style={{ color: CAUTION_COLORS.amber }}
              >
                Months to Navigate Carefully
              </span>
            </div>
            <div className="space-y-2">
              {avoidMonths.map((month, i) => (
                <CautionMonthCard key={month.month} month={month} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Lowest Energy Month (if different from avoid months) */}
        {lowestMonth && !avoidMonths.find((m) => m.month === lowestMonth.month) && (
          <div>
            <div className="flex items-center gap-2 mb-2.5 px-1">
              <Skull size={14} style={{ color: CAUTION_COLORS.red }} />
              <span
                className="text-xs uppercase tracking-wider font-medium"
                style={{ color: CAUTION_COLORS.red }}
              >
                Lowest Energy Month
              </span>
            </div>
            <CautionMonthCard month={lowestMonth} index={0} isLowest />
          </div>
        )}

        {/* Draining Locations */}
        {drainingCities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2.5 px-1">
              <MapPin size={14} style={{ color: CAUTION_COLORS.red }} />
              <span
                className="text-xs uppercase tracking-wider font-medium"
                style={{ color: CAUTION_COLORS.red }}
              >
                Challenging Locations
              </span>
            </div>
            <div className="space-y-2">
              {drainingCities.map((city, i) => (
                <CautionCityCard
                  key={city.city.name}
                  city={city}
                  index={i}
                  onFlyTo={onFlyToCity}
                />
              ))}
            </div>
          </div>
        )}

        {/* Reassurance note */}
        <div
          className="px-3 py-2.5 rounded-lg mt-3"
          style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <p
            className="text-xs leading-relaxed"
            style={{ color: "rgba(255, 255, 255, 0.4)" }}
          >
            These aren&apos;t bad — they&apos;re just periods and places that
            require more intention. Awareness is your advantage.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// Sub-components
// ============================================

interface CautionMonthCardProps {
  month: MonthInsight;
  index: number;
  isLowest?: boolean;
}

function CautionMonthCard({ month, index, isLowest }: CautionMonthCardProps) {
  const [showWhy, setShowWhy] = useState(false);
  const color = isLowest ? CAUTION_COLORS.red : CAUTION_COLORS.amber;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        onClick={() => setShowWhy(!showWhy)}
        className="w-full text-left p-3 rounded-xl transition-all"
        style={{
          background: `linear-gradient(135deg, ${color}08 0%, transparent 100%)`,
          border: `1px solid ${color}15`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold"
              style={{
                background: `${color}15`,
                color: color,
              }}
            >
              {month.score}
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "rgba(255, 255, 255, 0.85)" }}
              >
                {month.monthName}
              </p>
              {isLowest && (
                <p
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: CAUTION_COLORS.red }}
                >
                  Lowest energy
                </p>
              )}
            </div>
          </div>
          <motion.div
            animate={{ rotate: showWhy ? 180 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronDown
              size={14}
              style={{ color: "rgba(255, 255, 255, 0.25)" }}
            />
          </motion.div>
        </div>

        <AnimatePresence>
          {showWhy && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p
                className="text-xs mt-2.5 pt-2.5 leading-relaxed"
                style={{
                  color: "rgba(255, 255, 255, 0.5)",
                  borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                }}
              >
                {month.why}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

interface CautionCityCardProps {
  city: CityInsight;
  index: number;
  onFlyTo?: (lat: number, lng: number, cityName: string) => void;
}

function CautionCityCard({ city, index, onFlyTo }: CautionCityCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* Use div instead of button to avoid nested button issue with "View on Map" */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setShowDetails(!showDetails)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setShowDetails(!showDetails);
          }
        }}
        className="w-full text-left p-3 rounded-xl transition-all cursor-pointer"
        style={{
          background: `linear-gradient(135deg, ${CAUTION_COLORS.red}06 0%, transparent 100%)`,
          border: `1px solid ${CAUTION_COLORS.red}12`,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">{city.flag}</span>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "rgba(255, 255, 255, 0.85)" }}
              >
                {city.city.name}
              </p>
              <p
                className="text-[10px] uppercase tracking-wider"
                style={{ color: CAUTION_COLORS.muted }}
              >
                {city.planet} {city.lineType} Line
              </p>
            </div>
          </div>
          <motion.div
            animate={{ rotate: showDetails ? 180 : 0 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronDown
              size={14}
              style={{ color: "rgba(255, 255, 255, 0.25)" }}
            />
          </motion.div>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div
                className="mt-2.5 pt-2.5"
                style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}
              >
                <p
                  className="text-xs leading-relaxed mb-2"
                  style={{ color: "rgba(255, 255, 255, 0.5)" }}
                >
                  {city.why}
                </p>
                {onFlyTo && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFlyTo(city.city.lat, city.city.lng, city.city.name);
                    }}
                    className="text-xs font-medium py-1.5 px-3 rounded-lg"
                    style={{
                      background: `${CAUTION_COLORS.red}15`,
                      color: CAUTION_COLORS.red,
                    }}
                  >
                    View on Map
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
