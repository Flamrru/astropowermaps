/**
 * Activity Generator
 *
 * Generates "Best For" and "Avoid" activity lists based on:
 * - Active transit aspects
 * - Moon phase and sign
 * - Planet-specific themes
 */

import type { DayTransit, MoonInfo, AspectType } from "@/lib/dashboard-types";
import { PlanetId } from "./types";

// ============================================
// Activity Mappings
// ============================================

/** Activities associated with harmonious aspects to each planet */
const PLANET_BEST_ACTIVITIES: Record<PlanetId, string[]> = {
  sun: [
    "Taking leadership roles",
    "Self-promotion and visibility",
    "Creative self-expression",
    "Making important decisions",
    "Starting new ventures",
  ],
  moon: [
    "Nurturing relationships",
    "Home improvement projects",
    "Intuitive decision-making",
    "Emotional conversations",
    "Self-care rituals",
  ],
  mercury: [
    "Important conversations",
    "Writing and communication",
    "Learning new skills",
    "Signing contracts",
    "Short trips and errands",
  ],
  venus: [
    "Romantic dates and connections",
    "Beauty treatments and self-care",
    "Shopping for luxuries",
    "Creative projects",
    "Social gatherings",
  ],
  mars: [
    "Physical exercise and sports",
    "Starting bold initiatives",
    "Assertive conversations",
    "Competitive activities",
    "Taking decisive action",
  ],
  jupiter: [
    "Big-picture planning",
    "Educational pursuits",
    "Travel planning",
    "Expanding your network",
    "Taking calculated risks",
  ],
  saturn: [
    "Long-term planning",
    "Tackling difficult tasks",
    "Building structure and routine",
    "Professional commitments",
    "Mature conversations",
  ],
  uranus: [
    "Trying something new",
    "Innovative problem-solving",
    "Technology projects",
    "Breaking old patterns",
    "Unexpected adventures",
  ],
  neptune: [
    "Meditation and spiritual practice",
    "Creative visualization",
    "Artistic expression",
    "Compassionate acts",
    "Dream journaling",
  ],
  pluto: [
    "Deep inner work",
    "Transformative conversations",
    "Releasing what no longer serves",
    "Research and investigation",
    "Facing fears courageously",
  ],
};

/** Activities to approach with care when challenging aspects are active */
const PLANET_CAUTION_ACTIVITIES: Record<PlanetId, string[]> = {
  sun: [
    "Ego-driven decisions",
    "Seeking external validation",
    "Overcommitting yourself",
  ],
  moon: [
    "Making emotional decisions",
    "Reactive conversations",
    "Ignoring your feelings",
  ],
  mercury: [
    "Important signing or contracts",
    "Hasty communication",
    "Travel without backup plans",
  ],
  venus: [
    "Major relationship decisions",
    "Overspending on luxuries",
    "People-pleasing at your expense",
  ],
  mars: [
    "Aggressive confrontations",
    "Impulsive actions",
    "Physical risks or overexertion",
  ],
  jupiter: [
    "Overcommitting or overextending",
    "Excessive optimism",
    "Ignoring practical limits",
  ],
  saturn: [
    "Rigid thinking",
    "Self-criticism",
    "Avoiding necessary responsibilities",
  ],
  uranus: [
    "Reckless changes",
    "Rebellion without purpose",
    "Technology impulse buys",
  ],
  neptune: [
    "Escapist behaviors",
    "Unclear agreements",
    "Ignoring reality",
  ],
  pluto: [
    "Power struggles",
    "Manipulative behavior",
    "Obsessive thinking",
  ],
};

/** Moon phase activity recommendations */
const MOON_PHASE_ACTIVITIES: Record<string, { best: string[]; avoid: string[] }> = {
  "New Moon": {
    best: ["Setting intentions", "Starting fresh projects", "Quiet reflection"],
    avoid: ["Expecting immediate results", "Public launches"],
  },
  "Waxing Crescent": {
    best: ["Taking first steps", "Building momentum", "Gathering resources"],
    avoid: ["Giving up too soon", "Major decisions"],
  },
  "First Quarter": {
    best: ["Overcoming obstacles", "Taking action", "Problem-solving"],
    avoid: ["Avoiding challenges", "Staying passive"],
  },
  "Waxing Gibbous": {
    best: ["Refining your approach", "Preparing for completion", "Details work"],
    avoid: ["Starting new things", "Major changes"],
  },
  "Full Moon": {
    best: ["Celebration and gratitude", "Social events", "Releasing what's complete"],
    avoid: ["Starting new projects", "Overreacting emotionally"],
  },
  "Waning Gibbous": {
    best: ["Sharing wisdom", "Teaching others", "Gratitude practices"],
    avoid: ["Holding on too tightly", "New initiations"],
  },
  "Last Quarter": {
    best: ["Letting go", "Completion tasks", "Forgiveness work"],
    avoid: ["Starting new cycles", "Clinging to the past"],
  },
  "Waning Crescent": {
    best: ["Rest and restoration", "Meditation", "Dream work"],
    avoid: ["Forcing outcomes", "High-energy activities"],
  },
};

