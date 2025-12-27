/**
 * Astrocartography Calculations
 *
 * This module calculates planetary positions using the astronomia library
 * (VSOP87 theory for planets, full lunar theory for Moon) and generates
 * the geographic coordinates for astrocartography lines (MC, IC, AC, DC).
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

// Import astronomia modules
import * as julian from "astronomia/julian";
import * as sidereal from "astronomia/sidereal";
import * as moonposition from "astronomia/moonposition";
import * as nutation from "astronomia/nutation";
import * as solar from "astronomia/solar";
import { Planet } from "astronomia/planetposition";
import { Ecliptic } from "astronomia/coord";

// Import VSOP87 data for planets
import vsop87Bmercury from "astronomia/data/vsop87Bmercury";
import vsop87Bvenus from "astronomia/data/vsop87Bvenus";
import vsop87Bearth from "astronomia/data/vsop87Bearth";
import vsop87Bmars from "astronomia/data/vsop87Bmars";
import vsop87Bjupiter from "astronomia/data/vsop87Bjupiter";
import vsop87Bsaturn from "astronomia/data/vsop87Bsaturn";
import vsop87Buranus from "astronomia/data/vsop87Buranus";
import vsop87Bneptune from "astronomia/data/vsop87Bneptune";

// ============================================
// Constants
// ============================================

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// Latitude limits for AC/DC lines (beyond these, planets may be circumpolar)
const LAT_MIN = -66;
const LAT_MAX = 66;

// ============================================
// Planet Instances (VSOP87)
// ============================================

// Create planet instances using VSOP87 data
const planetInstances: Record<string, Planet> = {
  mercury: new Planet(vsop87Bmercury),
  venus: new Planet(vsop87Bvenus),
  earth: new Planet(vsop87Bearth),
  mars: new Planet(vsop87Bmars),
  jupiter: new Planet(vsop87Bjupiter),
  saturn: new Planet(vsop87Bsaturn),
  uranus: new Planet(vsop87Buranus),
  neptune: new Planet(vsop87Bneptune),
};

// ============================================
// Julian Day Calculation
// ============================================

/**
 * Parse birth data into Julian Day
 */
export function birthDataToJulianDay(birthData: BirthData): number {
  const [year, month, day] = birthData.date.split("-").map(Number);
  const [hour, minute] = birthData.time.split(":").map(Number);

  // Create a calendar date and convert to Julian Day
  // Note: astronomia uses UT, so we use the time as provided
  // For more accuracy, timezone conversion should be applied
  const decimalHour = hour + minute / 60;

  return julian.CalendarGregorianToJD(year, month, day + decimalHour / 24);
}

// ============================================
// Greenwich Sidereal Time
// ============================================

/**
 * Calculate Greenwich Mean Sidereal Time for a given Julian Day
 * Returns the sidereal time in degrees (0-360)
 */
function getGMST(jd: number): number {
  // Use astronomia's sidereal time calculation (returns seconds)
  const gmstSeconds = sidereal.mean(jd);

  // Convert seconds to degrees (24 hours = 360 degrees)
  const gmstDegrees = (gmstSeconds / 86400) * 360;

  return gmstDegrees;
}

// ============================================
// Planetary Position Calculations
// ============================================

/**
 * Get mean obliquity of the ecliptic for a given JDE
 */
function getObliquity(jde: number): number {
  return nutation.meanObliquity(jde);
}

/**
 * Calculate geocentric position for a planet using VSOP87
 * This converts heliocentric coordinates to geocentric
 */
function calculatePlanetPositionVSOP87(
  planetId: PlanetId,
  jde: number,
  earthPosition: { lon: number; lat: number; range: number }
): PlanetPosition {
  const planet = planetInstances[planetId];

  // Get heliocentric position of the planet
  const helio = planet.position2000(jde);

  // Convert heliocentric to geocentric coordinates
  // Geocentric longitude = heliocentric longitude + 180° (approximately, for outer planets)
  // For more accuracy, we need proper coordinate transformation

  // Calculate geocentric position using vector subtraction
  const helioX = helio.range * Math.cos(helio.lat) * Math.cos(helio.lon);
  const helioY = helio.range * Math.cos(helio.lat) * Math.sin(helio.lon);
  const helioZ = helio.range * Math.sin(helio.lat);

  const earthX = earthPosition.range * Math.cos(earthPosition.lat) * Math.cos(earthPosition.lon);
  const earthY = earthPosition.range * Math.cos(earthPosition.lat) * Math.sin(earthPosition.lon);
  const earthZ = earthPosition.range * Math.sin(earthPosition.lat);

  // Geocentric coordinates (planet position relative to Earth)
  const geoX = helioX - earthX;
  const geoY = helioY - earthY;
  const geoZ = helioZ - earthZ;

  // Convert back to spherical coordinates
  const geoRange = Math.sqrt(geoX * geoX + geoY * geoY + geoZ * geoZ);
  const geoLon = Math.atan2(geoY, geoX);
  const geoLat = Math.asin(geoZ / geoRange);

  // Convert ecliptic to equatorial using astronomia's coord module
  const obliquity = getObliquity(jde);
  const ecliptic = new Ecliptic(geoLon, geoLat);
  const equatorial = ecliptic.toEquatorial(obliquity);

  return {
    id: planetId,
    longitude: ((geoLon * RAD_TO_DEG % 360) + 360) % 360,
    latitude: geoLat * RAD_TO_DEG,
    rightAscension: equatorial.ra * RAD_TO_DEG,
    declination: equatorial.dec * RAD_TO_DEG,
  };
}

