/**
 * Power Days Calculator
 *
 * Calculates daily energy scores based on transit aspects to the user's natal chart.
 * Uses the same aspect detection as power-months but scores individual days.
 */

import { PlanetPosition } from "./types";
import {
  TransitCache,
  AspectType,
  PlanetaryAspect,
  ASPECTS,
  ASPECT_NAMES,
} from "./transit-types";
import { findAspectsOnDate, get2026Transits } from "./transit-calculations";

// ============================================
// Types
// ============================================

export type DayType = "power" | "rest" | "neutral";

export interface DailyScore {
  date: string; // "2026-01-15"
  score: number; // 0-100
  aspects: PlanetaryAspect[];
  dayType: DayType;
  description: string;
}

// ============================================
// Scoring Configuration
// ============================================

/** Thresholds for day classification */
const POWER_THRESHOLD = 70; // Score 70+ = Power Day
const REST_THRESHOLD = 25; // Score 25- = Rest Day

/** Nature modifiers - how much each aspect type contributes */
function getNatureModifier(aspectType: AspectType): number {
  const nature = ASPECTS[aspectType].nature;
  switch (nature) {
    case "harmonious":
      return 1.0; // Trines, sextiles - full power
    case "major":
      return 0.9; // Conjunctions - powerful but depends on planets
    case "awareness":
      return 0.7; // Oppositions - tension but awareness
    case "challenging":
      return 0.5; // Squares - still count but reduced
    case "minor-harmonious":
      return 0.6; // Semi-sextiles
    case "adjustment":
      return 0.4; // Quincunx
    case "minor-challenging":
      return 0.3; // Semi-square, sesquiquadrate
    default:
      return 0.5;
  }
}

/** Aspect meaning descriptions for UI */
const ASPECT_MEANINGS: Record<AspectType, string> = {
  conjunction: "powerful alignment",
  trine: "natural flow and harmony",
  sextile: "opportunity and ease",
  square: "tension driving action",
  opposition: "balance and awareness",
  "semi-sextile": "subtle adjustment",
  quincunx: "adaptation required",
  "semi-square": "minor friction",
  sesquiquadrate: "hidden tension",
};

// ============================================
// Core Scoring Functions
// ============================================

/**
 * Calculate daily energy score (0-100) based on transit aspects
 *
 * @param natalPositions - User's natal planet positions
 * @param date - ISO date string "2026-01-15"
 * @param transitCache - Optional pre-computed transit cache
 * @returns DailyScore with score, day type, and description
 */
export function calculateDailyScore(
  natalPositions: PlanetPosition[],
  date: string,
  transitCache?: TransitCache
): DailyScore {
  const cache = transitCache || get2026Transits();
  const aspects = findAspectsOnDate(natalPositions, date, cache);

  let totalPower = 0;
  const significantAspects: PlanetaryAspect[] = [];

  for (const aspect of aspects) {
    // Base power from aspect type (1-10)
    const basePower = ASPECTS[aspect.aspectType].power;

    // Orb tightness multiplier (tighter = exponentially stronger)
    const maxOrb = ASPECTS[aspect.aspectType].orb;
    const orbTightness = Math.max(0, 1 - aspect.orb / maxOrb);
    const orbMultiplier = Math.pow(orbTightness, 1.5);

    // Applying bonus (aspects getting closer are stronger)
    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;

    // Nature modifier (harmonious vs challenging)
    const natureModifier = getNatureModifier(aspect.aspectType);

    // Calculate aspect's contribution
    const aspectPower = basePower * orbMultiplier * applyingBonus * natureModifier;
    totalPower += aspectPower;

    // Track significant aspects for description
    if (aspectPower > 2) {
      significantAspects.push(aspect);
    }
  }

  // Sort significant aspects by power contribution
  significantAspects.sort((a, b) => {
    const powerA =
      ASPECTS[a.aspectType].power * (1 - a.orb / ASPECTS[a.aspectType].orb);
    const powerB =
      ASPECTS[b.aspectType].power * (1 - b.orb / ASPECTS[b.aspectType].orb);
    return powerB - powerA;
  });

  // Normalize to 0-100 scale
  // Typical raw range is 0-60, scale to 0-100
  const score = Math.min(100, Math.round(totalPower * 1.7));

  // Classify day type
  const dayType = classifyDay(score);

  // Generate human-readable description
  const description = generateDayDescription(score, significantAspects, dayType);

  return {
    date,
    score,
    aspects: significantAspects.slice(0, 3), // Top 3 aspects
    dayType,
    description,
  };
}

/**
 * Classify a day based on its score
 */
function classifyDay(score: number): DayType {
  if (score >= POWER_THRESHOLD) return "power";
  if (score <= REST_THRESHOLD) return "rest";
  return "neutral";
}

/**
 * Generate a human-readable description for the day
 */
function generateDayDescription(
  score: number,
  aspects: PlanetaryAspect[],
  dayType: DayType
): string {
  if (aspects.length === 0) {
    if (dayType === "power") {
      return "Cosmic momentum is building - trust your instincts";
    } else if (dayType === "rest") {
      return "A quiet day in the cosmos - perfect for reflection";
    }
    return "Steady energy - follow your own rhythm";
  }

  // Use the strongest aspect for the description
  const strongest = aspects[0];
  const transitName = formatPlanetName(strongest.transitPlanet);
  const natalName = formatPlanetName(strongest.natalPlanet);
  const aspectMeaning = ASPECT_MEANINGS[strongest.aspectType];

  if (dayType === "power") {
    return `${transitName} brings ${aspectMeaning} to your ${natalName}`;
  } else if (dayType === "rest") {
    return `${transitName} asks for patience with your ${natalName}`;
  }

  return `${transitName} activates your ${natalName} - ${aspectMeaning}`;
}

/**
 * Format planet name for display (capitalize first letter)
 */
function formatPlanetName(planet: string): string {
  return planet.charAt(0).toUpperCase() + planet.slice(1);
}

// ============================================
// Monthly Calculation
// ============================================

/**
 * Calculate power days for a full month
 *
 * @param natalPositions - User's natal planet positions
 * @param year - Year (e.g., 2026)
 * @param month - Month 1-12
 * @returns Array of DailyScore for each day
 */
export function calculateMonthPowerDays(
  natalPositions: PlanetPosition[],
  year: number,
  month: number
): DailyScore[] {
  const cache = get2026Transits();
  const scores: DailyScore[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    scores.push(calculateDailyScore(natalPositions, date, cache));
  }

  return scores;
}

/**
 * Get summary statistics for a month's power days
 */
export function getMonthSummary(dailyScores: DailyScore[]): {
  powerDays: number;
  restDays: number;
  averageScore: number;
  bestDay: DailyScore | null;
} {
  const powerDays = dailyScores.filter((d) => d.dayType === "power").length;
  const restDays = dailyScores.filter((d) => d.dayType === "rest").length;
  const averageScore =
    dailyScores.reduce((sum, d) => sum + d.score, 0) / dailyScores.length;

  let bestDay: DailyScore | null = null;
  for (const day of dailyScores) {
    if (!bestDay || day.score > bestDay.score) {
      bestDay = day;
    }
  }

  return {
    powerDays,
    restDays,
    averageScore: Math.round(averageScore),
    bestDay,
  };
}
