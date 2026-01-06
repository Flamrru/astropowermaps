/**
 * Lifetime Special Transits Calculator
 *
 * Main entry point for calculating rare, once-in-a-lifetime planetary transits.
 *
 * WHAT THIS CALCULATES:
 * - Saturn Returns (~age 29, 58, 87) - Major life restructuring
 * - Jupiter Returns (~every 12 years) - Cycles of expansion
 * - Chiron Return (~age 50) - Healing milestone
 * - Outer planet transits to Sun/Moon - Once-in-lifetime transformations
 *
 * PERFORMANCE:
 * Uses smart sampling (not brute-force) for near-instant calculation.
 * 90-year calculation = ~500 position lookups, not 32,000.
 */

import { BirthData, PlanetId, PlanetPosition } from "./types";
import { birthDataToJulianDay } from "./calculations";
import { calculateChironPosition } from "./chiron";
import {
  findPlanetaryReturns,
  findOuterPlanetTransit,
  julianDayToISO,
  calculateAge,
  getPlanetLongitude,
} from "./lifetime-transit-search";
import {
  LifetimeTransit,
  LifetimeTransitReport,
  LifetimeTransitType,
  LifetimeTransitOptions,
  LifetimePlanetId,
  TransitHit,
  TRANSIT_DESCRIPTIONS,
  TRANSIT_RARITY,
} from "./lifetime-transits-types";

// ============================================
// Helper Functions
// ============================================

/**
 * Get natal degree for a planet from natal positions array
 */
function getNatalDegree(
  natalPositions: PlanetPosition[],
  planet: PlanetId
): number {
  const pos = natalPositions.find((p) => p.id === planet);
  if (!pos) {
    throw new Error(`Natal position for ${planet} not found`);
  }
  return pos.longitude;
}

/**
 * Create a LifetimeTransit object from hits
 */
function createLifetimeTransit(
  type: LifetimeTransitType,
  transitPlanet: LifetimePlanetId,
  natalPlanet: LifetimePlanetId,
  natalDegree: number,
  hits: TransitHit[],
  birthJD: number,
  ordinal?: number
): LifetimeTransit {
  if (hits.length === 0) {
    throw new Error("Cannot create transit with no hits");
  }

  // First hit is the primary date
  const firstHit = hits[0];
  const lastHit = hits[hits.length - 1];

  // Calculate start/end dates (2 degrees of orb before/after)
  // For simplicity, use first and last hit dates
  const startDate = firstHit.date;
  const endDate = lastHit.date;

  // Calculate age at transit
  const age = calculateAge(birthJD, firstHit.julianDay);

  // Generate label based on type and ordinal
  let label = "";
  if (type === "saturn-return") {
    const ordinalText =
      ordinal === 1 ? "First" : ordinal === 2 ? "Second" : "Third";
    label = `${ordinalText} Saturn Return`;
  } else if (type === "jupiter-return") {
    label = `Jupiter Return (age ${age})`;
  } else if (type === "chiron-return") {
    label = "Chiron Return";
  } else {
    // Outer planet transits
    const planetName =
      transitPlanet.charAt(0).toUpperCase() + transitPlanet.slice(1);
    const natalName =
      natalPlanet.charAt(0).toUpperCase() + natalPlanet.slice(1);
    label = `${planetName} conjunct ${natalName}`;
  }

  return {
    type,
    transitPlanet,
    natalPlanet,
    natalDegree,
    hits,
    startDate,
    exactDate: firstHit.date,
    endDate,
    ageAtTransit: age,
    label,
    description: TRANSIT_DESCRIPTIONS[type],
    rarity: TRANSIT_RARITY[type],
  };
}

// ============================================
// Individual Transit Calculators
// ============================================

/**
 * Calculate all Saturn Returns
 */
function calculateSaturnReturns(
  natalSaturnDegree: number,
  birthJD: number,
  lifeSpanYears: number
): LifetimeTransit[] {
  const returns = findPlanetaryReturns(
    "saturn",
    natalSaturnDegree,
    birthJD,
    lifeSpanYears
  );

  return returns.map((hits, index) =>
    createLifetimeTransit(
      "saturn-return",
      "saturn",
      "saturn",
      natalSaturnDegree,
      hits,
      birthJD,
      index + 1
    )
  );
}

