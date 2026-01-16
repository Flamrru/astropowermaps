/**
 * Product Analytics Tracking Utilities
 *
 * Topic categorization for Stella messages and tracking helpers.
 */

// ============================================
// Topic Categories for Stella Messages
// ============================================

export const STELLA_TOPICS = {
  love: {
    keywords: [
      "love",
      "relationship",
      "relationships",
      "partner",
      "dating",
      "romance",
      "romantic",
      "marriage",
      "married",
      "soulmate",
      "twin flame",
      "ex",
      "crush",
      "heart",
      "venus",
      "boyfriend",
      "girlfriend",
      "husband",
      "wife",
      "breakup",
      "divorce",
      "attract",
      "compatible",
      "compatibility",
    ],
    label: "Love & Relationships",
    icon: "heart",
    color: "#EC4899", // Pink
  },
  career: {
    keywords: [
      "career",
      "job",
      "work",
      "business",
      "money",
      "financial",
      "finances",
      "promotion",
      "boss",
      "coworker",
      "salary",
      "success",
      "professional",
      "entrepreneur",
      "income",
      "wealth",
      "invest",
      "midheaven",
      "mc",
      "10th house",
      "tenth house",
    ],
    label: "Career & Business",
    icon: "briefcase",
    color: "#3B82F6", // Blue
  },
  saturn_return: {
    keywords: [
      "saturn return",
      "saturn",
      "29",
      "late 20s",
      "responsibility",
      "adulting",
      "growing up",
      "life lessons",
      "saturn transit",
    ],
    label: "Saturn Return",
    icon: "planet",
    color: "#6366F1", // Indigo
  },
  jupiter: {
    keywords: [
      "jupiter",
      "expansion",
      "luck",
      "lucky",
      "opportunity",
      "growth",
      "abundance",
      "fortune",
      "blessings",
      "jupiter return",
      "lucky break",
    ],
    label: "Jupiter & Expansion",
    icon: "sparkles",
    color: "#F59E0B", // Amber
  },
  timing: {
    keywords: [
      "when",
      "timing",
      "best time",
      "should i",
      "right time",
      "ready",
      "retrograde",
      "eclipse",
      "mercury retrograde",
      "void of course",
      "new moon",
      "full moon",
      "what day",
      "which month",
    ],
    label: "Timing & Decisions",
    icon: "clock",
    color: "#10B981", // Emerald
  },
  home: {
    keywords: [
      "home",
      "move",
      "moving",
      "relocation",
      "relocate",
      "family",
      "living",
      "apartment",
      "house",
      "real estate",
      "4th house",
      "fourth house",
      "ic",
      "imum coeli",
      "roots",
      "parents",
      "mother",
      "father",
    ],
    label: "Home & Relocation",
    icon: "home",
    color: "#8B5CF6", // Violet
  },
  growth: {
    keywords: [
      "purpose",
      "meaning",
      "soul",
      "spiritual",
      "spirituality",
      "north node",
      "south node",
      "destiny",
      "path",
      "life path",
      "karma",
      "past life",
      "healing",
      "transform",
      "transformation",
      "evolve",
      "self improvement",
    ],
    label: "Personal Growth",
    icon: "seedling",
    color: "#22C55E", // Green
  },
  health: {
    keywords: [
      "health",
      "body",
      "energy",
      "tired",
      "anxiety",
      "stress",
      "wellness",
      "6th house",
      "sixth house",
      "routine",
      "habits",
      "self care",
      "mental health",
    ],
    label: "Health & Wellness",
    icon: "activity",
    color: "#EF4444", // Red
  },
  general: {
    keywords: [], // Fallback - matches when nothing else does
    label: "General Guidance",
    icon: "stars",
    color: "#9CA3AF", // Gray
  },
} as const;

export type TopicKey = keyof typeof STELLA_TOPICS;

export interface TopicInfo {
  key: TopicKey;
  label: string;
  icon: string;
  color: string;
}

/**
 * Categorize a message into topics based on keyword matching
 * Returns array of matched topic keys, or ['general'] if none match
 */
