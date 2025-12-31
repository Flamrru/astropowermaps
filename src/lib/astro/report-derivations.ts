/**
 * Report 2026 Data Derivations
 *
 * Wires together Power Months and Power Places calculations to produce
 * the final Report 2026 data structure displayed to paid users.
 */

import { PlanetaryLine, PlanetId } from "./types";
import { YearForecast, MonthScore, PlanetaryAspect, getMonthName, ASPECTS } from "./transit-types";
import { PowerPlace, calculateAllPowerPlaces, LifeCategory } from "./power-places";
import { WorldCity } from "./cities";
import { getInterpretation } from "./interpretations";
import { MAJOR_CITIES, getCountryFlag } from "./cities";

// ============================================
// Types
// ============================================

export interface MonthInsight {
  month: number;
  monthName: string;
  score: number;
  dominantPlanet: PlanetId;
  keyAspects: PlanetaryAspect[];
  why: string;
  peakWindow: { startDate: string; endDate: string } | null;
}

export interface CityInsight {
  city: WorldCity;
  planet: PlanetId;
  lineType: "MC" | "IC" | "AC" | "DC";
  distance: number;
  flag: string;
  why: string;
  category: LifeCategory;
}

export interface Report2026Data {
  // Overall score (0-100)
  powerScore: number;
  powerScoreLabel: string;

  // #1 insights
  powerMonth: MonthInsight;
  powerCity: CityInsight;

  // Category-specific best months
  bestForMoney: MonthInsight;
  bestForLove: MonthInsight;
  bestForGrowth: MonthInsight;

  // Cautions
  avoidMonths: MonthInsight[];
  lowestMonth: MonthInsight;
  drainingCities: CityInsight[];

  // All months ranked (for optional detailed view)
  allMonthsRanked: { month: number; avgScore: number; label: string }[];
}

// ============================================
// Power Score Calculation
// ============================================

/**
 * Calculate overall 2026 Power Score (50-100)
 *
 * Optimistic scoring that uses ALL monthly planetary activity:
 * 1. Calculate average of all 12 months (already includes all transits)
 * 2. Apply generous curve that pushes toward higher scores
 * 3. Add benefic bonus for Jupiter/Venus highlights
 * 4. Floor at 50 - no one gets a "bad" year
 *
 * This ensures most people get 65-85, with exceptional charts hitting 90+
 */
function calculatePowerScore(forecast: YearForecast): { score: number; label: string } {
  // Step 1: Get average score across all 12 months
  // Monthly scores are 15-95, averaging typically 45-65
  const monthAverages: number[] = [];

  for (let m = 1; m <= 12; m++) {
    const monthScores = forecast.months.filter((ms) => ms.month === m);
    const avg = monthScores.reduce((sum, ms) => sum + ms.score, 0) / monthScores.length;
    monthAverages.push(avg);
  }

  const yearlyAverage = monthAverages.reduce((a, b) => a + b, 0) / 12;

  // Step 2: Apply generous curve
  // Base of 50 + scaled contribution from monthly average
  // yearlyAverage of 50 -> score of 75
  // yearlyAverage of 70 -> score of 87
  // yearlyAverage of 30 -> score of 63
  let score = 50 + (yearlyAverage * 0.5);

  // Step 3: Bonus for standout months (top 3 months boost)
  const sortedMonths = [...monthAverages].sort((a, b) => b - a);
  const topThreeAvg = (sortedMonths[0] + sortedMonths[1] + sortedMonths[2]) / 3;

  // If top months are significantly above average, add bonus
  if (topThreeAvg > yearlyAverage + 10) {
    score += 5; // Bonus for having peak months
  }

  // Step 4: Ensure 50-100 range
  // NOTE: Benefic bonus removed to match paywall-derivations.ts formula exactly
  score = Math.min(100, Math.max(50, Math.round(score)));

  // Labels (all positive!)
  let label: string;
  if (score >= 85) label = "Exceptional Year";
  else if (score >= 70) label = "Powerful Year";
  else if (score >= 55) label = "Strong Year";
  else label = "Foundation Year";

  return { score, label };
}