/**
 * Calculate all Jupiter Returns
 */
function calculateJupiterReturns(
  natalJupiterDegree: number,
  birthJD: number,
  lifeSpanYears: number
): LifetimeTransit[] {
  const returns = findPlanetaryReturns(
    "jupiter",
    natalJupiterDegree,
    birthJD,
    lifeSpanYears
  );

  return returns.map((hits, index) =>
    createLifetimeTransit(
      "jupiter-return",
      "jupiter",
      "jupiter",
      natalJupiterDegree,
      hits,
      birthJD,
      index + 1
    )
  );
}

/**
 * Calculate Chiron Return (usually just one)
 */
function calculateChironReturn(
  birthJD: number,
  lifeSpanYears: number
): LifetimeTransit | null {
  // Calculate natal Chiron position
  const natalChironDegree = calculateChironPosition(birthJD).longitude;

  const returns = findPlanetaryReturns(
    "chiron",
    natalChironDegree,
    birthJD,
    lifeSpanYears
  );

  if (returns.length === 0) {
    return null;
  }

  return createLifetimeTransit(
    "chiron-return",
    "chiron",
    "chiron",
    natalChironDegree,
    returns[0],
    birthJD
  );
}

/**
 * Calculate outer planet transits to Sun and Moon
 */
function calculateOuterPlanetTransits(
  natalSunDegree: number,
  natalMoonDegree: number,
  birthJD: number,
  lifeSpanYears: number
): LifetimeTransit[] {
  const transits: LifetimeTransit[] = [];

  // Pluto transits
  const plutoToSun = findOuterPlanetTransit(
    "pluto",
    natalSunDegree,
    birthJD,
    lifeSpanYears
  );
  if (plutoToSun.length > 0) {
    transits.push(
      createLifetimeTransit(
        "pluto-to-sun",
        "pluto",
        "sun",
        natalSunDegree,
        plutoToSun,
        birthJD
      )
    );
  }

  const plutoToMoon = findOuterPlanetTransit(
    "pluto",
    natalMoonDegree,
    birthJD,
    lifeSpanYears
  );
  if (plutoToMoon.length > 0) {
    transits.push(
      createLifetimeTransit(
        "pluto-to-moon",
        "pluto",
        "moon",
        natalMoonDegree,
        plutoToMoon,
        birthJD
      )
    );
  }

  // Neptune transits
  const neptuneToSun = findOuterPlanetTransit(
    "neptune",
    natalSunDegree,
    birthJD,
    lifeSpanYears
  );
  if (neptuneToSun.length > 0) {
    transits.push(
      createLifetimeTransit(
        "neptune-to-sun",
        "neptune",
        "sun",
        natalSunDegree,
        neptuneToSun,
        birthJD
      )
    );
  }

  const neptuneToMoon = findOuterPlanetTransit(
    "neptune",
    natalMoonDegree,
    birthJD,
    lifeSpanYears
  );
  if (neptuneToMoon.length > 0) {
    transits.push(
      createLifetimeTransit(
        "neptune-to-moon",
        "neptune",
        "moon",
        natalMoonDegree,
        neptuneToMoon,
        birthJD
      )
    );
  }

  // Uranus transits
  const uranusToSun = findOuterPlanetTransit(
    "uranus",
    natalSunDegree,
    birthJD,
    lifeSpanYears
  );
  if (uranusToSun.length > 0) {
    transits.push(
      createLifetimeTransit(
        "uranus-to-sun",
        "uranus",
        "sun",
        natalSunDegree,
        uranusToSun,
        birthJD
      )
    );
  }

  const uranusToMoon = findOuterPlanetTransit(
    "uranus",
    natalMoonDegree,
    birthJD,
    lifeSpanYears
  );
  if (uranusToMoon.length > 0) {
    transits.push(
      createLifetimeTransit(
        "uranus-to-moon",
        "uranus",
        "moon",
        natalMoonDegree,
        uranusToMoon,
        birthJD
      )
    );
  }

  return transits;
}

