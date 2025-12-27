/**
 * Power Months Calculator
 *
 * Scores each month of 2026 for different life categories based on
 * planetary transits to the user's natal chart. Includes confidence
 * calculations for unknown birth times.
 */

import { PlanetPosition, PlanetId, BirthData } from "./types";
import { LifeCategory } from "./power-places";
import {
  MonthScore,
  YearForecast,
  PeakWindow,
  PlanetaryAspect,
  ConfidenceLevel,
  BirthTimeWindow,
  ASPECTS,
  CATEGORY_ASPECT_WEIGHTS,
  CATEGORY_PLANETS,
  CONFIDENCE_THRESHOLDS,
  MONTH_NAMES,
} from "./transit-types";
import {
  getAspectsForMonth,
  findAspectsOnDate,
  get2026Transits,
  getMonthDates,
  calculateSampledNatalPositions,
} from "./transit-calculations";
import { getMonthInterpretation } from "./transit-interpretations";

// ============================================
// Constants
// ============================================

const ALL_CATEGORIES: LifeCategory[] = ["love", "career", "growth", "home"];

// ============================================
// Scoring Algorithm
// ============================================

/**
 * Calculate the power score for a single month in a single category
 * Uses DAILY sampling to properly differentiate months
 * (Slow planets form same aspects for months - we differentiate by orb tightness)
 *
 * @param _aspects - Unused (kept for API compatibility)
 * @param category - Life category to score
 * @param natalPositions - Natal planet positions
 * @param year - Year to calculate
 * @param month - Month to calculate (1-12)
 * @returns Raw cumulative score (normalized later)
 */
export function calculateCategoryScore(
  _aspects: PlanetaryAspect[],
  category: LifeCategory,
  natalPositions: PlanetPosition[],
  year: number = 2026,
  month: number = 1
): number {
  const categoryPlanets = CATEGORY_PLANETS[category];
  const aspectWeights = CATEGORY_ASPECT_WEIGHTS[category];
  const cache = get2026Transits();

  let totalDailyPower = 0;
  const daysInMonth = new Date(year, month, 0).getDate();

  // Calculate power for EACH DAY - this creates differentiation
  for (let day = 1; day <= daysInMonth; day++) {
    const isoDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayAspects = findAspectsOnDate(natalPositions, isoDate, cache);

    for (const aspect of dayAspects) {
      // Check if this aspect involves category-relevant planets
      const transitRelevant = categoryPlanets.includes(aspect.transitPlanet);
      const natalRelevant = categoryPlanets.includes(aspect.natalPlanet);

      if (!transitRelevant && !natalRelevant) continue;

      // Base score from aspect type
      const baseScore = ASPECTS[aspect.aspectType].power;

      // Weight by category relevance
      const aspectMultiplier = aspectWeights[aspect.aspectType];

      // Bonus if both planets are category-relevant
      const relevanceBonus = transitRelevant && natalRelevant ? 1.5 : 1.0;

      // KEY: Tighter orbs are EXPONENTIALLY stronger
      // This creates big differences when aspects are exact vs wide
      const maxOrb = ASPECTS[aspect.aspectType].orb;
      const orbTightness = Math.max(0, 1 - (aspect.orb / maxOrb));
      const orbMultiplier = Math.pow(orbTightness, 1.5); // Power curve for differentiation

      // Daily contribution
      const aspectPower = baseScore * aspectMultiplier * relevanceBonus * orbMultiplier;
      totalDailyPower += aspectPower;
    }
  }

  // Return raw cumulative score (will be normalized across all months later)
  return totalDailyPower;
}

/**
 * Find the dominant planet for a category's aspects
 */
function findDominantPlanet(aspects: PlanetaryAspect[], category: LifeCategory): PlanetId {
  const categoryPlanets = CATEGORY_PLANETS[category];
  const planetCounts: Record<string, number> = {};

  for (const aspect of aspects) {
    if (categoryPlanets.includes(aspect.transitPlanet)) {
      planetCounts[aspect.transitPlanet] = (planetCounts[aspect.transitPlanet] || 0) + 1;
    }
    if (categoryPlanets.includes(aspect.natalPlanet)) {
      planetCounts[aspect.natalPlanet] = (planetCounts[aspect.natalPlanet] || 0) + 1;
    }
  }

  // Return most frequent category planet, or first in priority
  let maxCount = 0;
  let dominant = categoryPlanets[0];

  for (const [planet, count] of Object.entries(planetCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominant = planet as PlanetId;
    }
  }

  return dominant;
}

