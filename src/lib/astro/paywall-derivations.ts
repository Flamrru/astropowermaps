/**
 * Paywall Data Derivations
 *
 * Utility functions to derive display data for the paywall
 * from the calculated forecast and astro data.
 */

import { YearForecast } from "@/lib/reveal-state";

// Month names for display
export const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

/**
 * Calculate a "2026 Power Score" (50-100) based on all monthly scores
 *
 * IMPORTANT: This must match the formula in report-derivations.ts
 * so the score shown in paywall matches what user sees after payment.
 *
 * Formula: 50 + (yearlyAverage * 0.5) + bonuses for standout months
 */
export function calculatePowerScore(forecast: YearForecast | null): number {
  if (!forecast) return 75; // Default fallback

  // Step 1: Get average score across all 12 months
  const monthScores = forecast.months.map(m => m.overall);
  const yearlyAverage = monthScores.reduce((a, b) => a + b, 0) / monthScores.length;

  // Step 2: Apply the same curve as report-derivations.ts
  // Base of 50 + scaled contribution from monthly average
  let score = 50 + (yearlyAverage * 0.5);

  // Step 3: Bonus for standout power months
  const sortedMonths = [...monthScores].sort((a, b) => b - a);
  const topThreeAvg = (sortedMonths[0] + sortedMonths[1] + sortedMonths[2]) / 3;

  if (topThreeAvg > yearlyAverage + 10) {
    score += 5; // Bonus for having peak months
  }

  // Step 4: Ensure 50-100 range (matching report-derivations.ts)
  return Math.min(100, Math.max(50, Math.round(score)));
}

/**
 * Get the best month for a specific category
 */
export function getBestMonthFor(
  forecast: YearForecast | null,
  category: "love" | "career" | "growth" | "home"
): { month: number; monthName: string; score: number } {
  if (!forecast) {
    return { month: 3, monthName: "March", score: 85 };
  }

  const sorted = [...forecast.months].sort((a, b) =>
    b.scores[category] - a.scores[category]
  );

  const best = sorted[0];
  return {
    month: best.month,
    monthName: MONTH_NAMES[best.month - 1],
    score: best.scores[category],
  };
}

/**
 * Get all months ranked by overall score
 */
export function getAllMonthsRanked(
  forecast: YearForecast | null
): { month: number; monthName: string; score: number; isPower: boolean; isAvoid: boolean }[] {
  if (!forecast) {
    return MONTH_NAMES.map((name, i) => ({
      month: i + 1,
      monthName: name,
      score: 50 + Math.floor(Math.random() * 40),
      isPower: [3, 7, 10].includes(i + 1),
      isAvoid: [2, 6, 11].includes(i + 1),
    }));
  }

  return [...forecast.months]
    .sort((a, b) => b.overall - a.overall)
    .map(m => ({
      month: m.month,
      monthName: MONTH_NAMES[m.month - 1],
      score: m.overall,
      isPower: forecast.powerMonths.includes(m.month),
      isAvoid: forecast.avoidMonths.includes(m.month),
    }));
}

/**
 * Get the lowest energy month (first avoid month)
 */
export function getLowestEnergyMonth(
  forecast: YearForecast | null
): { month: number; monthName: string } {
  if (!forecast || !forecast.avoidMonths.length) {
    return { month: 6, monthName: "June" };
  }

  const lowest = forecast.avoidMonths[0];
  return {
    month: lowest,
    monthName: MONTH_NAMES[lowest - 1],
  };
}

/**
 * Calculate days until 2026 (or days into 2026 if already there)
 */
export function calculateDaysUntil2026(): number {
  const now = new Date();
  const year2026 = new Date(2026, 0, 1); // Jan 1, 2026

  if (now >= year2026) {
    // Already in 2026 or later
    return 0;
  }

  const diffTime = year2026.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Mock power cities data (in production, derive from astroData)
 * Shows top cities based on planetary line intersections
 */
export function getPowerCities(): { name: string; distance: string; category: string }[] {
  return [
    { name: "Barcelona", distance: "2,847 km", category: "Venus + Jupiter" },
    { name: "Tokyo", distance: "9,312 km", category: "Sun + Mercury" },
    { name: "Cape Town", distance: "8,491 km", category: "Moon + Venus" },
  ];
}

/**
 * Mock draining locations (Saturn + Pluto lines)
 */
export function getDrainingLocations(): string[] {
  return ["Moscow", "Lima", "Jakarta"];
}
