/**
 * Placidus House System Calculations
 *
 * The Placidus system divides the sky based on TIME - specifically, how long
 * it takes each degree of the ecliptic to rise from the horizon to the meridian.
 * This makes it the most popular house system in Western astrology.
 *
 * Mathematical foundation:
 * - MC (10th cusp): Where the ecliptic crosses the meridian
 * - ASC (1st cusp): Where the ecliptic crosses the eastern horizon
 * - Intermediate cusps (2,3,11,12): Divide the semi-arcs into thirds
 * - Opposite cusps (5,6,8,9): Exactly 180° from their counterparts
 *
 * Limitation: Placidus fails at extreme latitudes (>66.5°) where some
 * ecliptic degrees never rise or set. We fall back to Equal House system.
 *
 * References:
 * - Jean Meeus, "Astronomical Algorithms" (2nd Edition)
 * - Robert Hand, "Horoscope Symbols"
 */

import * as sidereal from "astronomia/sidereal";
import * as nutation from "astronomia/nutation";
import { getZodiacFromLongitude, ZodiacSign } from "./zodiac";

// ============================================
// Constants
// ============================================

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// Latitude limit for Placidus (fails near polar circles)
const PLACIDUS_LAT_LIMIT = 66.5;

// Maximum iterations for cusp calculation
const MAX_ITERATIONS = 50;

// Convergence threshold (degrees)
const CONVERGENCE_THRESHOLD = 0.0001;

// ============================================
// Types
// ============================================

export interface HouseCusp {
  house: number;        // 1-12
  longitude: number;    // Ecliptic longitude (0-360°)
  sign: ZodiacSign;     // Zodiac sign on cusp
  degree: number;       // Degree within sign (0-30)
  formatted: string;    // "15° Aries"
}