/**
 * Get top N aspects by power for a category
 */
function getTopAspects(
  aspects: PlanetaryAspect[],
  category: LifeCategory,
  limit: number = 3
): PlanetaryAspect[] {
  const categoryPlanets = CATEGORY_PLANETS[category];
  const aspectWeights = CATEGORY_ASPECT_WEIGHTS[category];

  // Filter to category-relevant aspects
  const relevantAspects = aspects.filter(
    (a) => categoryPlanets.includes(a.transitPlanet) || categoryPlanets.includes(a.natalPlanet)
  );

  // Score and sort
  const scored = relevantAspects.map((aspect) => ({
    aspect,
    score: ASPECTS[aspect.aspectType].power * aspectWeights[aspect.aspectType] * (aspect.isApplying ? 1.2 : 1),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.aspect);
}

// ============================================
// Peak Window Detection
// ============================================

/**
 * Find the best week within a month for a category
 *
 * @param natalPositions - Natal planet positions
 * @param year - Year
 * @param month - Month (1-12)
 * @param category - Life category
 * @returns PeakWindow or null if no significant peak
 */
export function findPeakWindow(
  natalPositions: PlanetPosition[],
  year: number,
  month: number,
  category: LifeCategory
): PeakWindow | null {
  const cache = get2026Transits();
  const monthDates = getMonthDates(year, month);

  // Score each day
  const dailyScores: { date: string; score: number; aspects: PlanetaryAspect[] }[] = [];

  for (const date of monthDates) {
    const dayAspects = findAspectsOnDate(natalPositions, date, cache);
    const relevantAspects = dayAspects.filter(
      (a) =>
        CATEGORY_PLANETS[category].includes(a.transitPlanet) ||
        CATEGORY_PLANETS[category].includes(a.natalPlanet)
    );

    // Simple daily score based on aspect count and quality
    let dayScore = 0;
    for (const aspect of relevantAspects) {
      dayScore += ASPECTS[aspect.aspectType].power * (aspect.isApplying ? 1.2 : 1);
    }

    dailyScores.push({ date, score: dayScore, aspects: relevantAspects });
  }

  // Find best 7-day window using rolling sum
  let bestWindowStart = 0;
  let bestWindowScore = 0;

  for (let i = 0; i <= dailyScores.length - 7; i++) {
    const windowScore = dailyScores.slice(i, i + 7).reduce((sum, d) => sum + d.score, 0);
    if (windowScore > bestWindowScore) {
      bestWindowScore = windowScore;
      bestWindowStart = i;
    }
  }

  // Minimum threshold for a "peak"
  if (bestWindowScore < 10) {
    return null;
  }

  const startDate = dailyScores[bestWindowStart].date;
  const endIdx = Math.min(bestWindowStart + 6, dailyScores.length - 1);
  const endDate = dailyScores[endIdx].date;

  // Find the strongest aspect in this window
  const windowAspects = dailyScores.slice(bestWindowStart, bestWindowStart + 7).flatMap((d) => d.aspects);
  const topAspects = getTopAspects(windowAspects, category, 1);
  const mainAspect = topAspects[0] || null;

  // Determine intensity
  let intensity: "high" | "very-high" | "exceptional" = "high";
  if (bestWindowScore > 30) {
    intensity = "exceptional";
  } else if (bestWindowScore > 20) {
    intensity = "very-high";
  }

  // Generate reason
  const reason = mainAspect
    ? `${formatPlanetName(mainAspect.transitPlanet)} ${mainAspect.aspectType} natal ${formatPlanetName(mainAspect.natalPlanet)}`
    : "Multiple beneficial transits";

  return {
    startDate,
    endDate,
    intensity,
    reason,
    mainAspect,
  };
}

/**
 * Format planet name for display
 */
function formatPlanetName(planet: PlanetId): string {
  return planet.charAt(0).toUpperCase() + planet.slice(1);
}

// ============================================
// Full Year Forecast Calculation
// ============================================

/**
 * Calculate Power Months for an entire year
 *
 * @param natalPositions - Array of natal planet positions
 * @param year - Year to forecast (default: 2026)
 * @param confidenceMode - Whether birth time is uncertain
 * @returns YearForecast with all months scored
 */
export function calculatePowerMonths(
  natalPositions: PlanetPosition[],
  year: number = 2026,
  confidenceMode: boolean = false
): YearForecast {
  const months: MonthScore[] = [];

  // Calculate scores for each month and category
  for (let month = 1; month <= 12; month++) {
    const monthAspects = getAspectsForMonth(natalPositions, year, month);

    for (const category of ALL_CATEGORIES) {
      const score = calculateCategoryScore(monthAspects, category, natalPositions, year, month);
      const peakWindow = findPeakWindow(natalPositions, year, month, category);
      const dominantPlanet = findDominantPlanet(monthAspects, category);
      const keyAspects = getTopAspects(monthAspects, category, 3);

      // Generate interpretation
      const interpretation = getMonthInterpretation(category, score, month, dominantPlanet);

      months.push({
        month,
        year,
        category,
        score,
        peakWindow,
        dominantPlanet,
        keyAspects,
        interpretation,
        confidence: confidenceMode ? "medium" : "high", // Will be refined in confidence calculation
      });
    }
  }

  // Normalize scores within each category to spread across 15-95 range
  // This ensures visible differentiation between months
  for (const category of ALL_CATEGORIES) {
    const categoryMonths = months.filter((m) => m.category === category);
    const scores = categoryMonths.map((m) => m.score);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const range = maxScore - minScore;

    // If there's variation, normalize to 15-95 range
    // (Not 0-100 because even "quiet" months shouldn't feel completely dead)
    if (range > 0) {
      for (const month of categoryMonths) {
        const normalizedPosition = (month.score - minScore) / range;
        // Map to 15-95 range with slight curve to emphasize peaks
        month.score = Math.round(15 + (normalizedPosition ** 0.8) * 80);
      }
    } else {
      // If all scores are identical, set them to 50 (neutral)
      for (const month of categoryMonths) {
        month.score = 50;
      }
    }
  }

  // Find best months per category
  const bestMonths: Record<LifeCategory, number[]> = {
    love: [],
    career: [],
    growth: [],
    home: [],
  };

  for (const category of ALL_CATEGORIES) {
    const categoryMonths = months
      .filter((m) => m.category === category)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((m) => m.month);
    bestMonths[category] = categoryMonths;
  }

  // Find overall best months (average across categories)
  const monthAverages: { month: number; avgScore: number }[] = [];
  for (let month = 1; month <= 12; month++) {
    const monthScores = months.filter((m) => m.month === month);
    const avgScore = monthScores.reduce((sum, m) => sum + m.score, 0) / monthScores.length;
    monthAverages.push({ month, avgScore });
  }
  const overallPowerMonths = monthAverages
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 3)
    .map((m) => m.month);

  // Generate hash for caching
  const birthDataHash = generatePositionHash(natalPositions);

  return {
    year,
    birthDataHash,
    natalPositions,
    months,
    bestMonths,
    overallPowerMonths,
    calculatedAt: new Date().toISOString(),
    confidenceMode,
  };
}

/**
 * Generate a simple hash from natal positions for cache comparison
 */
function generatePositionHash(positions: PlanetPosition[]): string {
  const key = positions.map((p) => `${p.id}:${p.longitude.toFixed(2)}`).join("|");
  // Simple hash
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}

// ============================================
// Confidence-Based Calculation
// ============================================

/**
 * Calculate Power Months with confidence levels for unknown birth time
 * Runs calculations across multiple sampled birth times and aggregates results
 *
 * @param birthData - Birth data with unknown time
 * @param timeWindow - Approximate time window
 * @param year - Year to forecast
 * @returns YearForecast with confidence levels
 */
export function calculatePowerMonthsWithConfidence(
  birthData: BirthData,
  timeWindow: BirthTimeWindow,
  year: number = 2026
): YearForecast {
  // Generate sampled natal positions
  const sampledPositions = calculateSampledNatalPositions(birthData, timeWindow);

  if (sampledPositions.length === 0) {
    // Fallback: use noon
    const sampleData = { ...birthData, time: "12:00" };
    const natalPositions = sampledPositions[0] || [];
    return calculatePowerMonths(natalPositions, year, true);
  }

  // Calculate forecast for each sample
  const sampleForecasts = sampledPositions.map((positions) =>
    calculatePowerMonths(positions, year, true)
  );

  // Aggregate results with confidence
  const aggregatedMonths: MonthScore[] = [];

  for (let month = 1; month <= 12; month++) {
    for (const category of ALL_CATEGORIES) {
      // Gather scores from all samples
      const sampleScores = sampleForecasts.map((forecast) => {
        const monthScore = forecast.months.find(
          (m) => m.month === month && m.category === category
        );
        return monthScore?.score || 0;
      });

      // Calculate average and standard deviation
      const avgScore = sampleScores.reduce((a, b) => a + b, 0) / sampleScores.length;
      const variance =
        sampleScores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / sampleScores.length;
      const stdDev = Math.sqrt(variance);

      // Determine confidence based on consistency
      // Low standard deviation = high confidence
      let confidence: ConfidenceLevel = "low";
      const coeffOfVariation = avgScore > 0 ? stdDev / avgScore : 1;

      if (coeffOfVariation < 0.2) {
        confidence = "high";
      } else if (coeffOfVariation < 0.4) {
        confidence = "medium";
      }

      // Use median forecast for other fields
      const medianIdx = Math.floor(sampleForecasts.length / 2);
      const medianForecast = sampleForecasts[medianIdx];
      const medianMonth = medianForecast.months.find(
        (m) => m.month === month && m.category === category
      );

      if (medianMonth) {
        aggregatedMonths.push({
          ...medianMonth,
          score: Math.round(avgScore),
          confidence,
        });
      }
    }
  }

  // Find best months (same logic as non-confidence version)
  const bestMonths: Record<LifeCategory, number[]> = {
    love: [],
    career: [],
    growth: [],
    home: [],
  };

  for (const category of ALL_CATEGORIES) {
    const categoryMonths = aggregatedMonths
      .filter((m) => m.category === category)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((m) => m.month);
    bestMonths[category] = categoryMonths;
  }

  const monthAverages: { month: number; avgScore: number }[] = [];
  for (let month = 1; month <= 12; month++) {
    const monthScores = aggregatedMonths.filter((m) => m.month === month);
    const avgScore = monthScores.reduce((sum, m) => sum + m.score, 0) / monthScores.length;
    monthAverages.push({ month, avgScore });
  }
  const overallPowerMonths = monthAverages
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 3)
    .map((m) => m.month);

  // Use first sample's positions as reference (for hash)
  const natalPositions = sampledPositions[0];

  return {
    year,
    birthDataHash: generatePositionHash(natalPositions),
    natalPositions,
    months: aggregatedMonths,
    bestMonths,
    overallPowerMonths,
    calculatedAt: new Date().toISOString(),
    confidenceMode: true,
  };
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get MonthScore for a specific month and category
 */
export function getMonthScore(
  forecast: YearForecast,
  month: number,
  category: LifeCategory
): MonthScore | undefined {
  return forecast.months.find((m) => m.month === month && m.category === category);
}

/**
 * Get all scores for a category
 */
export function getCategoryScores(forecast: YearForecast, category: LifeCategory): MonthScore[] {
  return forecast.months.filter((m) => m.category === category);
}

/**
 * Get label for score level
 */
export function getScoreLabel(score: number): string {
  if (score >= 80) return "Exceptional";
  if (score >= 60) return "Very Strong";
  if (score >= 40) return "Good";
  if (score >= 20) return "Moderate";
  return "Quiet";
}

/**
 * Get description for confidence level
 */
export function getConfidenceDescription(confidence: ConfidenceLevel): string {
  switch (confidence) {
    case "high":
      return "High confidence - results consistent across time variations";
    case "medium":
      return "Medium confidence - some variation based on birth time";
    case "low":
      return "Low confidence - results vary significantly; consider providing birth time";
  }
}
