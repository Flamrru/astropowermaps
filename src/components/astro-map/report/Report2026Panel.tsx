"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Briefcase, Heart, Sparkles } from "lucide-react";
import { PlanetaryLine } from "@/lib/astro/types";
import { YearForecast } from "@/lib/astro/transit-types";
import { calculateReport2026Data, Report2026Data } from "@/lib/astro/report-derivations";
import PowerScoreHero from "./PowerScoreHero";
import InsightCard, { InsightCardDuo, InsightCardTrio } from "./InsightCard";
import CautionsSection from "./CautionsSection";

// ============================================
// Colors
// ============================================

const COLORS = {
  gold: "#E8C547",
  purple: "#9B7ED9",
  pink: "#E8A4C9",
  green: "#4ADE80",
  amber: "#F59E0B",
};

// ============================================
// Types
// ============================================

interface Report2026PanelProps {
  forecast: YearForecast;
  lines: PlanetaryLine[];
  onFlyToCity: (lat: number, lng: number, cityName: string) => void;
}

// ============================================
// Component
// ============================================

export default function Report2026Panel({
  forecast,
  lines,
  onFlyToCity,
}: Report2026PanelProps) {
  // Calculate all report data
  const reportData = useMemo<Report2026Data>(
    () => calculateReport2026Data(forecast, lines),
    [forecast, lines]
  );

  return (
    <div className="pb-6">
      {/* ═══════════════════════════════════════════════════════════════
          HERO: Power Score
          ═══════════════════════════════════════════════════════════════ */}
      <PowerScoreHero
        score={reportData.powerScore}
        label={reportData.powerScoreLabel}
      />

      {/* ═══════════════════════════════════════════════════════════════
          FEATURED DUO: Power Month + Power City
          ═══════════════════════════════════════════════════════════════ */}
      <section className="px-4 mt-4">
        <InsightCardDuo
          left={{
            title: "#1 Power Month",
            value: reportData.powerMonth.monthName,
            subtitle: `Score: ${reportData.powerMonth.score}`,
            icon: <Calendar size={20} />,
            accentColor: COLORS.gold,
            why: reportData.powerMonth.why,
            badge: "#1",
          }}
          right={{
            title: "#1 Power City",
            value: reportData.powerCity.city.name,
            subtitle: `${reportData.powerCity.planet} ${reportData.powerCity.lineType}`,
            icon: <MapPin size={20} />,
            accentColor: COLORS.gold,
            why: reportData.powerCity.why,
            badge: "#1",
            cityData: {
              name: reportData.powerCity.city.name,
              flag: reportData.powerCity.flag,
              lat: reportData.powerCity.city.lat,
              lng: reportData.powerCity.city.lng,
            },
            onFlyToCity,
          }}
          delay={0.3}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CATEGORY TRIO: Money / Love / Growth
          ═══════════════════════════════════════════════════════════════ */}
      <section className="px-4 mt-4">
        <p
          className="text-xs uppercase tracking-wider mb-2.5 px-1 font-medium"
          style={{ color: "rgba(255, 255, 255, 0.4)" }}
        >
          Best Months By Category
        </p>
        <InsightCardTrio
          cards={[
            {
              title: "Money",
              value: reportData.bestForMoney.monthName.slice(0, 3),
              icon: <Briefcase size={16} />,
              accentColor: COLORS.green,
              why: reportData.bestForMoney.why,
            },
            {
              title: "Love",
              value: reportData.bestForLove.monthName.slice(0, 3),
              icon: <Heart size={16} />,
              accentColor: COLORS.pink,
              why: reportData.bestForLove.why,
            },
            {
              title: "Growth",
              value: reportData.bestForGrowth.monthName.slice(0, 3),
              icon: <Sparkles size={16} />,
              accentColor: COLORS.purple,
              why: reportData.bestForGrowth.why,
            },
          ]}
          delay={0.4}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ALL MONTHS OVERVIEW
          ═══════════════════════════════════════════════════════════════ */}
      <section className="px-4 mt-6">
        <p
          className="text-xs uppercase tracking-wider mb-2.5 px-1 font-medium"
          style={{ color: "rgba(255, 255, 255, 0.4)" }}
        >
          Year at a Glance
        </p>
        <MonthsOverview months={reportData.allMonthsRanked} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CAUTIONS SECTION (Collapsible)
          ═══════════════════════════════════════════════════════════════ */}
      <section className="px-4 mt-6">
        <CautionsSection
          avoidMonths={reportData.avoidMonths}
          lowestMonth={reportData.lowestMonth}
          drainingCities={reportData.drainingCities}
          onFlyToCity={onFlyToCity}
          delay={0.5}
        />
      </section>
    </div>
  );
}

