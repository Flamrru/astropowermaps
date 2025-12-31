/**
 * Power Places Calculator
 *
 * Calculates which major cities fall near beneficial planetary lines.
 * Used to show users their best destinations for different life themes.
 */

import { PlanetId, LineType, PlanetaryLine } from "./types";
import { WorldCity, MAJOR_CITIES, getCountryFlag } from "./cities";
import { getPlainSummary } from "./interpretations";

// ============================================
// Types
// ============================================

export type LifeCategory = "love" | "career" | "growth" | "home";

export interface PowerPlace {
  city: WorldCity;
  planet: PlanetId;
  lineType: LineType;
  distance: number; // km from line
  interpretation: string;
  flag: string;
  // Scoring fields
  score: number;        // Raw calculated score (0-200 typical range)
  stars: number;        // Normalized to 0-5 with 0.5 precision
  multiLineBonus: boolean; // True if city has multiple beneficial lines
}

export interface CategoryResult {
  category: LifeCategory;
  label: string;
  icon: string;
  description: string;
  places: PowerPlace[];
}

// ============================================
// Category Configuration
// ============================================

interface CategoryConfig {
  label: string;
  icon: string;
  description: string;
  planets: PlanetId[];
  lineTypes: LineType[];
  // Priority order for planets (first is most important)
  priority: PlanetId[];
}

const CATEGORY_CONFIG: Record<LifeCategory, CategoryConfig> = {
  love: {
    label: "Love & Romance",
    icon: "💕",
    description: "Best places for romance and relationships",
    planets: ["venus", "moon"],
    lineTypes: ["DC", "AC"], // Descendant and Ascendant are best for love
    priority: ["venus", "moon"],
  },
  career: {
    label: "Career & Success",
    icon: "💼",
    description: "Best places for professional growth",
    planets: ["sun", "jupiter", "saturn"],
    lineTypes: ["MC"], // Midheaven is the career line
    priority: ["jupiter", "sun", "saturn"],
  },
  growth: {
    label: "Personal Growth",
    icon: "🌟",
    description: "Best places for expansion and luck",
    planets: ["jupiter"],
    lineTypes: ["MC", "AC", "DC", "IC"],
    priority: ["jupiter"],
  },
  home: {
    label: "Home & Family",
    icon: "🏠",
    description: "Best places to settle down",
    planets: ["moon"],
    lineTypes: ["IC"], // Imum Coeli is the home line
    priority: ["moon"],
  },
};

// ============================================
// Scoring System
// ============================================

/**
 * Line type power multipliers
 * MC (Midheaven) is the most powerful angular point
 */
const LINE_TYPE_MULTIPLIERS: Record<LineType, number> = {
  MC: 1.25, // Midheaven - career/public image
  AC: 1.20, // Ascendant - personal energy/identity
  DC: 1.15, // Descendant - relationships
  IC: 1.10, // Imum Coeli - home/roots
};

/**
 * Planet relevance by category
 * High relevance = 1.5x, Medium = 1.2x, Low = 1.0x
 */
const PLANET_RELEVANCE: Record<LifeCategory, Record<PlanetId, number>> = {
  love: {
    venus: 1.5, moon: 1.5, neptune: 1.2,
    sun: 1.0, mars: 1.0, mercury: 1.0, jupiter: 1.0,
    saturn: 1.0, uranus: 1.0, pluto: 1.0,
  },
  career: {
    sun: 1.5, jupiter: 1.5, saturn: 1.2, mars: 1.2,
    venus: 1.0, moon: 1.0, mercury: 1.0,
    uranus: 1.0, neptune: 1.0, pluto: 1.0,
  },
  growth: {
    jupiter: 1.5, uranus: 1.5, neptune: 1.2, pluto: 1.2,
    sun: 1.0, venus: 1.0, moon: 1.0, mars: 1.0,
    mercury: 1.0, saturn: 1.0,
  },
  home: {
    moon: 1.5, saturn: 1.5, venus: 1.2,
    sun: 1.0, mars: 1.0, mercury: 1.0, jupiter: 1.0,
    uranus: 1.0, neptune: 1.0, pluto: 1.0,
  },
};

