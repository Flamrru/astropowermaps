/**
 * Astrocartography Calculations
 *
 * This module calculates planetary positions and generates the geographic
 * coordinates for astrocartography lines (MC, IC, AC, DC).
 *
 * Key concepts:
 * - MC (Midheaven): Where a planet culminates (highest point in sky)
 * - IC (Imum Coeli): Opposite of MC (lowest point)
 * - AC (Ascendant): Where a planet rises on the eastern horizon
 * - DC (Descendant): Where a planet sets on the western horizon
 */

import {
  BirthData,
  PlanetId,
  PlanetPosition,
  PlanetaryLine,
  LineType,
  AstrocartographyResult,
} from "./types";
import { PLANETS, PLANET_ORDER, LINE_TYPES, getDefaultPlanets, getLineId } from "./planets";

// ============================================
// Constants
// ============================================

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// Earth's axial tilt (obliquity of ecliptic) - approximate for modern era
const OBLIQUITY = 23.4393;

// Latitude limits for AC/DC lines (beyond these, planets may be circumpolar)
const LAT_MIN = -66;
const LAT_MAX = 66;

// Number of points to generate per line for smooth curves
const POINTS_PER_LINE = 180;

// ============================================
// Julian Day Calculation
// ============================================

/**
 * Convert a date/time to Julian Day Number
 * This is the astronomical time standard used for calculations
 */
function dateToJulianDay(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): number {
  // Algorithm from Astronomical Algorithms by Jean Meeus
  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);

  const JD =
    Math.floor(365.25 * (year + 4716)) +
    Math.floor(30.6001 * (month + 1)) +
    day +
    B -
    1524.5 +
    (hour + minute / 60) / 24;

  return JD;
}

/**
 * Parse birth data into Julian Day
 */
export function birthDataToJulianDay(birthData: BirthData): number {
  const [year, month, day] = birthData.date.split("-").map(Number);
  const [hour, minute] = birthData.time.split(":").map(Number);

  // TODO: Convert local time to UTC using timezone
  // For now, we'll use the time as-is (simplified)

  return dateToJulianDay(year, month, day, hour, minute);
}

// ============================================
// Greenwich Sidereal Time
// ============================================

/**
 * Calculate Greenwich Mean Sidereal Time for a given Julian Day
 * Returns the sidereal time in degrees (0-360)
 */
function getGMST(jd: number): number {
  // Julian centuries from J2000.0
  const T = (jd - 2451545.0) / 36525.0;

  // GMST in degrees
  let gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000.0;

  // Normalize to 0-360
  gmst = ((gmst % 360) + 360) % 360;

  return gmst;
}

/**
 * Calculate Local Sidereal Time for a given Julian Day and longitude
 */
function getLST(jd: number, longitude: number): number {
  const gmst = getGMST(jd);
  let lst = gmst + longitude;

  // Normalize to 0-360
  lst = ((lst % 360) + 360) % 360;

  return lst;
}

// ============================================
// Simplified Planetary Positions
// ============================================

/**
 * Mean orbital elements for planets (simplified)
 * These are approximate and sufficient for astrocartography visualization
 * For production accuracy, use Swiss Ephemeris or similar
 */
const ORBITAL_ELEMENTS: Record<
  PlanetId,
  {
    L0: number; // Mean longitude at epoch (degrees)
    Lrate: number; // Daily motion (degrees/day)
    e: number; // Eccentricity
    i: number; // Inclination (degrees)
  }
