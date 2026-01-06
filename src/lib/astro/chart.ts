/**
 * Unified Chart Calculation
 *
 * This module brings together all astrological calculations into a single
 * interface for computing a complete natal chart:
 * - Planetary positions
 * - Big Three (Sun, Moon, Rising)
 * - Houses (Placidus with Equal fallback)
 * - Lunar Nodes (True Node)
 * - Natal aspects between planets
 * - House placements for each planet
 *
 * This is the primary interface for the AI content APIs.
 */

import { BirthData, PlanetPosition, PlanetId, NatalAspect, HousePlacement, AstroPointId } from "./types";
import { birthDataToJulianDay, calculatePlanetPosition } from "./calculations";
import { PLANET_ORDER } from "./planets";
import { calculateBigThree, BigThree, getZodiacFromLongitude } from "./zodiac";
import { calculateHouses, HouseResult, findHouseForPlanet } from "./houses";
import { calculateTrueNode, LunarNodeResult, getNodeThemes } from "./nodes";
import { ASPECTS, AspectType, ASPECT_SYMBOLS, ASPECT_NAMES } from "./transit-types";

// ============================================
// Types
// ============================================

export interface FullChart {
  // Birth data reference
  birthData: BirthData;
  julianDay: number;

  // Core placements
  bigThree: BigThree;
  planetPositions: PlanetPosition[];

  // Houses (null if birth time unknown)
  houses: HouseResult | null;

  // Lunar Nodes
  nodes: LunarNodeResult;
  nodeThemes: { northTheme: string; southTheme: string };

  // Derived calculations
  natalAspects: NatalAspect[];
  housePlacements: HousePlacement[] | null;

  // Metadata
  calculatedAt: string;
}

// ============================================
// Aspect Calculation
// ============================================

/**
 * Detect aspect between two longitudes
 *
 * @param lon1 - First longitude (0-360)
 * @param lon2 - Second longitude (0-360)
 * @returns Aspect type and orb, or null if no aspect
 */
function detectAspect(
  lon1: number,
  lon2: number
): { type: AspectType; orb: number } | null {
  // Calculate angular difference
  let diff = Math.abs(lon1 - lon2);
  if (diff > 180) diff = 360 - diff;

  // Check each aspect type
  for (const [aspectType, config] of Object.entries(ASPECTS)) {
    const orb = Math.abs(diff - config.degrees);
    if (orb <= config.orb) {
      return { type: aspectType as AspectType, orb };
    }
  }

  return null;
}

/**
 * Calculate all natal aspects between planets
 *
 * Checks every pair of planets for aspects.
 * Returns aspects sorted by tightness (smallest orb first).
 */
function calculateNatalAspects(positions: PlanetPosition[]): NatalAspect[] {
  const aspects: NatalAspect[] = [];

  // Check each unique pair of planets
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const p1 = positions[i];
      const p2 = positions[j];

      const aspect = detectAspect(p1.longitude, p2.longitude);
      if (aspect) {
        aspects.push({
          planet1: p1.id,
          planet2: p2.id,
          aspectType: aspect.type,
          orb: Math.round(aspect.orb * 100) / 100, // Round to 2 decimals
          isExact: aspect.orb < 1,
        });
      }
    }
  }

  // Sort by orb (tightest aspects first)
  aspects.sort((a, b) => a.orb - b.orb);

  return aspects;
}

/**
 * Calculate house placements for all planets
 */
