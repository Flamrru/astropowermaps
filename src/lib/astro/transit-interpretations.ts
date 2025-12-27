/**
 * Transit Interpretations
 *
 * Provides human-readable interpretations for Power Months
 * based on category, score level, and dominant planet.
 */

import { PlanetId } from "./types";
import { LifeCategory } from "./power-places";
import { AspectType, MONTH_NAMES } from "./transit-types";

// ============================================
// Month Interpretations by Category
// ============================================

interface ScoreLevelInterpretation {
  exceptional: string;  // 80-100
  veryStrong: string;   // 60-79
  good: string;         // 40-59
  moderate: string;     // 20-39
  quiet: string;        // 0-19
}

const CATEGORY_INTERPRETATIONS: Record<LifeCategory, ScoreLevelInterpretation> = {
  love: {
    exceptional:
      "An extraordinary month for romance and connection. The stars align powerfully for meaningful relationships, deep emotional bonds, and romantic encounters. If single, this is prime time for meeting someone special. If partnered, expect renewed passion and intimacy.",
    veryStrong:
      "A wonderful month for love and relationships. Strong cosmic support for romantic connections, heartfelt conversations, and emotional growth. Open your heart to new possibilities and deeper connections with those you care about.",
    good:
      "A positive month for love with favorable energy supporting your romantic life. Good opportunities for connection and relationship growth. Stay open to love in unexpected places.",
    moderate:
      "A steady month for relationships. While not peak energy, there's still room for meaningful connection. Focus on nurturing existing bonds and appreciating the love already in your life.",
    quiet:
      "A reflective month for love. Use this time for self-love and understanding what you truly want in relationships. Inner work now prepares you for future romantic opportunities.",
  },
  career: {
    exceptional:
      "A powerhouse month for professional success. Major opportunities for advancement, recognition, and breakthrough achievements. Your work is noticed and rewarded. Take bold action on career goals.",
    veryStrong:
      "Excellent energy for career growth and professional achievements. Doors open more easily, and your efforts gain traction. A great time to pursue promotions, start new projects, or expand your influence.",
    good:
      "Solid support for career matters. Good progress is possible with consistent effort. Focus on building skills and relationships that advance your professional path.",
    moderate:
      "A stable month for career. Maintain momentum on existing projects and look for small ways to stand out. Steady progress beats no progress.",
    quiet:
      "A month for career reflection and planning. Use this time to reassess goals, learn new skills, or prepare for future opportunities. Rest and recharge for bigger pushes ahead.",
  },
  growth: {
    exceptional:
      "A transformative month for personal expansion. Exceptional opportunities for learning, travel, and spiritual growth. Say yes to adventures and new experiences. Your worldview expands dramatically.",
    veryStrong:
      "Powerful energy for personal development and expansion. Great time for education, travel, or exploring new philosophies. Push beyond your comfort zone and grow.",
    good:
      "Supportive energy for growth and learning. Good opportunities to expand your horizons through study, travel, or new experiences. Stay curious and open-minded.",
    moderate:
      "A month of gradual growth. Small steps forward add up. Focus on one area of development and give it consistent attention.",
    quiet:
      "A month for internal growth. While external expansion may be limited, inner development flourishes. Reflect on your journey and consolidate recent lessons.",
  },
  home: {
    exceptional:
      "An outstanding month for home and family. Perfect energy for buying property, moving, or major home improvements. Family bonds strengthen significantly. Create your sanctuary.",
    veryStrong:
      "Excellent support for domestic matters. Great time for home projects, family gatherings, or establishing deeper roots. Your living space becomes a source of joy.",
    good:
      "Positive energy for home and family life. Good time for smaller improvements, quality family time, and creating comfort. Appreciate your personal space.",
    moderate:
      "A steady month for domestic life. Maintain what you have and make small improvements. Family relationships remain stable with some nurturing.",
    quiet:
      "A month to simplify at home. Less about big changes, more about finding peace in your current space. Declutter, rest, and restore your home energy.",
  },
};

// ============================================
// Planet-Specific Modifiers
// ============================================

interface PlanetModifier {
  love: string;
  career: string;
  growth: string;
  home: string;
}

const PLANET_MODIFIERS: Record<PlanetId, PlanetModifier> = {
  sun: {
    love: "Your authentic self shines in relationships.",
    career: "Leadership opportunities and recognition await.",
    growth: "Self-expression and creativity flourish.",
    home: "You become the heart of your home.",
  },
  moon: {
    love: "Emotional depth and nurturing connections.",
    career: "Trust your instincts in professional matters.",
    growth: "Emotional intelligence expands significantly.",
    home: "Deep comfort and family bonding.",
  },
  mercury: {
    love: "Communication opens hearts.",
    career: "Ideas and negotiations succeed.",
    growth: "Learning and intellectual expansion.",
    home: "Important family conversations.",
  },
  venus: {
    love: "Romance, beauty, and attraction peak.",
    career: "Diplomacy and charm advance your goals.",
    growth: "Appreciation for life's pleasures.",
    home: "Beautifying your space brings joy.",
  },
  mars: {
    love: "Passion and desire intensify.",
    career: "Drive and ambition fuel success.",
    growth: "Courage to pursue new challenges.",
    home: "Energy for home projects.",
  },
  jupiter: {
    love: "Expansion and optimism in relationships.",
    career: "Luck and abundance in professional life.",
    growth: "Major personal expansion and opportunity.",
    home: "Abundance flows into your home life.",
  },
  saturn: {
    love: "Commitment and long-term bonds solidify.",
    career: "Hard work pays off with lasting results.",
    growth: "Discipline brings meaningful achievement.",
    home: "Structure and stability at home.",
  },
  uranus: {
    love: "Exciting, unexpected romantic developments.",
    career: "Innovation and breakthrough ideas.",
    growth: "Radical personal transformation.",
    home: "Surprising changes in living situation.",
  },
  neptune: {
    love: "Spiritual and soulmate connections.",
    career: "Creative and intuitive success.",
    growth: "Spiritual awakening and inspiration.",
    home: "Creating a dreamlike sanctuary.",
  },
  pluto: {
    love: "Deep transformation in relationships.",
    career: "Power shifts and major changes.",
    growth: "Profound personal rebirth.",
    home: "Complete home transformation.",
  },
};

