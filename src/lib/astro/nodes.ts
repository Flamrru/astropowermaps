/**
 * Lunar Node Calculations
 *
 * Calculates the True (Osculating) North Node position.
 * The True Node oscillates around the Mean Node by ±1.5° due to
 * the Sun's gravitational perturbation on the Moon's orbit.
 *
 * Formulas from Jean Meeus, "Astronomical Algorithms" (2nd Edition), Chapter 47.
 *
 * In astrology:
 * - North Node (☊, Rahu): Soul's growth direction, what you're developing
 * - South Node (☋, Ketu): Past patterns, what you're releasing
 *
 * The nodes move RETROGRADE (backward) through the zodiac, completing
 * a full cycle in approximately 18.6 years.
 */

import { getZodiacFromLongitude, ZodiacSign } from "./zodiac";

// ============================================
// Constants
// ============================================

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// ============================================
// Types
// ============================================

export interface NodePosition {
  longitude: number;    // Ecliptic longitude (0-360°)
  sign: ZodiacSign;     // Zodiac sign
  degree: number;       // Degree within sign (0-30)
  symbol: string;       // ☊ or ☋
  formatted: string;    // "15° Aries"
}

export interface LunarNodeResult {
  northNode: NodePosition;
  southNode: NodePosition;
  isRetrograde: boolean;  // Almost always true (nodes move backward)
  meanNode: number;       // Mean Node longitude (for reference)
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
 * Calculate Mean Lunar Node longitude
 *
 * The Mean Node moves smoothly retrograde at ~19.341° per year
 * This is the baseline before perturbation corrections.
 *
 * @param T - Julian centuries from J2000.0
 * @returns Mean Node longitude in degrees (0-360)
 */
function calculateMeanNode(T: number): number {
  // Meeus formula (Chapter 47, Table 47.A)
  // Ω = 125°.0445479 − 1934°.1362891·T + 0°.0020754·T² + T³/467441 − T⁴/60616000
  const meanNode =
    125.0445479 -
    1934.1362891 * T +
    0.0020754 * T * T +
    (T * T * T) / 467441 -
    (T * T * T * T) / 60616000;

  return normalizeAngle(meanNode);
}

/**
 * Calculate the correction terms to convert Mean Node to True Node
 *
 * The True Node oscillates around the Mean Node due to gravitational
 * perturbations, primarily from the Sun. The oscillation has a period
 * of about 173 days and amplitude of about ±1.5°.
 *
 * @param T - Julian centuries from J2000.0
 * @returns Correction in degrees to add to Mean Node
 */
function calculateNodeCorrection(T: number): number {
  // Fundamental arguments (Meeus, Chapter 47)

  // D = Moon's mean elongation from Sun
  const D =
    297.8501921 +
    445267.1114034 * T -
    0.0018819 * T * T +
    (T * T * T) / 545868 -
    (T * T * T * T) / 113065000;

  // M = Sun's mean anomaly
  const M =
    357.5291092 +
    35999.0502909 * T -
    0.0001536 * T * T +
    (T * T * T) / 24490000;

  // M' = Moon's mean anomaly
  const Mprime =
    134.9633964 +
    477198.8675055 * T +
    0.0087414 * T * T +
    (T * T * T) / 69699 -
    (T * T * T * T) / 14712000;

  // F = Moon's argument of latitude (mean distance from ascending node)
  const F =
    93.272095 +
    483202.0175233 * T -
    0.0036539 * T * T -
    (T * T * T) / 3526000 +
    (T * T * T * T) / 863310000;

  // Convert to radians
  const Drad = (D * DEG_TO_RAD) % (2 * Math.PI);
  const Mrad = (M * DEG_TO_RAD) % (2 * Math.PI);
  const Mprad = (Mprime * DEG_TO_RAD) % (2 * Math.PI);
  const Frad = (F * DEG_TO_RAD) % (2 * Math.PI);

  // Perturbation terms (main terms from Meeus)
  // These create the oscillation of the True Node around the Mean Node
  let correction = 0;

  // Primary perturbation terms
  correction += -1.4979 * Math.sin(2 * Drad - 2 * Frad);
  correction += -0.15 * Math.sin(Mrad);
  correction += -0.1226 * Math.sin(2 * Drad);
  correction += 0.1176 * Math.sin(2 * Frad);
  correction += -0.0801 * Math.sin(2 * Mprad - 2 * Frad);

  // Secondary terms (smaller amplitude)
  correction += 0.0425 * Math.sin(Mprad);
  correction += 0.0315 * Math.sin(2 * Drad - Mrad);
  correction += -0.0124 * Math.sin(2 * Drad - 2 * Frad - Mrad);
  correction += -0.011 * Math.sin(2 * Drad + Mprad);
  correction += 0.0102 * Math.sin(2 * Drad - Mprad);

  return correction;
}

/**
 * Check if the node is currently in direct motion (rare)
 *
 * The nodes are retrograde ~98% of the time, but occasionally
 * go direct for short periods. This calculates the instantaneous
 * motion direction by comparing positions.
 *
 * @param jd - Julian Day
 * @returns true if retrograde (normal), false if direct (rare)
 */
function isNodeRetrograde(jd: number): boolean {
  const T1 = (jd - 2451545.0) / 36525;
  const T2 = (jd + 1 - 2451545.0) / 36525; // One day later

  const node1 = calculateMeanNode(T1) + calculateNodeCorrection(T1);
  const node2 = calculateMeanNode(T2) + calculateNodeCorrection(T2);

  // Account for wrap-around at 0°/360°
  let diff = node2 - node1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  // Negative motion = retrograde (moving backward through zodiac)
  return diff < 0;
}

// ============================================
// Main Export Function
// ============================================

/**
 * Calculate True Lunar Node position for a given Julian Day
 *
 * Returns both North Node (ascending) and South Node (descending).
 * The South Node is always exactly opposite (180°) from the North Node.
 *
 * @param jd - Julian Day number
 * @returns LunarNodeResult with both node positions
 *
 * @example
 * const jd = 2460000.5; // Some date
 * const nodes = calculateTrueNode(jd);
 * console.log(nodes.northNode.formatted); // "15° Aries"
 * console.log(nodes.southNode.formatted); // "15° Libra"
 */
export function calculateTrueNode(jd: number): LunarNodeResult {
  // Calculate Julian centuries from J2000.0 epoch
  const T = (jd - 2451545.0) / 36525;

  // Get Mean Node (baseline)
  const meanNodeLongitude = calculateMeanNode(T);

  // Get correction for True Node
  const correction = calculateNodeCorrection(T);

  // True Node = Mean Node + correction
  const trueNodeLongitude = normalizeAngle(meanNodeLongitude + correction);

  // South Node is exactly opposite
  const southNodeLongitude = normalizeAngle(trueNodeLongitude + 180);

  // Convert to zodiac positions
  const northZodiac = getZodiacFromLongitude(trueNodeLongitude);
  const southZodiac = getZodiacFromLongitude(southNodeLongitude);

  // Check retrograde status
  const retrograde = isNodeRetrograde(jd);

  return {
    northNode: {
      longitude: trueNodeLongitude,
      sign: northZodiac.sign,
      degree: Math.round(northZodiac.degree),
      symbol: "☊",
      formatted: `${Math.round(northZodiac.degree)}° ${northZodiac.sign}`,
    },
    southNode: {
      longitude: southNodeLongitude,
      sign: southZodiac.sign,
      degree: Math.round(southZodiac.degree),
      symbol: "☋",
      formatted: `${Math.round(southZodiac.degree)}° ${southZodiac.sign}`,
    },
    isRetrograde: retrograde,
    meanNode: meanNodeLongitude,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate Mean Lunar Node (without perturbation corrections)
 *
 * Some astrologers prefer Mean Node for its smooth, predictable motion.
 * This is also useful for comparison/debugging.
 *
 * @param jd - Julian Day number
 * @returns Mean Node longitude (0-360°)
 */
export function calculateMeanNodeOnly(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return calculateMeanNode(T);
}

/**
 * Get the difference between True and Mean Node
 *
 * Useful for understanding how much the True Node is "wobbling"
 * at any given moment. Range is approximately ±1.5°.
 *
 * @param jd - Julian Day number
 * @returns Difference in degrees (True - Mean)
 */
export function getTrueMinusMeanNode(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return calculateNodeCorrection(T);
}

// ============================================
// Astrological Interpretation Helpers
// ============================================

/**
 * Node sign meanings for AI prompts
 */
export const NODE_SIGN_THEMES: Record<ZodiacSign, { north: string; south: string }> = {
  Aries: {
    north: "developing independence, courage, and self-assertion",
    south: "releasing over-dependence on others and people-pleasing",
  },
  Taurus: {
    north: "building security, self-worth, and material stability",
    south: "releasing attachment to others' resources and intensity",
  },
  Gemini: {
    north: "cultivating curiosity, communication, and flexibility",
    south: "releasing dogmatic beliefs and over-philosophizing",
  },
  Cancer: {
    north: "nurturing emotional connections and creating home",
    south: "releasing excessive ambition and public image focus",
  },
  Leo: {
    north: "expressing creativity, joy, and personal authenticity",
    south: "releasing over-identification with groups and detachment",
  },
  Virgo: {
    north: "developing practical skills, service, and discernment",
    south: "releasing escapism, victimhood, and boundary dissolution",
  },
  Libra: {
    north: "learning partnership, diplomacy, and compromise",
    south: "releasing excessive independence and self-focus",
  },
  Scorpio: {
    north: "embracing transformation, intimacy, and shared resources",
    south: "releasing material attachment and comfort-seeking",
  },
  Sagittarius: {
    north: "expanding through philosophy, travel, and higher learning",
    south: "releasing superficiality and scattered thinking",
  },
  Capricorn: {
    north: "building structures, reputation, and responsible authority",
    south: "releasing emotional dependency and family patterns",
  },
  Aquarius: {
    north: "serving humanity, innovation, and collective progress",
    south: "releasing ego attachment and need for personal recognition",
  },
  Pisces: {
    north: "developing spirituality, compassion, and surrender",
    south: "releasing over-analysis, criticism, and perfectionism",
  },
};

/**
 * Get node themes for a given node result
 */
export function getNodeThemes(nodes: LunarNodeResult): {
  northTheme: string;
  southTheme: string;
} {
  return {
    northTheme: NODE_SIGN_THEMES[nodes.northNode.sign].north,
    southTheme: NODE_SIGN_THEMES[nodes.southNode.sign].south,
  };
}
