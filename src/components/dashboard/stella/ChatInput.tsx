"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * ChatInput
 *
 * Auto-resizing textarea with send button.
 * Disabled when loading or empty.
 * Gold accent styling matching the app theme.
 */
export default function ChatInput({
  onSend,
  isLoading,
  disabled = false,
  placeholder = "Ask Stella anything...",
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !isLoading && !disabled) {
      onSend(trimmed);
      setMessage("");
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = message.trim().length > 0 && !isLoading && !disabled;

  return (
    <div
      className="flex items-end gap-2 p-4 border-t"
      style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
    >
      {/* Input container */}
      <div
        className="flex-1 rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || disabled}
          rows={1}
          className="w-full px-4 py-3 bg-transparent text-white/90 text-sm placeholder:text-white/30 resize-none focus:outline-none disabled:opacity-50"
          style={{ maxHeight: "120px" }}
        />
      </div>

      {/* Send button */}
      <motion.button
        onClick={handleSend}
        disabled={!canSend}
        aria-label="Send message"
        whileHover={canSend ? { scale: 1.05 } : {}}
        whileTap={canSend ? { scale: 0.95 } : {}}
        className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{
          background: canSend
            ? "linear-gradient(135deg, rgba(201, 162, 39, 0.9) 0%, rgba(232, 197, 71, 0.9) 100%)"
            : "rgba(255, 255, 255, 0.1)",
          border: canSend
            ? "1px solid rgba(232, 197, 71, 0.5)"
            : "1px solid rgba(255, 255, 255, 0.1)",
          cursor: canSend ? "pointer" : "not-allowed",
        }}
      >
        {isLoading ? (
          <Loader2 size={18} className="text-white/80 animate-spin" />
        ) : (
          <Send
            size={18}
            className={canSend ? "text-black/80" : "text-white/30"}
            style={{ transform: "translateX(1px)" }}
          />
        )}
      </motion.button>
    </div>
  );
}
