/**
 * Lifetime Transit Search Algorithm
 *
 * Core algorithm to find WHEN a planet reaches a specific degree.
 * Uses bisection search (binary search) for precision.
 *
 * KEY CHALLENGE: Finding when transit Saturn = natal Saturn (for example)
 * - We have calculatePlanetPosition(planet, julianDay) → longitude
 * - We need to INVERT this: given a target longitude, find the date
 *
 * ALGORITHM: Bisection Search
 * 1. Sample the date range at intervals
 * 2. Detect when the planet "crosses" the target degree
 * 3. Use binary search to narrow down to precise date
 *
 * HANDLING RETROGRADE:
 * Slow planets like Saturn can cross the same degree 3 times
 * (direct, retrograde, direct again). We find ALL crossings.
 */

import { PlanetId } from "./types";
import { calculatePlanetPosition } from "./calculations";
import { calculateChironPosition, isChironRetrograde } from "./chiron";
import {
  LifetimePlanetId,
  TransitHit,
  SAMPLING_INTERVALS,
} from "./lifetime-transits-types";

// ============================================
// Position Helpers
// ============================================

/**
 * Get planet longitude, supporting both regular planets and Chiron
 */
export function getPlanetLongitude(
  planet: LifetimePlanetId,
  jd: number
): number {
  if (planet === "chiron") {
    return calculateChironPosition(jd).longitude;
  }
  return calculatePlanetPosition(planet as PlanetId, jd).longitude;
}

/**
 * Check if a planet is retrograde at a given Julian Day
 */
export function isPlanetRetrograde(
  planet: LifetimePlanetId,
  jd: number
): boolean {
  if (planet === "chiron") {
    return isChironRetrograde(jd);
  }

  // Compare positions 1 day apart
  const pos1 = getPlanetLongitude(planet, jd - 0.5);
  const pos2 = getPlanetLongitude(planet, jd + 0.5);

  // Calculate angular difference (accounting for 360° wraparound)
  let diff = pos2 - pos1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  // Negative motion = retrograde
  return diff < 0;
}

// ============================================
// Angular Distance
// ============================================

/**
 * Calculate signed angular distance between two positions
 *
 * This correctly handles the 360° wraparound (e.g., 359° to 1° is +2°, not -358°)
 *
 * @param position - Current planet position (0-360)
 * @param target - Target degree we're looking for (0-360)
 * @returns Signed distance (-180 to +180). Positive = ahead of target.
 */
export function angularDistance(position: number, target: number): number {
  let diff = position - target;

  // Normalize to -180 to +180 range
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;

  return diff;
}

// ============================================
// Single Crossing Detection
// ============================================

/**
 * Find the exact Julian Day when a planet crosses a target degree
 *
 * Uses binary search (bisection) to narrow down the crossing point.
 *
 * @param planet - Planet to track
 * @param targetDegree - Natal degree to find (0-360)
 * @param startJD - Start of search window
 * @param endJD - End of search window
 * @param precision - Stop when range < this many days (default: 0.1 = ~2.4 hours)
 * @returns Julian Day of crossing, or null if no crossing in range
 */
export function findTransitCrossing(
  planet: LifetimePlanetId,
  targetDegree: number,
  startJD: number,
  endJD: number,
  precision: number = 0.1
): number | null {
  // Get positions at start and end
  const startPos = getPlanetLongitude(planet, startJD);
  const endPos = getPlanetLongitude(planet, endJD);

  // Calculate angular distances to target
  const startDist = angularDistance(startPos, targetDegree);
  const endDist = angularDistance(endPos, targetDegree);

  // No crossing if:
  // - Same sign of distance AND both far from target
  // - This means planet didn't cross the target degree
  if (
    Math.sign(startDist) === Math.sign(endDist) &&
    Math.abs(startDist) > 1 &&
    Math.abs(endDist) > 1
  ) {
    return null;
  }

  // Precision reached - we found the crossing
  if (endJD - startJD < precision) {
    return (startJD + endJD) / 2;
  }

  // Bisect: check the middle
  const midJD = (startJD + endJD) / 2;
  const midPos = getPlanetLongitude(planet, midJD);
  const midDist = angularDistance(midPos, targetDegree);

  // Determine which half contains the crossing
  // A crossing occurred where sign changed or we got very close
  if (Math.sign(startDist) !== Math.sign(midDist) || Math.abs(midDist) < 1) {
    // Crossing is in first half
    return findTransitCrossing(planet, targetDegree, startJD, midJD, precision);
  } else {
    // Crossing is in second half
    return findTransitCrossing(planet, targetDegree, midJD, endJD, precision);
  }
}

