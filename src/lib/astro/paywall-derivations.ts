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
 * Calculate a "2026 Power Score" (0-100) based on power month scores
 * This gives users a single number to hook onto
 */
export function calculatePowerScore(forecast: YearForecast | null): number {
  if (!forecast) return 75; // Default fallback

  // Average the overall scores of power months
  const powerMonthScores = forecast.powerMonths.map(m => {
    const month = forecast.months.find(mo => mo.month === m);
    return month?.overall || 70;
  });

  const avg = powerMonthScores.reduce((a, b) => a + b, 0) / powerMonthScores.length;
  // Normalize to be between 70-95 for better presentation
  return Math.round(Math.min(95, Math.max(70, avg)));
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
