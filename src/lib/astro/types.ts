/**
 * Astrocartography Types
 *
 * These types define the data structures for birth data input,
 * planetary calculations, and map rendering.
 */

// ============================================
// Input Types (from user form)
// ============================================

export interface BirthLocation {
  name: string;        // "New York, NY, USA"
  lat: number;         // 40.7128
  lng: number;         // -74.0060
  timezone: string;    // "America/New_York"
}

/** Time window for unknown birth times - used for confidence calculations */
export type BirthTimeWindow = "morning" | "afternoon" | "evening" | "unknown";

export interface BirthData {
  date: string;        // "1990-05-15" (ISO date)
  time: string;        // "14:30" (24h format) or "12:00" if unknown
  timeUnknown: boolean; // True if user doesn't know birth time
  location: BirthLocation;
  timeWindow?: BirthTimeWindow; // Optional: if timeUnknown, which window
}

// ============================================
// Calculation Types (internal)
// ============================================

export type PlanetId =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export type LineType = "MC" | "IC" | "AC" | "DC";

export interface PlanetPosition {
  id: PlanetId;
  longitude: number;      // Ecliptic longitude (0-360 degrees)
  latitude: number;       // Ecliptic latitude
  rightAscension: number; // RA in degrees
  declination: number;    // Declination in degrees
}

// ============================================
// Output Types (for map rendering)
// ============================================

export interface PlanetaryLine {
  id: string;             // Unique ID: "sun-MC", "venus-AC", etc.
  planet: PlanetId;
  lineType: LineType;
  coordinates: [number, number][]; // Array of [lng, lat] pairs
  color: string;          // Hex color for rendering
  dashArray?: number[];   // For dashed lines (IC/DC)
}

export interface PlanetInfo {
  id: PlanetId;
  name: string;           // "Sun", "Moon", etc.
  symbol: string;         // Unicode symbol
  color: string;          // Line color
  visible: boolean;       // Toggle state for map
}

export interface AstrocartographyResult {
  birthData: BirthData;
  julianDay: number;
  planets: PlanetInfo[];
  lines: PlanetaryLine[];
  calculatedAt: string;   // ISO timestamp
}

// ============================================
// API Types
// ============================================

export interface AstrocartographyRequest {
  birthData: BirthData;
}

export interface AstrocartographyResponse {
  success: boolean;
  data?: AstrocartographyResult;
  error?: string;
}

// ============================================
// Map Component Types
// ============================================

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

export interface TooltipData {
  planet: PlanetId;
  lineType: LineType;
  interpretation: string;
  position: { x: number; y: number };
}

// ============================================
// Extended Calculation Types (Chart Features)
// ============================================

/**
 * Astro points include planets plus calculated points like nodes
 */
export type AstroPointId = PlanetId | "northNode" | "southNode";

/**
 * Which house a planet or point is located in
 */
export interface HousePlacement {
  point: AstroPointId;    // Planet or node
  house: number;          // House number (1-12)
  longitude: number;      // Exact longitude
  degreeInHouse: number;  // Degrees from house cusp
}

/**
 * A natal aspect between two planets in the birth chart
 */
export interface NatalAspect {
  planet1: PlanetId;
  planet2: PlanetId;
  aspectType: string;     // "conjunction", "trine", etc.
  orb: number;            // Actual orb in degrees
  isExact: boolean;       // Orb < 1°
}

/**
 * Complete natal chart data structure
 * Used for full chart interpretation and AI context
 */
export interface NatalChart {
  birthData: BirthData;
  julianDay: number;

  // Core placements
  planetPositions: PlanetPosition[];

  // Houses (null if birth time unknown)
  houses: {
    cusps: number[];      // 12 house cusps
    system: "placidus" | "equal";
    ascendant: number;
    mc: number;
  } | null;

  // Nodes
  nodes: {
    northNode: { longitude: number; sign: string; degree: number };
    southNode: { longitude: number; sign: string; degree: number };
  };

  // Derived data
  housePlacements: HousePlacement[] | null;
  natalAspects: NatalAspect[];

  // Metadata
  calculatedAt: string;
}
