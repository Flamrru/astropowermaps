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
 */
export function calculateCategoryPlaces(
  category: LifeCategory,
  lines: PlanetaryLine[],
  maxDistance: number = 400
): CategoryResult {
  const config = CATEGORY_CONFIG[category];
  const places: PowerPlace[] = [];

  // Filter lines by category configuration
  const relevantLines = lines.filter(
    (line) =>
      config.planets.includes(line.planet) &&
      config.lineTypes.includes(line.lineType)
  );

  // Check each city against relevant lines
  for (const city of MAJOR_CITIES) {
    for (const line of relevantLines) {
      const distance = pointToPolylineDistance(
        { lat: city.lat, lng: city.lng },
        line.coordinates
      );

      if (distance <= maxDistance) {
        places.push({
          city,
          planet: line.planet,
          lineType: line.lineType,
          distance: Math.round(distance),
          interpretation: getPlainSummary(line.planet, line.lineType),
          flag: getCountryFlag(city.countryCode),
        });
      }
    }
  }

  // Sort by:
  // 1. Priority planet order (more beneficial planets first)
  // 2. Distance (closer is better)
  places.sort((a, b) => {
    const priorityA = config.priority.indexOf(a.planet);
    const priorityB = config.priority.indexOf(b.planet);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return a.distance - b.distance;
  });

  // Remove duplicate cities (keep only closest line per city)
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
    places: uniquePlaces.slice(0, 5), // Top 5 places per category
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
