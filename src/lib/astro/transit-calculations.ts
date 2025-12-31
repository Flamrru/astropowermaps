/**
 * Transit Calculations
 *
 * Calculates planetary transits for future dates and detects aspects
 * between transiting planets and natal positions. Supports daily sampling
 * for accurate peak window detection and confidence calculations.
 */

import * as julian from "astronomia/julian";
import { PlanetPosition, PlanetId, BirthData } from "./types";
import { calculatePlanetPosition, birthDataToJulianDay } from "./calculations";
import { PLANET_ORDER } from "./planets";
import {
  TransitPosition,
  TransitCache,
  AspectType,
  PlanetaryAspect,
  ASPECTS,
  BirthTimeWindow,
  TIME_WINDOW_RANGES,
} from "./transit-types";

// ============================================
// Julian Day Utilities
// ============================================

/**
 * Convert a Date object to Julian Day
 */
export function dateToJulianDay(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  const decimalDay = day + (hour + minute / 60) / 24;
  return julian.CalendarGregorianToJD(year, month, decimalDay);
}

/**
 * Convert ISO date string to Julian Day (noon UTC)
 */
export function isoDateToJulianDay(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  return julian.CalendarGregorianToJD(year, month, day + 0.5); // Noon UTC
}

/**
 * Get ISO date string from Date object
 */
function dateToISOString(date: Date): string {
  return date.toISOString().split("T")[0];
}

// ============================================
// Transit Position Calculations
// ============================================

/**
 * Calculate all planet positions for a specific date
 */
export function calculateTransitPositions(date: Date): TransitPosition[] {
  const jd = dateToJulianDay(date);
  const isoDate = dateToISOString(date);

  return PLANET_ORDER.map((planetId) => {
    const position = calculatePlanetPosition(planetId, jd);
    return {
      ...position,
      date: isoDate,
    };
  });
}

/**
 * Calculate transit positions for a specific ISO date
 */
export function calculateTransitPositionsForDate(isoDate: string): TransitPosition[] {
  const jd = isoDateToJulianDay(isoDate);

  return PLANET_ORDER.map((planetId) => {
    const position = calculatePlanetPosition(planetId, jd);
    return {
      ...position,
      date: isoDate,
    };
  });
}

// ============================================
// 2026 Transit Cache Generation
// ============================================

/**
 * Generate all daily transit positions for a year
 * Returns a Map with ISO date keys and position arrays
 *
 * @param year - Year to generate transits for (default: 2026)
 * @returns TransitCache - Map of date -> TransitPosition[]
 */
export function generateYearTransits(year: number = 2026): TransitCache {
  const cache: TransitCache = new Map();

  // Start from January 1st
  const startDate = new Date(year, 0, 1);
  // End at December 31st
  const endDate = new Date(year, 11, 31);

  // Iterate through each day
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const isoDate = dateToISOString(currentDate);
    cache.set(isoDate, calculateTransitPositions(currentDate));

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return cache;
}

// Singleton cache for 2026 transits (generated lazily)
let transit2026Cache: TransitCache | null = null;

/**
 * Get the 2026 transit cache, generating it if needed
 * This is memoized to avoid recalculation
 */
export function get2026Transits(): TransitCache {
  if (!transit2026Cache) {
    console.log("Generating 2026 transit cache...");
    const startTime = Date.now();
    transit2026Cache = generateYearTransits(2026);
    console.log(`Transit cache generated in ${Date.now() - startTime}ms (${transit2026Cache.size} days)`);
  }
  return transit2026Cache;
}

/**
 * Get transit positions for a specific date in 2026
 */
export function getTransitsForDate(isoDate: string): TransitPosition[] {
  const cache = get2026Transits();
  return cache.get(isoDate) || calculateTransitPositionsForDate(isoDate);
}

// ============================================
// Aspect Detection
// ============================================

/**
 * Normalize angle to 0-360 range
 */
function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Calculate the angular difference between two positions
 * Returns value between 0 and 180
 */
function angularDifference(lon1: number, lon2: number): number {
  let diff = Math.abs(normalizeAngle(lon1) - normalizeAngle(lon2));
  if (diff > 180) {
    diff = 360 - diff;
  }
  return diff;
}

/**
 * Detect if two planetary longitudes form an aspect
 *
 * @param transitLon - Longitude of transiting planet
 * @param natalLon - Longitude of natal planet
 * @param orbMultiplier - Optional multiplier for orb (default: 1.0)
 * @returns Detected aspect or null
 */
export function detectAspect(
  transitLon: number,
  natalLon: number,
  orbMultiplier: number = 1.0
): { type: AspectType; orb: number } | null {
  const diff = angularDifference(transitLon, natalLon);

  // Check each aspect type
  for (const [aspectType, config] of Object.entries(ASPECTS)) {
    const effectiveOrb = config.orb * orbMultiplier;
    const deviation = Math.abs(diff - config.degrees);

    if (deviation <= effectiveOrb) {
      return {
        type: aspectType as AspectType,
        orb: deviation,
      };
    }
  }

  return null;
}

/**
 * Determine if an aspect is applying (getting stronger) or separating
 * Requires positions from two consecutive days
 *
 * @param todayOrb - Today's orb (distance from exact aspect)
 * @param tomorrowOrb - Tomorrow's orb
 * @returns true if applying (orb is tightening), false if separating
 */