export interface HouseResult {
  cusps: HouseCusp[];           // All 12 house cusps
  system: "placidus" | "equal"; // Which system was used
  ascendant: number;            // 1st house cusp (ASC)
  mc: number;                   // 10th house cusp (Midheaven)
  ic: number;                   // 4th house cusp (Imum Coeli)
  descendant: number;           // 7th house cusp (DSC)
  vertex: number;               // Western point (optional feature)
  calculatedAt: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Normalize angle to 0-360° range
 */
function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Get mean obliquity of the ecliptic
 */
function getObliquity(jd: number): number {
  return nutation.meanObliquity(jd);
}

/**
 * Calculate Local Sidereal Time in degrees
 *
 * @param jd - Julian Day
 * @param longitude - Geographic longitude (east positive)
 * @returns LST in degrees (0-360)
 */
function calculateLST(jd: number, longitude: number): number {
  // Get Greenwich Mean Sidereal Time
  // NOTE: sidereal.mean() returns GMST in seconds, not radians!
  // Convert seconds to degrees: (seconds / 86400) * 360
  const gmstSeconds = sidereal.mean(jd);
  const gmstDeg = (gmstSeconds / 86400) * 360;

  // Local Sidereal Time = GMST + geographic longitude
  return normalizeAngle(gmstDeg + longitude);
}

/**
 * Calculate RAMC (Right Ascension of the Midheaven)
 *
 * RAMC equals the Local Sidereal Time, expressed in degrees.
 */
function calculateRAMC(jd: number, longitude: number): number {
  return calculateLST(jd, longitude);
}

/**
 * Convert ecliptic longitude to Right Ascension
 *
 * @param longitude - Ecliptic longitude in degrees
 * @param obliquity - Obliquity of ecliptic in radians
 * @returns Right Ascension in degrees
 */
function longitudeToRA(longitude: number, obliquity: number): number {
  const lonRad = longitude * DEG_TO_RAD;

  // RA = atan2(sin(lon) * cos(obl), cos(lon))
  const ra = Math.atan2(
    Math.sin(lonRad) * Math.cos(obliquity),
    Math.cos(lonRad)
  );

  return normalizeAngle(ra * RAD_TO_DEG);
}

/**
 * Convert Right Ascension to ecliptic longitude
 *
 * This is the inverse of longitudeToRA.
 *
 * @param ra - Right Ascension in degrees
 * @param obliquity - Obliquity of ecliptic in radians
 * @returns Ecliptic longitude in degrees
 */
function raToLongitude(ra: number, obliquity: number): number {
  const raRad = ra * DEG_TO_RAD;

  // lon = atan2(sin(ra) * cos(obl), cos(ra))
  // But we need to account for latitude being 0 on the ecliptic for MC
  const lon = Math.atan2(
    Math.sin(raRad),
    Math.cos(raRad) * Math.cos(obliquity)
  );

  return normalizeAngle(lon * RAD_TO_DEG);
}

/**
 * Calculate declination for a given ecliptic longitude
 *
 * @param longitude - Ecliptic longitude in degrees
 * @param obliquity - Obliquity of ecliptic in radians
 * @returns Declination in radians
 */
function calculateDeclination(longitude: number, obliquity: number): number {
  const lonRad = longitude * DEG_TO_RAD;

  // sin(dec) = sin(lon) * sin(obl)
  // (assumes ecliptic latitude = 0, which is true for house cusps)
  return Math.asin(Math.sin(lonRad) * Math.sin(obliquity));
}

/**
 * Calculate semi-arc for a given declination and latitude
 *
 * The semi-arc is half the time (in degrees) that a point spends
 * above the horizon. Used for Placidus house division.
 *
 * @param declination - Declination in radians
 * @param latitude - Geographic latitude in radians
 * @returns Semi-arc in degrees, or NaN if circumpolar
 */
function calculateSemiArc(declination: number, latitude: number): number {
  // cos(H) = -tan(lat) * tan(dec)
  const cosH = -Math.tan(latitude) * Math.tan(declination);

  // Check for circumpolar condition (never rises or never sets)
  if (Math.abs(cosH) > 1) {
    return NaN; // Point is circumpolar
  }

  // Semi-arc in degrees
  return Math.acos(cosH) * RAD_TO_DEG;
}

// ============================================
// MC and ASC Calculations
// ============================================

/**
 * Calculate MC (Midheaven / 10th house cusp)
 *
 * The MC is where the ecliptic crosses the upper meridian.
 * Formula: tan(MC) = tan(RAMC) / cos(obliquity)
 *
 * @param jd - Julian Day
 * @param longitude - Geographic longitude
 * @returns MC longitude in degrees (0-360)
 */
function calculateMC(jd: number, longitude: number): number {
  const RAMC = calculateRAMC(jd, longitude);
  const obliquity = getObliquity(jd);

  const ramcRad = RAMC * DEG_TO_RAD;

  // MC calculation
  let mc = Math.atan2(
    Math.sin(ramcRad),
    Math.cos(ramcRad) * Math.cos(obliquity)
  ) * RAD_TO_DEG;

  mc = normalizeAngle(mc);

  // Ensure MC is in the correct quadrant (should be near RAMC)
  // If MC is more than 90° from RAMC, add 180°
  const diff = Math.abs(normalizeAngle(mc - RAMC));
  if (diff > 90 && diff < 270) {
    mc = normalizeAngle(mc + 180);
  }

  return mc;
}

/**
 * Calculate ASC (Ascendant / 1st house cusp)
 *
 * The ASC is where the ecliptic crosses the eastern horizon.
 * This is the most complex of the angular houses to calculate.
 *
 * @param jd - Julian Day
 * @param latitude - Geographic latitude in degrees
 * @param longitude - Geographic longitude in degrees
 * @returns ASC longitude in degrees (0-360)
 */
function calculateASC(jd: number, latitude: number, longitude: number): number {
  const RAMC = calculateRAMC(jd, longitude);
  const obliquity = getObliquity(jd);

  const ramcRad = RAMC * DEG_TO_RAD;
  const latRad = latitude * DEG_TO_RAD;

  // Ascendant formula:
  // tan(ASC) = cos(RAMC) / (-sin(RAMC) * cos(obl) - tan(lat) * sin(obl))
  const y = Math.cos(ramcRad);
  const x = -(Math.sin(ramcRad) * Math.cos(obliquity) + Math.tan(latRad) * Math.sin(obliquity));

  let asc = Math.atan2(y, x) * RAD_TO_DEG;
  asc = normalizeAngle(asc);

  return asc;
}

// ============================================
// Placidus Intermediate Cusp Calculation
// ============================================

/**
 * Calculate a Placidus intermediate house cusp (2, 3, 11, or 12)
 *
 * Uses an iterative approach to find the ecliptic longitude where:
 * RA(cusp) = RAMC + F × SA(cusp)
 *
 * Where F is the fractional position (1/3 or 2/3) and SA is the semi-arc.
 *
 * @param houseNumber - House number (2, 3, 11, or 12)
 * @param RAMC - Right Ascension of MC in degrees
 * @param latitude - Geographic latitude in degrees
 * @param obliquity - Obliquity of ecliptic in radians
 * @returns Cusp longitude in degrees, or NaN if calculation fails
 */
function calculatePlacidusIntermediate(
  houseNumber: 2 | 3 | 11 | 12,
  RAMC: number,
  latitude: number,
  obliquity: number
): number {
  // Determine the fraction F
  // Houses 11 and 3 use 1/3, houses 12 and 2 use 2/3
  const F = (houseNumber === 11 || houseNumber === 3) ? 1 / 3 : 2 / 3;

  // Determine if we're working with diurnal (above horizon) or nocturnal (below)
  // Houses 11, 12 are diurnal (MC to ASC)
  // Houses 2, 3 are nocturnal (IC to DSC)
  const isDiurnal = houseNumber >= 11;

  const latRad = latitude * DEG_TO_RAD;

  // Initial guess: equal division from MC
  // Diurnal: move forward from MC; Nocturnal: move backward from IC
  let cusp = isDiurnal
    ? normalizeAngle(RAMC + F * 90)
    : normalizeAngle(RAMC + 180 - F * 90);

  // Iterative refinement
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    // Calculate declination at current cusp longitude
    const dec = calculateDeclination(cusp, obliquity);

    // Calculate semi-arc
    const semiArc = calculateSemiArc(dec, latRad);

    if (isNaN(semiArc)) {
      // Circumpolar - Placidus fails at this latitude
      return NaN;
    }

    // Calculate target RA based on Placidus formula
    let targetRA: number;
    if (isDiurnal) {
      // Diurnal semi-arc: from MC toward ASC
      targetRA = normalizeAngle(RAMC + F * semiArc);
    } else {
      // Nocturnal semi-arc: from IC toward DSC (moving backward/clockwise)
      // IC = RAMC + 180, and we use the nocturnal semi-arc (180 - SA)
      const nocturnalSemiArc = 180 - semiArc;
      targetRA = normalizeAngle(RAMC + 180 - F * nocturnalSemiArc);
    }

    // Calculate current RA at cusp longitude
    const currentRA = longitudeToRA(cusp, obliquity);

    // Calculate error (difference between target and current RA)
    let error = targetRA - currentRA;

    // Normalize error to -180 to 180 range
    if (error > 180) error -= 360;
    if (error < -180) error += 360;

    // Check for convergence
    if (Math.abs(error) < CONVERGENCE_THRESHOLD) {
      return normalizeAngle(cusp);
    }

    // Update cusp (with damping to prevent oscillation)
    cusp = normalizeAngle(cusp + error * 0.5);
  }

