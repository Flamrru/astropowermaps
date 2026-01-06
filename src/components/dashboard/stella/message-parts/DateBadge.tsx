"use client";

import { Calendar } from "lucide-react";

/**
 * DateBadge
 *
 * Displays a date as a golden pill badge with a calendar icon.
 * Used for dates like "June 2031" in Stella's messages.
 */

interface DateBadgeProps {
  children: React.ReactNode;
}

export default function DateBadge({ children }: DateBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mx-0.5"
      style={{
        background: "rgba(201, 162, 39, 0.15)",
        border: "1px solid rgba(201, 162, 39, 0.4)",
        color: "#E8C547",
        boxShadow: "0 0 8px rgba(201, 162, 39, 0.15)",
      }}
    >
      <Calendar size={10} className="opacity-80" />
      {children}
    </span>
  );
}