/** Moon sign activity boosts */
const MOON_SIGN_ACTIVITIES: Record<string, string[]> = {
  Aries: ["Physical activity", "Starting new things", "Bold conversations"],
  Taurus: ["Sensory pleasures", "Financial planning", "Nature time"],
  Gemini: ["Social connections", "Learning", "Writing and communication"],
  Cancer: ["Home activities", "Family time", "Emotional processing"],
  Leo: ["Creative expression", "Playful activities", "Being seen"],
  Virgo: ["Organization", "Health routines", "Detailed work"],
  Libra: ["Partnerships", "Aesthetic projects", "Diplomacy"],
  Scorpio: ["Deep conversations", "Transformation work", "Research"],
  Sagittarius: ["Adventure", "Learning", "Philosophical discussions"],
  Capricorn: ["Career focus", "Long-term planning", "Discipline"],
  Aquarius: ["Group activities", "Innovation", "Social causes"],
  Pisces: ["Creative arts", "Spiritual practice", "Compassionate acts"],
};

// ============================================
// Activity Generation Functions
// ============================================

/**
 * Generate "Best For" activities based on transits and moon
 *
 * @param transits - Array of day's transits
 * @param moon - Moon info (phase and sign)
 * @returns Array of 3-4 activity strings
 */
export function generateBestForActivities(
  transits: DayTransit[],
  moon: MoonInfo
): string[] {
  const activities: Set<string> = new Set();
  const harmonious: AspectType[] = ["trine", "sextile", "conjunction"];

  // 1. Add activities from harmonious transits
  for (const transit of transits) {
    if (harmonious.includes(transit.aspect)) {
      const planetActivities = PLANET_BEST_ACTIVITIES[transit.planet1 as PlanetId];
      if (planetActivities && planetActivities.length > 0) {
        // Pick the most relevant activity (first one)
        activities.add(planetActivities[0]);
      }
      // Also consider the natal planet being activated
      const natalActivities = PLANET_BEST_ACTIVITIES[transit.planet2 as PlanetId];
      if (natalActivities && natalActivities.length > 0) {
        activities.add(natalActivities[1] || natalActivities[0]);
      }
    }
  }

  // 2. Add moon phase activities
  const phaseActivities = MOON_PHASE_ACTIVITIES[moon.phase];
  if (phaseActivities) {
    activities.add(phaseActivities.best[0]);
  }

  // 3. Add moon sign activities
  const signActivities = MOON_SIGN_ACTIVITIES[moon.sign];
  if (signActivities && signActivities.length > 0) {
    activities.add(signActivities[0]);
  }

  // 4. If we don't have enough, add general positive activities
  const fallbackActivities = [
    "Following your intuition",
    "Connecting with loved ones",
    "Creative self-expression",
    "Mindful decision-making",
  ];

  const result = Array.from(activities);
  while (result.length < 3 && fallbackActivities.length > 0) {
    const fallback = fallbackActivities.shift();
    if (fallback && !result.includes(fallback)) {
      result.push(fallback);
    }
  }

  // Return top 4 activities
  return result.slice(0, 4);
}

/**
 * Generate "Avoid" / "Approach with Care" activities
 *
 * @param transits - Array of day's transits
 * @param moon - Moon info (phase and sign)
 * @returns Array of 2-3 activity strings
 */
export function generateAvoidActivities(
  transits: DayTransit[],
  moon: MoonInfo
): string[] {
  const activities: Set<string> = new Set();
  const challenging: AspectType[] = ["square", "opposition"];

  // 1. Add caution activities from challenging transits
  for (const transit of transits) {
    if (challenging.includes(transit.aspect)) {
      const planetCautions = PLANET_CAUTION_ACTIVITIES[transit.planet1 as PlanetId];
      if (planetCautions && planetCautions.length > 0) {
        activities.add(planetCautions[0]);
      }
      // Also consider cautions related to the natal planet
      const natalCautions = PLANET_CAUTION_ACTIVITIES[transit.planet2 as PlanetId];
      if (natalCautions && natalCautions.length > 0 && activities.size < 3) {
        activities.add(natalCautions[0]);
      }
    }
  }

  // 2. Add moon phase cautions
  const phaseActivities = MOON_PHASE_ACTIVITIES[moon.phase];
  if (phaseActivities && phaseActivities.avoid.length > 0) {
    activities.add(phaseActivities.avoid[0]);
  }

  // 3. If no challenging transits, add general mindfulness cautions
  if (activities.size === 0) {
    activities.add("Rushing important decisions");
    activities.add("Ignoring your body's signals");
  }

  // Return 2-3 caution items
  return Array.from(activities).slice(0, 3);
}

/**
 * Generate both activity lists for a day
 *
 * @param transits - Array of day's transits
 * @param moon - Moon info
 * @returns Object with bestFor and avoid arrays
 */
export function generateDayActivities(
  transits: DayTransit[],
  moon: MoonInfo
): { bestFor: string[]; avoid: string[] } {
  return {
    bestFor: generateBestForActivities(transits, moon),
    avoid: generateAvoidActivities(transits, moon),
  };
}

// ============================================
// Exports
// ============================================

export {
  PLANET_BEST_ACTIVITIES,
  PLANET_CAUTION_ACTIVITIES,
  MOON_PHASE_ACTIVITIES,
  MOON_SIGN_ACTIVITIES,
};
