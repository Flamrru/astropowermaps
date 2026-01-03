"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface RemainingCounterProps {
  remaining: number;
  limit?: number;
}

/**
 * RemainingCounter
 *
 * Shows remaining daily message count.
 * Changes appearance when running low.
 */
export default function RemainingCounter({
  remaining,
  limit = 50,
}: RemainingCounterProps) {
  const percentage = (remaining / limit) * 100;
  const isLow = remaining <= 10;
  const isEmpty = remaining <= 0;

  if (isEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-2 text-center"
      >
        <p className="text-amber-400/80 text-xs">
          You&apos;ve reached your daily limit. Come back tomorrow!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5 px-4 py-2">
      <MessageCircle
        size={12}
        className={isLow ? "text-amber-400/60" : "text-white/30"}
      />
      <span
        className={`text-xs ${
          isLow ? "text-amber-400/60" : "text-white/30"
        }`}
      >
        {remaining} message{remaining !== 1 ? "s" : ""} left today
      </span>
    </div>
  );
}
