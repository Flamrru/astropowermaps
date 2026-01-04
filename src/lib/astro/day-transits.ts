/**
 * Day Transits - Enhanced Day Detail Calculations
 *
 * Calculates all transit data for a specific day including:
 * - Transit aspects to natal chart with interpretations
 * - Moon phase and sign
 * - Daily power score
 * - Formatted display strings
 */

import { PlanetPosition, PlanetId } from "./types";
import { PLANETS } from "./planets";
import { findAspectsOnDate, getTransitsForDate, isoDateToJulianDay } from "./transit-calculations";
import { calculateDailyScore, DayType } from "./power-days";
import { PlanetaryAspect, ASPECT_SYMBOLS, AspectType } from "./transit-types";
import { getZodiacFromLongitude } from "./zodiac";
import { generateDayActivities } from "./activity-generator";
import type { DayTransit, MoonInfo, EnhancedDayData, AspectType as DashboardAspectType } from "@/lib/dashboard-types";

// ============================================
// Moon Phase Calculation
// ============================================

/**
 * Calculate moon phase from Julian Day
 * Uses Meeus algorithm for lunar phase
 */
function getMoonPhaseFromJD(jd: number): { phase: string; illumination: number } {
  // Calculate moon phase (0-29.5 day cycle)
  // Reference: JD 2451550.1 was a known new moon
  const daysSinceNew = (jd - 2451550.1) % 29.530588853;
  const phaseRatio = daysSinceNew / 29.530588853;

  // Calculate illumination percentage
  const illumination = Math.round(((1 - Math.cos(phaseRatio * 2 * Math.PI)) / 2) * 100);

  // Determine phase name (human-readable)
  let phase: string;
  if (phaseRatio < 0.03 || phaseRatio > 0.97) phase = "New Moon";
  else if (phaseRatio < 0.22) phase = "Waxing Crescent";
  else if (phaseRatio < 0.28) phase = "First Quarter";
  else if (phaseRatio < 0.47) phase = "Waxing Gibbous";
  else if (phaseRatio < 0.53) phase = "Full Moon";
  else if (phaseRatio < 0.72) phase = "Waning Gibbous";
  else if (phaseRatio < 0.78) phase = "Last Quarter";
  else phase = "Waning Crescent";

  return { phase, illumination };
}

// ============================================
// Transit Interpretations
// ============================================

/** Short interpretations for each aspect type */
const ASPECT_SHORT_INTERPRETATIONS: Record<AspectType, string> = {
  conjunction: "Powerful energy merging",
  sextile: "Opportunity flowing easily",
  square: "Tension driving growth",
  trine: "Natural harmony and ease",
  opposition: "Balance and awareness",
  "semi-sextile": "Subtle adjustment",
  quincunx: "Adaptation required",
  "semi-square": "Minor friction",
  sesquiquadrate: "Hidden tension",
};

/** Planet keywords for interpretation generation */
const PLANET_KEYWORDS: Record<PlanetId, { energy: string; themes: string[] }> = {
  sun: { energy: "vitality", themes: ["identity", "confidence", "purpose", "leadership"] },
  moon: { energy: "emotion", themes: ["feelings", "intuition", "nurturing", "comfort"] },
  mercury: { energy: "communication", themes: ["thinking", "learning", "speaking", "travel"] },
  venus: { energy: "love", themes: ["relationships", "beauty", "pleasure", "values"] },
  mars: { energy: "action", themes: ["drive", "courage", "passion", "conflict"] },
  jupiter: { energy: "expansion", themes: ["growth", "luck", "optimism", "wisdom"] },
  saturn: { energy: "structure", themes: ["discipline", "responsibility", "limits", "maturity"] },
  uranus: { energy: "innovation", themes: ["change", "freedom", "rebellion", "awakening"] },
  neptune: { energy: "dreams", themes: ["imagination", "spirituality", "illusion", "compassion"] },
  pluto: { energy: "transformation", themes: ["power", "rebirth", "depth", "intensity"] },
};

/** Moon sign meanings for context */
const MOON_SIGN_MEANINGS: Record<string, string> = {
  Aries: "Bold emotions, need for action",
  Taurus: "Grounded feelings, comfort-seeking",
  Gemini: "Curious mood, social energy",
  Cancer: "Deep sensitivity, nurturing vibes",
  Leo: "Expressive emotions, heart-centered",
  Virgo: "Analytical feelings, helpful urges",
  Libra: "Harmonious mood, relationship focus",
  Scorpio: "Intense emotions, transformation",
  Sagittarius: "Adventurous spirit, optimism",
  Capricorn: "Practical feelings, ambition",
  Aquarius: "Detached emotions, unique insights",
  Pisces: "Dreamy mood, spiritual sensitivity",
};

/**
 * Generate a short interpretation for a transit aspect
 */