// ============================================
// Main Entry Point
// ============================================

/**
 * Calculate all lifetime special transits for a person
 *
 * This is the main entry point for the feature.
 *
 * @param birthData - User's birth information
 * @param natalPositions - Pre-calculated natal planet positions
 * @param options - Calculation options
 * @returns Complete lifetime transit report
 *
 * @example
 * ```typescript
 * const natalPositions = calculateNatalPositions(birthData);
 * const report = calculateLifetimeTransits(birthData, natalPositions);
 *
 * console.log(report.saturnReturns[0].exactDate); // "2029-03-15"
 * console.log(report.nextMajorTransit?.label);    // "First Saturn Return"
 * ```
 */
export function calculateLifetimeTransits(
  birthData: BirthData,
  natalPositions: PlanetPosition[],
  options?: LifetimeTransitOptions
): LifetimeTransitReport {
  const lifeSpanYears = options?.lifeSpanYears ?? 90;
  const includeChiron = options?.includeChiron ?? true;

  // Convert birth data to Julian Day
  const birthJD = birthDataToJulianDay(birthData);

  // Get natal degrees
  const natalSaturnDegree = getNatalDegree(natalPositions, "saturn");
  const natalJupiterDegree = getNatalDegree(natalPositions, "jupiter");
  const natalSunDegree = getNatalDegree(natalPositions, "sun");
  const natalMoonDegree = getNatalDegree(natalPositions, "moon");

  // Calculate each type of transit
  const saturnReturns = calculateSaturnReturns(
    natalSaturnDegree,
    birthJD,
    lifeSpanYears
  );

  const jupiterReturns = calculateJupiterReturns(
    natalJupiterDegree,
    birthJD,
    lifeSpanYears
  );

  const chironReturn = includeChiron
    ? calculateChironReturn(birthJD, lifeSpanYears)
    : null;

  const outerPlanetTransits = calculateOuterPlanetTransits(
    natalSunDegree,
    natalMoonDegree,
    birthJD,
    lifeSpanYears
  );

  // Combine all transits and sort chronologically
  const allTransits: LifetimeTransit[] = [
    ...saturnReturns,
    ...jupiterReturns,
    ...(chironReturn ? [chironReturn] : []),
    ...outerPlanetTransits,
  ].sort(
    (a, b) => new Date(a.exactDate).getTime() - new Date(b.exactDate).getTime()
  );

  // Find next upcoming transit
  const today = new Date().toISOString().split("T")[0];
  const nextMajorTransit =
    allTransits.find((t) => t.exactDate > today) ?? null;

  return {
    birthDate: birthData.date,
    lifeSpanYears,
    saturnReturns,
    jupiterReturns,
    chironReturn,
    outerPlanetTransits,
    allTransits,
    nextMajorTransit,
    calculatedAt: new Date().toISOString(),
  };
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Get just the Saturn Returns for quick access
 */
export function getSaturnReturns(
  birthData: BirthData,
  natalPositions: PlanetPosition[]
): LifetimeTransit[] {
  const birthJD = birthDataToJulianDay(birthData);
  const natalSaturnDegree = getNatalDegree(natalPositions, "saturn");
  return calculateSaturnReturns(natalSaturnDegree, birthJD, 90);
}

/**
 * Get the next major lifetime transit from today
 */
export function getNextMajorTransit(
  birthData: BirthData,
  natalPositions: PlanetPosition[]
): LifetimeTransit | null {
  const report = calculateLifetimeTransits(birthData, natalPositions);
  return report.nextMajorTransit;
}

/**
 * Check if a person is currently in a major transit
 * (within orb of exact date)
 */
export function getCurrentMajorTransit(
  birthData: BirthData,
  natalPositions: PlanetPosition[],
  orbDays: number = 30
): LifetimeTransit | null {
  const report = calculateLifetimeTransits(birthData, natalPositions);
  const today = new Date();

  for (const transit of report.allTransits) {
    const exactDate = new Date(transit.exactDate);
    const daysDiff = Math.abs(
      (today.getTime() - exactDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff <= orbDays) {
      return transit;
    }
  }

  return null;
}
