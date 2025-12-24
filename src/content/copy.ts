/**
 * LOCKED COPY - DO NOT MODIFY
 * All text must match the "2026 Power Map — Quiz Funnel Brief" exactly.
 * Verbatim, punctuation included. No rewrites, no "improvements", no shortening.
 */

export const COPY = {
  // SCREEN 1 — Entry
  screen1: {
    headline: "There are 3 months and 3 places that will define your 2026.",
    subhead: "Based on your birth chart, there's a map for your year. Most people never see it.",
    credibilityBar: ["Cosmopolitan", "Well+Good", "mindbodygreen", "Refinery29"],
    button: "See My Map →",
  },

  // SCREEN 2 — Insight (no interaction)
  screen2: {
    text: [
      "You're going to travel somewhere in 2026. A trip, a vacation, maybe a few.",
      "But where you go matters more than you think. Not just for the photos — for what happens after."
    ],
    button: "Next →",
  },

  // SCREEN 3 — Question
  screen3: {
    question: "Have you ever visited a place that just felt... right?",
    supportingText: "A city where ideas started flowing. A trip where you came back different.",
    options: [
      "Yes, definitely",
      "Maybe once or twice",
      "Not sure",
    ],
  },

  // SCREEN 4 — Social Proof Interstitial (no interaction)
  screen4: {
    stat: "73%",
    statText: "of people say the same thing.",
    paragraphs: [
      "That wasn't random.",
      "Based on your birth chart, there are specific locations on Earth where your energy amplifies. Where clarity comes easier. Where the right people and opportunities appear.",
      "You don't need to move there. You just need to visit — at the right time."
    ],
    button: "Next →",
  },

  // SCREEN 5 — Question
  screen5: {
    question: "What do you want 2026 to be about?",
    options: [
      "Career / business growth",
      "Creativity / new ideas",
      "Love / relationships",
      "Clarity / finding direction",
      "Adventure / feeling alive",
    ],
  },

  // SCREEN 6 — Insight (no interaction)
  screen6: {
    paragraphs: [
      "Timing matters as much as location.",
      "You have 3 months in 2026 where everything you start gains traction. Push during those windows, and momentum builds.",
      "Push outside them? It feels like dragging a boulder uphill."
    ],
    button: "Next →",
  },

  // SCREEN 7 — Testimonial (no interaction)
  screen7: {
    quote: "I booked a trip to Lisbon during my power month. Within 2 weeks of being there, I met my now-business partner and closed my first 5-figure client.",
    attribution: "— Sarah M., London",
    button: "Next →",
  },

  // SCREEN 8 — Loading/Processing Screen
  screen8: {
    loadingTexts: [
      "Checking if your map is ready...",
      "Scanning 2026 windows...",
      "Almost there...",
    ],
  },

  // SCREEN 9 — Results Gate + Email Capture
  screen9: {
    headline: "Your map exists. You just haven't seen it yet.",
    subhead: "In 48 hours, the 2026 Power Map goes live. Enter your birth details, and you'll get:",
    benefits: [
      "Your 3 power months — when to launch, take risks, make moves",
      "Your 3 power destinations — where to travel for breakthroughs",
      "Your rest windows — when to recharge instead of force",
    ],
    socialProof: "12,847 people already on the waitlist",
    inputPlaceholder: "Enter your email",
    button: "Get Early Access",
  },

  // SCREEN 10 — Confirmation
  screen10: {
    headline: "You're on the list.",
    text: "We'll email you the moment it's live. You'll enter your birth details then and get your personalized map.",
    shareText: "Share with a friend",
  },

  // Navigation
  nav: {
    title: "2026 Power Map",
  },
} as const;

export type CopyType = typeof COPY;
