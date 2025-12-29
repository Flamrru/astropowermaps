"use client";

import { motion } from "framer-motion";
import { Lock, TrendingUp, TrendingDown, AlertTriangle, MapPin, Calendar, DollarSign, Heart, Sparkles, Brain } from "lucide-react";
import { YearForecast } from "@/lib/reveal-state";
import {
  calculatePowerScore,
  getBestMonthFor,
  getAllMonthsRanked,
  getLowestEnergyMonth,
  getPowerCities,
  getDrainingLocations,
  MONTH_NAMES,
} from "@/lib/astro/paywall-derivations";

interface BlurredReportPreviewProps {
  forecastData: YearForecast | null;
}

// Power Score Gauge component
function PowerScoreGauge({ score }: { score: number }) {
  const radius = 50;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-32 h-20 mx-auto">
      <svg viewBox="0 0 120 70" className="w-full h-full">
        {/* Background arc */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B6914" />
            <stop offset="50%" stopColor="#C9A227" />
            <stop offset="100%" stopColor="#E8C547" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <span className="text-gold text-3xl font-bold">{score}</span>
        <span className="text-white/50 text-lg">/100</span>
      </div>
    </div>
  );
}

// Blurred text with lock icon
function BlurredValue({ children, intensity = "medium" }: { children: React.ReactNode; intensity?: "light" | "medium" | "heavy" }) {
  const blurMap = { light: "blur-[4px]", medium: "blur-[6px]", heavy: "blur-[8px]" };
  return (
    <span className={`${blurMap[intensity]} select-none inline-block`}>
      {children}
    </span>
  );
}

// Section card wrapper
function PreviewCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {children}
    </motion.div>
  );
}

// Mini bar chart for energy visualization
function EnergyBar({ score, isHighlighted = false }: { score: number; isHighlighted?: boolean }) {
  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${score}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className={`h-full rounded-full ${isHighlighted ? "bg-gold" : "bg-white/30"}`}
      />
    </div>
  );
}

