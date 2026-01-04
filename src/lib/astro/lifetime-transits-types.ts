/**
 * Lifetime Special Transits - Type Definitions
 *
 * Types for calculating once-in-a-lifetime and rare planetary transits
 * across a user's entire lifespan (birth to ~90 years).
 */

import { PlanetId } from "./types";

// ============================================
// Transit Type Definitions
// ============================================

/**
 * Extended planet ID to include Chiron
 * Chiron is needed for Chiron Return calculations but isn't in VSOP87
 */
export type LifetimePlanetId = PlanetId | "chiron";

/**
 * Types of special lifetime transits we calculate
 */
export type LifetimeTransitType =
  | "saturn-return"
  | "jupiter-return"
  | "chiron-return"
  | "pluto-to-sun"
  | "pluto-to-moon"
  | "neptune-to-sun"
  | "neptune-to-moon"
  | "uranus-to-sun"
  | "uranus-to-moon";

/**
 * Rarity classification for transits
 */
export type TransitRarity = "common" | "rare" | "very-rare" | "once-in-lifetime";

// ============================================
// Transit Hit (Single Crossing)
// ============================================

/**
 * A single crossing of a target degree
 *
 * Due to RETROGRADE MOTION, slow planets can cross the same degree
 * up to 3 times. This is called a "triple pass":
 * 1. First pass (direct motion)
 * 2. Retrograde pass (backward motion)
 * 3. Final pass (direct motion again)
 */
export interface TransitHit {
  /** ISO date of the crossing "2029-03-15" */
  date: string;

  /** Julian Day for precise astronomical calculations */
  julianDay: number;

  /** Was the planet moving backward (retrograde) at this crossing? */
  isRetrograde: boolean;

  /** Which pass in a potential triple-pass sequence */
  phase: "first" | "retrograde" | "final";

  /** How close to exact (always < 1 degree for "hits") */
  orb: number;
}

// ============================================
// Complete Transit Event
// ============================================

/**
 * A complete lifetime transit event
 *
 * May contain multiple "hits" if the planet crosses the degree
 * multiple times due to retrograde motion.
 *
 * Example: Saturn Return in 2029 might have:
 * - First hit: March 2029 (Saturn crosses natal Saturn)
 * - Retrograde hit: August 2029 (Saturn backs over it)
 * - Final hit: December 2029 (Saturn crosses final time)
 */
export interface LifetimeTransit {
  /** Type of transit (saturn-return, pluto-to-sun, etc.) */
  type: LifetimeTransitType;

  /** The transiting planet (what's moving in the sky) */
  transitPlanet: LifetimePlanetId;

  /** The natal planet being transited (in the birth chart) */
  natalPlanet: LifetimePlanetId;

  /** The natal degree being crossed (0-360) */
  natalDegree: number;

  /** All crossings for this transit (1-3 hits) */
  hits: TransitHit[];

  /** When the transit enters orb (starts being felt) */
  startDate: string;

  /** Primary exact date (first hit) */
  exactDate: string;

  /** When the transit exits orb (completes) */
  endDate: string;

  /** User's age at the time of this transit */
  ageAtTransit: number;

  /** Human-readable label ("First Saturn Return") */
  label: string;

  /** Brief description of the transit's meaning */
  description: string;

  /** How rare is this transit? */
  rarity: TransitRarity;
}

// ============================================
// Full Report
// ============================================

/**
 * Complete lifetime transit report for a user
 *
 * Contains all major transits across their lifespan,
 * organized by type and also in chronological order.
 */
export interface LifetimeTransitReport {
  /** User's birth date (for reference) */
  birthDate: string;

  /** How many years were calculated (default: 90) */
  lifeSpanYears: number;

  /** All Saturn Returns (~age 29, 58, 87) */
  saturnReturns: LifetimeTransit[];

  /** All Jupiter Returns (~every 12 years) */
  jupiterReturns: LifetimeTransit[];

  /** Chiron Return (~age 50, usually just one) */
  chironReturn: LifetimeTransit | null;