function generateShortInterpretation(
  transitPlanet: PlanetId,
  natalPlanet: PlanetId,
  aspectType: AspectType
): string {
  const transit = PLANET_KEYWORDS[transitPlanet];
  const natal = PLANET_KEYWORDS[natalPlanet];
  const aspectMeaning = ASPECT_SHORT_INTERPRETATIONS[aspectType];

  // Use aspect nature to frame the interpretation
  const isHarmonious = ["trine", "sextile"].includes(aspectType);
  const isChallenging = ["square", "opposition"].includes(aspectType);

  if (isHarmonious) {
    return `${transit.energy.charAt(0).toUpperCase() + transit.energy.slice(1)} flows easily into your ${natal.themes[0]}. ${aspectMeaning}.`;
  } else if (isChallenging) {
    return `${transit.energy.charAt(0).toUpperCase() + transit.energy.slice(1)} creates tension with your ${natal.themes[0]}. ${aspectMeaning}.`;
  } else {
    return `${transit.energy.charAt(0).toUpperCase() + transit.energy.slice(1)} activates your ${natal.themes[0]}. ${aspectMeaning}.`;
  }
}

/**
 * Generate a full interpretation (3-4 sentences) for expanded view
 */
function generateFullInterpretation(
  transitPlanet: PlanetId,
  natalPlanet: PlanetId,
  aspectType: AspectType,
  isApplying: boolean
): string {
  const transit = PLANET_KEYWORDS[transitPlanet];
  const natal = PLANET_KEYWORDS[natalPlanet];
  const transitName = PLANETS[transitPlanet].name;
  const natalName = PLANETS[natalPlanet].name;

  const isHarmonious = ["trine", "sextile"].includes(aspectType);
  const isChallenging = ["square", "opposition"].includes(aspectType);
  const applyingText = isApplying ? "This energy is building" : "This energy is fading";

  let interpretation = "";

  if (aspectType === "conjunction") {
    interpretation = `${transitName} merges with your natal ${natalName}, intensifying ${natal.energy} in your life. This is a powerful activation of your ${natal.themes[0]} and ${natal.themes[1]}. Use this cosmic spotlight to express your authentic self. ${applyingText}, so ${isApplying ? "prepare for peak intensity" : "reflect on recent insights"}.`;
  } else if (isHarmonious) {
    interpretation = `${transitName} creates a harmonious flow with your ${natalName}, making ${natal.themes[0]} feel easier and more natural. This is an excellent time for ${transit.themes[1]} related to ${natal.themes[2]}. Opportunities may arise without much effort on your part. ${applyingText}.`;
  } else if (isChallenging) {
    interpretation = `${transitName} challenges your ${natalName}, creating productive tension around ${natal.themes[0]}. This isn't bad—it's a push toward growth. You may need to balance ${transit.themes[0]} with ${natal.themes[1]}. ${applyingText}, so ${isApplying ? "prepare to take action" : "integration is underway"}.`;
  } else {
    interpretation = `${transitName} makes contact with your ${natalName}, subtly influencing ${natal.energy}. Pay attention to themes of ${natal.themes[0]} and ${transit.themes[1]}. Minor adjustments may be needed. ${applyingText}.`;
  }

  return interpretation;
}

/**
 * Calculate significance score (1-10) for sorting transits
 * Higher = more important to show first
 */
function calculateSignificance(
  transitPlanet: PlanetId,
  natalPlanet: PlanetId,
  aspectType: AspectType,
  orb: number
): number {
  let score = 0;

  // Major aspects are more significant
  const majorAspects: AspectType[] = ["conjunction", "trine", "square", "opposition", "sextile"];
  if (majorAspects.includes(aspectType)) score += 3;

  // Conjunctions are most significant
  if (aspectType === "conjunction") score += 2;

  // Luminaries (Sun/Moon) are more significant
  if (["sun", "moon"].includes(transitPlanet)) score += 2;
  if (["sun", "moon"].includes(natalPlanet)) score += 1;

  // Personal planets more significant than outer
  if (["mercury", "venus", "mars"].includes(transitPlanet)) score += 1;

  // Tighter orbs are more significant
  if (orb < 1) score += 2;
  else if (orb < 3) score += 1;

  return Math.min(10, Math.max(1, score));
}

// ============================================
// Main Calculation Function
// ============================================

/**
 * Calculate all enhanced day data for a specific date
 *
 * @param date - ISO date string "2026-01-15"
 * @param natalPositions - User's natal planet positions
 * @returns EnhancedDayData with all transit info, moon data, and score
 */
