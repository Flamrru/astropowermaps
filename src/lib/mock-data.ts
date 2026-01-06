/**
 * Mock Data for Dashboard Development
 *
 * Used when accessing /dashboard?dev=true
 * Pre-fills a complete subscriber profile for UI testing.
 */

import type {
  Subscriber,
  DailyPowerScore,
  WeeklyForecast,
  BestDay,
  RitualPrompt,
  QuickReply,
  DashboardState,
} from "./dashboard-types";
import type { BigThree, Element } from "./astro/zodiac-types";
import type { BirthData } from "./astro/types";

// ============================================
// Dev Birth Data (matches existing reveal flow)
// ============================================

export const DEV_BIRTH_DATA: BirthData = {
  date: "1988-05-05",
  time: "14:30",
  timeUnknown: false,
  location: {
    name: "Bratislava, Slovakia",
    lat: 48.1486,
    lng: 17.1077,
    timezone: "Europe/Bratislava",
  },
};

// ============================================
// Mock Subscriber (Fire Sign - Leo)
// ============================================

export const DEV_SUBSCRIBER: Subscriber = {
  id: "dev-user-001",
  email: "sarah@example.com",
  displayName: "Sarah",
  subscriptionStatus: "active",
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
};

// ============================================
// Mock Big Three (Fire dominant)
// ============================================

export const DEV_BIG_THREE: BigThree = {
  sun: {
    sign: "Leo",
    symbol: "♌",
    element: "fire",
    degree: 15.42,
    totalDegree: 135.42,
  },
  moon: {
    sign: "Scorpio",
    symbol: "♏",
    element: "water",
    degree: 8.67,
    totalDegree: 218.67,
  },
  rising: {
    sign: "Virgo",
    symbol: "♍",
    element: "earth",
    degree: 22.15,
    totalDegree: 172.15,
  },
};

export const DEV_ELEMENT: Element = "fire"; // Based on Sun sign

// ============================================
// Mock Daily Power Score
// ============================================

export const DEV_DAILY_SCORE: DailyPowerScore = {
  score: 78,
  message:
    "Channel your Leo fire into creative projects today. The Sun's trine to Jupiter amplifies your natural charisma—perfect for presentations or pitching ideas.",
  avoid:
    "Avoid confrontational conversations this afternoon. Mercury's square suggests miscommunication risks.",
  focusAreas: ["creativity", "communication", "leadership"],
  date: new Date().toISOString().split("T")[0],
  generatedAt: new Date().toISOString(),
};

// ============================================
// Mock Weekly Forecast
// ============================================

export const DEV_WEEKLY_FORECAST: WeeklyForecast = {
  weekStart: getMonday().toISOString().split("T")[0],
  theme: "Transformation",
  summary: `This week brings a powerful shift in your creative expression, Leo. With Venus entering your 5th house, romance and artistic pursuits take center stage.

Your Scorpio Moon suggests deep emotional insights mid-week—don't shy away from introspection. The Virgo Rising helps you organize these revelations into practical steps.

**Key theme:** Turning passion into purpose.`,
  powerDays: [
    {
      day: "Wednesday",
      date: getDateOffset(3),
      energy: "Career momentum",
      score: 92,
    },
    {
      day: "Friday",
      date: getDateOffset(5),
      energy: "Love & connection",
      score: 88,
    },
    {
      day: "Sunday",
      date: getDateOffset(7),
      energy: "Creative flow",
      score: 85,
    },
  ],
  cautionDays: ["Tuesday", "Thursday"],
  keyInsight:
    "Venus trine your natal Sun mid-week creates magnetic energy. Use it wisely.",
  generatedAt: new Date().toISOString(),
};

// ============================================
// Mock Best Days
// ============================================

export const DEV_BEST_DAYS: BestDay[] = [
  {
    date: getDateOffsetISO(3),
    displayDate: `Wed ${new Date(getDateOffsetISO(3)).getDate()}th`,
    goal: "career",
    score: 92,
    reason: "Sun conjunct Jupiter in your 10th house—ideal for professional moves",
  },
  {
    date: getDateOffsetISO(5),
    displayDate: `Fri ${new Date(getDateOffsetISO(5)).getDate()}th`,
    goal: "love",
    score: 88,
    reason: "Venus trines your natal Moon—emotional connections deepen",
  },
  {
    date: getDateOffsetISO(8),
    displayDate: `Mon ${new Date(getDateOffsetISO(8)).getDate()}th`,
    goal: "creativity",
    score: 85,
    reason: "Mercury enters your 5th house—ideas flow freely",
  },
  {
    date: getDateOffsetISO(12),
    displayDate: `Fri ${new Date(getDateOffsetISO(12)).getDate()}th`,
    goal: "clarity",
    score: 82,
    reason: "New Moon in fellow fire sign—fresh perspectives emerge",
  },
];

// ============================================
// Mock Today's Ritual
// ============================================

export const DEV_TODAY_RITUAL: RitualPrompt = {
  id: "ritual-001",
  type: "daily",
  category: "reflection",
  basePrompt: "Reflect on what emotions surfaced today and what they're teaching you.",
  personalizedPrompt:
    "As a Scorpio Moon, you feel emotions with unusual depth. Today, reflect on what feelings surfaced and what transformation they're inviting. Your Leo Sun reminds you: even shadows can be illuminated with courage.",
  signReference: "Scorpio",
};

// ============================================
// Mock Quick Replies (Personalized)
// ============================================

export const DEV_QUICK_REPLIES: QuickReply[] = [
  {
    id: "qr-1",
    text: "What's my love forecast?",
    prompt:
      "Based on my Leo Sun and Scorpio Moon, what does my love life look like this month?",
    category: "love",
    isPersonalized: true,
  },
  {
    id: "qr-2",
    text: "Best career move now?",
    prompt:
      "With my current transits, what career opportunities should I pursue?",
    category: "career",
    isPersonalized: true,
  },
  {
    id: "qr-3",
    text: "Why am I feeling stuck?",
    prompt:
      "I'm feeling blocked creatively. What do my transits say about this energy?",
    category: "clarity",
    isPersonalized: false,
  },
  {
    id: "qr-4",
    text: "Today's energy explained",
    prompt: "Give me a deeper breakdown of today's cosmic energy for my chart.",
    category: "general",
    isPersonalized: true,
  },
];

// ============================================
// Complete Dev Dashboard State
// ============================================

export const DEV_DASHBOARD_STATE: Partial<DashboardState> = {
  isDevMode: true,
  isLoading: false,
  error: null,
  subscriber: DEV_SUBSCRIBER,
  birthData: DEV_BIRTH_DATA,
  bigThree: DEV_BIG_THREE,
  element: DEV_ELEMENT,
  dailyScore: DEV_DAILY_SCORE,
  weeklyForecast: DEV_WEEKLY_FORECAST,
  bestDays: DEV_BEST_DAYS,
  todayRitual: DEV_TODAY_RITUAL,
  chatMessages: [],
  quickReplies: DEV_QUICK_REPLIES,
  isChatOpen: false,
};

// ============================================
// Helper Functions
// ============================================

function getMonday(): Date {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(today.setDate(diff));
}

function getDateOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDateOffsetISO(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}
