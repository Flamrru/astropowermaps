"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import QuickReplies, { DEFAULT_QUICK_REPLIES, CALENDAR_QUICK_REPLIES, LIFE_TRANSITS_QUICK_REPLIES } from "./QuickReplies";
import type { ChatMessage as ChatMessageType } from "@/lib/dashboard-types";

interface StellaChatDrawerProps {
  isOpen: boolean;
  resetKey?: number;
  /** Pre-filled data from "Ask Stella about this day" */
  prefillContext?: {
    /** Friendly message shown to user (e.g., "Tell me about January 5th") */
    displayMessage: string;
    /** Technical context for AI (score, transits, moon) - not shown to user */
    hiddenContext: string;
  } | null;
  /** Callback when prefill context has been consumed */
  onPrefillConsumed?: () => void;
  /** Override view context (e.g., "life-transits" from calendar tab) */
  viewHint?: string;
}

// Derive view context from pathname
function getViewContext(pathname: string | null): string {
  if (!pathname) return "dashboard";
  if (pathname.startsWith("/calendar")) return "calendar";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/map")) return "map";
  return "dashboard";
}

/**
 * StellaChatDrawer
 *
 * Main chat interface that handles:
 * - Message history display
 * - Sending messages to /api/stella/chat
 * - Loading states and error handling
 * - Rate limit display
 * - Quick reply suggestions
 */