> = {
  sun: { L0: 280.46, Lrate: 0.9856474, e: 0.0167, i: 0 },
  moon: { L0: 218.32, Lrate: 13.176358, e: 0.0549, i: 5.145 },
  mercury: { L0: 252.25, Lrate: 4.0923344, e: 0.2056, i: 7.0 },
  venus: { L0: 181.98, Lrate: 1.6021302, e: 0.0068, i: 3.4 },
  mars: { L0: 355.45, Lrate: 0.5240208, e: 0.0934, i: 1.85 },
  jupiter: { L0: 34.4, Lrate: 0.0830853, e: 0.0484, i: 1.3 },
  saturn: { L0: 49.94, Lrate: 0.0334979, e: 0.0542, i: 2.49 },
  uranus: { L0: 313.23, Lrate: 0.011725, e: 0.0472, i: 0.77 },
  neptune: { L0: 304.88, Lrate: 0.006020, e: 0.0086, i: 1.77 },
  pluto: { L0: 238.93, Lrate: 0.003979, e: 0.2488, i: 17.16 },
};

/**
 * Calculate simplified planetary position for a given Julian Day
 * Returns ecliptic longitude, latitude, and equatorial coordinates
 */
export function calculatePlanetPosition(planet: PlanetId, jd: number): PlanetPosition {
  const elements = ORBITAL_ELEMENTS[planet];
  const daysSinceEpoch = jd - 2451545.0; // Days since J2000.0

  // Calculate mean longitude
  let longitude = elements.L0 + elements.Lrate * daysSinceEpoch;
  longitude = ((longitude % 360) + 360) % 360;

  // Simplified latitude (mostly 0 for planets, except Moon and Pluto)
  const latitude = 0; // Simplified - real calculation would use orbital elements

  // Convert ecliptic to equatorial coordinates
  const { ra, dec } = eclipticToEquatorial(longitude, latitude, OBLIQUITY);

  return {
    id: planet,
    longitude,
    latitude,
    rightAscension: ra,
    declination: dec,
  };
}

/**
 * Convert ecliptic coordinates to equatorial coordinates
 */
function eclipticToEquatorial(
  eclLon: number,
  eclLat: number,
  obliquity: number
): { ra: number; dec: number } {
  const lonRad = eclLon * DEG_TO_RAD;
  const latRad = eclLat * DEG_TO_RAD;
  const oblRad = obliquity * DEG_TO_RAD;

  // Declination
  const sinDec =
    Math.sin(latRad) * Math.cos(oblRad) +
    Math.cos(latRad) * Math.sin(oblRad) * Math.sin(lonRad);
  const dec = Math.asin(sinDec) * RAD_TO_DEG;

  // Right Ascension
  const y = Math.sin(lonRad) * Math.cos(oblRad) - Math.tan(latRad) * Math.sin(oblRad);
  const x = Math.cos(lonRad);
  let ra = Math.atan2(y, x) * RAD_TO_DEG;
  ra = ((ra % 360) + 360) % 360;

  return { ra, dec };
}

// ============================================
// Astrocartography Line Calculations
// ============================================

/**
 * Calculate MC line coordinates
 * MC is where the planet culminates (crosses the meridian)
 * This is a vertical line at a specific longitude
 */
function calculateMCLine(
  planet: PlanetPosition,
  jd: number
): [number, number][] {
  const gmst = getGMST(jd);

  // The MC longitude is where the planet's RA equals the LST
  // So: LST = GMST + longitude = planet RA
  // Therefore: longitude = planet RA - GMST
  let mcLongitude = planet.rightAscension - gmst;

  // Normalize to -180 to 180
  if (mcLongitude > 180) mcLongitude -= 360;
  if (mcLongitude < -180) mcLongitude += 360;

  // Generate vertical line from pole to pole
  const points: [number, number][] = [];
  for (let lat = -85; lat <= 85; lat += 2) {
    points.push([mcLongitude, lat]);
  }

  return points;
}

/**
 * Calculate IC line coordinates
 * IC is opposite to MC (180 degrees away)
 */
function calculateICLine(
  planet: PlanetPosition,
  jd: number
): [number, number][] {
  const mcLine = calculateMCLine(planet, jd);

  // Shift longitude by 180 degrees
  return mcLine.map(([lng, lat]) => {
    let icLng = lng + 180;
    if (icLng > 180) icLng -= 360;
    return [icLng, lat] as [number, number];
  });
}

