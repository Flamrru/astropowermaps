/**
 * Dashboard Types for Stella+
 *
 * Type definitions for the subscriber dashboard including
 * Big Three, daily scores, forecasts, and rituals.
 */

// Import from zodiac-types (client-safe, no astronomia)
import type { ZodiacSign, Element, ZodiacInfo, BigThree } from "./astro/zodiac-types";
import type { BirthData } from "./astro/types";

// Re-export zodiac types for convenience
export type { ZodiacSign, Element, ZodiacInfo, BigThree, BirthData };

// ============================================
// User & Subscription Types
// ============================================

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "trialing"
  | "incomplete"
  | "grandfathered";

export interface Subscriber {
  id: string;
  email: string;
  displayName: string;
  subscriptionStatus: SubscriptionStatus;
  currentPeriodEnd?: string; // ISO date
  createdAt: string;
}

// ============================================
// Daily Power Score
// ============================================

export interface DailyPowerScore {
  score: number; // 0-100
  message: string; // "Channel your Leo fire..."
  avoid?: string; // "Avoid confrontational conversations..."
  focusAreas: string[]; // ["creativity", "communication"]
  date: string; // ISO date
  generatedAt: string; // ISO timestamp
}

// ============================================
// Weekly Forecast
// ============================================

export interface WeeklyForecast {
  weekStart: string; // ISO date (Monday)
  theme: string; // "Transformation"
  summary: string; // Full forecast text
  powerDays: PowerDay[];
  cautionDays: string[]; // ["Tuesday", "Thursday"]
  keyInsight: string; // Short highlight
  generatedAt: string;
}

export interface PowerDay {
  day: string; // "Wednesday"
  date: string; // "Jan 8"
  energy: string; // "Career momentum"
  score: number; // 0-100
}

// ============================================
// Best Day Picker
// ============================================

export type GoalCategory =
  | "love"
  | "career"
  | "creativity"
  | "clarity"
  | "adventure";

export interface BestDay {
  date: string; // ISO date
  displayDate: string; // "Wed 8th"
  goal: GoalCategory;
  score: number; // 0-100
  reason: string; // "Venus trines your natal Moon"
}

export interface BestDayRequest {
  goal: GoalCategory;
  range: 7 | 14 | 30; // days ahead
}

// ============================================
// Rituals & Journal
// ============================================

export interface RitualPrompt {
  id: string;
  type: "daily" | "weekly";
  category: "reflection" | "gratitude" | "intention" | "release";
  basePrompt: string; // Template
  personalizedPrompt: string; // With zodiac personalization
  signReference?: ZodiacSign; // Which sign inspired the prompt
}

export interface JournalEntry {
  id: string;
  promptId?: string;
  entryText: string;
  mood?: "positive" | "neutral" | "challenging";
  createdAt: string;
}

// ============================================
// Stella Chat
// ============================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  /** Message status for retry functionality */
  status?: "sending" | "sent" | "failed";
}

export interface QuickReply {
  id: string;
  text: string; // "Ask about love"
  prompt: string; // Full prompt to send
  category: GoalCategory | "general";
  isPersonalized: boolean;
}

// ============================================
// Calendar
// ============================================

export type CalendarEventType =
  | "power_day"
  | "rest_day"
  | "new_moon"
  | "full_moon"
  | "mercury_retrograde"
  | "eclipse";

export interface CalendarEvent {
  type: CalendarEventType;
  date: string;
  title: string;
  description?: string;
}

export interface CalendarSettings {
  token: string;
  enabledEventTypes: CalendarEventType[];
  lastRotated: string;
}

// ============================================
// Enhanced Day Detail
// ============================================

export type AspectType =
  | "conjunction"
  | "sextile"
  | "square"
  | "trine"
  | "opposition";

export interface DayTransit {
  planet1: string;          // "sun" (transiting planet)
  aspect: AspectType;       // "trine"
  planet2: string;          // "jupiter" (natal planet)
  isNatal: boolean;         // true if hitting user's natal planet
  symbol: string;           // "☉ △ ♃"
  label: string;            // "Sun trine your Jupiter"
  shortText: string;        // 1 sentence interpretation
  fullText: string;         // 3-4 sentences (expanded view)
  significance: number;     // 1-10 for sorting (higher = more important)
}

export interface MoonInfo {
  phase: string;            // "Waxing Gibbous"
  sign: string;             // "Scorpio"
  meaning: string;          // "Deep emotions, transformation"
  illumination: number;     // 0-100 percentage
}

export interface DayRitual {
  title: string;            // "Jupiter Expansion Ritual"
  context: string;          // Why this ritual today
  steps: string[];          // Actionable steps
  timing: string;           // "Morning, facing sunlight"
}

export interface EnhancedDayData {
  date: string;
  score: number;            // 0-100
  scoreLabel: "power" | "balanced" | "rest";
  summary: string;          // 1-2 sentence personalized overview

  moon: MoonInfo;
  transits: DayTransit[];
  bestFor: string[];        // 3-4 activities
  avoid: string[];          // 2-3 cautions

  ritual?: DayRitual;
  journalPrompt?: string;
}

// ============================================
// Dashboard State
// ============================================

export interface DashboardState {
  // Mode
  isDevMode: boolean;
  isLoading: boolean;
  error: string | null;

  // User
  subscriber: Subscriber | null;
  birthData: BirthData | null;
  bigThree: BigThree | null;
  element: Element | null;

  // Content
  dailyScore: DailyPowerScore | null;
  weeklyForecast: WeeklyForecast | null;
  bestDays: BestDay[];
  todayRitual: RitualPrompt | null;

  // Chat
  chatMessages: ChatMessage[];
  quickReplies: QuickReply[];
  isChatOpen: boolean;
}

// ============================================
// Dashboard Actions
// ============================================

export type DashboardAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_DEV_MODE"; payload: boolean }
  | { type: "SET_SUBSCRIBER"; payload: Subscriber }
  | { type: "SET_BIRTH_DATA"; payload: BirthData }
  | { type: "SET_BIG_THREE"; payload: BigThree }
  | { type: "SET_ELEMENT"; payload: Element }
  | { type: "SET_DAILY_SCORE"; payload: DailyPowerScore }
  | { type: "SET_WEEKLY_FORECAST"; payload: WeeklyForecast }
  | { type: "SET_BEST_DAYS"; payload: BestDay[] }
  | { type: "SET_TODAY_RITUAL"; payload: RitualPrompt }
  | { type: "TOGGLE_CHAT"; payload?: boolean }
  | { type: "ADD_CHAT_MESSAGE"; payload: ChatMessage }
  | { type: "SET_QUICK_REPLIES"; payload: QuickReply[] }
  | { type: "HYDRATE_DEV_DATA"; payload: Partial<DashboardState> };

// ============================================
// Dashboard Context
// ============================================

export interface DashboardContextValue {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
}
