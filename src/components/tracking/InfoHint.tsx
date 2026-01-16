"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";
import { createPortal } from "react-dom";

interface InfoHintProps {
  text: string;
  size?: "sm" | "md";
}

/**
 * Subtle info button that shows explanation on hover/click
 * Uses portal to render tooltip outside of overflow-hidden containers
 */
export function InfoHint({ text, size = "sm" }: InfoHintProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: Math.min(rect.left, window.innerWidth - 280),
      });
    }
  };

  const handleOpen = () => {
    updatePosition();
    setIsOpen(true);
  };

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        onMouseEnter={handleOpen}
        onMouseLeave={() => setIsOpen(false)}
        className="text-zinc-500 hover:text-zinc-300 transition-colors p-0.5 -m-0.5 rounded"
        aria-label="More info"
      >
        <HelpCircle className={iconSize} />
      </button>

      {mounted && isOpen && createPortal(
        <div
          className="fixed z-[9999] w-64 p-3 rounded-lg bg-zinc-800 border border-zinc-700 shadow-2xl text-xs text-zinc-300 leading-relaxed animate-fadeIn"
          style={{ top: position.top, left: position.left }}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300 md:hidden"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          {text}
        </div>,
        document.body
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
      `}</style>
    </>
  );
}