// ============================================
// Months Overview - Celestial Energy Chart
// ============================================

const MONTH_LABELS = [
  ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
];

interface MonthsOverviewProps {
  months: { month: number; avgScore: number; label: string }[];
}

function MonthsOverview({ months }: MonthsOverviewProps) {
  // Create a map for quick lookup
  const monthMap = new Map(months.map((m) => [m.month, m]));

  const getScoreColor = (score: number) => {
    if (score >= 75) return COLORS.gold;
    if (score >= 60) return COLORS.purple;
    if (score >= 45) return COLORS.pink;
    return "rgba(255, 255, 255, 0.25)";
  };

  const getGlowIntensity = (score: number) => {
    if (score >= 75) return "0 0 12px rgba(232, 197, 71, 0.5)";
    if (score >= 60) return "0 0 10px rgba(155, 126, 217, 0.4)";
    if (score >= 45) return "0 0 8px rgba(232, 164, 201, 0.3)";
    return "none";
  };

  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(15, 15, 35, 0.8) 0%, rgba(8, 8, 20, 0.9) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.03)",
      }}
    >
      {/* Subtle cosmic dust overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, rgba(232, 197, 71, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(155, 126, 217, 0.06) 0%, transparent 50%)",
        }}
      />

      {/* Two rows of 6 months each */}
      <div className="relative space-y-4">
        {MONTH_LABELS.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-6 gap-2">
            {row.map((label, colIndex) => {
              const monthNum = rowIndex * 6 + colIndex + 1;
              const data = monthMap.get(monthNum);
              const score = data?.avgScore || 50;
              const color = getScoreColor(score);
              const glow = getGlowIntensity(score);
              const barHeight = Math.max(15, (score / 100) * 100);

              return (
                <motion.div
                  key={monthNum}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.6 + (rowIndex * 6 + colIndex) * 0.05,
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                  className="flex flex-col items-center"
                >
                  {/* Month label */}
                  <span
                    className="text-[10px] font-medium tracking-wide mb-1.5"
                    style={{
                      color: score >= 75 ? color : "rgba(255, 255, 255, 0.45)",
                      textShadow: score >= 75 ? `0 0 8px ${color}40` : "none",
                    }}
                  >
                    {label}
                  </span>

                  {/* Energy bar container */}
                  <div
                    className="w-full rounded-lg relative"
                    style={{
                      height: 48,
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    {/* Animated energy bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeight}%` }}
                      transition={{
                        delay: 0.8 + (rowIndex * 6 + colIndex) * 0.06,
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute bottom-0 left-0 right-0 rounded-lg"
                      style={{
                        background: `linear-gradient(to top, ${color} 0%, ${color}90 60%, ${color}60 100%)`,
                        boxShadow: glow,
                      }}
                    />

                    {/* Top highlight on high scores */}
                    {score >= 70 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{
                          delay: 1.5 + colIndex * 0.1,
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ background: color }}
                      />
                    )}
                  </div>

                  {/* Score number */}
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 + (rowIndex * 6 + colIndex) * 0.04 }}
                    className="text-[10px] mt-1.5 tabular-nums font-medium"
                    style={{
                      color: score >= 75 ? color : "rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    {score}
                  </motion.span>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
        className="flex items-center justify-center gap-5 mt-4 pt-3"
        style={{ borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}
      >
        <LegendItem color={COLORS.gold} label="Exceptional" />
        <LegendItem color={COLORS.purple} label="Strong" />
        <LegendItem color={COLORS.pink} label="Good" />
      </motion.div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2.5 h-2.5 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}, ${color}90)`,
          boxShadow: `0 0 6px ${color}40`,
        }}
      />
      <span
        className="text-[10px] font-medium tracking-wide"
        style={{ color: "rgba(255, 255, 255, 0.5)" }}
      >
        {label}
      </span>
    </div>
  );
}
