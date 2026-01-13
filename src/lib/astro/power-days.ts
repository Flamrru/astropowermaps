/**
 * Power Days Calculator
 *
 * Calculates daily energy scores based on transit aspects to the user's natal chart.
 * Uses the same aspect detection as power-months but scores individual days.
 */

import { PlanetId, PlanetPosition } from "./types";
import {
  TransitCache,
  AspectType,
  PlanetaryAspect,
  ASPECTS,
  ASPECT_NAMES,
  CATEGORY_ASPECT_WEIGHTS,
} from "./transit-types";
import { LifeCategory } from "./power-places";
import { findAspectsOnDate, get2026Transits } from "./transit-calculations";
import type { GoalCategory, BestDay } from "@/lib/dashboard-types";

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
const REST_THRESHOLD = 30; // Score 30- = Rest Day

// ============================================
// Flow Score Constants (Variation F)
// ============================================

/** Aspect types by nature */
const HARMONIOUS_ASPECTS: AspectType[] = ["trine", "sextile"];
const CHALLENGING_ASPECTS: AspectType[] = ["square", "opposition"];
const CONJUNCTION_ASPECT: AspectType = "conjunction";

/** Planet categories for weighting */
const LUMINARIES: PlanetId[] = ["sun", "moon"];
const PERSONAL_PLANETS: PlanetId[] = ["mercury", "venus", "mars"];
const BENEFIC_PLANETS: PlanetId[] = ["venus", "jupiter"];
const MALEFIC_PLANETS: PlanetId[] = ["mars", "saturn"];

/**
 * Determine if a conjunction is harmonious based on planets involved
 * Benefics (Venus, Jupiter) create harmonious conjunctions
 */
function isConjunctionHarmonious(aspect: PlanetaryAspect): boolean {
  return (
    BENEFIC_PLANETS.includes(aspect.transitPlanet) ||
    BENEFIC_PLANETS.includes(aspect.natalPlanet)
  );
}

/**
 * Determine if a conjunction is challenging based on planets involved
 * Malefics (Mars, Saturn) create challenging conjunctions
 */
function isConjunctionChallenging(aspect: PlanetaryAspect): boolean {
  return (
    MALEFIC_PLANETS.includes(aspect.transitPlanet) ||
    MALEFIC_PLANETS.includes(aspect.natalPlanet)
  );
}

/**
 * Get planet weight based on category
 * Luminaries (Sun/Moon) = 2.0x, Personal (Mercury/Venus/Mars) = 1.5x, Outer = 1.0x
 */
function getPlanetWeight(aspect: PlanetaryAspect): number {
  if (
    LUMINARIES.includes(aspect.transitPlanet) ||
    LUMINARIES.includes(aspect.natalPlanet)
  ) {
    return 2.0;
  }
  if (
    PERSONAL_PLANETS.includes(aspect.transitPlanet) ||
    PERSONAL_PLANETS.includes(aspect.natalPlanet)
  ) {
    return 1.5;
  }
  return 1.0;
}

/**
 * Get orb bonus - tighter aspects are exponentially more powerful
 */