// ============================================
// Month Insight Helpers
// ============================================

/**
 * Generate a "why" explanation for a month's score
 */
function generateMonthWhy(monthScore: MonthScore): string {
  const { dominantPlanet, keyAspects, category } = monthScore;

  if (keyAspects.length === 0) {
    return `${capitalize(dominantPlanet)} energy is quietly supportive this month.`;
  }

  // Find the most impactful aspect
  const topAspect = keyAspects[0];
  const aspectName = topAspect.aspectType;
  const aspectNature = ASPECTS[aspectName].nature;

  // Build explanation based on aspect type
  let explanation: string;

  if (aspectNature === "harmonious") {
    explanation = `${capitalize(topAspect.transitPlanet)} forms a flowing ${aspectName} with your natal ${capitalize(topAspect.natalPlanet)}`;
  } else if (aspectNature === "major") {
    explanation = `Powerful ${capitalize(topAspect.transitPlanet)}-${capitalize(topAspect.natalPlanet)} conjunction activates`;
  } else if (aspectNature === "challenging") {
    explanation = `${capitalize(topAspect.transitPlanet)} squares your ${capitalize(topAspect.natalPlanet)}, creating productive tension`;
  } else {
    explanation = `${capitalize(topAspect.transitPlanet)} opposes your ${capitalize(topAspect.natalPlanet)}, bringing awareness`;
  }

  // Add category context
  const categoryContext: Record<LifeCategory, string> = {
    love: "for romance and connection",
    career: "for professional advancement",
    growth: "for expansion and opportunity",
    home: "for domestic harmony",
  };

  return `${explanation} ${categoryContext[category]}.`;
}

/**
 * Generate a "why" explanation for a low-scoring month
 */
function generateAvoidWhy(monthScore: MonthScore): string {
  const { keyAspects, month } = monthScore;

  // Check for challenging aspects
  const challengingAspects = keyAspects.filter(
    (a) => ASPECTS[a.aspectType].nature === "challenging"
  );

  if (challengingAspects.length > 0) {
    const aspect = challengingAspects[0];
    return `${capitalize(aspect.transitPlanet)} ${aspect.aspectType}s your ${capitalize(aspect.natalPlanet)} - energy may feel blocked or frustrated.`;
  }

  // Check for Saturn involvement (always challenging)
  const saturnAspect = keyAspects.find(
    (a) => a.transitPlanet === "saturn" || a.natalPlanet === "saturn"
  );
  if (saturnAspect) {
    return `Saturn's influence brings delays and extra responsibilities.`;
  }

  // Mercury retrograde check (rough estimate - 3 times a year)
  const mercuryRetroMonths = [1, 5, 9]; // Approximate 2026 retrogrades
  if (mercuryRetroMonths.includes(month)) {
    return `Communication snags likely - Mercury retrograde energy.`;
  }

  return `Lower cosmic support - save major decisions for stronger months.`;
}

/**
 * Create a MonthInsight from a MonthScore
 */
function toMonthInsight(monthScore: MonthScore, isAvoid: boolean = false): MonthInsight {
  return {
    month: monthScore.month,
    monthName: getMonthName(monthScore.month),
    score: monthScore.score,
    dominantPlanet: monthScore.dominantPlanet,
    keyAspects: monthScore.keyAspects,
    why: isAvoid ? generateAvoidWhy(monthScore) : generateMonthWhy(monthScore),
    peakWindow: monthScore.peakWindow
      ? { startDate: monthScore.peakWindow.startDate, endDate: monthScore.peakWindow.endDate }
      : null,
  };
}

// ============================================
// City Insight Helpers
// ============================================

/**
 * Create a CityInsight from a PowerPlace
 */