export default function BlurredReportPreview({ forecastData }: BlurredReportPreviewProps) {
  const powerScore = calculatePowerScore(forecastData);
  const bestLove = getBestMonthFor(forecastData, "love");
  const bestCareer = getBestMonthFor(forecastData, "career");
  const bestGrowth = getBestMonthFor(forecastData, "growth");
  const lowestMonth = getLowestEnergyMonth(forecastData);
  const allMonths = getAllMonthsRanked(forecastData);
  const powerCities = getPowerCities();
  const drainingLocations = getDrainingLocations();

  const powerMonths = forecastData?.powerMonths || [3, 7, 10];
  const avoidMonths = forecastData?.avoidMonths || [2, 6, 11];

  return (
    <div className="space-y-4 px-5 pt-6">
      {/* TIER 1: Holy Shit Sections */}

      {/* 2026 Power Score */}
      <PreviewCard>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white/80 text-[15px] font-medium">Your 2026 Power Score</h4>
          <Lock className="w-4 h-4 text-white/30" />
        </div>
        <PowerScoreGauge score={powerScore} />
        <p className="text-center text-white/50 text-[13px] mt-3">
          How aligned 2026 is for your chart
        </p>
      </PreviewCard>

      {/* #1 Power Month */}
      <PreviewCard>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white/80 text-[15px] font-medium">Your #1 Power Month</h4>
          <Lock className="w-4 h-4 text-white/30" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-gold text-2xl font-bold mb-1">
              <BlurredValue>{MONTH_NAMES[powerMonths[0] - 1]}</BlurredValue>
            </p>
            <p className="text-white/50 text-[13px]">Your highest-momentum window in 2026</p>
          </div>
          <div className="w-16 h-12 relative">
            <TrendingUp className="w-full h-full text-gold/30" />
          </div>
        </div>
      </PreviewCard>

      {/* #1 Power City */}
      <PreviewCard>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white/80 text-[15px] font-medium">Your #1 Power City</h4>
          <Lock className="w-4 h-4 text-white/30" />
        </div>
        <div className="flex items-center gap-4">
          <MapPin className="w-8 h-8 text-gold/50" />
          <div className="flex-1">
            <p className="text-gold text-xl font-bold mb-1">
              <BlurredValue>{powerCities[0].name}</BlurredValue>
            </p>
            <p className="text-white/50 text-[13px]">
              <BlurredValue intensity="light">{powerCities[0].distance}</BlurredValue> from you
            </p>
            <p className="text-white/40 text-[12px]">Where your {powerCities[0].category} lines intersect</p>
          </div>
        </div>
      </PreviewCard>

      {/* TIER 2: Category Timing */}
      <div className="grid grid-cols-2 gap-3">
        {/* Best Month for Money */}
        <PreviewCard className="!p-4">
          <DollarSign className="w-5 h-5 text-gold/50 mb-2" />
          <p className="text-white/60 text-[12px] mb-1">Best for Money</p>
          <p className="text-gold font-semibold">
            <BlurredValue>{bestCareer.monthName}</BlurredValue>
          </p>
        </PreviewCard>

        {/* Best Month for Love */}
        <PreviewCard className="!p-4">
          <Heart className="w-5 h-5 text-pink-400/50 mb-2" />
          <p className="text-white/60 text-[12px] mb-1">Best for Love</p>
          <p className="text-gold font-semibold">
            <BlurredValue>{bestLove.monthName}</BlurredValue>
          </p>
        </PreviewCard>

        {/* Best for New Starts */}
        <PreviewCard className="!p-4">
          <Sparkles className="w-5 h-5 text-purple-400/50 mb-2" />
          <p className="text-white/60 text-[12px] mb-1">New Beginnings</p>
          <p className="text-gold font-semibold">
            <BlurredValue>{bestGrowth.monthName}</BlurredValue>
          </p>
        </PreviewCard>

        {/* Best for Decisions */}
        <PreviewCard className="!p-4">
          <Brain className="w-5 h-5 text-blue-400/50 mb-2" />
          <p className="text-white/60 text-[12px] mb-1">Major Decisions</p>
          <p className="text-gold font-semibold">
            <BlurredValue>{MONTH_NAMES[powerMonths[1] - 1]}</BlurredValue>
          </p>
        </PreviewCard>
      </div>

      {/* TIER 3: Warnings */}
      <PreviewCard className="!border-orange-500/20 !bg-orange-500/5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          <h4 className="text-white/80 text-[15px] font-medium">Months to Avoid</h4>
          <Lock className="w-4 h-4 text-white/30 ml-auto" />
        </div>
        <div className="flex gap-3 mb-4">
          {avoidMonths.slice(0, 3).map((m, i) => (
            <div key={i} className="flex-1 text-center p-2 rounded-lg bg-orange-500/10">
              <p className="text-orange-300 font-medium">
                <BlurredValue intensity="light">{MONTH_NAMES[m - 1].slice(0, 3)}</BlurredValue>
              </p>
            </div>
          ))}
        </div>
        <p className="text-white/50 text-[13px]">Mercury retrograde + your Saturn transit</p>
      </PreviewCard>

      <PreviewCard className="!border-red-500/20 !bg-red-500/5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="w-5 h-5 text-red-400" />
          <h4 className="text-white/80 text-[15px] font-medium">Lowest Energy Month</h4>
          <Lock className="w-4 h-4 text-white/30 ml-auto" />
        </div>
        <p className="text-red-300 text-xl font-bold mb-1">
          <BlurredValue>{lowestMonth.monthName}</BlurredValue>
        </p>
        <p className="text-white/50 text-[13px]">Plan rest, not action</p>
      </PreviewCard>

      {/* Draining Locations */}
      <PreviewCard className="!border-red-500/15 !bg-red-500/3">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-red-400/70" />
          <h4 className="text-white/80 text-[15px] font-medium">Locations That Drain You</h4>
          <Lock className="w-4 h-4 text-white/30 ml-auto" />
        </div>
        <div className="flex flex-wrap gap-2">
          {drainingLocations.map((city, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-red-500/10 text-red-300/80 text-[13px]">
              <BlurredValue intensity="light">{city}</BlurredValue>
            </span>
          ))}
        </div>
        <p className="text-white/40 text-[12px] mt-2">Your Saturn + Pluto lines — avoid or prepare</p>
      </PreviewCard>

      {/* TIER 4: Deep Analysis */}
      <PreviewCard>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white/80 text-[15px] font-medium">All 12 Months Ranked</h4>
          <Lock className="w-4 h-4 text-white/30" />
        </div>
        <div className="space-y-2">
          {allMonths.slice(0, 5).map((month, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-white/40 text-[12px] w-5">{i + 1}.</span>
              <span className="text-white/70 text-[14px] w-20">
                <BlurredValue intensity="light">{month.monthName}</BlurredValue>
              </span>
              <div className="flex-1">
                <EnergyBar score={month.score} isHighlighted={month.isPower} />
              </div>
            </div>
          ))}
          <p className="text-white/30 text-[12px] text-center pt-2">
            + 7 more months...
          </p>
        </div>
      </PreviewCard>

      {/* Calendar Preview */}
      <PreviewCard>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white/80 text-[15px] font-medium">2026 Calendar View</h4>
          <Calendar className="w-4 h-4 text-white/30" />
        </div>
        <div className="grid grid-cols-6 gap-1">
          {MONTH_NAMES.map((month, i) => {
            const isPower = powerMonths.includes(i + 1);
            const isAvoid = avoidMonths.includes(i + 1);
            return (
              <div
                key={i}
                className={`aspect-square rounded flex items-center justify-center text-[10px] ${
                  isPower
                    ? "bg-gold/30 text-gold"
                    : isAvoid
                    ? "bg-red-500/20 text-red-300"
                    : "bg-white/5 text-white/30"
                }`}
              >
                <BlurredValue intensity="light">{month.slice(0, 1)}</BlurredValue>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-3 text-[11px]">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gold/50" />
            <span className="text-white/40">Power</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500/30" />
            <span className="text-white/40">Avoid</span>
          </span>
        </div>
      </PreviewCard>

      {/* Gradient fade to checkout - visual separator */}
      <div
        className="h-20 -mx-5"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(5, 5, 16, 0.95))",
        }}
      />
    </div>
  );
}