  // If we didn't converge, return NaN (will trigger fallback)
  return NaN;
}

// ============================================
// Equal House System (Fallback)
// ============================================

/**
 * Calculate houses using Equal House system
 *
 * Each house is exactly 30° from the Ascendant.
 * Simple and works at all latitudes.
 *
 * @param ascendant - Ascendant longitude in degrees
 * @returns Array of 12 house cusp longitudes
 */
function calculateEqualHouses(ascendant: number): number[] {
  return Array.from({ length: 12 }, (_, i) =>
    normalizeAngle(ascendant + i * 30)
  );
}

// ============================================
// Main Export Functions
// ============================================

/**
 * Calculate all 12 house cusps using Placidus system
 *
 * Falls back to Equal House system if:
 * - Latitude exceeds Placidus limit (±66.5°)
 * - Any intermediate cusp calculation fails (circumpolar)
 *
 * @param jd - Julian Day
 * @param latitude - Geographic latitude in degrees
 * @param longitude - Geographic longitude in degrees
 * @returns HouseResult with all cusps and system info
 */
export function calculateHouses(
  jd: number,
  latitude: number,
  longitude: number
): HouseResult {
  // Check if we need to fall back to Equal House
  const usePlacidus = Math.abs(latitude) <= PLACIDUS_LAT_LIMIT;

  // Calculate the angular houses (work for all systems)
  const mc = calculateMC(jd, longitude);
  const asc = calculateASC(jd, latitude, longitude);
  const ic = normalizeAngle(mc + 180);
  const dsc = normalizeAngle(asc + 180);

  let cuspsLongitudes: number[];
  let system: "placidus" | "equal";

  if (!usePlacidus) {
    // Polar latitude - use Equal House
    cuspsLongitudes = calculateEqualHouses(asc);
    system = "equal";
  } else {
    // Attempt Placidus calculation
    const obliquity = getObliquity(jd);
    const RAMC = calculateRAMC(jd, longitude);

    // Calculate intermediate cusps
    const house11 = calculatePlacidusIntermediate(11, RAMC, latitude, obliquity);
    const house12 = calculatePlacidusIntermediate(12, RAMC, latitude, obliquity);
    const house2 = calculatePlacidusIntermediate(2, RAMC, latitude, obliquity);
    const house3 = calculatePlacidusIntermediate(3, RAMC, latitude, obliquity);

    // Check if any calculation failed
    if (isNaN(house11) || isNaN(house12) || isNaN(house2) || isNaN(house3)) {
      // Fallback to Equal House
      cuspsLongitudes = calculateEqualHouses(asc);
      system = "equal";
    } else {
      // Build Placidus cusp array
      // Houses 5,6,8,9 are opposite their counterparts
      cuspsLongitudes = [
        asc,                            // 1st
        house2,                         // 2nd
        house3,                         // 3rd
        ic,                             // 4th
        normalizeAngle(house11 + 180),  // 5th (opposite 11th)
        normalizeAngle(house12 + 180),  // 6th (opposite 12th)
        dsc,                            // 7th
        normalizeAngle(house2 + 180),   // 8th (opposite 2nd)
        normalizeAngle(house3 + 180),   // 9th (opposite 3rd)
        mc,                             // 10th
        house11,                        // 11th
        house12,                        // 12th
      ];
      system = "placidus";
    }
  }

  // Calculate vertex (western point where prime vertical meets ecliptic)
  // Simplified calculation: Vertex ≈ ASC + 180° adjusted for latitude
  // This is a simplified approximation
  const vertex = normalizeAngle(dsc);

  // Build cusp objects with zodiac info
  const cusps: HouseCusp[] = cuspsLongitudes.map((longitude, index) => {
    const zodiac = getZodiacFromLongitude(longitude);
    return {
      house: index + 1,
      longitude,
      sign: zodiac.sign,
      degree: Math.round(zodiac.degree),
      formatted: `${Math.round(zodiac.degree)}° ${zodiac.sign}`,
    };
  });

  return {
    cusps,
    system,
    ascendant: asc,
    mc,
    ic,
    descendant: dsc,
    vertex,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Find which house a planet is in
 *
 * @param planetLongitude - Planet's ecliptic longitude
 * @param houses - House calculation result
 * @returns House number (1-12)
 */
export function findHouseForPlanet(
  planetLongitude: number,
  houses: HouseResult
): number {
  const cusps = houses.cusps.map((c) => c.longitude);

  // Find the house by checking which cusp range contains the planet
  for (let i = 0; i < 12; i++) {
    const nextIndex = (i + 1) % 12;
    const cuspStart = cusps[i];
    const cuspEnd = cusps[nextIndex];

    // Handle wrap-around at 360°/0°
    if (cuspEnd < cuspStart) {
      // House spans 0°
      if (planetLongitude >= cuspStart || planetLongitude < cuspEnd) {
        return i + 1;
      }
    } else {
      if (planetLongitude >= cuspStart && planetLongitude < cuspEnd) {
        return i + 1;
      }
    }
  }

  // Fallback (shouldn't happen)
  return 1;
}

// ============================================
// House Meanings for AI Prompts
// ============================================

export const HOUSE_MEANINGS: Record<number, { name: string; theme: string; rules: string }> = {
  1: {
    name: "First House (Ascendant)",
    theme: "Self & Identity",
    rules: "Physical appearance, personality, how others see you, first impressions",
  },
  2: {
    name: "Second House",
    theme: "Values & Resources",
    rules: "Money, possessions, self-worth, material security",
  },
  3: {
    name: "Third House",
    theme: "Communication",
    rules: "Siblings, short trips, learning, writing, local community",
  },
  4: {
    name: "Fourth House (IC)",
    theme: "Home & Roots",
    rules: "Family, ancestry, home life, emotional foundation, private self",
  },
  5: {
    name: "Fifth House",
    theme: "Creativity & Joy",
    rules: "Romance, children, creative expression, hobbies, pleasure",
  },
  6: {
    name: "Sixth House",
    theme: "Health & Service",
    rules: "Daily routines, work habits, health, service to others",
  },
  7: {
    name: "Seventh House (Descendant)",
    theme: "Partnerships",
    rules: "Marriage, business partners, open enemies, one-on-one relationships",
  },
  8: {
    name: "Eighth House",
    theme: "Transformation",
    rules: "Shared resources, intimacy, death/rebirth, inheritance, occult",
  },
  9: {
    name: "Ninth House",
    theme: "Higher Learning",
    rules: "Philosophy, long journeys, higher education, publishing, beliefs",
  },
  10: {
    name: "Tenth House (MC)",
    theme: "Career & Reputation",
    rules: "Public image, career, achievements, authority, life direction",
  },
  11: {
    name: "Eleventh House",
    theme: "Community & Dreams",
    rules: "Friends, groups, humanitarian causes, hopes and wishes",
  },
  12: {
    name: "Twelfth House",
    theme: "Spirituality & Unconscious",
    rules: "Hidden matters, spirituality, retreat, self-undoing, karma",
  },
};
