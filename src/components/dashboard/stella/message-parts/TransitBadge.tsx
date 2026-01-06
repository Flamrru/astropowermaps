"use client";

/**
 * TransitBadge
 *
 * Displays major transit names as inline badges.
 * Used for transits like "Saturn Return", "Jupiter Return" etc.
 */

// Transit symbols and colors
const TRANSIT_CONFIG: Record<string, { symbol: string; color: string }> = {
  "saturn return": { symbol: "♄", color: "rgba(148, 163, 184, 0.9)" }, // Slate/silver
  "jupiter return": { symbol: "♃", color: "rgba(251, 191, 36, 0.9)" }, // Amber/gold
  "chiron return": { symbol: "⚷", color: "rgba(168, 85, 247, 0.9)" }, // Purple
  "uranus conjunct": { symbol: "♅", color: "rgba(56, 189, 248, 0.9)" }, // Cyan
  "neptune conjunct": { symbol: "♆", color: "rgba(139, 92, 246, 0.9)" }, // Violet
  "pluto conjunct": { symbol: "♇", color: "rgba(244, 63, 94, 0.9)" }, // Rose
};

interface TransitBadgeProps {
  transit: string;
}

export default function TransitBadge({ transit }: TransitBadgeProps) {
  const lowerTransit = transit.toLowerCase();
  const config = TRANSIT_CONFIG[lowerTransit] || { symbol: "✦", color: "#E8C547" };

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium mx-0.5"
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(4px)",
      }}
    >
      <span
        style={{
          color: config.color,
          textShadow: `0 0 6px ${config.color}`,
        }}
      >
        {config.symbol}
      </span>
      <span style={{ color: "rgba(255, 255, 255, 0.9)" }}>
        {transit}
      </span>
    </span>
  );
}