export function categorizeMessage(content: string): TopicKey[] {
  const lowercased = content.toLowerCase();
  const matchedTopics: TopicKey[] = [];

  for (const [topicKey, topic] of Object.entries(STELLA_TOPICS)) {
    if (topicKey === "general") continue; // Fallback only

    const hasMatch = topic.keywords.some((keyword) => {
      // Use word boundary matching for short keywords to avoid false positives
      if (keyword.length <= 3) {
        const regex = new RegExp(`\\b${keyword}\\b`, "i");
        return regex.test(lowercased);
      }
      return lowercased.includes(keyword);
    });

    if (hasMatch) {
      matchedTopics.push(topicKey as TopicKey);
    }
  }

  return matchedTopics.length > 0 ? matchedTopics : ["general"];
}

/**
 * Get topic info by key
 */
export function getTopicInfo(key: TopicKey): TopicInfo {
  const topic = STELLA_TOPICS[key];
  return {
    key,
    label: topic.label,
    icon: topic.icon,
    color: topic.color,
  };
}

/**
 * Get all topic infos
 */
export function getAllTopics(): TopicInfo[] {
  return Object.entries(STELLA_TOPICS).map(([key, topic]) => ({
    key: key as TopicKey,
    label: topic.label,
    icon: topic.icon,
    color: topic.color,
  }));
}

// ============================================
// Event Types
// ============================================

export type EventCategory = "navigation" | "engagement" | "stella" | "session" | "map" | "calendar" | "profile";

export type EventName =
  | "page_view"
  | "feature_use"
  | "stella_query"
  | "stella_chat_open"
  | "stella_chat_close"
  | "session_start"
  | "session_end"
  | "card_view"
  | "card_expand"
  | "calendar_day_click"
  | "map_interaction";

export interface TrackingEvent {
  event_name: EventName | string;
  event_category: EventCategory;
  properties?: Record<string, unknown>;
  session_id?: string;
}

// ============================================
// Engagement Level Classification
// ============================================

export type EngagementLevel = "high" | "medium" | "low" | "dormant";

export interface EngagementThresholds {
  high: number; // 20+ messages
  medium: number; // 5-19 messages
  low: number; // 1-4 messages
  // dormant = 0 messages
}

export const DEFAULT_ENGAGEMENT_THRESHOLDS: EngagementThresholds = {
  high: 20,
  medium: 5,
  low: 1,
};

/**
 * Classify engagement level based on message count
 */
export function classifyEngagement(
  messageCount: number,
  thresholds: EngagementThresholds = DEFAULT_ENGAGEMENT_THRESHOLDS
): EngagementLevel {
  if (messageCount >= thresholds.high) return "high";
  if (messageCount >= thresholds.medium) return "medium";
  if (messageCount >= thresholds.low) return "low";
  return "dormant";
}

/**
 * Get engagement level info
 */
export function getEngagementInfo(level: EngagementLevel): {
  label: string;
  color: string;
  description: string;
} {
  const info = {
    high: {
      label: "Power User",
      color: "#10B981",
      description: "20+ messages",
    },
    medium: {
      label: "Regular",
      color: "#3B82F6",
      description: "5-19 messages",
    },
    low: {
      label: "Light",
      color: "#F59E0B",
      description: "1-4 messages",
    },
    dormant: {
      label: "Dormant",
      color: "#6B7280",
      description: "No messages",
    },
  };
  return info[level];
}

// ============================================
// Date Helpers for Analytics
// ============================================

/**
 * Get start of day in UTC
 */
export function getStartOfDayUTC(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Get start of N days ago
 */
export function getDaysAgo(days: number): Date {
  const d = getStartOfDayUTC();
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

/**
 * Format date range for display
 */
export function formatDateRange(from: Date, to: Date): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const fromStr = from.toLocaleDateString("en-US", opts);
  const toStr = to.toLocaleDateString("en-US", opts);
  return `${fromStr} - ${toStr}`;
}
