/**
 * Zodiac Sign Calculations
 *
 * Converts ecliptic longitude (0-360°) to zodiac signs and provides
 * element mapping for UI theming (Fire, Earth, Air, Water).
 */

import { BirthData, PlanetPosition } from "./types";
import { birthDataToJulianDay } from "./calculations";

// ============================================
// Types
// ============================================

export type ZodiacSign =
  | "Aries"
  | "Taurus"
  | "Gemini"
  | "Cancer"
  | "Leo"
  | "Virgo"
  | "Libra"
  | "Scorpio"
  | "Sagittarius"
  | "Capricorn"
  | "Aquarius"
  | "Pisces";

export type Element = "fire" | "earth" | "air" | "water";

export interface ZodiacInfo {
  sign: ZodiacSign;
  symbol: string;
  element: Element;
  degree: number; // Degree within the sign (0-30)
  totalDegree: number; // Full ecliptic longitude (0-360)
}

export interface BigThree {
  sun: ZodiacInfo;
  moon: ZodiacInfo;
  rising: ZodiacInfo;
}

// ============================================
// Zodiac Data
// ============================================

export const ZODIAC_SIGNS: Array<{
  name: ZodiacSign;
  symbol: string;
  element: Element;
  startDegree: number;
}> = [
  { name: "Aries", symbol: "♈", element: "fire", startDegree: 0 },
  { name: "Taurus", symbol: "♉", element: "earth", startDegree: 30 },
  { name: "Gemini", symbol: "♊", element: "air", startDegree: 60 },
  { name: "Cancer", symbol: "♋", element: "water", startDegree: 90 },
  { name: "Leo", symbol: "♌", element: "fire", startDegree: 120 },
  { name: "Virgo", symbol: "♍", element: "earth", startDegree: 150 },
  { name: "Libra", symbol: "♎", element: "air", startDegree: 180 },
  { name: "Scorpio", symbol: "♏", element: "water", startDegree: 210 },
  { name: "Sagittarius", symbol: "♐", element: "fire", startDegree: 240 },
  { name: "Capricorn", symbol: "♑", element: "earth", startDegree: 270 },
  { name: "Aquarius", symbol: "♒", element: "air", startDegree: 300 },
  { name: "Pisces", symbol: "♓", element: "water", startDegree: 330 },
];

// Element display data for UI
export const ELEMENTS: Record<
  Element,
  { name: string; emoji: string; signs: ZodiacSign[] }
> = {
  fire: {
    name: "Fire",
    emoji: "🔥",
    signs: ["Aries", "Leo", "Sagittarius"],
  },
  earth: {
    name: "Earth",
    emoji: "🌍",
    signs: ["Taurus", "Virgo", "Capricorn"],
  },
  air: {
    name: "Air",
    emoji: "💨",
    signs: ["Gemini", "Libra", "Aquarius"],
  },
  water: {
    name: "Water",
    emoji: "💧",
    signs: ["Cancer", "Scorpio", "Pisces"],
  },
};

// ============================================
// Conversion Functions
// ============================================

/**
 * Get zodiac sign from ecliptic longitude (0-360°)
 *
 * @param longitude - Ecliptic longitude in degrees (0-360)
 * @returns Full zodiac info including sign, symbol, element, and degree
 *
 * @example
 * getZodiacFromLongitude(135) // Leo at 15°
 * getZodiacFromLongitude(0)   // Aries at 0°
 */
export function getZodiacFromLongitude(longitude: number): ZodiacInfo {
  // Normalize to 0-360 range
  const normalized = ((longitude % 360) + 360) % 360;

  // Find the sign (each sign spans 30°)
  const signIndex = Math.floor(normalized / 30);
  const zodiac = ZODIAC_SIGNS[Math.min(signIndex, 11)];

  // Degree within the sign (0-30)
  const degree = Math.round((normalized % 30) * 100) / 100;

  return {
    sign: zodiac.name,
    symbol: zodiac.symbol,
    element: zodiac.element,
    degree,
    totalDegree: normalized,
  };
}

/**
 * Get element from zodiac sign name
 */
export function getElement(sign: ZodiacSign): Element {
  const zodiac = ZODIAC_SIGNS.find((z) => z.name === sign);
  return zodiac?.element ?? "fire";
}

/**
 * Get zodiac symbol from sign name
 */
export function getZodiacSymbol(sign: ZodiacSign): string {
  const zodiac = ZODIAC_SIGNS.find((z) => z.name === sign);
  return zodiac?.symbol ?? "?";
}