/**
 * Calculate proximity score based on distance from line
 * Closer = higher score. More granular at close distances for better differentiation.
 */
function getProximityScore(distance: number): number {
  // Very close cities get premium scores
  if (distance < 30) return 100;  // Exceptionally close
  if (distance < 75) return 90;   // Very close
  if (distance < 150) return 70;  // Close
  if (distance < 250) return 50;  // Moderate
  if (distance < 350) return 30;  // Far
  return 20; // 350-400 km - Very far
}

/**
 * Convert raw score to star rating (3-5 with 0.5 precision)
 *
 * IMPORTANT: All cities shown are ON beneficial planetary lines!
 * The minimum is 3 stars because being on ANY line is already good.
 * Stars represent "intensity" not "quality" - even 3-star cities are beneficial.
 *
 * Score range (based on formula):
 * - Min: ~22 (400km + IC line + low relevance) → 3.0 stars
 * - Max: ~200 (< 30km + MC line + high relevance + multi-line) → 5.0 stars
 *
 * Example mappings:
 * - 5.0 stars: < 30km, strong line/planet match
 * - 4.0 stars: ~150km, moderate match
 * - 3.0 stars: 350-400km, still beneficial but less intense
 */
function scoreToStars(score: number): number {
  // Map score to 3-5 star range (all shown cities are beneficial)
  const minStars = 3;
  const maxStars = 5;
  const minScore = 22;  // Worst case: 20 * 1.10 * 1.0
  const maxScore = 200; // Best case: (100 * 1.25 * 1.5) + 15

  // Normalize to 0-1 range, then scale to 3-5 stars
  const normalized = Math.min(Math.max((score - minScore) / (maxScore - minScore), 0), 1);
  const stars = minStars + normalized * (maxStars - minStars);

  // Round to nearest 0.5
  return Math.round(stars * 2) / 2;
}

/**
 * Calculate city score based on multiple factors
 * Formula: ProximityScore × LineTypeMultiplier × PlanetRelevance
 */
function calculateCityScore(
  distance: number,
  lineType: LineType,
  planet: PlanetId,
  category: LifeCategory,
  hasMultipleLines: boolean
): { score: number; stars: number } {
  // Factor 1: Proximity (0-100)
  const proximityScore = getProximityScore(distance);

  // Factor 2: Line type multiplier (1.10-1.25)
  const lineMultiplier = LINE_TYPE_MULTIPLIERS[lineType];

  // Factor 3: Planet relevance (1.0-1.5)
  const planetRelevance = PLANET_RELEVANCE[category][planet] || 1.0;

  // Calculate raw score
  let rawScore = proximityScore * lineMultiplier * planetRelevance;

  // Factor 4: Multi-line bonus
  if (hasMultipleLines) {
    rawScore += 15; // Bonus for having multiple beneficial lines nearby
  }

  // Convert to stars
  const stars = scoreToStars(rawScore);

  return { score: Math.round(rawScore), stars };
}

// ============================================
// Geo Calculations
// ============================================

/**
 * Calculate the Haversine distance between two points in kilometers
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Find the minimum distance from a point to a polyline
 * Uses perpendicular distance to line segments
 */
function pointToPolylineDistance(
  point: { lat: number; lng: number },
  polyline: [number, number][]
): number {
  let minDistance = Infinity;

  for (let i = 0; i < polyline.length - 1; i++) {
    const [lng1, lat1] = polyline[i];
    const [lng2, lat2] = polyline[i + 1];

    // Calculate distance to this segment
    const distance = pointToSegmentDistance(
      point.lat,
      point.lng,
      lat1,
      lng1,
      lat2,
      lng2
    );

    if (distance < minDistance) {
      minDistance = distance;
    }
  }

  return minDistance;
}

