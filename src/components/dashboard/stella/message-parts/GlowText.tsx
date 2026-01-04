"use client";

/**
 * GlowText
 *
 * Renders text with a subtle golden glow effect.
 * Used for bold/emphasized text in Stella's messages.
 */

interface GlowTextProps {
  children: React.ReactNode;
}

export default function GlowText({ children }: GlowTextProps) {
  return (
    <span
      className="font-medium"
      style={{
        color: "rgba(255, 255, 255, 0.95)",
        textShadow: "0 0 12px rgba(232, 197, 71, 0.5), 0 0 4px rgba(232, 197, 71, 0.3)",
      }}
    >
      {children}
    </span>
  );
}
