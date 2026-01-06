"use client";

/**
 * PlanetBadge
 *
 * Displays a planet name with its astrological symbol.
 * Symbol appears in gold with a subtle glow, name in white.
 * Renders inline to flow naturally with text.
 */

// Planet symbols mapping
const PLANET_SYMBOLS: Record<string, string> = {
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
  chiron: "⚷",
};

interface PlanetBadgeProps {
  planet: string;
}

export default function PlanetBadge({ planet }: PlanetBadgeProps) {
  const lowerPlanet = planet.toLowerCase();
  const symbol = PLANET_SYMBOLS[lowerPlanet] || "";

  return (
    <span className="inline-flex items-center gap-0.5">
      {symbol && (
        <span
          className="text-sm"
          style={{
            color: "#E8C547",
            textShadow: "0 0 8px rgba(232, 197, 71, 0.6)",
          }}
        >
          {symbol}
        </span>
      )}
      <span
        className="font-medium"
        style={{
          color: "rgba(255, 255, 255, 0.95)",
        }}
      >
        {planet}
      </span>
    </span>
  );
}
