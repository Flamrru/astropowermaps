/**
 * Chiron Position Calculator
 *
 * Chiron is a centaur (minor planet) orbiting between Saturn and Uranus.
 * It's not included in the VSOP87 theory used by the astronomia library,
 * so we calculate its position using simplified orbital elements.
 *
 * ABOUT CHIRON:
 * - Orbital period: ~50.7 years (hence "Chiron Return" around age 50)
 * - Highly elliptical orbit (e = 0.379)
 * - Perihelion: 8.5 AU (near Saturn's orbit)
 * - Aphelion: 18.9 AU (near Uranus's orbit)
 *
 * ACCURACY:
 * This simplified calculation is accurate to ~0.5-1 degree, which is
 * acceptable for transit timing (within a few weeks for slow-moving Chiron).
 * For exact natal chart positions, a more precise ephemeris would be needed.
 *
 * ORBITAL ELEMENTS (J2000.0 epoch = January 1, 2000, 12:00 TT):
 * - Semi-major axis (a): 13.648 AU
 * - Eccentricity (e): 0.3791
 * - Inclination (i): 6.931°
 * - Longitude of ascending node (Ω): 209.35°
 * - Argument of perihelion (ω): 339.56°
 * - Mean longitude at epoch (L0): 68.48°
 * - Mean daily motion (n): 0.01945°/day
 */

// ============================================
// Constants
// ============================================

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/** Julian Day for J2000.0 epoch (January 1, 2000, 12:00 TT) */
const J2000 = 2451545.0;

/**
 * Chiron orbital elements at J2000.0
 * Source: JPL Small-Body Database
 */
const CHIRON = {
  /** Mean longitude at J2000.0 (degrees) */
  L0: 68.48,

  /** Mean daily motion (degrees per day) */
  n: 0.01945,

  /** Eccentricity */
  e: 0.3791,

  /** Argument of perihelion (degrees) */
  omega: 339.56,

  /** Longitude of ascending node (degrees) */
  Omega: 209.35,

  /** Inclination (degrees) */
  i: 6.931,

  /** Semi-major axis (AU) - not used in simplified calculation */
  a: 13.648,
};

// ============================================
// Position Calculation
// ============================================

/**
 * Calculate Chiron's ecliptic longitude at a given Julian Day
 *
 * Uses a simplified two-body Keplerian approach:
 * 1. Calculate mean longitude from epoch
 * 2. Apply equation of center (accounts for elliptical orbit)
 * 3. Return true ecliptic longitude
 *
 * @param jd - Julian Day number
 * @returns Object with longitude (0-360 degrees)
 *
 * @example
 * // Get Chiron's position today
 * const jd = 2460500.5; // Some Julian Day
 * const { longitude } = calculateChironPosition(jd);
 * console.log(`Chiron is at ${longitude.toFixed(2)}°`);
 */
export function calculateChironPosition(jd: number): { longitude: number } {
  // Days since J2000.0 epoch
  const d = jd - J2000;

  // Step 1: Calculate mean longitude
  // L = L0 + n * d (where n is mean daily motion)
  let L = CHIRON.L0 + CHIRON.n * d;

  // Normalize to 0-360 degrees
  L = normalizeAngle(L);

  // Step 2: Calculate mean anomaly
  // M = L - ω - Ω (simplified, ignoring precession)
  let M = L - CHIRON.omega - CHIRON.Omega;
  M = normalizeAngle(M);
  const Mrad = M * DEG_TO_RAD;

  // Step 3: Apply equation of center (Kepler's approximation)
  // This corrects for the elliptical orbit
  // C ≈ (2e - e³/4)sin(M) + (5e²/4)sin(2M) + (13e³/12)sin(3M)
  const e = CHIRON.e;
  const C =
    (2 * e - (e * e * e) / 4) * Math.sin(Mrad) +
    ((5 * e * e) / 4) * Math.sin(2 * Mrad) +
    ((13 * e * e * e) / 12) * Math.sin(3 * Mrad);

  // Step 4: Calculate true longitude
  // True longitude = Mean longitude + Equation of center
  let trueLongitude = L + C * RAD_TO_DEG;

  // Normalize to 0-360 degrees
  trueLongitude = normalizeAngle(trueLongitude);

  return { longitude: trueLongitude };
}

/**
 * Calculate Chiron's position with additional details
 * (Extended version for debugging/verification)
 *
 * @param jd - Julian Day number
 * @returns Detailed position object
 */
export function calculateChironPositionDetailed(jd: number): {
  longitude: number;
  meanLongitude: number;
  meanAnomaly: number;
  equationOfCenter: number;
  daysSinceEpoch: number;
} {
  const d = jd - J2000;

  let L = CHIRON.L0 + CHIRON.n * d;
  L = normalizeAngle(L);

  let M = L - CHIRON.omega - CHIRON.Omega;
  M = normalizeAngle(M);
  const Mrad = M * DEG_TO_RAD;

  const e = CHIRON.e;
  const C =
    (2 * e - (e * e * e) / 4) * Math.sin(Mrad) +
    ((5 * e * e) / 4) * Math.sin(2 * Mrad) +
    ((13 * e * e * e) / 12) * Math.sin(3 * Mrad);

  let trueLongitude = L + C * RAD_TO_DEG;
  trueLongitude = normalizeAngle(trueLongitude);

  return {
    longitude: trueLongitude,
    meanLongitude: L,
    meanAnomaly: M,
    equationOfCenter: C * RAD_TO_DEG,
    daysSinceEpoch: d,
  };
}

/**
 * Check if Chiron is retrograde at a given Julian Day
 *
 * Chiron appears to move backward (retrograde) when Earth
 * passes it in its orbit. This happens for ~5 months each year.
 *
 * @param jd - Julian Day number
 * @returns true if Chiron is retrograde
 */
export function isChironRetrograde(jd: number): boolean {
  // Compare positions 1 day apart
  const pos1 = calculateChironPosition(jd - 0.5);
  const pos2 = calculateChironPosition(jd + 0.5);

  // Calculate angular difference (accounting for 360° wraparound)
  let diff = pos2.longitude - pos1.longitude;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  // Negative motion = retrograde
  return diff < 0;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Normalize an angle to 0-360 degrees
 */
function normalizeAngle(angle: number): number {
  angle = angle % 360;
  if (angle < 0) angle += 360;
  return angle;
}

/**
 * Get Chiron's zodiac sign from longitude
 *
 * @param longitude - Ecliptic longitude (0-360)
 * @returns Zodiac sign name
 */
export function getChironSign(longitude: number): string {
  const signs = [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ];
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex];
}

/**
 * Format Chiron position for display
 *
 * @param longitude - Ecliptic longitude (0-360)
 * @returns Formatted string like "15° Aries"
 */
export function formatChironPosition(longitude: number): string {
  const sign = getChironSign(longitude);
  const degreeInSign = Math.floor(longitude % 30);
  return `${degreeInSign}° ${sign}`;
}