/**
 * Calculate Sun position (geocentric)
 */
function calculateSunPosition(jde: number): PlanetPosition {
  // Get Sun's apparent position
  const T = (jde - 2451545.0) / 36525;
  const { lon } = solar.trueLongitude(T);

  // Sun's latitude is essentially 0
  const lat = 0;

  // Convert to equatorial
  const obliquity = getObliquity(jde);
  const ecliptic = new Ecliptic(lon, lat);
  const equatorial = ecliptic.toEquatorial(obliquity);

  return {
    id: "sun",
    longitude: ((lon * RAD_TO_DEG % 360) + 360) % 360,
    latitude: 0,
    rightAscension: equatorial.ra * RAD_TO_DEG,
    declination: equatorial.dec * RAD_TO_DEG,
  };
}

/**
 * Calculate Moon position (already geocentric)
 */
function calculateMoonPosition(jde: number): PlanetPosition {
  // moonposition.position returns geocentric ecliptic coordinates
  const moon = moonposition.position(jde);

  // Convert to equatorial
  const obliquity = getObliquity(jde);
  const ecliptic = new Ecliptic(moon.lon, moon.lat);
  const equatorial = ecliptic.toEquatorial(obliquity);

  return {
    id: "moon",
    longitude: ((moon.lon * RAD_TO_DEG % 360) + 360) % 360,
    latitude: moon.lat * RAD_TO_DEG,
    rightAscension: equatorial.ra * RAD_TO_DEG,
    declination: equatorial.dec * RAD_TO_DEG,
  };
}

/**
 * Calculate Pluto position (simplified - VSOP87 doesn't cover Pluto)
 * Uses simplified orbital elements
 */
function calculatePlutoPosition(jde: number): PlanetPosition {
  // Simplified Pluto calculation (approximate)
  const T = (jde - 2451545.0) / 36525;

  // Mean longitude (approximate)
  let lon = 238.93 + 0.003979 * (jde - 2451545.0);
  lon = ((lon % 360) + 360) % 360;

  // Pluto's inclination causes significant latitude variation
  const lat = 0; // Simplified

  const lonRad = lon * DEG_TO_RAD;
  const latRad = lat * DEG_TO_RAD;

  // Convert to equatorial
  const obliquity = getObliquity(jde);
  const ecliptic = new Ecliptic(lonRad, latRad);
  const equatorial = ecliptic.toEquatorial(obliquity);

  return {
    id: "pluto",
    longitude: lon,
    latitude: lat,
    rightAscension: equatorial.ra * RAD_TO_DEG,
    declination: equatorial.dec * RAD_TO_DEG,
  };
}

/**
 * Calculate planetary position for a given planet and Julian Day
 */
export function calculatePlanetPosition(planet: PlanetId, jd: number): PlanetPosition {
  // Special cases
  if (planet === "sun") {
    return calculateSunPosition(jd);
  }

  if (planet === "moon") {
    return calculateMoonPosition(jd);
  }

  if (planet === "pluto") {
    return calculatePlutoPosition(jd);
  }

  // For VSOP87 planets, we need Earth's position first
  const earth = planetInstances.earth.position2000(jd);
  const earthPosition = {
    lon: earth.lon,
    lat: earth.lat,
    range: earth.range,
  };

  return calculatePlanetPositionVSOP87(planet, jd, earthPosition);
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
// Additional Calculation Functions
// ============================================

/**
 * Calculate natal positions for all planets from birth data
 * Used for transit calculations
 */
export function calculateNatalPositions(birthData: BirthData): PlanetPosition[] {
  const jd = birthDataToJulianDay(birthData);
  return PLANET_ORDER.map((planetId) => calculatePlanetPosition(planetId, jd));
}

// ============================================
// Utility Exports
// ============================================

export { getGMST, birthDataToJulianDay as dateToJulianDay };