export function isAspectApplying(todayOrb: number, tomorrowOrb: number): boolean {
  return tomorrowOrb < todayOrb;
}

/**
 * Find all aspects between transiting planets and natal positions on a date
 *
 * @param natalPositions - Array of natal planet positions
 * @param transitDate - ISO date string for transit
 * @param transitCache - Optional pre-computed transit cache
 * @returns Array of detected aspects
 */
export function findAspectsOnDate(
  natalPositions: PlanetPosition[],
  transitDate: string,
  transitCache?: TransitCache
): PlanetaryAspect[] {
  const aspects: PlanetaryAspect[] = [];

  // Get today's and tomorrow's transits
  const todayTransits = transitCache?.get(transitDate) || getTransitsForDate(transitDate);

  // Calculate tomorrow's date for applying/separating detection
  const tomorrow = new Date(transitDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = dateToISOString(tomorrow);
  const tomorrowTransits = transitCache?.get(tomorrowDate) || getTransitsForDate(tomorrowDate);

  // Check each transiting planet against each natal planet
  for (const transit of todayTransits) {
    for (const natal of natalPositions) {
      // Skip same-planet aspects (e.g., transit Sun to natal Sun conjunction happens once a year)
      // We still include these as they can be significant

      const aspect = detectAspect(transit.longitude, natal.longitude);

      if (aspect) {
        // Find tomorrow's position for the same transit planet
        const tomorrowTransit = tomorrowTransits.find((t) => t.id === transit.id);

        // Determine if applying or separating
        let applying = true; // Default to applying if we can't determine
        if (tomorrowTransit) {
          const tomorrowAspect = detectAspect(tomorrowTransit.longitude, natal.longitude);
          if (tomorrowAspect && tomorrowAspect.type === aspect.type) {
            applying = isAspectApplying(aspect.orb, tomorrowAspect.orb);
          }
        }

        aspects.push({
          transitPlanet: transit.id,
          natalPlanet: natal.id,
          aspectType: aspect.type,
          orb: aspect.orb,
          isApplying: applying,
          exactDate: transitDate, // Simplified: actual exact date would require interpolation
          startDate: transitDate, // Would need lookback to find entry into orb
          endDate: transitDate, // Would need lookahead to find exit from orb
        });
      }
    }
  }

  return aspects;
}

/**
 * Get all aspects for a month
 *
 * @param natalPositions - Array of natal planet positions
 * @param year - Year
 * @param month - Month (1-12)
 * @returns Array of unique aspects active during the month
 */
export function getAspectsForMonth(
  natalPositions: PlanetPosition[],
  year: number,
  month: number
): PlanetaryAspect[] {
  const cache = get2026Transits();
  const allAspects: PlanetaryAspect[] = [];

  // Get days in this month
  const daysInMonth = new Date(year, month, 0).getDate();

  // Check each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const isoDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayAspects = findAspectsOnDate(natalPositions, isoDate, cache);
    allAspects.push(...dayAspects);
  }

  // Deduplicate aspects (keep the one with tightest orb)
  const aspectMap = new Map<string, PlanetaryAspect>();
  for (const aspect of allAspects) {
    const key = `${aspect.transitPlanet}-${aspect.natalPlanet}-${aspect.aspectType}`;
    const existing = aspectMap.get(key);
    if (!existing || aspect.orb < existing.orb) {
      aspectMap.set(key, aspect);
    }
  }

  return Array.from(aspectMap.values());
}

// ============================================
// Birth Time Sampling for Confidence
// ============================================

/**
 * Generate sample birth times across a time window
 *
 * @param birthData - Base birth data
 * @param window - Time window to sample
 * @param intervalMinutes - Sampling interval (default: 30 minutes)
 * @returns Array of BirthData with different times
 */
export function sampleBirthTimes(
  birthData: BirthData,
  window: BirthTimeWindow,
  intervalMinutes: number = 30
): BirthData[] {
  const samples: BirthData[] = [];
  const range = TIME_WINDOW_RANGES[window];

  // Generate samples at regular intervals
  for (let hour = range.start; hour < range.end; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      // Handle midnight crossing for evening window
      const actualHour = hour % 24;
      const timeString = `${String(actualHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

      samples.push({
        ...birthData,
        time: timeString,
        timeUnknown: true, // Mark as sampled
      });
    }
  }

  return samples;
}

/**
 * Calculate natal positions for multiple birth time samples
 * Returns array of position arrays, one per sample
 */
export function calculateSampledNatalPositions(
  birthData: BirthData,
  window: BirthTimeWindow
): PlanetPosition[][] {
  const samples = sampleBirthTimes(birthData, window);

  return samples.map((sample) => {
    const jd = birthDataToJulianDay(sample);
    return PLANET_ORDER.map((planetId) => calculatePlanetPosition(planetId, jd));
  });
}

// ============================================
// Utility Exports
// ============================================

/**
 * Get all dates in a month as ISO strings
 */
export function getMonthDates(year: number, month: number): string[] {
  const dates: string[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
  }

  return dates;
}

/**
 * Get dates for a specific week
 */
export function getWeekDates(startDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);

  for (let i = 0; i < 7; i++) {
    dates.push(dateToISOString(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