// ============================================
// Multiple Crossings (Retrograde Handling)
// ============================================

/**
 * Find ALL crossings of a target degree in a date range
 *
 * Due to retrograde motion, slow planets can cross the same degree
 * up to 3 times:
 * 1. First pass (direct motion)
 * 2. Retrograde pass (planet moving backward)
 * 3. Final pass (direct motion again)
 *
 * @param planet - Planet to track
 * @param targetDegree - Natal degree to find (0-360)
 * @param startJD - Start of search window
 * @param endJD - End of search window
 * @param samplingDays - How often to sample (default based on planet)
 * @returns Array of TransitHit objects for all crossings
 */
export function findAllTransitCrossings(
  planet: LifetimePlanetId,
  targetDegree: number,
  startJD: number,
  endJD: number,
  samplingDays?: number
): TransitHit[] {
  // Use planet-specific sampling interval if not provided
  const interval = samplingDays ?? SAMPLING_INTERVALS[planet];
  const hits: TransitHit[] = [];

  // Track previous position for crossing detection
  let prevJD = startJD;
  let prevPos = getPlanetLongitude(planet, prevJD);
  let prevDist = angularDistance(prevPos, targetDegree);

  // Sample through the entire range
  for (let jd = startJD + interval; jd <= endJD; jd += interval) {
    const pos = getPlanetLongitude(planet, jd);
    const dist = angularDistance(pos, targetDegree);

    // Check for a potential crossing
    const signChanged = Math.sign(prevDist) !== Math.sign(dist);
    const wasClose = Math.abs(prevDist) < 2 || Math.abs(dist) < 2;

    if (signChanged || (wasClose && Math.abs(dist) < Math.abs(prevDist))) {
      // Found a potential crossing zone - use bisection to find exact JD
      const exactJD = findTransitCrossing(planet, targetDegree, prevJD, jd, 0.1);

      if (exactJD !== null) {
        // Avoid duplicate hits (within 30 days of previous hit)
        const lastHit = hits[hits.length - 1];
        if (!lastHit || exactJD - lastHit.julianDay > 30) {
          const isRetrograde = isPlanetRetrograde(planet, exactJD);

          // Determine phase based on retrograde status and position in sequence
          let phase: TransitHit["phase"] = "first";
          if (hits.length === 1) {
            phase = isRetrograde ? "retrograde" : "final";
          } else if (hits.length >= 2) {
            phase = "final";
          }

          hits.push({
            date: julianDayToISO(exactJD),
            julianDay: exactJD,
            orb: 0, // Exact crossing
            isRetrograde,
            phase,
          });
        }
      }
    }

    // Move to next sample
    prevJD = jd;
    prevPos = pos;
    prevDist = dist;
  }

  // Re-label phases based on actual sequence
  if (hits.length >= 2) {
    hits[0].phase = "first";
    if (hits.length === 2) {
      hits[1].phase = "final";
    } else if (hits.length >= 3) {
      hits[1].phase = "retrograde";
      hits[2].phase = "final";
    }
  }

  return hits;
}

// ============================================
// Return Transit Finder (Saturn, Jupiter, Chiron)
// ============================================