function getOrbBonus(orb: number): number {
  if (orb < 1) return 2.5;
  if (orb < 2) return 2.0;
  if (orb < 3) return 1.5;
  if (orb < 5) return 1.0;
  return 0.5;
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
 * Calculate daily energy score (0-100) using Flow Score formula
 *
 * Flow Score measures the BALANCE between harmonious and challenging aspects,
 * not just the total quantity. This creates natural variation in scores.
 *
 * High score (70+) = Day flows with ease (more trines, sextiles)
 * Low score (30-) = Day requires extra effort (more squares, oppositions)
 * Middle (31-69) = Balanced energy, neutral day
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

  // Track harmonious vs challenging power separately
  let harmonious = 0;
  let challenging = 0;
  const significantAspects: PlanetaryAspect[] = [];

  // Only consider major aspects for Flow Score
  const majorAspects: AspectType[] = [
    "conjunction",
    "trine",
    "sextile",
    "square",
    "opposition",
  ];

  for (const aspect of aspects) {
    if (!majorAspects.includes(aspect.aspectType)) continue;

    const basePower = ASPECTS[aspect.aspectType].power;
    const orbBonus = getOrbBonus(aspect.orb);
    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;
    const planetWeight = getPlanetWeight(aspect);

    const power = basePower * orbBonus * applyingBonus * planetWeight;

    // Categorize by aspect nature
    if (HARMONIOUS_ASPECTS.includes(aspect.aspectType)) {
      harmonious += power;
    } else if (CHALLENGING_ASPECTS.includes(aspect.aspectType)) {
      challenging += power;
    } else if (aspect.aspectType === CONJUNCTION_ASPECT) {
      // Conjunctions: benefics are harmonious, malefics are challenging
      if (isConjunctionHarmonious(aspect)) {
        harmonious += power;
      } else if (isConjunctionChallenging(aspect)) {
        challenging += power;
      } else {
        // Neutral conjunctions (Mercury, Uranus, Neptune, Pluto)
        // Split 60/40 toward harmonious (conjunctions are generally unifying)
        harmonious += power * 0.6;
        challenging += power * 0.4;
      }
    }

    // Track all significant aspects
    if (power > 5) {
      significantAspects.push(aspect);
    }
  }

  // Calculate Flow Score
  const total = harmonious + challenging;
  let score: number;

  if (total === 0) {
    // No major aspects = neutral day
    score = 50;
  } else {
    // Base score from harmonious ratio (0-100)
    const harmRatio = harmonious / total;
    const baseScore = harmRatio * 100;

    // Magnitude effect: stronger days push further from 50
    // sqrt(total)/10 gives gentle scaling
    // (harmRatio - 0.5) determines direction from center
    const magnitude = Math.sqrt(total) / 10;
    const magnitudeEffect = (harmRatio - 0.5) * magnitude * 20;

    score = Math.max(0, Math.min(100, Math.round(baseScore + magnitudeEffect)));
  }

  // Sort significant aspects by power contribution
  significantAspects.sort((a, b) => {
    const powerA = ASPECTS[a.aspectType].power * getOrbBonus(a.orb);
    const powerB = ASPECTS[b.aspectType].power * getOrbBonus(b.orb);
    return powerB - powerA;
  });

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
  // Use UTC to avoid timezone issues with month boundaries
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

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

// ============================================
// Goal-Specific Best Days
// ============================================

/**
 * Map GoalCategory to LifeCategory for aspect scoring
 */
const GOAL_CATEGORY_MAP: Record<GoalCategory, LifeCategory> = {
  love: "love",
  career: "career",
  creativity: "growth",   // Creative expression = growth/expansion
  clarity: "home",        // Inner clarity = home/reflection
  adventure: "growth",    // Adventure = expansion/growth
};

/**
 * Goal-specific planet associations
 * Only aspects involving these planets count toward the goal
 */
const GOAL_PLANETS: Record<GoalCategory, PlanetId[]> = {
  love: ["venus", "moon", "mars"],
  career: ["sun", "jupiter", "saturn", "mars"],
  creativity: ["venus", "neptune", "uranus"],
  clarity: ["mercury", "saturn", "moon"],
  adventure: ["jupiter", "mars", "uranus"],
};

/**
 * Calculate a day's score for a specific goal
 * Only considers aspects involving goal-relevant planets
 */
function calculateDayScoreForGoal(
  natalPositions: PlanetPosition[],
  date: string,
  goal: GoalCategory,
  transitCache?: TransitCache
): { score: number; reason: string; topAspect: PlanetaryAspect | null } {
  const cache = transitCache || get2026Transits();
  const aspects = findAspectsOnDate(natalPositions, date, cache);
  const lifeCategory = GOAL_CATEGORY_MAP[goal];
  const relevantPlanets = GOAL_PLANETS[goal];

  let totalPower = 0;
  let topAspect: PlanetaryAspect | null = null;
  let topAspectPower = 0;

  for (const aspect of aspects) {
    // Calculate planet relevance weight (Option C)
    // Transit planets drive the day's energy, natal planets are being activated
    let planetWeight = 0;
    if (relevantPlanets.includes(aspect.transitPlanet)) {
      planetWeight += 0.8; // Transit planet is relevant
    }
    if (relevantPlanets.includes(aspect.natalPlanet)) {
      planetWeight += 0.4; // Natal planet is relevant
    }
    // Both = 1.2 (strongest), Transit only = 0.8, Natal only = 0.4, Neither = skip
    if (planetWeight === 0) continue;

    // Base power from aspect type
    const basePower = ASPECTS[aspect.aspectType].power;

    // Orb tightness multiplier
    const maxOrb = ASPECTS[aspect.aspectType].orb;
    const orbTightness = Math.max(0, 1 - aspect.orb / maxOrb);
    const orbMultiplier = Math.pow(orbTightness, 1.5);

    // Applying bonus
    const applyingBonus = aspect.isApplying ? 1.2 : 1.0;

    // Category-specific weight for this aspect type
    const categoryWeight = CATEGORY_ASPECT_WEIGHTS[lifeCategory][aspect.aspectType];

    // Calculate aspect's contribution (including planet relevance weight)
    const aspectPower = basePower * orbMultiplier * applyingBonus * categoryWeight * planetWeight;
    totalPower += aspectPower;

    // Track the strongest aspect for the reason
    if (aspectPower > topAspectPower) {
      topAspectPower = aspectPower;
      topAspect = aspect;
    }
  }

  // Normalize to 0-100 scale using diminishing returns (Option A)
  // This creates natural differentiation: low scores spread out, high scores compress
  // Formula: totalPower / (totalPower + 40) gives curve that never quite reaches 100
  const score = Math.round((totalPower / (totalPower + 40)) * 100);

  // Generate reason from top aspect
  let reason = "Cosmic alignment favors your goals";
  if (topAspect) {
    const transitName = formatPlanetName(topAspect.transitPlanet);
    const natalName = formatPlanetName(topAspect.natalPlanet);
    const aspectMeaning = ASPECT_MEANINGS[topAspect.aspectType];
    reason = `${transitName} brings ${aspectMeaning} to your ${natalName}`;
  }

  return { score, reason, topAspect };
}

/**
 * Format date for display (e.g., "Wed 8th")
 */
function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr);
  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
  const dayOfMonth = date.getUTCDate();

  // Add ordinal suffix
  const suffix =
    dayOfMonth === 1 || dayOfMonth === 21 || dayOfMonth === 31
      ? "st"
      : dayOfMonth === 2 || dayOfMonth === 22
      ? "nd"
      : dayOfMonth === 3 || dayOfMonth === 23
      ? "rd"
      : "th";

  return `${dayOfWeek} ${dayOfMonth}${suffix}`;
}

/**
 * Get the best days for a specific goal in a month
 *
 * @param natalPositions - User's natal planet positions
 * @param year - Year (e.g., 2026)
 * @param month - Month 1-12
 * @param goal - Goal category (love, career, creativity, clarity, adventure)
 * @param limit - Max number of days to return (default 5)
 * @returns Array of BestDay sorted by score descending
 */
export function getBestDaysForGoal(
  natalPositions: PlanetPosition[],
  year: number,
  month: number,
  goal: GoalCategory,
  limit: number = 5
): BestDay[] {
  const cache = get2026Transits();
  // Use UTC to avoid timezone issues with month boundaries
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const allDays: Array<{ date: string; score: number; reason: string }> = [];

  // Calculate score for each day
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const { score, reason } = calculateDayScoreForGoal(natalPositions, date, goal, cache);
    allDays.push({ date, score, reason });
  }

  // Sort by score descending and take top N
  allDays.sort((a, b) => b.score - a.score);
  const topDays = allDays.slice(0, limit);

  // Format as BestDay objects
  return topDays.map((d) => ({
    date: d.date,
    displayDate: formatDisplayDate(d.date),
    goal,
    score: d.score,
    reason: d.reason,
  }));
}
