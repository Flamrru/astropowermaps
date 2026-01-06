"use client";

import { motion } from "framer-motion";
import type { QuickReply } from "@/lib/dashboard-types";

interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (prompt: string) => void;
  disabled?: boolean;
  showLabel?: boolean;
}

/**
 * QuickReplies
 *
 * Horizontal scrollable suggestion chips for quick prompts.
 * Always visible so users can tap suggestions anytime.
 */
export default function QuickReplies({
  replies,
  onSelect,
  disabled = false,
  showLabel = true,
}: QuickRepliesProps) {
  if (replies.length === 0) return null;

  return (
    <div className="px-4 pb-2">
      {showLabel && (
        <p className="text-white/40 text-xs mb-2">Try asking...</p>
      )}
      <div className="flex flex-wrap gap-2">
        {replies.map((reply, index) => (
          <motion.button
            key={reply.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => !disabled && onSelect(reply.prompt)}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            className="px-3 py-1.5 rounded-full text-xs transition-all"
            style={{
              background: "rgba(201, 162, 39, 0.1)",
              border: "1px solid rgba(201, 162, 39, 0.3)",
              color: "rgba(232, 197, 71, 0.9)",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {reply.text}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/**
 * Default quick replies for empty chat state
 */
export const DEFAULT_QUICK_REPLIES: QuickReply[] = [
  {
    id: "love",
    text: "Love & relationships",
    prompt: "What does my chart say about love and relationships right now?",
    category: "love",
    isPersonalized: true,
  },
  {
    id: "career",
    text: "Career path",
    prompt: "What career insights can you give me based on my chart?",
    category: "career",
    isPersonalized: true,
  },
  {
    id: "today",
    text: "Today's energy",
    prompt: "What should I focus on today based on the current transits?",
    category: "general",
    isPersonalized: true,
  },
  {
    id: "week",
    text: "This week",
    prompt: "What's the cosmic weather for me this week?",
    category: "general",
    isPersonalized: true,
  },
  {
    id: "moon",
    text: "My Moon sign",
    prompt: "Tell me more about my Moon sign and how it affects my emotions.",
    category: "general",
    isPersonalized: true,
  },
];

/**
 * Calendar-specific quick replies when Stella is opened from the calendar
 */
export const CALENDAR_QUICK_REPLIES: QuickReply[] = [
  {
    id: "best-days",
    text: "Best days this month",
    prompt: "Which are my best days this month and why?",
    category: "general",
    isPersonalized: true,
  },
  {
    id: "power-days",
    text: "Power days explained",
    prompt: "What makes a day a 'power day' for me?",
    category: "general",
    isPersonalized: true,
  },
  {
    id: "moon-phases",
    text: "Moon phases",
    prompt: "How do the moon phases this month affect my energy?",
    category: "general",
    isPersonalized: true,
  },
  {
    id: "plan-week",
    text: "Plan my week",
    prompt: "Help me plan my week based on the cosmic calendar.",
    category: "general",
    isPersonalized: true,
  },
  {
    id: "rest-days",
    text: "Rest days",
    prompt: "Why do I have rest days and how should I use them?",
    category: "general",
    isPersonalized: true,
  },
];

/**
 * Life Transits-specific quick replies when Stella is opened from the Life Transits tab
 */
export const LIFE_TRANSITS_QUICK_REPLIES: QuickReply[] = [
  {
    id: "saturn-return",
    text: "My Saturn Return",
    prompt: "Tell me about my Saturn Return - when is it and what should I expect?",
    category: "general",
    isPersonalized: true,
  },
  {
    id: "jupiter-return",
    text: "Jupiter Return",
    prompt: "What is a Jupiter Return and when is my next one?",
    category: "general",
    isPersonalized: true,
  },
  {
    id: "next-transit",
    text: "My next big transit",
    prompt: "What's my next major life transit and how should I prepare for it?",
    category: "general",
    isPersonalized: true,
  },
  {
    id: "chiron-return",
    text: "Chiron Return",
    prompt: "What is the Chiron Return and what does it mean for my healing journey?",
    category: "general",
    isPersonalized: true,
  },
  {
    id: "outer-planets",
    text: "Outer planet transits",
    prompt: "How do outer planet transits like Uranus, Neptune, and Pluto affect my life?",
    category: "general",
    isPersonalized: true,
  },
];

/**
 * 2026 Report-specific quick replies when Stella is opened from the 2026 Report tab
 */
export const YEAR_2026_QUICK_REPLIES: QuickReply[] = [
  {
    id: "2026-overview",
    text: "My 2026 overview",
    prompt: "What are the main themes and opportunities for me in 2026?",
    category: "general",
    isPersonalized: true,
  },
  {
    id: "2026-love",
    text: "Love in 2026",
    prompt: "What does 2026 hold for my love life and relationships?",
    category: "love",
    isPersonalized: true,
  },
  {
    id: "2026-career",
    text: "Career in 2026",
    prompt: "What career opportunities and challenges should I expect in 2026?",
    category: "career",
    isPersonalized: true,
  },
  {
    id: "2026-best-months",
    text: "Best months",
    prompt: "Which months in 2026 will be most powerful for me and why?",
    category: "general",
    isPersonalized: true,
  },
  {
    id: "2026-challenges",
    text: "Challenges ahead",
    prompt: "What challenges might I face in 2026 and how can I prepare?",
    category: "general",
    isPersonalized: true,
  },
];