/**
 * Calculate perpendicular distance from point to line segment
 */
function pointToSegmentDistance(
  pLat: number,
  pLng: number,
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  // Vector from point 1 to point 2
  const dx = lng2 - lng1;
  const dy = lat2 - lat1;

  // If the segment is actually a point
  if (dx === 0 && dy === 0) {
    return haversineDistance(pLat, pLng, lat1, lng1);
  }

  // Calculate the t that minimizes the distance
  const t = Math.max(
    0,
    Math.min(1, ((pLng - lng1) * dx + (pLat - lat1) * dy) / (dx * dx + dy * dy))
  );

  // Find the closest point on the segment
  const closestLng = lng1 + t * dx;
  const closestLat = lat1 + t * dy;

  return haversineDistance(pLat, pLng, closestLat, closestLng);
}

// ============================================
// Power Places Calculation
// ============================================

/**
 * Calculate power places for all categories
 */
export function calculateAllPowerPlaces(
  lines: PlanetaryLine[],
  maxDistance: number = 400 // km
): Record<LifeCategory, CategoryResult> {
  const results: Record<LifeCategory, CategoryResult> = {
    love: calculateCategoryPlaces("love", lines, maxDistance),
    career: calculateCategoryPlaces("career", lines, maxDistance),
    growth: calculateCategoryPlaces("growth", lines, maxDistance),
    home: calculateCategoryPlaces("home", lines, maxDistance),
  };

  return results;
}

/**
 * Calculate power places for a specific category
 * Uses multi-factor scoring system for city ranking
 */
export function calculateCategoryPlaces(
  category: LifeCategory,
  lines: PlanetaryLine[],
  maxDistance: number = 400
): CategoryResult {
  const config = CATEGORY_CONFIG[category];

  // Filter lines by category configuration
  const relevantLines = lines.filter(
    (line) =>
      config.planets.includes(line.planet) &&
      config.lineTypes.includes(line.lineType)
  );

  // First pass: Collect all city-line matches and count lines per city
  interface CityMatch {
    city: WorldCity;
    planet: PlanetId;
    lineType: LineType;
    distance: number;
  }

  const allMatches: CityMatch[] = [];
  const cityLineCount: Map<string, number> = new Map();

  for (const city of MAJOR_CITIES) {
    for (const line of relevantLines) {
      const distance = pointToPolylineDistance(
        { lat: city.lat, lng: city.lng },
        line.coordinates
      );

      if (distance <= maxDistance) {
        allMatches.push({
          city,
          planet: line.planet,
          lineType: line.lineType,
          distance: Math.round(distance),
        });

        // Track how many lines pass near this city
        const count = cityLineCount.get(city.name) || 0;
        cityLineCount.set(city.name, count + 1);
      }
    }
  }

  // Second pass: Create scored places
  const places: PowerPlace[] = allMatches.map((match) => {
    const hasMultipleLines = (cityLineCount.get(match.city.name) || 0) >= 2;
    const { score, stars } = calculateCityScore(
      match.distance,
      match.lineType,
      match.planet,
      category,
      hasMultipleLines
    );

    return {
      city: match.city,
      planet: match.planet,
      lineType: match.lineType,
      distance: match.distance,
      interpretation: getPlainSummary(match.planet, match.lineType),
      flag: getCountryFlag(match.city.countryCode),
      score,
      stars,
      multiLineBonus: hasMultipleLines,
    };
  });

  // Sort by score (highest first)
  places.sort((a, b) => b.score - a.score);

  // Remove duplicate cities (keep only highest-scoring line per city)
  const uniquePlaces: PowerPlace[] = [];
  const seenCities = new Set<string>();

  for (const place of places) {
    if (!seenCities.has(place.city.name)) {
      seenCities.add(place.city.name);
      uniquePlaces.push(place);
    }
  }

  return {
    category,
    label: config.label,
    icon: config.icon,
    description: config.description,
    places: uniquePlaces.slice(0, 25), // Top 25 places per category
  };
}