function calculateHousePlacements(
  positions: PlanetPosition[],
  nodes: LunarNodeResult,
  houses: HouseResult
): HousePlacement[] {
  const placements: HousePlacement[] = [];

  // Planet placements
  for (const planet of positions) {
    const house = findHouseForPlanet(planet.longitude, houses);
    const houseCusp = houses.cusps[house - 1].longitude;

    // Calculate degree within house
    let degreeInHouse = planet.longitude - houseCusp;
    if (degreeInHouse < 0) degreeInHouse += 360;

    placements.push({
      point: planet.id,
      house,
      longitude: planet.longitude,
      degreeInHouse: Math.round(degreeInHouse * 10) / 10,
    });
  }

  // North Node placement
  const nnHouse = findHouseForPlanet(nodes.northNode.longitude, houses);
  placements.push({
    point: "northNode",
    house: nnHouse,
    longitude: nodes.northNode.longitude,
    degreeInHouse: 0, // Simplified
  });

  // South Node placement
  const snHouse = findHouseForPlanet(nodes.southNode.longitude, houses);
  placements.push({
    point: "southNode",
    house: snHouse,
    longitude: nodes.southNode.longitude,
    degreeInHouse: 0,
  });

  return placements;
}

// ============================================
// Main Export Functions
// ============================================

/**
 * Calculate a complete natal chart
 *
 * This is the primary function for getting all chart data.
 * Handles birth time unknown gracefully (houses will be null).
 *
 * @param birthData - User's birth data
 * @returns FullChart with all calculations
 *
 * @example
 * const chart = calculateFullChart({
 *   date: "1990-05-15",
 *   time: "14:30",
 *   timeUnknown: false,
 *   location: { name: "NYC", lat: 40.7128, lng: -74.006, timezone: "America/New_York" }
 * });
 *
 * console.log(chart.bigThree.sun.sign); // "Taurus"
 * console.log(chart.nodes.northNode.sign); // e.g., "Aquarius"
 * console.log(chart.houses?.cusps[0].formatted); // e.g., "15° Virgo"
 */
export function calculateFullChart(birthData: BirthData): FullChart {
  // Calculate Julian Day
  const jd = birthDataToJulianDay(birthData);

  // Core planetary positions
  const planetPositions = PLANET_ORDER.map((planetId) =>
    calculatePlanetPosition(planetId, jd)
  );

  // Big Three (Sun, Moon, Rising)
  const bigThree = calculateBigThree(birthData);

  // Lunar Nodes
  const nodes = calculateTrueNode(jd);
  const nodeThemes = getNodeThemes(nodes);

  // Houses (only if birth time is known)
  let houses: HouseResult | null = null;
  let housePlacements: HousePlacement[] | null = null;

  if (!birthData.timeUnknown) {
    houses = calculateHouses(jd, birthData.location.lat, birthData.location.lng);
    housePlacements = calculateHousePlacements(planetPositions, nodes, houses);
  }

  // Natal aspects between planets
  const natalAspects = calculateNatalAspects(planetPositions);

  return {
    birthData,
    julianDay: jd,
    bigThree,
    planetPositions,
    houses,
    nodes,
    nodeThemes,
    natalAspects,
    housePlacements,
    calculatedAt: new Date().toISOString(),
  };
}

// ============================================
// Formatting Helpers for AI Prompts
// ============================================

/**
 * Format chart data as a string for AI prompts
 */
