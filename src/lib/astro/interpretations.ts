/**
 * Astrocartography Line Interpretations
 *
 * Each planet-line combination has a specific meaning in astrocartography.
 * These interpretations describe the energy and themes activated when
 * you visit or live near these lines.
 */

import { PlanetId, LineType } from "./types";

// ============================================
// Interpretation Types
// ============================================

export interface Interpretation {
  title: string;
  description: string;
  plainSummary: string;  // One-liner in casual language
  tips: string[];        // Actionable suggestions
}

type InterpretationMap = Record<PlanetId, Record<LineType, Interpretation>>;

// ============================================
// Line Type Friendly Names
// ============================================

export const LINE_TYPE_NAMES: Record<LineType, { name: string; description: string }> = {
  MC: {
    name: "Midheaven Line",
    description: "Where you shine publicly and build your reputation",
  },
  IC: {
    name: "Foundation Line",
    description: "Where you feel at home and connect with your roots",
  },
  AC: {
    name: "Rising Line",
    description: "Where you express your true self most powerfully",
  },
  DC: {
    name: "Setting Line",
    description: "Where you attract meaningful relationships",
  },
};

// ============================================
// Interpretation Data
// ============================================

export const INTERPRETATIONS: InterpretationMap = {
  sun: {
    MC: {
      title: "Sun Midheaven - Spotlight of Success",
      description:
        "Your identity shines brightest here. This is a place of recognition, leadership, and career advancement. You naturally step into positions of authority and visibility. Fame and public success are possible along this line.",
      plainSummary: "This place wants to make you famous.",
      tips: [
        "Great for career moves and job interviews",
        "Consider this location for business launches",
        "Your leadership abilities shine here",
      ],
    },
    IC: {
      title: "Sun Imum Coeli - Heart of Home",
      description:
        "Here you connect deeply with your roots and inner self. Family matters become central, and you may feel drawn to explore your ancestry. A powerful place for self-discovery and building a meaningful home life.",
      plainSummary: "You'll feel most yourself at home here.",
      tips: [
        "Ideal for self-discovery retreats",
        "Good place to research family history",
        "Perfect for building your forever home",
      ],
    },
    AC: {
      title: "Sun Ascendant - Radiating Vitality",
      description:
        "Your presence becomes magnetic and vibrant. This line enhances self-confidence, creativity, and personal expression. You naturally attract attention and feel more alive, energetic, and authentic.",
      plainSummary: "People notice you the moment you walk in.",
      tips: [
        "Perfect for personal reinvention",
        "Great for creative projects",
        "Your confidence naturally increases here",
      ],
    },
    DC: {
      title: "Sun Descendant - Illuminating Partnerships",
      description:
        "Relationships take center stage here. You attract confident, charismatic partners and meaningful connections. This line highlights partnerships that help define who you are through others.",
      plainSummary: "You'll meet partners who light up your life.",
      tips: [
        "Good for finding a confident partner",
        "Business partnerships thrive here",
        "Great for collaborative projects",
      ],
    },
  },

  moon: {
    MC: {
      title: "Moon Midheaven - Public Nurturer",
      description:
        "Your emotional sensitivity becomes a career asset. Success comes through caring professions, public service, or connecting with the masses. You're seen as nurturing and emotionally intelligent.",
      plainSummary: "Your caring nature becomes your superpower.",
      tips: [
        "Ideal for careers in healthcare or education",
        "Great for public-facing emotional work",
        "Your empathy helps you connect with audiences",
      ],
    },
    IC: {
      title: "Moon Imum Coeli - Emotional Sanctuary",
      description:
        "This is perhaps the most powerful place for emotional healing and creating a true home. Deep connections to family, ancestry, and your inner world flourish here. A place of profound belonging.",
      plainSummary: "This is where your soul feels at home.",
      tips: [
        "The best line for settling down",
        "Powerful for emotional healing",
        "Perfect for raising a family",
      ],
    },
    AC: {
      title: "Moon Ascendant - Intuitive Self",
      description:
        "Your emotional and intuitive nature leads the way. You become more receptive, sensitive, and connected to your feelings. Mood fluctuations are common, but so is enhanced empathy and intuition.",
      plainSummary: "Your intuition becomes your guide.",
      tips: [
        "Trust your gut feelings here",
        "Great for creative and intuitive work",
        "Be mindful of emotional sensitivity",
      ],
    },
    DC: {
      title: "Moon Descendant - Emotional Bonds",
      description:
        "Deep emotional connections in relationships are highlighted. Partners who nurture and care for you appear along this line. Family-like bonds form with significant others.",
      plainSummary: "You'll find someone who truly understands you.",
      tips: [
        "Ideal for finding a nurturing partner",
        "Deep emotional bonds form here",
        "Great for healing relationship patterns",
      ],
    },
  },

  mercury: {
    MC: {
      title: "Mercury Midheaven - Voice of Authority",
      description:
        "Communication and intellect drive your career success. Writing, teaching, speaking, and all forms of information exchange are favored. Your ideas gain public recognition here.",
      plainSummary: "Your words carry weight and influence.",
      tips: [
        "Perfect for writers and speakers",
        "Great for teaching or consulting",
        "Your ideas get noticed here",
      ],
    },
    IC: {
      title: "Mercury Imum Coeli - Roots of Thought",
      description:
        "Intellectual exploration of your origins and inner world. This line favors studying family history, working from home, or developing ideas in private before sharing them publicly.",
      plainSummary: "A quiet place to think and create.",
      tips: [
        "Ideal for remote work",
        "Great for writing projects",
        "Good for researching family history",
      ],
    },
    AC: {
      title: "Mercury Ascendant - Quick Mind",
      description:
        "You become more curious, talkative, and mentally agile. Learning comes easily, and you express yourself with wit and clarity. A great line for students, writers, and communicators.",
      plainSummary: "Your mind becomes sharper and quicker.",
      tips: [
        "Perfect for students and learners",
        "Great for networking events",
        "Your communication skills shine",
      ],
    },
    DC: {
      title: "Mercury Descendant - Meeting of Minds",
      description:
        "Partnerships are intellectually stimulating. You attract clever, communicative partners and thrive in relationships built on mental connection and shared ideas.",
      plainSummary: "You'll find someone you can talk to for hours.",
      tips: [
        "Great for finding intellectual partners",
        "Ideal for collaborative brainstorming",
        "Communication in relationships flows easily",
      ],
    },
  },

  venus: {
    MC: {
      title: "Venus Midheaven - Beauty in Career",
      description:
        "Success through art, beauty, diplomacy, and social grace. Careers in fashion, design, entertainment, or anything aesthetic are favored. You're seen as charming and attractive professionally.",
      plainSummary: "Your taste and charm open doors.",
      tips: [
        "Great for creative careers",
        "Perfect for networking and diplomacy",
        "Your aesthetic sense is valued here",
      ],
    },
    IC: {
      title: "Venus Imum Coeli - Beautiful Home",
      description:
        "Creating a harmonious, beautiful home environment becomes important. This line favors domestic happiness, artistic home projects, and finding peace in your private life.",
      plainSummary: "You'll create a home that feels like art.",
      tips: [
        "Perfect for interior design projects",
        "Domestic harmony comes easily",
        "Great for hosting and entertaining",
      ],
    },
    AC: {
      title: "Venus Ascendant - Magnetic Charm",
      description:
        "Your attractiveness and social appeal increase dramatically. Love, beauty, and pleasure are enhanced. This is a powerful line for romance, art, and enjoying life's pleasures.",
      plainSummary: "You become irresistibly charming here.",
      tips: [
        "One of the best lines for romance",
        "Your beauty and charm are enhanced",
        "Great for social events and dating",
      ],
    },
    DC: {
      title: "Venus Descendant - Love Destiny",
      description:
        "One of the most romantic lines in astrocartography. Significant love relationships are likely here. Partners are beautiful, artistic, or bring harmony and pleasure into your life.",
      plainSummary: "This is where you find true love.",
      tips: [
        "THE line for finding your soulmate",
        "Partners bring beauty into your life",
        "Great for honeymoons and romantic trips",
      ],
    },
  },

  mars: {
    MC: {
      title: "Mars Midheaven - Ambitious Drive",
      description:
        "Career ambition and competitive energy are maximized. Success through boldness, leadership, and initiative. Athletic, military, or entrepreneurial pursuits are favored, but watch for conflicts with authority.",
      plainSummary: "Your ambition and drive go into overdrive.",
      tips: [
        "Great for competitive industries",
        "Perfect for athletic pursuits",
        "Channel energy into productive goals",
      ],
    },
    IC: {
      title: "Mars Imum Coeli - Inner Fire",
      description:
        "Energy is directed toward home and private matters. Renovations, physical improvements to your space, or working on inner strength are themes. Family dynamics may be intense.",
      plainSummary: "You'll feel motivated to improve your space.",
      tips: [
        "Great for home renovation projects",
        "Channel energy into exercise at home",
        "Work through family dynamics actively",
      ],
    },
    AC: {
      title: "Mars Ascendant - Warrior Spirit",
      description:
        "You become more assertive, energetic, and physically active. Courage and initiative increase, but so can impatience and conflict. Great for athletes and those who need to take bold action.",
      plainSummary: "You feel bold, brave, and ready to act.",
      tips: [
        "Perfect for fitness and sports",
        "Great for taking bold action",
        "Be mindful of impatience",
      ],
    },
    DC: {
      title: "Mars Descendant - Passionate Partnerships",
      description:
        "Relationships are intense and passionate. You attract dynamic, assertive partners. There's potential for both great passion and conflict in partnerships along this line.",
      plainSummary: "Expect sparks and passion in love.",
      tips: [
        "Attracts passionate partners",
        "Great for adventurous relationships",
        "Learn to channel intensity positively",
      ],
    },
  },

  jupiter: {
    MC: {
      title: "Jupiter Midheaven - Career Expansion",
      description:
        "One of the best lines for career success and recognition. Opportunities for growth, promotion, and abundance in your professional life. Teaching, law, publishing, and international work are favored.",
      plainSummary: "Career opportunities seem to find you.",
      tips: [
        "THE line for career advancement",
        "Great for international business",
        "Opportunities multiply here",
      ],
    },
    IC: {
      title: "Jupiter Imum Coeli - Abundant Home",
      description:
        "Expansion and growth in home and family matters. A spacious home, large family gatherings, and philosophical exploration of your roots are themes. Inner optimism develops.",
      plainSummary: "Your home life expands and flourishes.",
      tips: [
        "Great for large family gatherings",
        "Perfect for spacious homes",
        "Inner growth and optimism increase",
      ],
    },
    AC: {
      title: "Jupiter Ascendant - Fortunate Self",
      description:
        "Luck and optimism follow you here. You feel more confident, generous, and expansive. Travel, higher learning, and adventure call strongly along this line.",
      plainSummary: "You become a magnet for good fortune.",
      tips: [
        "One of the luckiest lines overall",
        "Great for travel and adventure",
        "Your confidence naturally expands",
      ],
    },
    DC: {
      title: "Jupiter Descendant - Beneficial Partners",
      description:
        "Partnerships bring growth and good fortune. You attract generous, wise, or wealthy partners. Marriage and business partnerships are especially favored along this line.",
      plainSummary: "Partners bring abundance into your life.",
      tips: [
        "Attracts successful partners",
        "Great for business partnerships",
        "Relationships lead to growth",
      ],
    },
  },

  saturn: {
    MC: {
      title: "Saturn Midheaven - Serious Success",
      description:
        "Career advancement through hard work, discipline, and perseverance. Authority and reputation are earned over time. This is a line of professional mastery, but requires patience and effort.",
      plainSummary: "Hard work here leads to lasting success.",
      tips: [
        "Great for building long-term career",
        "Authority is earned through effort",
        "Perfect for mastering your craft",
      ],
    },
    IC: {
      title: "Saturn Imum Coeli - Grounded Roots",
      description:
        "Responsibilities around home and family increase. Building solid foundations, dealing with property matters, or caring for elders are themes. Emotional maturity develops through challenges.",
      plainSummary: "You build foundations that last forever.",
      tips: [
        "Good for buying property",
        "Teaches responsibility in family",
        "Builds emotional maturity",
      ],
    },
    AC: {
      title: "Saturn Ascendant - Mature Presence",
      description:
        "You're taken more seriously here. Maturity, responsibility, and discipline become prominent traits. Good for building long-term achievements, but can feel restrictive or isolating.",
      plainSummary: "People take you seriously here.",
      tips: [
        "Great for professional credibility",
        "Builds discipline and structure",
        "Balance work with self-care",
      ],
    },
    DC: {
      title: "Saturn Descendant - Committed Partners",
      description:
        "Serious, committed relationships are the theme. Partners may be older, more mature, or bring responsibilities. Long-term commitments and learning through relationships are emphasized.",
      plainSummary: "You find partners ready for commitment.",
      tips: [
        "Attracts mature, stable partners",
        "Great for long-term commitments",
        "Relationships teach important lessons",
      ],
    },
  },

  uranus: {
    MC: {
      title: "Uranus Midheaven - Revolutionary Career",
      description:
        "Unconventional career paths and sudden changes in professional life. Innovation, technology, and breaking from tradition are favored. Your unique vision can change your industry.",
      plainSummary: "Your unique ideas can change the game.",
      tips: [
        "Great for tech and innovation",
        "Embrace unconventional career paths",
        "Your originality is valued here",
      ],
    },
    IC: {
      title: "Uranus Imum Coeli - Liberated Roots",
      description:
        "Breaking free from family patterns and traditions. Unusual living situations or frequent changes to your home life. Inner awakening and psychological liberation are possible.",
      plainSummary: "You break free from old family patterns.",
      tips: [
        "Great for personal liberation",
        "Embrace unconventional living",
        "Perfect for inner awakening",
      ],
    },
    AC: {
      title: "Uranus Ascendant - Awakened Self",
      description:
        "Your individuality and uniqueness are amplified. You become more independent, inventive, and willing to break conventions. Expect the unexpected in how you present yourself.",
      plainSummary: "You embrace what makes you different.",
      tips: [
        "Great for personal reinvention",
        "Your uniqueness stands out",
        "Embrace unexpected changes",
      ],
    },
    DC: {
      title: "Uranus Descendant - Unusual Partnerships",
      description:
        "Unconventional relationships and partners who are different or eccentric. Freedom within partnerships is essential. Sudden beginnings and endings of relationships may occur.",
      plainSummary: "You attract fascinating, unusual partners.",
      tips: [
        "Attracts unique individuals",
        "Relationships need freedom",
        "Embrace non-traditional dynamics",
      ],
    },
  },

  neptune: {
    MC: {
      title: "Neptune Midheaven - Inspired Career",
      description:
        "Careers in art, music, film, healing, or spirituality are favored. Public image may be idealized or confusing. Creative inspiration flows, but practical matters may be unclear.",
      plainSummary: "Your creative dreams can become reality.",
      tips: [
        "Great for artists and healers",
        "Follow your creative inspiration",
        "Stay grounded in practical matters",
      ],
    },
    IC: {
      title: "Neptune Imum Coeli - Spiritual Home",
      description:
        "Deep spiritual or artistic experiences in private life. Family may have secrets or spiritual dimensions. Creating a sanctuary for retreat and inner exploration is important.",
      plainSummary: "Your home becomes a spiritual sanctuary.",
      tips: [
        "Perfect for meditation retreats",
        "Create a peaceful home sanctuary",
        "Explore family spirituality",
      ],
    },
    AC: {
      title: "Neptune Ascendant - Dreamy Presence",
      description:
        "You become more sensitive, imaginative, and spiritually attuned. Artistic abilities are enhanced, but boundaries may blur. A line of inspiration but also potential confusion.",
      plainSummary: "You tap into creative and spiritual gifts.",
      tips: [
        "Great for artistic expression",
        "Trust your spiritual intuition",
        "Maintain healthy boundaries",
      ],
    },
    DC: {
      title: "Neptune Descendant - Idealized Love",
      description:
        "Romantic idealism colors relationships. Partners may seem magical or confusing. Spiritual connections are possible, but so is disillusionment if expectations are unrealistic.",
      plainSummary: "Love feels like a beautiful dream here.",
      tips: [
        "Can attract soulmate connections",
        "Keep expectations realistic",
        "Look for spiritual compatibility",
      ],
    },
  },

  pluto: {
    MC: {
      title: "Pluto Midheaven - Powerful Transformation",
      description:
        "Career involves power, transformation, or depth. Positions of influence and control are possible. Your professional life may undergo complete rebirth and regeneration.",
      plainSummary: "You can become truly powerful here.",
      tips: [
        "Great for transformational leadership",
        "Careers in psychology or investigation",
        "Embrace professional rebirth",
      ],
    },
    IC: {
      title: "Pluto Imum Coeli - Deep Roots",
      description:
        "Profound transformation through exploring your past and inner world. Family secrets may emerge. Psychological healing and releasing old patterns are powerful themes.",
      plainSummary: "Deep healing transforms your foundation.",
      tips: [
        "Powerful for therapy and healing",
        "Family patterns can be resolved",
        "Perfect for shadow work",
      ],
    },
    AC: {
      title: "Pluto Ascendant - Intense Presence",
      description:
        "You become more intense, magnetic, and transformative. Personal power increases, and you may undergo profound identity changes. Others sense your depth and intensity.",
      plainSummary: "You become magnetically intense.",
      tips: [
        "Great for personal transformation",
        "Your presence is powerful",
        "Embrace your depth",
      ],
    },
    DC: {
      title: "Pluto Descendant - Transformative Bonds",
      description:
        "Relationships are intense and transformative. Power dynamics with partners are prominent. Deep, sometimes obsessive connections that change both people profoundly.",
      plainSummary: "Relationships here change you forever.",
      tips: [
        "Attracts transformative partners",
        "Be aware of power dynamics",
        "Embrace mutual growth",
      ],
    },
  },
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get full interpretation for a specific planet and line type
 */
export function getInterpretation(
  planet: PlanetId,
  lineType: LineType
): Interpretation {
  return INTERPRETATIONS[planet][lineType];
}

/**
 * Get short summary for tooltips (first sentence only)
 */
export function getShortInterpretation(planet: PlanetId, lineType: LineType): string {
  const full = INTERPRETATIONS[planet][lineType].description;
  return full.split(". ")[0] + ".";
}

/**
 * Get the plain language summary
 */
export function getPlainSummary(planet: PlanetId, lineType: LineType): string {
  return INTERPRETATIONS[planet][lineType].plainSummary;
}

/**
 * Get actionable tips
 */
export function getTips(planet: PlanetId, lineType: LineType): string[] {
  return INTERPRETATIONS[planet][lineType].tips;
}

/**
 * Get friendly name for line type
 */
export function getLineTypeName(lineType: LineType): string {
  return LINE_TYPE_NAMES[lineType].name;
}

/**
 * Get description for line type
 */
export function getLineTypeDescription(lineType: LineType): string {
  return LINE_TYPE_NAMES[lineType].description;
}