function toCityInsight(place: PowerPlace, category: LifeCategory): CityInsight {
  const interp = getInterpretation(place.planet, place.lineType);

  return {
    city: place.city,
    planet: place.planet,
    lineType: place.lineType,
    distance: place.distance,
    flag: place.flag,
    why: interp.plainSummary,
    category,
  };
}

// ============================================
// Main Calculation Function
// ============================================

/**
 * Calculate the full Report 2026 data from forecast and lines
 */
export function calculateReport2026Data(
  forecast: YearForecast,
  lines: PlanetaryLine[]
): Report2026Data {
  // Calculate power score
  const { score: powerScore, label: powerScoreLabel } = calculatePowerScore(forecast);

  // Get all power places
  const allPlaces = calculateAllPowerPlaces(lines);

  // ─────────────────────────────────────────────────────────────────
  // #1 Power Month (best month across all categories)
  // ─────────────────────────────────────────────────────────────────

  // Calculate average score per month
  const monthAverages = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const monthScores = forecast.months.filter((ms) => ms.month === m);
    const avg = monthScores.reduce((sum, ms) => sum + ms.score, 0) / monthScores.length;
    return { month: m, avgScore: avg };
  }).sort((a, b) => b.avgScore - a.avgScore);

  const bestMonthNum = monthAverages[0].month;
  const bestMonthAvgScore = Math.round(monthAverages[0].avgScore);

  // Get the highest-scoring category for this month to use for interpretation
  const bestMonthScores = forecast.months
    .filter((ms) => ms.month === bestMonthNum)
    .sort((a, b) => b.score - a.score);

  // Use average score (consistent with Year at a Glance grid) but keep the best category's interpretation
  const powerMonthInsight = toMonthInsight(bestMonthScores[0]);
  const powerMonth: MonthInsight = {
    ...powerMonthInsight,
    score: bestMonthAvgScore, // Use average, not single-category score
  };

  // ─────────────────────────────────────────────────────────────────
  // #1 Power City (best city across all categories)
  // ─────────────────────────────────────────────────────────────────

  // Find the closest city to any beneficial line
  let bestCity: CityInsight | null = null;
  let bestCityDistance = Infinity;

  for (const category of ["love", "career", "growth", "home"] as LifeCategory[]) {
    const places = allPlaces[category].places;
    for (const place of places) {
      // Prioritize Venus/Jupiter lines as most beneficial
      const isBenefic = ["venus", "jupiter", "sun"].includes(place.planet);
      const effectiveDistance = isBenefic ? place.distance * 0.7 : place.distance;

      if (effectiveDistance < bestCityDistance) {
        bestCityDistance = effectiveDistance;
        bestCity = toCityInsight(place, category);
      }
    }
  }

  // Fallback if no places found
  if (!bestCity) {
    bestCity = {
      city: { name: "Barcelona", country: "Spain", countryCode: "ES", lat: 41.3851, lng: 2.1734, region: "europe" },
      planet: "venus",
      lineType: "DC",
      distance: 200,
      flag: "🇪🇸",
      why: "A beautiful destination for new experiences.",
      category: "love",
    };
  }

  const powerCity = bestCity;

  // ─────────────────────────────────────────────────────────────────
  // Category-Specific Best Months
  // ─────────────────────────────────────────────────────────────────

  const getBestMonthForCategory = (category: LifeCategory): MonthInsight => {
    const categoryMonths = forecast.months
      .filter((ms) => ms.category === category)
      .sort((a, b) => b.score - a.score);
    return toMonthInsight(categoryMonths[0]);
  };

  const bestForMoney = getBestMonthForCategory("career");
  const bestForLove = getBestMonthForCategory("love");
  const bestForGrowth = getBestMonthForCategory("growth");

  // ─────────────────────────────────────────────────────────────────
  // Cautions: Avoid Months
  // ─────────────────────────────────────────────────────────────────

  // Find months with lowest average scores
  const lowestMonths = [...monthAverages].sort((a, b) => a.avgScore - b.avgScore);

  // Get 2-3 months to avoid
  const avoidMonths: MonthInsight[] = [];
  for (let i = 0; i < Math.min(3, lowestMonths.length); i++) {
    const m = lowestMonths[i].month;
    // Only include if score is meaningfully low (below 50)
    if (lowestMonths[i].avgScore < 50) {
      const monthScores = forecast.months.filter((ms) => ms.month === m);
      const worstCategory = monthScores.sort((a, b) => a.score - b.score)[0];
      avoidMonths.push(toMonthInsight(worstCategory, true));
    }
  }

  // Lowest month specifically
  const lowestMonthNum = lowestMonths[0].month;
  const lowestMonthScores = forecast.months.filter((ms) => ms.month === lowestMonthNum);
  const lowestMonth = toMonthInsight(lowestMonthScores.sort((a, b) => a.score - b.score)[0], true);

  // ─────────────────────────────────────────────────────────────────
  // Cautions: Draining Locations (Saturn/Pluto lines)
  // ─────────────────────────────────────────────────────────────────

  const drainingCities = getDrainingLocations(lines);

  // ─────────────────────────────────────────────────────────────────
  // All Months Ranked
  // ─────────────────────────────────────────────────────────────────

  const allMonthsRanked = monthAverages.map((m) => ({
    month: m.month,
    avgScore: Math.round(m.avgScore),
    label: getScoreLabel(m.avgScore),
  }));

  return {
    powerScore,
    powerScoreLabel,
    powerMonth,
    powerCity,
    bestForMoney,
    bestForLove,
    bestForGrowth,
    avoidMonths,
    lowestMonth,
    drainingCities,
    allMonthsRanked,
  };
}