export function calculateEnhancedDayData(
  date: string,
  natalPositions: PlanetPosition[]
): EnhancedDayData {
  // 1. Calculate daily score (uses existing power-days logic)
  const dailyScore = calculateDailyScore(natalPositions, date);

  // 2. Get moon position and calculate sign
  const jd = isoDateToJulianDay(date);
  const transitPositions = getTransitsForDate(date);
  const moonPosition = transitPositions.find((p) => p.id === "moon");

  let moonSign = "Aries";
  if (moonPosition) {
    const zodiacInfo = getZodiacFromLongitude(moonPosition.longitude);
    moonSign = zodiacInfo.sign;
  }

  // 3. Calculate moon phase
  const moonPhaseData = getMoonPhaseFromJD(jd);

  // 4. Build moon info
  const moon: MoonInfo = {
    phase: moonPhaseData.phase,
    sign: moonSign,
    meaning: MOON_SIGN_MEANINGS[moonSign] || "Emotional attunement",
    illumination: moonPhaseData.illumination,
  };

  // 5. Get all aspects for this day
  const rawAspects = findAspectsOnDate(natalPositions, date);

  // 6. Filter to core planets (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn)
  const corePlanets: PlanetId[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"];
  const filteredAspects = rawAspects.filter(
    (a) => corePlanets.includes(a.transitPlanet) && corePlanets.includes(a.natalPlanet)
  );

  // 7. Convert to DayTransit format with interpretations
  const transits: DayTransit[] = filteredAspects.map((aspect) => {
    const transitSymbol = PLANETS[aspect.transitPlanet].symbol;
    const aspectSymbol = ASPECT_SYMBOLS[aspect.aspectType];
    const natalSymbol = PLANETS[aspect.natalPlanet].symbol;
    const transitName = PLANETS[aspect.transitPlanet].name;
    const natalName = PLANETS[aspect.natalPlanet].name;

    // Format: "☉ △ ♃"
    const symbol = `${transitSymbol} ${aspectSymbol} ${natalSymbol}`;

    // Format: "Sun trine your Jupiter"
    const aspectVerb = aspect.aspectType === "conjunction" ? "conjunct" : aspect.aspectType;
    const label = `${transitName} ${aspectVerb} your ${natalName}`;

    return {
      planet1: aspect.transitPlanet,
      aspect: aspect.aspectType as DashboardAspectType,
      planet2: aspect.natalPlanet,
      isNatal: true, // Always hitting natal planet
      symbol,
      label,
      shortText: generateShortInterpretation(aspect.transitPlanet, aspect.natalPlanet, aspect.aspectType),
      fullText: generateFullInterpretation(aspect.transitPlanet, aspect.natalPlanet, aspect.aspectType, aspect.isApplying),
      significance: calculateSignificance(aspect.transitPlanet, aspect.natalPlanet, aspect.aspectType, aspect.orb),
    };
  });

  // 8. Sort by significance (highest first)
  transits.sort((a, b) => b.significance - a.significance);

  // 9. Convert dayType to scoreLabel
  const scoreLabel: "power" | "balanced" | "rest" =
    dailyScore.dayType === "power" ? "power" :
    dailyScore.dayType === "rest" ? "rest" : "balanced";

  // 10. Generate summary
  const summary = generateDaySummary(dailyScore.score, scoreLabel, transits, moon);

  // 11. Generate activity recommendations
  const activities = generateDayActivities(transits, moon);

  return {
    date,
    score: dailyScore.score,
    scoreLabel,
    summary,
    moon,
    transits,
    bestFor: activities.bestFor,
    avoid: activities.avoid,
    // ritual and journalPrompt will be added by API from database
  };
}

/**
 * Generate a 1-2 sentence personalized summary for the day
 */
function generateDaySummary(
  score: number,
  scoreLabel: "power" | "balanced" | "rest",
  transits: DayTransit[],
  moon: MoonInfo
): string {
  // Get the most significant transit for context
  const topTransit = transits[0];

  if (scoreLabel === "power") {
    if (topTransit) {
      const transitName = PLANETS[topTransit.planet1 as PlanetId].name;
      const energy = PLANET_KEYWORDS[topTransit.planet1 as PlanetId].energy;
      return `${transitName} amplifies your ${energy} today. With the Moon in ${moon.sign}, trust your instincts and take bold action.`;
    }
    return `Cosmic momentum is with you today. The ${moon.phase} in ${moon.sign} supports confident action.`;
  }

  if (scoreLabel === "rest") {
    if (topTransit && ["square", "opposition"].includes(topTransit.aspect)) {
      return `A day for patience and reflection. The Moon in ${moon.sign} asks you to honor your inner rhythm.`;
    }
    return `The cosmos invites you to slow down. With the Moon in ${moon.sign}, focus on rest and self-care.`;
  }

  // Balanced
  if (topTransit) {
    const transitName = PLANETS[topTransit.planet1 as PlanetId].name;
    return `${transitName} gently activates your chart today. Steady energy with the Moon in ${moon.sign}.`;
  }
  return `A balanced day in the cosmos. Follow your own rhythm with the Moon in ${moon.sign}.`;
}

// ============================================
// Exports
// ============================================

export {
  getMoonPhaseFromJD,
  generateShortInterpretation,
  generateFullInterpretation,
  MOON_SIGN_MEANINGS,
  PLANET_KEYWORDS,
};
