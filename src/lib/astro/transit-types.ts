/**
 * Transit & Power Forecast Types
 *
 * Types for calculating planetary transits, Power Months scoring,
 * and confidence-based results when birth time is unknown.
 */

import { PlanetId, PlanetPosition, BirthTimeWindow } from "./types";
import { LifeCategory, PowerPlace } from "./power-places";

// Re-export BirthTimeWindow for convenience
export type { BirthTimeWindow };

// ============================================
// Birth Time Handling
// ============================================

/**
 * Time ranges for each window (local time)
 */
export const TIME_WINDOW_RANGES: Record<BirthTimeWindow, { start: number; end: number }> = {
  morning: { start: 6, end: 12 },     // 6:00 AM - 12:00 PM
  afternoon: { start: 12, end: 18 },  // 12:00 PM - 6:00 PM
  evening: { start: 18, end: 24 },    // 6:00 PM - 12:00 AM
  unknown: { start: 0, end: 24 },     // Full day sampling
};

/**
 * Confidence level for results calculated with time uncertainty
 */
export type ConfidenceLevel = "high" | "medium" | "low";

/**
 * Confidence thresholds for consistency across sampled times
 * - High: Result appears in 80%+ of samples
 * - Medium: Result appears in 50-79% of samples
 * - Low: Result appears in 25-49% of samples
 */
export const CONFIDENCE_THRESHOLDS = {
  high: 0.8,
  medium: 0.5,
  low: 0.25,
};

// ============================================
// Transit Positions
// ============================================

/**
 * Planetary position on a specific date (for transits)
 */
export interface TransitPosition extends PlanetPosition {
  date: string; // ISO date "2026-01-15"
}

/**
 * Cache of all transit positions for a year
 * Key is ISO date string, value is array of planet positions
 */
export type TransitCache = Map<string, TransitPosition[]>;

// ============================================
// Aspects
// ============================================

/**
 * Types of planetary aspects
 *
 * Major aspects (traditional, stronger influence):
 * - Conjunction, Sextile, Square, Trine, Opposition
 *
 * Minor aspects (subtler influence, added for nuanced readings):
 * - Semi-sextile, Quincunx, Semi-square, Sesquiquadrate
 */
export type AspectType =
  // Major Aspects
  | "conjunction"     // 0° - Powerful union, new beginnings
  | "sextile"         // 60° - Opportunity, easy flow
  | "square"          // 90° - Tension, action required
  | "trine"           // 120° - Harmony, natural flow
  | "opposition"      // 180° - Awareness, balance needed
  // Minor Aspects
  | "semi-sextile"    // 30° - Slight friction, adjustment between neighbors
  | "quincunx"        // 150° - Disconnect requiring adaptation (also "inconjunct")
  | "semi-square"     // 45° - Minor irritation, subtle tension
  | "sesquiquadrate"; // 135° - Hidden friction, delayed challenges

/**
 * Configuration for each aspect type
 */
export interface AspectConfig {
  degrees: number;      // Target angle (0, 30, 45, 60, 90, 120, 135, 150, 180)
  orb: number;          // Allowed deviation in degrees
  power: number;        // Base influence score (1-10)
  nature:
    | "major"             // Conjunction - neutral, depends on planets
    | "harmonious"        // Sextile, Trine - easy flow
    | "challenging"       // Square - friction requiring action
    | "awareness"         // Opposition - polarity, balance needed
    | "minor-harmonious"  // Semi-sextile - subtle positive
    | "adjustment"        // Quincunx - requires adaptation
    | "minor-challenging"; // Semi-square, Sesquiquadrate - subtle friction
}

/**
 * Aspect configurations with orbs and power ratings
 *
 * Orbs follow standard Western astrology practice:
 * - Major aspects: 6-8° orb (stronger influence)
 * - Minor aspects: 2-3° orb (subtler, requires tighter angle)
 */
export const ASPECTS: Record<AspectType, AspectConfig> = {
  // Major Aspects
  conjunction: { degrees: 0, orb: 8, power: 10, nature: "major" },
  sextile: { degrees: 60, orb: 4, power: 6, nature: "harmonious" },
  square: { degrees: 90, orb: 6, power: 8, nature: "challenging" },
  trine: { degrees: 120, orb: 6, power: 9, nature: "harmonious" },
  opposition: { degrees: 180, orb: 8, power: 9, nature: "awareness" },
  // Minor Aspects
  "semi-sextile": { degrees: 30, orb: 2, power: 3, nature: "minor-harmonious" },
  quincunx: { degrees: 150, orb: 3, power: 5, nature: "adjustment" },
  "semi-square": { degrees: 45, orb: 2, power: 4, nature: "minor-challenging" },
  sesquiquadrate: { degrees: 135, orb: 2, power: 4, nature: "minor-challenging" },
};

/**
 * Aspect symbols for display
 */
export const ASPECT_SYMBOLS: Record<AspectType, string> = {
  conjunction: "☌",
  sextile: "⚹",
  square: "□",
  trine: "△",
  opposition: "☍",
  "semi-sextile": "⚺",
  quincunx: "⚻",
  "semi-square": "∠",
  sesquiquadrate: "⚼",
};

/**
 * Human-readable aspect names
 */
export const ASPECT_NAMES: Record<AspectType, string> = {
  conjunction: "Conjunction",
  sextile: "Sextile",
  square: "Square",
  trine: "Trine",
  opposition: "Opposition",
  "semi-sextile": "Semi-Sextile",
  quincunx: "Quincunx",
  "semi-square": "Semi-Square",
  sesquiquadrate: "Sesquiquadrate",
};

/**
 * A detected aspect between a transiting planet and natal planet
 */