// ============================================
// Draining Locations
// ============================================

/**
 * Find cities near Saturn or Pluto lines (challenging energy)
 * Returns up to 3 draining locations
 */
export function getDrainingLocations(lines: PlanetaryLine[], maxDistance: number = 400): CityInsight[] {
  // Using MAJOR_CITIES and getCountryFlag imported at top of file

  // Filter to Saturn and Pluto lines only
  const drainingLines = lines.filter(
    (line) => line.planet === "saturn" || line.planet === "pluto"
  );

  if (drainingLines.length === 0) return [];

  // Find cities near these lines
  const drainingPlaces: CityInsight[] = [];
  const seenCities = new Set<string>();

  for (const line of drainingLines) {
    for (const city of MAJOR_CITIES as WorldCity[]) {
      if (seenCities.has(city.name)) continue;

      const distance = pointToPolylineDistanceSimple(
        city.lat,
        city.lng,
        line.coordinates
      );

      if (distance <= maxDistance) {
        seenCities.add(city.name);

        // Generate warning text
        let warning: string;

        if (line.planet === "saturn") {
          warning = "May feel heavy or restrictive - extra effort required here.";
        } else {
          warning = "Intense transformation zone - proceed with awareness.";
        }

        drainingPlaces.push({
          city,
          planet: line.planet,
          lineType: line.lineType,
          distance: Math.round(distance),
          flag: getCountryFlag(city.countryCode),
          why: warning,
          category: "career", // Saturn/Pluto primarily affect career/growth
        });
      }
    }
  }

  // Sort by distance and return top 3
  drainingPlaces.sort((a, b) => a.distance - b.distance);
  return drainingPlaces.slice(0, 3);
}

/**
 * Simple point-to-polyline distance (using haversine)
 */
function pointToPolylineDistanceSimple(
  lat: number,
  lng: number,
  coordinates: [number, number][]
): number {
  let minDist = Infinity;

  for (const [coordLng, coordLat] of coordinates) {
    const dist = haversineDistance(lat, lng, coordLat, coordLng);
    if (dist < minDist) minDist = dist;
  }

  return minDist;
}

/**
 * Haversine distance in km
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ============================================
// Utility Functions
// ============================================

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Exceptional";
  if (score >= 65) return "Strong";
  if (score >= 50) return "Good";
  if (score >= 35) return "Moderate";
  return "Quiet";
}