/**
 * Format degree display (e.g., "15° Leo")
 */
export function formatZodiacDegree(info: ZodiacInfo): string {
  return `${Math.round(info.degree)}° ${info.sign}`;
}

// ============================================
// Big Three Calculation
// ============================================

/**
 * Calculate Sun sign from birth data
 *
 * Uses the existing calculatePlanetPosition function from calculations.ts
 */
export function calculateSunSign(birthData: BirthData): ZodiacInfo {
  // Import dynamically to avoid circular dependency
  const { calculatePlanetPosition } = require("./calculations");

  const jd = birthDataToJulianDay(birthData);
  const sunPosition: PlanetPosition = calculatePlanetPosition("sun", jd);

  return getZodiacFromLongitude(sunPosition.longitude);
}

/**
 * Calculate Moon sign from birth data
 */
export function calculateMoonSign(birthData: BirthData): ZodiacInfo {
  const { calculatePlanetPosition } = require("./calculations");

  const jd = birthDataToJulianDay(birthData);
  const moonPosition: PlanetPosition = calculatePlanetPosition("moon", jd);

  return getZodiacFromLongitude(moonPosition.longitude);
}

/**
 * Calculate Rising sign (Ascendant) from birth data
 *
 * The Ascendant is the zodiac sign rising on the eastern horizon at birth.
 * It requires both the exact birth time AND location (latitude).
 *
 * Calculation:
 * 1. Find Local Sidereal Time (LST) at birth location
 * 2. Calculate the ecliptic degree on the eastern horizon
 * 3. Convert that degree to zodiac sign
 *
 * @param birthData - Must include precise time and location
 * @returns Rising sign info, or Aries 0° if time is unknown
 */
export function calculateRisingSign(birthData: BirthData): ZodiacInfo {
  // If birth time is unknown, we can't calculate Rising accurately
  if (birthData.timeUnknown) {
    return {
      sign: "Aries",
      symbol: "♈",
      element: "fire",
      degree: 0,
      totalDegree: 0,
    };
  }

  const { birthDataToJulianDay } = require("./calculations");
  const sidereal = require("astronomia/sidereal");

  const jd = birthDataToJulianDay(birthData);
  const lat = birthData.location.lat;
  const lng = birthData.location.lng;

  // Calculate Greenwich Mean Sidereal Time
  const gmst = sidereal.mean(jd) * (180 / Math.PI); // Convert to degrees

  // Local Sidereal Time = GMST + birth longitude
  const lst = (gmst + lng + 360) % 360;

  // Calculate obliquity of the ecliptic
  const T = (jd - 2451545.0) / 36525;
  const obliquity = 23.439291 - 0.0130042 * T; // Simplified formula
  const oblRad = obliquity * (Math.PI / 180);

  // Calculate Ascendant using the formula:
  // tan(ASC) = cos(ε) * tan(LST) / (cos(φ) * sin(ε) - sin(φ) * cos(ε) * tan(LST))
  // Where ε = obliquity, φ = latitude, LST = local sidereal time

  const lstRad = lst * (Math.PI / 180);
  const latRad = lat * (Math.PI / 180);

  const y = Math.cos(lstRad);
  const x =
    -Math.sin(lstRad) * Math.cos(oblRad) -
    Math.tan(latRad) * Math.sin(oblRad);

  let ascendant = Math.atan2(y, x) * (180 / Math.PI);

  // Normalize to 0-360
  ascendant = ((ascendant % 360) + 360) % 360;

  return getZodiacFromLongitude(ascendant);
}

/**
 * Calculate the Big Three (Sun, Moon, Rising) from birth data
 *
 * @param birthData - Birth date, time, and location
 * @returns Object with sun, moon, and rising zodiac info
 */
export function calculateBigThree(birthData: BirthData): BigThree {
  return {
    sun: calculateSunSign(birthData),
    moon: calculateMoonSign(birthData),
    rising: calculateRisingSign(birthData),
  };
}

// ============================================
// Convenience Exports
// ============================================

/**
 * Get all zodiac signs for a given element
 */
export function getSignsByElement(element: Element): ZodiacSign[] {
  return ELEMENTS[element].signs;
}

/**
 * Check if two signs share the same element
 */
export function sameElement(sign1: ZodiacSign, sign2: ZodiacSign): boolean {
  return getElement(sign1) === getElement(sign2);
}
