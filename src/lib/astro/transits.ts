/**
 * Transit Calculations
 *
 * Calculates current planetary positions for AI content generation.
 * Reuses existing astronomia-based calculations from calculations.ts.
 */

import { calculatePlanetPosition } from "./calculations";
import { getZodiacFromLongitude, ZodiacInfo } from "./zodiac";
import { PlanetId } from "./types";
import * as julian from "astronomia/julian";
import * as moonposition from "astronomia/moonposition";

// ============================================
// Types
// ============================================

export interface TransitPosition {
  planet: string;
  sign: string;
  degree: number;
  symbol: string;
  formatted: string; // e.g., "15° Capricorn"
}

export interface CurrentTransits {
  sun: TransitPosition;
  moon: TransitPosition;
  mercury: TransitPosition;
  venus: TransitPosition;
  mars: TransitPosition;
  jupiter: TransitPosition;
  saturn: TransitPosition;
  lunarPhase: LunarPhase;
  calculatedAt: string;
}

export interface LunarPhase {
  name: string;
  emoji: string;
  illumination: number; // 0-100%
}

// ============================================
// Lunar Phase Calculation
// ============================================

const LUNAR_PHASES = [
  { name: "New Moon", emoji: "🌑", min: 0, max: 1 },
  { name: "Waxing Crescent", emoji: "🌒", min: 1, max: 49 },
  { name: "First Quarter", emoji: "🌓", min: 49, max: 51 },
  { name: "Waxing Gibbous", emoji: "🌔", min: 51, max: 99 },
  { name: "Full Moon", emoji: "🌕", min: 99, max: 100 },
  { name: "Waning Gibbous", emoji: "🌖", min: 51, max: 99 },
  { name: "Last Quarter", emoji: "🌗", min: 49, max: 51 },
  { name: "Waning Crescent", emoji: "🌘", min: 1, max: 49 },
];

/**
 * Calculate current lunar phase based on Sun-Moon elongation
 */
function calculateLunarPhase(jd: number): LunarPhase {
  // Get Sun and Moon positions
  const sunPos = calculatePlanetPosition("sun", jd);
  const moonPos = calculatePlanetPosition("moon", jd);

  // Calculate elongation (angle between Moon and Sun)
  let elongation = moonPos.longitude - sunPos.longitude;
  if (elongation < 0) elongation += 360;

  // Calculate illumination percentage (simplified)
  // At 0° elongation = new moon (0%), at 180° = full moon (100%)
  const illumination = Math.round((1 - Math.cos((elongation * Math.PI) / 180)) * 50);

  // Determine phase based on elongation
  let phase: { name: string; emoji: string };

  if (elongation < 11.25) {
    phase = { name: "New Moon", emoji: "🌑" };
  } else if (elongation < 78.75) {
    phase = { name: "Waxing Crescent", emoji: "🌒" };
  } else if (elongation < 101.25) {
    phase = { name: "First Quarter", emoji: "🌓" };
  } else if (elongation < 168.75) {
    phase = { name: "Waxing Gibbous", emoji: "🌔" };
  } else if (elongation < 191.25) {
    phase = { name: "Full Moon", emoji: "🌕" };
  } else if (elongation < 258.75) {
    phase = { name: "Waning Gibbous", emoji: "🌖" };
  } else if (elongation < 281.25) {
    phase = { name: "Last Quarter", emoji: "🌗" };
  } else if (elongation < 348.75) {
    phase = { name: "Waning Crescent", emoji: "🌘" };
  } else {
    phase = { name: "New Moon", emoji: "🌑" };
  }

  return {
    ...phase,
    illumination,
  };
}

// ============================================
// Transit Position Calculation
// ============================================

/**
 * Get transit position for a single planet
 */
function getTransitPosition(planetId: PlanetId, jd: number): TransitPosition {
  const position = calculatePlanetPosition(planetId, jd);
  const zodiac = getZodiacFromLongitude(position.longitude);

  return {
    planet: planetId,
    sign: zodiac.sign,
    degree: Math.round(zodiac.degree),
    symbol: zodiac.symbol,
    formatted: `${Math.round(zodiac.degree)}° ${zodiac.sign}`,
  };
}

/**
 * Get current Julian Day for "now"
 */
function getCurrentJulianDay(): number {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const day =
    now.getUTCDate() +
    (now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600) / 24;

  return julian.CalendarGregorianToJD(year, month, day);
}

// ============================================
// Main Export Function
// ============================================

/**
 * Get current planetary transits for AI content generation.
 *
 * Returns positions of major planets plus lunar phase info.
 * Used in daily score, weekly forecast, and ritual prompts.
 *
 * @example
 * const transits = getCurrentTransits();
 * // transits.sun = { planet: "sun", sign: "Capricorn", degree: 13, ... }
 * // transits.lunarPhase = { name: "Waxing Gibbous", emoji: "🌔", illumination: 78 }
 */
export function getCurrentTransits(): CurrentTransits {
  const jd = getCurrentJulianDay();

  return {
    sun: getTransitPosition("sun", jd),
    moon: getTransitPosition("moon", jd),
    mercury: getTransitPosition("mercury", jd),
    venus: getTransitPosition("venus", jd),
    mars: getTransitPosition("mars", jd),
    jupiter: getTransitPosition("jupiter", jd),
    saturn: getTransitPosition("saturn", jd),
    lunarPhase: calculateLunarPhase(jd),
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Format transits as a string for AI prompts
 */
export function formatTransitsForPrompt(transits: CurrentTransits): string {
  return `Today's Planetary Positions:
- Sun: ${transits.sun.formatted}
- Moon: ${transits.moon.formatted} (${transits.lunarPhase.name} ${transits.lunarPhase.emoji})
- Mercury: ${transits.mercury.formatted}
- Venus: ${transits.venus.formatted}
- Mars: ${transits.mars.formatted}
- Jupiter: ${transits.jupiter.formatted}
- Saturn: ${transits.saturn.formatted}`;
}