/**
 * Calculate AC (Ascendant) line coordinates
 * AC is where the planet rises on the eastern horizon
 * This is a curved line following the horizon
 */
function calculateACLine(
  planet: PlanetPosition,
  jd: number
): [number, number][] {
  const gmst = getGMST(jd);
  const decRad = planet.declination * DEG_TO_RAD;
  const points: [number, number][] = [];

  // For each latitude, calculate where the planet is on the horizon
  for (let lat = LAT_MIN; lat <= LAT_MAX; lat += 1) {
    const latRad = lat * DEG_TO_RAD;

    // Hour angle when planet is on horizon: cos(H) = -tan(lat) * tan(dec)
    const cosH = -Math.tan(latRad) * Math.tan(decRad);

    // Check if planet rises/sets at this latitude
    if (Math.abs(cosH) > 1) continue; // Circumpolar or never rises

    const H = Math.acos(cosH) * RAD_TO_DEG;

    // For AC (rising), use negative hour angle (east of meridian)
    // Local Sidereal Time = RA - H (for rising)
    const lst = planet.rightAscension - H;

    // Convert LST to geographic longitude
    let lng = lst - gmst;

    // Normalize
    if (lng > 180) lng -= 360;
    if (lng < -180) lng += 360;

    points.push([lng, lat]);
  }

  return points;
}

/**
 * Calculate DC (Descendant) line coordinates
 * DC is where the planet sets on the western horizon
 */
function calculateDCLine(
  planet: PlanetPosition,
  jd: number
): [number, number][] {
  const gmst = getGMST(jd);
  const decRad = planet.declination * DEG_TO_RAD;
  const points: [number, number][] = [];

  for (let lat = LAT_MIN; lat <= LAT_MAX; lat += 1) {
    const latRad = lat * DEG_TO_RAD;
    const cosH = -Math.tan(latRad) * Math.tan(decRad);

    if (Math.abs(cosH) > 1) continue;

    const H = Math.acos(cosH) * RAD_TO_DEG;

    // For DC (setting), use positive hour angle (west of meridian)
    const lst = planet.rightAscension + H;

    let lng = lst - gmst;
    if (lng > 180) lng -= 360;
    if (lng < -180) lng += 360;

    points.push([lng, lat]);
  }

  return points;
}

// ============================================
// Main Calculation Function
// ============================================

/**
 * Calculate all astrocartography lines for given birth data
 */
export function calculateAstrocartography(birthData: BirthData): AstrocartographyResult {
  const jd = birthDataToJulianDay(birthData);
  const lines: PlanetaryLine[] = [];

  // Calculate positions and lines for each planet
  for (const planetId of PLANET_ORDER) {
    const position = calculatePlanetPosition(planetId, jd);
    const planetConfig = PLANETS[planetId];

    // Calculate all four line types
    const lineCalculators: Record<LineType, () => [number, number][]> = {
      MC: () => calculateMCLine(position, jd),
      IC: () => calculateICLine(position, jd),
      AC: () => calculateACLine(position, jd),
      DC: () => calculateDCLine(position, jd),
    };

    for (const lineType of ["MC", "IC", "AC", "DC"] as LineType[]) {
      const coordinates = lineCalculators[lineType]();
      const lineTypeConfig = LINE_TYPES[lineType];

      lines.push({
        id: getLineId(planetId, lineType),
        planet: planetId,
        lineType,
        coordinates,
        color: planetConfig.color,
        dashArray: lineTypeConfig.dashArray,
      });
    }
  }

  return {
    birthData,
    julianDay: jd,
    planets: getDefaultPlanets(),
    lines,
    calculatedAt: new Date().toISOString(),
  };
}

// ============================================
// Utility Exports
// ============================================

export { getGMST, getLST, dateToJulianDay };
