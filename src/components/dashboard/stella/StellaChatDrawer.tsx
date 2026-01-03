"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import QuickReplies, { DEFAULT_QUICK_REPLIES } from "./QuickReplies";
import RemainingCounter from "./RemainingCounter";
import type { ChatMessage as ChatMessageType } from "@/lib/dashboard-types";

interface StellaChatDrawerProps {
  isOpen: boolean;
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
export default function StellaChatDrawer({ isOpen }: StellaChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
  useEffect(() => {
    if (isOpen && !hasLoadedHistory) {
      loadChatHistory();
    }
  }, [isOpen, hasLoadedHistory]);

  /**
   * Load chat history from the database
   */
  const loadChatHistory = async () => {
    try {
      const response = await fetch("/api/stella/history");
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }
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
    if (isLoading || remaining <= 0) return;

    // Clear any previous error
    setError(null);

    // Create user message
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    // Add user message immediately (optimistic update)
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/stella/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
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
    <div className="flex flex-col h-[60vh]">
      {/* Messages area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.1) transparent",
        }}
      >
        {/* Empty state with quick replies */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center pb-8">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{
                background: "rgba(201, 162, 39, 0.1)",
                border: "1px solid rgba(201, 162, 39, 0.3)",
              }}
            >
              <span className="text-2xl">✨</span>
            </div>
            <h4 className="text-white font-medium mb-1">Chat with Stella</h4>
            <p className="text-white/50 text-sm max-w-xs mx-auto mb-6">
              Ask about your chart, today&apos;s energy, love, career, or anything cosmic.
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id}
            message={message}
            isLast={index === messages.length - 1}
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

      {/* Quick replies (shown when empty or after loading) */}
      {isEmpty && !isDisabled && (
        <QuickReplies
          replies={DEFAULT_QUICK_REPLIES}
          onSelect={handleQuickReply}
          disabled={isLoading}
        />
      )}

      {/* Remaining counter */}
      <RemainingCounter remaining={remaining} />

      {/* Input */}
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
  );
}