export function formatChartForPrompt(chart: FullChart): string {
  const lines: string[] = [];

  // Big Three
  lines.push("CORE PLACEMENTS:");
  lines.push(`- Sun: ${chart.bigThree.sun.sign} ${chart.bigThree.sun.symbol} at ${chart.bigThree.sun.degree}°`);
  lines.push(`- Moon: ${chart.bigThree.moon.sign} ${chart.bigThree.moon.symbol} at ${chart.bigThree.moon.degree}°`);
  lines.push(`- Rising: ${chart.bigThree.rising.sign} ${chart.bigThree.rising.symbol} at ${chart.bigThree.rising.degree}°`);
  lines.push("");

  // Nodes
  lines.push("LUNAR NODES (Soul Purpose):");
  lines.push(`- North Node ${chart.nodes.northNode.symbol}: ${chart.nodes.northNode.formatted}`);
  lines.push(`  Theme: ${chart.nodeThemes.northTheme}`);
  lines.push(`- South Node ${chart.nodes.southNode.symbol}: ${chart.nodes.southNode.formatted}`);
  lines.push(`  Theme: ${chart.nodeThemes.southTheme}`);
  lines.push("");

  // Houses (if available)
  if (chart.houses) {
    lines.push(`HOUSES (${chart.houses.system.toUpperCase()} system):`);
    lines.push(`- Ascendant (1st): ${chart.houses.cusps[0].formatted}`);
    lines.push(`- IC (4th): ${chart.houses.cusps[3].formatted}`);
    lines.push(`- Descendant (7th): ${chart.houses.cusps[6].formatted}`);
    lines.push(`- MC (10th): ${chart.houses.cusps[9].formatted}`);
    lines.push("");

    // House placements
    if (chart.housePlacements) {
      lines.push("PLANET HOUSE PLACEMENTS:");
      for (const placement of chart.housePlacements) {
        if (placement.point !== "northNode" && placement.point !== "southNode") {
          const planet = chart.planetPositions.find(p => p.id === placement.point);
          if (planet) {
            const zodiac = getZodiacFromLongitude(planet.longitude);
            lines.push(`- ${placement.point}: House ${placement.house} (${zodiac.sign})`);
          }
        }
      }
      lines.push("");
    }
  } else {
    lines.push("HOUSES: Birth time unknown - houses not available");
    lines.push("");
  }

  // Key natal aspects (top 5)
  if (chart.natalAspects.length > 0) {
    lines.push("KEY NATAL ASPECTS:");
    const topAspects = chart.natalAspects.slice(0, 5);
    for (const aspect of topAspects) {
      const symbol = ASPECT_SYMBOLS[aspect.aspectType as AspectType] || aspect.aspectType;
      const exactLabel = aspect.isExact ? " (exact)" : "";
      lines.push(`- ${aspect.planet1} ${symbol} ${aspect.planet2} (${aspect.orb.toFixed(1)}°${exactLabel})`);
    }
  }

  return lines.join("\n");
}

/**
 * Get a summary of significant chart features
 */
export function getChartHighlights(chart: FullChart): string[] {
  const highlights: string[] = [];

  // Element balance
  const elements = {
    fire: 0, earth: 0, air: 0, water: 0
  };
  elements[chart.bigThree.sun.element]++;
  elements[chart.bigThree.moon.element]++;
  elements[chart.bigThree.rising.element]++;

  const dominant = Object.entries(elements).sort((a, b) => b[1] - a[1])[0];
  if (dominant[1] >= 2) {
    highlights.push(`Strong ${dominant[0]} emphasis (${dominant[1]}/3 placements)`);
  }

  // Exact aspects
  const exactAspects = chart.natalAspects.filter(a => a.isExact);
  for (const aspect of exactAspects.slice(0, 2)) {
    const name = ASPECT_NAMES[aspect.aspectType as AspectType] || aspect.aspectType;
    highlights.push(`Exact ${name} between ${aspect.planet1} and ${aspect.planet2}`);
  }

  // Node house placement
  if (chart.housePlacements) {
    const nnPlacement = chart.housePlacements.find(p => p.point === "northNode");
    if (nnPlacement) {
      highlights.push(`North Node in House ${nnPlacement.house}`);
    }
  }

  return highlights;
}

/**
 * Format natal aspects for AI context
 */
export function formatAspectsForPrompt(aspects: NatalAspect[]): string {
  if (aspects.length === 0) return "No significant natal aspects.";

  return aspects
    .slice(0, 8)
    .map((a) => {
      const symbol = ASPECT_SYMBOLS[a.aspectType as AspectType] || a.aspectType;
      const nature = ASPECTS[a.aspectType as AspectType]?.nature || "neutral";
      return `${a.planet1} ${symbol} ${a.planet2} (${a.orb.toFixed(1)}° orb, ${nature})`;
    })
    .join("\n");
}