export interface PlanetaryAspect {
  transitPlanet: PlanetId;    // Planet moving in the sky (2026)
  natalPlanet: PlanetId;      // Planet in birth chart
  aspectType: AspectType;
  orb: number;                // Actual deviation from exact aspect
  isApplying: boolean;        // Getting closer (stronger) or separating
  exactDate: string;          // Date when aspect is exact (or closest)
  startDate: string;          // When aspect enters orb
  endDate: string;            // When aspect exits orb
}

// ============================================
// Category Weights for Scoring
// ============================================

/**
 * How much each aspect type contributes to a life category
 * Higher = more beneficial for that life area
 *
 * Minor aspects have lower weights (0.3-0.7) due to subtler influence
 */
export const CATEGORY_ASPECT_WEIGHTS: Record<LifeCategory, Record<AspectType, number>> = {
  love: {
    // Major aspects
    conjunction: 1.2,
    trine: 1.5,       // Trines best for love - harmony
    sextile: 1.3,
    square: 0.5,      // Squares challenging for relationships
    opposition: 0.8,
    // Minor aspects
    "semi-sextile": 0.5,    // Slight positive
    quincunx: 0.4,          // Adjustment needed in relationships
    "semi-square": 0.3,     // Minor friction
    sesquiquadrate: 0.3,    // Hidden tension
  },
  career: {
    // Major aspects
    conjunction: 1.5, // Conjunctions powerful for career
    trine: 1.2,
    sextile: 1.0,
    square: 1.3,      // Squares drive ambition
    opposition: 1.0,
    // Minor aspects
    "semi-sextile": 0.4,
    quincunx: 0.6,          // Can indicate career pivots
    "semi-square": 0.5,     // Minor pressure can motivate
    sesquiquadrate: 0.5,
  },
  growth: {
    // Major aspects
    conjunction: 1.4,
    trine: 1.3,
    sextile: 1.2,
    square: 1.0,
    opposition: 1.1,
    // Minor aspects
    "semi-sextile": 0.5,
    quincunx: 0.7,          // Quincunx promotes growth through adaptation
    "semi-square": 0.4,
    sesquiquadrate: 0.4,
  },
  home: {
    // Major aspects
    conjunction: 1.3,
    trine: 1.5,       // Trines best for home - peace
    sextile: 1.2,
    square: 0.6,      // Squares disruptive for home
    opposition: 0.7,
    // Minor aspects
    "semi-sextile": 0.5,
    quincunx: 0.3,          // Discomfort at home
    "semi-square": 0.3,     // Minor disruptions
    sesquiquadrate: 0.3,
  },
};

/**
 * Which planets are most relevant for each category
 */
export const CATEGORY_PLANETS: Record<LifeCategory, PlanetId[]> = {
  love: ["venus", "moon", "mars"],
  career: ["sun", "jupiter", "saturn", "mars"],
  growth: ["jupiter", "uranus", "neptune"],
  home: ["moon", "saturn", "venus"],
};

// ============================================
// Power Months
// ============================================

/**
 * Best period within a month
 */
export interface PeakWindow {
  startDate: string;          // ISO date
  endDate: string;            // ISO date
  intensity: "high" | "very-high" | "exceptional";
  reason: string;             // "Venus trine natal Venus"
  mainAspect: PlanetaryAspect | null;
}

/**
 * Score for one month in one category
 */
export interface MonthScore {
  month: number;              // 1-12
  year: number;               // 2026
  category: LifeCategory;
  score: number;              // 0-100 (raw, no artificial minimum)
  peakWindow: PeakWindow | null;
  dominantPlanet: PlanetId;
  keyAspects: PlanetaryAspect[];  // Top 3 aspects contributing to score
  interpretation: string;
  confidence: ConfidenceLevel;    // For time-unknown cases
}

/**
 * Full year forecast for all categories
 */
export interface YearForecast {
  year: number;
  birthDataHash: string;      // For caching/comparison
  natalPositions: PlanetPosition[];
  months: MonthScore[];       // 12 months × 4 categories = 48 entries
  bestMonths: Record<LifeCategory, number[]>;  // Top 3 months per category
  overallPowerMonths: number[];  // Best months across all categories
  calculatedAt: string;       // ISO timestamp
  confidenceMode: boolean;    // True if calculated with time uncertainty
}

// ============================================
// Timed Power Places
// ============================================

/**
 * Power Place enhanced with best timing information
 */
export interface TimedPowerPlace extends PowerPlace {
  timing: {
    bestMonths: number[];           // Top 1-3 months (1-12)
    peakWindow: PeakWindow | null;  // Best specific window
    recommendation: string;          // "Visit Paris in April 2026"
    combinedScore: number;          // PlaceScore × MonthScore
  };
  confidence: ConfidenceLevel;
}

/**
 * Category result with timed places
 */
export interface TimedCategoryResult {
  category: LifeCategory;
  label: string;
  icon: string;
  description: string;
  places: TimedPowerPlace[];
  bestOverallWindow: PeakWindow | null;  // Best time for this category anywhere
}

// ============================================
// API Types
// ============================================

/**
 * Request for Power Months calculation
 */
export interface PowerForecastRequest {
  natalPositions: PlanetPosition[];
  year: number;
  timeWindow?: BirthTimeWindow;  // For confidence mode
}

/**
 * Response with full forecast
 */
export interface PowerForecastResponse {
  success: boolean;
  data?: YearForecast;
  error?: string;
}

// ============================================
// Helper Types
// ============================================

/**
 * Month names for display
 */
export const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
] as const;

/**
 * Get month name from number (1-12)
 */
export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] || "Unknown";
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startMonth = MONTH_NAMES[start.getMonth()];
  const endMonth = MONTH_NAMES[end.getMonth()];

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()}-${end.getDate()}`;
  }
  return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
}
