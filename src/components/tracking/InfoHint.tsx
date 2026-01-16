"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

interface InfoHintProps {
  text: string;
  size?: "sm" | "md";
}

/**
 * Subtle info button that shows explanation on hover/click
 * Use this to explain metrics to non-technical users
 */
export function InfoHint({ text, size = "sm" }: InfoHintProps) {
  const [isOpen, setIsOpen] = useState(false);

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 -m-0.5 rounded"
        aria-label="More info"
      >
        <HelpCircle className={iconSize} />
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg bg-zinc-800 border border-zinc-700 shadow-xl text-xs text-zinc-300 leading-relaxed">
          {text}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-8 border-transparent border-t-zinc-700" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-px border-8 border-transparent border-t-zinc-800" />
          </div>
        </div>
      )}
    </div>
  );
}