/**
 * Find all "returns" of a planet to its natal position
 *
 * A "return" is when transit planet conjuncts natal planet.
 * - Saturn Return: ~every 29.5 years
 * - Jupiter Return: ~every 12 years
 * - Chiron Return: ~every 51 years
 *
 * @param planet - Planet to track (saturn, jupiter, chiron)
 * @param natalDegree - Natal position of the planet (0-360)
 * @param birthJD - Julian Day of birth
 * @param lifeSpanYears - How many years to search (default: 90)
 * @returns Array of all returns found
 */
export function findPlanetaryReturns(
  planet: LifetimePlanetId,
  natalDegree: number,
  birthJD: number,
  lifeSpanYears: number = 90
): TransitHit[][] {
  const endJD = birthJD + lifeSpanYears * 365.25;
  const returns: TransitHit[][] = [];

  // Estimate orbital period for smarter searching
  const orbitalPeriods: Partial<Record<LifetimePlanetId, number>> = {
    jupiter: 11.86,
    saturn: 29.46,
    chiron: 50.7,
  };

  const period = orbitalPeriods[planet];
  if (!period) {
    // For outer planets, just scan the whole range
    const hits = findAllTransitCrossings(planet, natalDegree, birthJD, endJD);
    if (hits.length > 0) {
      returns.push(hits);
    }
    return returns;
  }

  // Search in windows around expected return dates
  const periodDays = period * 365.25;
  let expectedReturnJD = birthJD + periodDays;

  while (expectedReturnJD < endJD) {
    // Search window: 6 months before to 6 months after expected date
    const windowStart = Math.max(birthJD, expectedReturnJD - 180);
    const windowEnd = Math.min(endJD, expectedReturnJD + 180);

    const hits = findAllTransitCrossings(
      planet,
      natalDegree,
      windowStart,
      windowEnd
    );

    if (hits.length > 0) {
      returns.push(hits);
    }

    // Move to next expected return
    expectedReturnJD += periodDays;
  }

  return returns;
}

// ============================================
// Outer Planet Transit Finder
// ============================================

/**
 * Find outer planet transits to a natal position
 *
 * Outer planets (Pluto, Neptune, Uranus) move so slowly that
 * they may only transit a natal point ONCE in a lifetime.
 *
 * @param transitPlanet - The outer planet (pluto, neptune, uranus)
 * @param natalDegree - Natal position to check (Sun, Moon, etc.)
 * @param birthJD - Julian Day of birth
 * @param lifeSpanYears - How many years to search
 * @returns Array of hits (empty if no transit occurs in lifetime)
 */
export function findOuterPlanetTransit(
  transitPlanet: LifetimePlanetId,
  natalDegree: number,
  birthJD: number,
  lifeSpanYears: number = 90
): TransitHit[] {
  const endJD = birthJD + lifeSpanYears * 365.25;

  // Use larger sampling interval for very slow planets
  const samplingDays = SAMPLING_INTERVALS[transitPlanet];

  return findAllTransitCrossings(
    transitPlanet,
    natalDegree,
    birthJD,
    endJD,
    samplingDays
  );
}

// ============================================
// Julian Day Conversion
// ============================================

/**
 * Convert Julian Day to ISO date string
 *
 * @param jd - Julian Day number
 * @returns ISO date string "2029-03-15"
 */
export function julianDayToISO(jd: number): string {
  // Julian Day starts at noon, so subtract 0.5 to get midnight
  const j = jd + 0.5;
  const z = Math.floor(j);
  const f = j - z;

  let A: number;
  if (z < 2299161) {
    A = z;
  } else {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    A = z + 1 + alpha - Math.floor(alpha / 4);
  }

  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);

  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Convert ISO date string to Julian Day
 *
 * @param isoDate - ISO date string "2029-03-15"
 * @returns Julian Day number
 */
export function isoToJulianDay(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);

  let y = year;
  let m = month;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);

  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    B -
    1524.5
  );
}

/**
 * Calculate age in years from birth JD to transit JD
 *
 * @param birthJD - Julian Day of birth
 * @param transitJD - Julian Day of transit
 * @returns Age in years (integer)
 */
export function calculateAge(birthJD: number, transitJD: number): number {
  const days = transitJD - birthJD;
  return Math.floor(days / 365.25);
}