export default function StellaChatDrawer({
  isOpen,
  resetKey = 0,
  prefillContext,
  onPrefillConsumed,
  viewHint,
}: StellaChatDrawerProps) {
  const pathname = usePathname();
  // Use viewHint if provided (from parent), otherwise derive from pathname
  const viewContext = viewHint || getViewContext(pathname);

  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[] | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Stable boolean for dependency arrays (avoids array size changes)
  const hasPrefillContext = !!prefillContext;

  // Reset chat when resetKey changes (user clicked "New chat")
  useEffect(() => {
    if (resetKey > 0) {
      setMessages([]);
      setError(null);
      setDynamicSuggestions(null); // Reset to default pills
    }
  }, [resetKey]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  // Load chat history when drawer opens (if not already loaded)
  // Always load history to get the remaining count, even with prefillContext
  useEffect(() => {
    if (isOpen && !hasLoadedHistory) {
      // When prefillContext is provided, skip loading old messages (fresh start)
      // but still fetch the remaining count for rate limiting
      loadChatHistory(hasPrefillContext);
    }
  }, [isOpen, hasLoadedHistory, hasPrefillContext]);

  // Auto-send prefill context when provided (e.g., "Ask Stella about this day")
  useEffect(() => {
    if (prefillContext && isOpen && hasLoadedHistory && !isLoading) {
      // Clear suggestions for fresh experience
      setDynamicSuggestions(null);
      // Send with hidden context for AI, but show friendly message to user
      // Pass clearFirst=true to start with a clean slate
      sendMessageWithContext(prefillContext.displayMessage, prefillContext.hiddenContext, true);
      // Defer consuming context to next frame so React can render the message first
      requestAnimationFrame(() => {
        onPrefillConsumed?.();
      });
    }
  }, [prefillContext, isOpen, hasLoadedHistory, isLoading]);

  /**
   * Load chat history from the database
   * @param skipMessages - If true, only load remaining count (for "Ask Stella about this day")
   */
  const loadChatHistory = async (skipMessages = false) => {
    try {
      const response = await fetch("/api/stella/history");
      if (response.ok) {
        const data = await response.json();
        // Only set messages if we're not skipping them (normal chat opening)
        if (!skipMessages && data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }
        // Always get remaining count
        if (typeof data.remaining === "number") {
          setRemaining(data.remaining);
        }
      }
    } catch (err) {
      // Silently fail - empty chat is fine
      console.error("Failed to load chat history:", err);
    } finally {
      setHasLoadedHistory(true);
    }
  };

  /**
   * Send a message to Stella
   */
  const sendMessage = async (content: string) => {
    return sendMessageWithContext(content);
  };

  /**
   * Send a message with optional hidden context (for "Ask Stella about this day")
   * Shows displayMessage to user, but passes hiddenContext to API for better responses
   * @param clearFirst - If true, clears previous messages before adding new one (for fresh day questions)
   */
  const sendMessageWithContext = async (displayMessage: string, hiddenContext?: string, clearFirst?: boolean) => {
    if (isLoading || remaining <= 0) return;

    // Clear any previous error
    setError(null);

    // Create user message (what the user sees)
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content: displayMessage,
      createdAt: new Date().toISOString(),
    };

    // Add user message immediately (optimistic update)
    // If clearFirst is true, start fresh with just this message
    if (clearFirst) {
      setMessages([userMessage]);
    } else {
      setMessages((prev) => [...prev, userMessage]);
    }
    setIsLoading(true);

    try {
      // Send displayMessage and hiddenContext as separate fields
      // API stores only displayMessage, uses hiddenContext for AI prompt
      const response = await fetch("/api/stella/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayMessage,
          hiddenContext,
          viewContext,
        }),
      });

      if (response.status === 429) {
        // Rate limited
        setRemaining(0);
        setError("You've reached your daily message limit. Come back tomorrow!");
        return;
      }

      if (response.status === 401) {
        setError("Please log in to chat with Stella.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Add delay for natural feeling (Stella is "thinking")
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Add assistant message
      const assistantMessage: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update remaining count
      if (typeof data.remaining === "number") {
        setRemaining(data.remaining);
      }

      // Update dynamic suggestions if available
      if (data.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setDynamicSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError("Couldn't reach Stella. Please try again.");
      // Remove the optimistic user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (prompt: string) => {
    sendMessage(prompt);
  };

  const isEmpty = messages.length === 0 && !isLoading;
  const isDisabled = remaining <= 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Messages area - scrollable */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.1) transparent",
        }}
      >
        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center min-h-[150px] text-center">
            <div
              className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{
                background: "rgba(201, 162, 39, 0.1)",
                border: "1px solid rgba(201, 162, 39, 0.3)",
              }}
            >
              <span className="text-xl">✨</span>
            </div>
            <h4 className="text-white font-medium mb-1 text-sm">Chat with Stella</h4>
            <p className="text-white/50 text-xs max-w-[200px] mx-auto">
              Ask about your chart, love, career, or anything cosmic.
            </p>
          </div>
        )}

        {/* Messages - show last 5 for clean UI */}
        {messages.slice(-5).map((message, index, arr) => (
          <ChatMessage
            key={message.id}
            message={message}
            isLast={index === arr.length - 1}
          />
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isLoading && <TypingIndicator />}
        </AnimatePresence>

        {/* Error message */}
        {error && (
          <div className="text-center py-2">
            <p className="text-red-400/80 text-sm">{error}</p>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom section - ALL fixed elements together */}
      <div
        className="flex-shrink-0 pt-4 pb-20"
        style={{
          background: "rgba(10, 10, 20, 0.98)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Quick replies - context-aware based on page and conversation */}
        {!isDisabled && (
          <QuickReplies
            replies={
              dynamicSuggestions
                ? dynamicSuggestions.map((text, i) => ({
                    id: `dyn-${i}`,
                    text,
                    prompt: text,
                    category: "general" as const,
                    isPersonalized: true,
                  }))
                : viewContext === "life-transits"
                  ? LIFE_TRANSITS_QUICK_REPLIES
                  : viewContext === "calendar"
                    ? CALENDAR_QUICK_REPLIES
                    : DEFAULT_QUICK_REPLIES
            }
            onSelect={handleQuickReply}
            disabled={isLoading}
            showLabel={isEmpty && !dynamicSuggestions}
          />
        )}

        {/* Chat input */}
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          disabled={isDisabled}
          placeholder={
            isDisabled
              ? "Daily limit reached"
              : "Ask Stella anything..."
          }
        />
      </div>
    </div>
  );
}