  /** Outer planet transits to Sun/Moon (Pluto, Neptune, Uranus) */
  outerPlanetTransits: LifetimeTransit[];

  /** All transits sorted chronologically */
  allTransits: LifetimeTransit[];

  /** The next upcoming major transit (null if all are past) */
  nextMajorTransit: LifetimeTransit | null;

  /** When this report was calculated */
  calculatedAt: string;
}

// ============================================
// Calculation Options
// ============================================

/**
 * Options for lifetime transit calculation
 */
export interface LifetimeTransitOptions {
  /** How many years from birth to calculate (default: 90) */
  lifeSpanYears?: number;

  /** Include Chiron Return calculation (default: true) */
  includeChiron?: boolean;

  /** Orb for detecting transit influence (default: 2 degrees) */
  orbForInfluence?: number;
}

// ============================================
// Transit Descriptions
// ============================================

/**
 * Pre-defined descriptions for each transit type
 */
export const TRANSIT_DESCRIPTIONS: Record<LifetimeTransitType, string> = {
  "saturn-return":
    "Major life restructuring. A time of maturity, responsibility, and building lasting foundations.",
  "jupiter-return":
    "Year of expansion and opportunity. Fresh cycle of growth, optimism, and new horizons.",
  "chiron-return":
    "Deep healing milestone. Integrating life's wounds into wisdom and teaching.",
  "pluto-to-sun":
    "Profound transformation of identity. Death and rebirth of who you are at your core.",
  "pluto-to-moon":
    "Emotional metamorphosis. Deep psychological transformation of your inner world.",
  "neptune-to-sun":
    "Spiritual awakening. Dissolving ego boundaries, heightened creativity and intuition.",
  "neptune-to-moon":
    "Emotional transcendence. Dreams, imagination, and compassion flooding your life.",
  "uranus-to-sun":
    "Liberation of self. Sudden changes, awakening to your authentic individuality.",
  "uranus-to-moon":
    "Emotional revolution. Breaking free from old patterns, unexpected life changes.",
};

/**
 * Rarity classification for each transit type
 */
export const TRANSIT_RARITY: Record<LifetimeTransitType, TransitRarity> = {
  "saturn-return": "rare", // ~3 per lifetime
  "jupiter-return": "common", // ~7 per lifetime
  "chiron-return": "very-rare", // 1 per lifetime
  "pluto-to-sun": "once-in-lifetime",
  "pluto-to-moon": "once-in-lifetime",
  "neptune-to-sun": "once-in-lifetime",
  "neptune-to-moon": "once-in-lifetime",
  "uranus-to-sun": "very-rare", // 1-2 per lifetime
  "uranus-to-moon": "very-rare",
};

// ============================================
// Sampling Intervals (Performance Optimization)
// ============================================

/**
 * How often to sample each planet's position (in days)
 *
 * Slow planets don't need frequent sampling - they barely move.
 * This dramatically reduces calculation time.
 */
export const SAMPLING_INTERVALS: Record<LifetimePlanetId, number> = {
  // Fast planets (not used for lifetime transits, but included for completeness)
  sun: 1,
  moon: 1,
  mercury: 1,
  venus: 1,
  mars: 7,

  // Lifetime transit planets - sample less frequently
  jupiter: 30, // ~30°/year, check monthly
  saturn: 45, // ~12°/year, check every 6 weeks
  chiron: 60, // ~7°/year, check every 2 months
  uranus: 90, // ~4°/year, check quarterly
  neptune: 120, // ~2°/year, check every 4 months
  pluto: 180, // ~1°/year, check every 6 months
};

/**
 * Orbital periods in years (for smart search windows)
 */
export const ORBITAL_PERIODS: Partial<Record<LifetimePlanetId, number>> = {
  jupiter: 11.86,
  saturn: 29.46,
  chiron: 50.7,
  uranus: 84.0,
  neptune: 164.8,
  pluto: 248.1,
};
