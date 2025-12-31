/**
 * Planet Configuration
 *
 * Defines the visual properties and metadata for each planet
 * used in astrocartography calculations and map rendering.
 */

import { PlanetId, PlanetInfo, LineType } from "./types";

// ============================================
// Planet Definitions
// ============================================

export const PLANETS: Record<PlanetId, Omit<PlanetInfo, "visible">> = {
  sun: {
    id: "sun",
    name: "Sun",
    symbol: "\u2609", // ☉
    color: "#E8C547", // Gold - matches app theme
  },
  moon: {
    id: "moon",
    name: "Moon",
    symbol: "\u263D", // ☽
    color: "#C0C0C0", // Silver
  },
  mercury: {
    id: "mercury",
    name: "Mercury",
    symbol: "\u263F", // ☿
    color: "#7EC8E3", // Light blue
  },
  venus: {
    id: "venus",
    name: "Venus",
    symbol: "\u2640", // ♀
    color: "#E8A4C9", // Pink
  },
  mars: {
    id: "mars",
    name: "Mars",
    symbol: "\u2642", // ♂
    color: "#E85A5A", // Red
  },
  jupiter: {
    id: "jupiter",
    name: "Jupiter",
    symbol: "\u2643", // ♃
    color: "#9B7ED9", // Purple
  },
  saturn: {
    id: "saturn",
    name: "Saturn",
    symbol: "\u2644", // ♄
    color: "#B5935D", // Brown/tan
  },
  uranus: {
    id: "uranus",
    name: "Uranus",
    symbol: "\u2645", // ♅
    color: "#00CED1", // Cyan
  },
  neptune: {
    id: "neptune",
    name: "Neptune",
    symbol: "\u2646", // ♆
    color: "#2F8B9D", // Teal
  },
  pluto: {
    id: "pluto",
    name: "Pluto",
    symbol: "\u2647", // ♇
    color: "#6B3FA0", // Dark purple
  },
};

// ============================================
// Planet Order (for UI listing)
// ============================================

export const PLANET_ORDER: PlanetId[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
];

// ============================================
// Line Type Definitions
// ============================================

export const LINE_TYPES: Record<
  LineType,
  { name: string; description: string; dashArray?: number[] }
> = {
  MC: {
    name: "Midheaven",
    description: "Where this planet culminates - your public presence and career",
  },
  IC: {
    name: "Imum Coeli",
    description: "Where this planet is at its lowest - your roots, home, and inner self",
    dashArray: [8, 4], // Dashed line
  },
  AC: {
    name: "Ascendant",
    description: "Where this planet rises - how you express yourself and are perceived",
  },
  DC: {
    name: "Descendant",
    description: "Where this planet sets - relationships and partnerships",
    dashArray: [8, 4], // Dashed line
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get all planets with default visibility (all visible)
 */
export function getDefaultPlanets(): PlanetInfo[] {
  return PLANET_ORDER.map((id) => ({
    ...PLANETS[id],
    visible: true,
  }));
}

/**
 * Get planet info by ID
 */
export function getPlanet(id: PlanetId): PlanetInfo {
  return {
    ...PLANETS[id],
    visible: true,
  };
}

/**
 * Generate unique line ID
 */
export function getLineId(planet: PlanetId, lineType: LineType): string {
  return `${planet}-${lineType}`;
}

/**
 * Parse line ID back to components
 */
export function parseLineId(lineId: string): { planet: PlanetId; lineType: LineType } | null {
  const parts = lineId.split("-");
  if (parts.length !== 2) return null;

  const planet = parts[0] as PlanetId;
  const lineType = parts[1] as LineType;

  if (!PLANETS[planet] || !LINE_TYPES[lineType]) return null;

  return { planet, lineType };
}
