/**
 * Zodiac Types (client-safe)
 *
 * Type definitions only - no astronomia imports.
 * Use this file for client-side components that need zodiac types.
 * For actual calculations, use the server-side API (/api/user/birth-data).
 */

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
  degree: number;
  totalDegree: number;
}

export interface BigThree {
  sun: ZodiacInfo;
  moon: ZodiacInfo;
  rising: ZodiacInfo;
}

// Element data for UI theming
export const ELEMENTS: Record<
  Element,
  { name: string; color: string; gradient: string; signs: ZodiacSign[] }
> = {
  fire: {
    name: "Fire",
    color: "#E8C547",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #DC2626 100%)",
    signs: ["Aries", "Leo", "Sagittarius"],
  },
  earth: {
    name: "Earth",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #059669 0%, #065F46 100%)",
    signs: ["Taurus", "Virgo", "Capricorn"],
  },
  air: {
    name: "Air",
    color: "#60A5FA",
    gradient: "linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)",
    signs: ["Gemini", "Libra", "Aquarius"],
  },
  water: {
    name: "Water",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)",
    signs: ["Cancer", "Scorpio", "Pisces"],
  },
};