// ============================================
// Main Interpretation Function
// ============================================

/**
 * Get a full interpretation for a month based on category, score, and dominant planet
 *
 * @param category - Life category
 * @param score - Score 0-100
 * @param month - Month number (1-12)
 * @param dominantPlanet - Most influential planet
 * @returns Human-readable interpretation
 */
export function getMonthInterpretation(
  category: LifeCategory,
  score: number,
  month: number,
  dominantPlanet: PlanetId
): string {
  const categoryTexts = CATEGORY_INTERPRETATIONS[category];
  const planetModifier = PLANET_MODIFIERS[dominantPlanet][category];
  const monthName = MONTH_NAMES[month - 1];

  // Get base interpretation based on score
  let baseText: string;
  if (score >= 80) {
    baseText = categoryTexts.exceptional;
  } else if (score >= 60) {
    baseText = categoryTexts.veryStrong;
  } else if (score >= 40) {
    baseText = categoryTexts.good;
  } else if (score >= 20) {
    baseText = categoryTexts.moderate;
  } else {
    baseText = categoryTexts.quiet;
  }

  // Combine with planet modifier
  return `${baseText} ${planetModifier}`;
}

/**
 * Get a short interpretation (one sentence) for UI displays
 */
export function getShortInterpretation(
  category: LifeCategory,
  score: number,
  dominantPlanet: PlanetId
): string {
  const planetModifier = PLANET_MODIFIERS[dominantPlanet][category];

  if (score >= 80) return `Exceptional energy. ${planetModifier}`;
  if (score >= 60) return `Very strong month. ${planetModifier}`;
  if (score >= 40) return `Good opportunities. ${planetModifier}`;
  if (score >= 20) return `Steady progress. ${planetModifier}`;
  return `Quiet month for reflection.`;
}

// ============================================
// Aspect Interpretations
// ============================================

/**
 * Get interpretation for a specific aspect
 */
export function getAspectInterpretation(
  transitPlanet: PlanetId,
  natalPlanet: PlanetId,
  aspectType: AspectType
): string {
  const transitName = formatPlanetName(transitPlanet);
  const natalName = formatPlanetName(natalPlanet);

  const aspectMeanings: Record<AspectType, string> = {
    conjunction: `${transitName} merges with your ${natalName}, creating powerful new energy`,
    sextile: `${transitName} harmonizes with your ${natalName}, opening opportunities`,
    square: `${transitName} challenges your ${natalName}, driving growth through tension`,
    trine: `${transitName} flows beautifully with your ${natalName}, bringing ease`,
    opposition: `${transitName} illuminates your ${natalName}, bringing awareness`,
  };

  return aspectMeanings[aspectType];
}

/**
 * Get a brief aspect description for UI
 */
export function getAspectBrief(
  transitPlanet: PlanetId,
  natalPlanet: PlanetId,
  aspectType: AspectType
): string {
  return `${formatPlanetName(transitPlanet)} ${aspectType} natal ${formatPlanetName(natalPlanet)}`;
}

// ============================================
// Peak Window Interpretations
// ============================================

/**
 * Get interpretation for a peak window
 */
export function getPeakWindowInterpretation(
  category: LifeCategory,
  intensity: "high" | "very-high" | "exceptional",
  reason: string
): string {
  const intensityPhrases = {
    high: "This week brings heightened energy",
    "very-high": "A powerful window opens",
    exceptional: "Peak cosmic alignment creates extraordinary potential",
  };

  const categoryFocus: Record<LifeCategory, string> = {
    love: "for romantic connection and emotional bonding",
    career: "for professional achievement and recognition",
    growth: "for personal expansion and learning",
    home: "for domestic harmony and family bonds",
  };

  return `${intensityPhrases[intensity]} ${categoryFocus[category]}. Key influence: ${reason}.`;
}

// ============================================
// Utility Functions
// ============================================

function formatPlanetName(planet: PlanetId): string {
  return planet.charAt(0).toUpperCase() + planet.slice(1);
}

/**
 * Get category label for display
 */
export function getCategoryLabel(category: LifeCategory): string {
  const labels: Record<LifeCategory, string> = {
    love: "Love & Romance",
    career: "Career & Success",
    growth: "Personal Growth",
    home: "Home & Family",
  };
  return labels[category];
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: LifeCategory): string {
  const icons: Record<LifeCategory, string> = {
    love: "💕",
    career: "💼",
    growth: "🌟",
    home: "🏠",
  };
  return icons[category];
}

/**
 * Get color for category (matching existing app colors)
 */
export function getCategoryColor(category: LifeCategory): string {
  const colors: Record<LifeCategory, string> = {
    love: "#E8A4C9",   // Pink
    career: "#E8C547", // Gold
    growth: "#9B7ED9", // Purple
    home: "#C4C4C4",   // Gray/Silver
  };
  return colors[category];
}