/**
 * Get category configuration
 */
export function getCategoryConfig(category: LifeCategory): CategoryConfig {
  return CATEGORY_CONFIG[category];
}

/**
 * Get all category IDs
 */
export function getAllCategories(): LifeCategory[] {
  return Object.keys(CATEGORY_CONFIG) as LifeCategory[];
}

// ============================================
// Timed Power Places (for 2026 Forecast)
// ============================================

import { YearForecast, TimedPowerPlace, ConfidenceLevel, getMonthName } from "./transit-types";

/**
 * Calculate best months to visit each power place
 * Uses formula: TimedPlaceScore = PlaceScore × MonthScore
 */
export function enhancePlacesWithTiming(
  places: PowerPlace[],
  forecast: YearForecast,
  category: LifeCategory
): TimedPowerPlace[] {
  // Get months for this category
  const categoryMonths = forecast.months.filter((m) => m.category === category);
  const bestMonthsForCategory = forecast.bestMonths[category] || [];

  return places.map((place) => {
    // Calculate place score (0-100 based on distance, closer = higher)
    const maxDistance = 400;
    const placeScore = Math.max(0, 100 - (place.distance / maxDistance) * 50);

    // Find best months for this place (PlaceScore × MonthScore)
    const monthScores = categoryMonths.map((month) => ({
      month: month.month,
      score: month.score,
      combinedScore: (placeScore / 100) * (month.score / 100) * 100,
      peakWindow: month.peakWindow,
    }));

    // Sort by combined score and take top 3
    monthScores.sort((a, b) => b.combinedScore - a.combinedScore);
    const bestMonths = monthScores.slice(0, 3).map((m) => m.month);
    const topMonth = monthScores[0];

    // Determine confidence based on forecast confidence mode
    let confidence: ConfidenceLevel = "high";
    if (forecast.confidenceMode) {
      // Find the average confidence of the best months
      const monthConfidences = bestMonths.map((m) => {
        const monthData = categoryMonths.find((cm) => cm.month === m);
        return monthData?.confidence || "medium";
      });
      // Use the most common confidence level
      const highCount = monthConfidences.filter((c) => c === "high").length;
      const mediumCount = monthConfidences.filter((c) => c === "medium").length;
      if (highCount >= 2) confidence = "high";
      else if (mediumCount >= 2 || highCount >= 1) confidence = "medium";
      else confidence = "low";
    }

    // Generate recommendation text
    const monthNames = bestMonths.slice(0, 2).map((m) => getMonthName(m));
    const recommendation =
      bestMonths.length > 1
        ? `Visit ${place.city.name} in ${monthNames.join(" or ")} 2026`
        : `Visit ${place.city.name} in ${monthNames[0]} 2026`;

    return {
      ...place,
      timing: {
        bestMonths,
        peakWindow: topMonth?.peakWindow || null,
        recommendation,
        combinedScore: Math.round(topMonth?.combinedScore || 0),
      },
      confidence,
    };
  });
}

/**
 * Get timed places for all categories
 */
export function getTimedPowerPlaces(
  lines: PlanetaryLine[],
  forecast: YearForecast
): Record<LifeCategory, TimedPowerPlace[]> {
  const allPlaces = calculateAllPowerPlaces(lines);

  return {
    love: enhancePlacesWithTiming(allPlaces.love.places, forecast, "love"),
    career: enhancePlacesWithTiming(allPlaces.career.places, forecast, "career"),
    growth: enhancePlacesWithTiming(allPlaces.growth.places, forecast, "growth"),
    home: enhancePlacesWithTiming(allPlaces.home.places, forecast, "home"),
  };
}
