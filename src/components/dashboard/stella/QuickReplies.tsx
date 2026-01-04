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
