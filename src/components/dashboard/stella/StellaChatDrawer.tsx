"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import QuickReplies, { DEFAULT_QUICK_REPLIES, CALENDAR_QUICK_REPLIES, LIFE_TRANSITS_QUICK_REPLIES, YEAR_2026_QUICK_REPLIES } from "./QuickReplies";
import type { ChatMessage as ChatMessageType } from "@/lib/dashboard-types";
import type { AstrocartographyResult, PlanetaryLine } from "@/lib/astro/types";
import { MAJOR_CITIES, type WorldCity } from "@/lib/astro/cities";

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
  /** Astrocartography data when on map page */
  mapData?: AstrocartographyResult | null;
}

// Derive view context from pathname
function getViewContext(pathname: string | null): string {
  if (!pathname) return "dashboard";
  if (pathname.startsWith("/calendar")) return "calendar";
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/map")) return "map";
  return "dashboard";
}

// Line type full names for Stella
const LINE_TYPE_NAMES: Record<string, string> = {
  AC: "Ascendant (AC) - How you appear and your personal power",
  DC: "Descendant (DC) - Relationships and partnerships",
  MC: "Midheaven (MC) - Career and public recognition",
  IC: "Imum Coeli (IC) - Home, roots, and private life",
};

// Planet names and meanings for astrocartography
const PLANET_MEANINGS: Record<string, string> = {
  sun: "Sun - Identity, vitality, and life force",
  moon: "Moon - Emotions, comfort, and belonging",
  mercury: "Mercury - Communication and mental stimulation",
  venus: "Venus - Love, beauty, and pleasure",
  mars: "Mars - Drive, energy, and action",
  jupiter: "Jupiter - Expansion, luck, and opportunity",
  saturn: "Saturn - Structure, challenge, and mastery",
  uranus: "Uranus - Change, innovation, and awakening",
  neptune: "Neptune - Spirituality, creativity, and dreams",
  pluto: "Pluto - Transformation and deep power",
};

/**
 * Haversine distance calculation (km)
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

/**
 * Calculate minimum distance from a city to a planetary line
 */
function cityToLineDistance(city: WorldCity, line: PlanetaryLine): number {
  let minDist = Infinity;
  const coords = line.coordinates;
  // Sample points along the line for efficiency
  const step = Math.max(1, Math.floor(coords.length / 50));
  for (let i = 0; i < coords.length; i += step) {
    const [lng, lat] = coords[i];
    const dist = haversineDistance(city.lat, city.lng, lat, lng);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

/**
 * Summarize astrocartography lines for Stella
 * Uses full 350-city database with accurate distance calculations
 */
function summarizeMapLines(mapData: AstrocartographyResult): string {
  // Calculate distances from all 350 cities to all lines
  const cityData: Array<{
    city: WorldCity;
    nearbyLines: Array<{ name: string; dist: number }>;
  }> = [];

  for (const city of MAJOR_CITIES) {
    const nearbyLines: Array<{ name: string; dist: number }> = [];
    for (const line of mapData.lines) {
      if (line.coordinates.length === 0) continue;
      const dist = cityToLineDistance(city, line);
      if (dist <= 600) { // Within influence range
        const planetName = line.planet.charAt(0).toUpperCase() + line.planet.slice(1);
        nearbyLines.push({ name: `${planetName} ${line.lineType}`, dist });
      }
    }
    if (nearbyLines.length > 0) {
      nearbyLines.sort((a, b) => a.dist - b.dist);
      cityData.push({ city, nearbyLines });
    }
  }

  // Group by region for cleaner output
  const byRegion: Record<string, typeof cityData> = {
    europe: [],
    "north-america": [],
    "south-america": [],
    asia: [],
    oceania: [],
    africa: [],
  };

  for (const item of cityData) {
    if (byRegion[item.city.region]) {
      byRegion[item.city.region].push(item);
    }
  }

  // Build output
  let output = "YOUR ASTROCARTOGRAPHY LINES - DISTANCES TO 350 MAJOR CITIES:\n\n";

  const regionLabels: Record<string, string> = {
    europe: "EUROPE",
    "north-america": "NORTH AMERICA",
    "south-america": "SOUTH AMERICA",
    asia: "ASIA & MIDDLE EAST",
    oceania: "AUSTRALIA & OCEANIA",
    africa: "AFRICA",
  };

  for (const [region, label] of Object.entries(regionLabels)) {
    const cities = byRegion[region];
    if (cities.length === 0) continue;

    // Sort cities by closest line distance
    cities.sort((a, b) => a.nearbyLines[0].dist - b.nearbyLines[0].dist);

    output += `${label}:\n`;
    // Show top 15 cities per region with best planetary influences
    for (const item of cities.slice(0, 15)) {
      const top3 = item.nearbyLines.slice(0, 3).map(l => `${l.name} (${l.dist}km)`).join(", ");
      output += `${item.city.name}, ${item.city.country}: ${top3}\n`;
    }
    output += "\n";
  }

  output += "LINE TYPE MEANINGS:\n";
  output += "- MC: Career, success, recognition | IC: Home, roots, family\n";
  output += "- AC: Personal power, vitality | DC: Relationships, partnerships\n\n";
  output += "DISTANCE GUIDE: <100km=very strong, 100-300km=strong, 300-600km=moderate\n";
  output += "You have distance data for 350+ cities - answer ANY city question confidently!\n";

  return output;
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
  mapData,
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
  // Store pending message data for retry functionality
  const pendingMessageRef = useRef<{ displayMessage: string; hiddenContext?: string } | null>(null);

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
   * @param retryMessageId - If provided, this is a retry of a failed message
   */
  const sendMessageWithContext = async (
    displayMessage: string,
    hiddenContext?: string,
    clearFirst?: boolean,
    retryMessageId?: string
  ) => {
    if (isLoading || remaining <= 0) return;

    // Clear any previous error
    setError(null);

    // Store message data for potential retry
    pendingMessageRef.current = { displayMessage, hiddenContext };

    let userMessageId: string;

    if (retryMessageId) {
      // Retrying a failed message - update its status to "sending"
      userMessageId = retryMessageId;
      setMessages((prev) =>
        prev.map((m) => (m.id === retryMessageId ? { ...m, status: "sending" } : m))
      );
    } else {
      // New message - create with status "sending"
      userMessageId = `user-${Date.now()}`;
      const userMessage: ChatMessageType = {
        id: userMessageId,
        role: "user",
        content: displayMessage,
        createdAt: new Date().toISOString(),
        status: "sending",
      };

      // Add user message immediately (optimistic update)
      if (clearFirst) {
        setMessages([userMessage]);
      } else {
        setMessages((prev) => [...prev, userMessage]);
      }
    }

    setIsLoading(true);

    try {
      // Send displayMessage and hiddenContext as separate fields
      // API stores only displayMessage, uses hiddenContext for AI prompt
      // Include mapData summary if on map page
      const mapLineSummary = mapData ? summarizeMapLines(mapData) : undefined;

      const response = await fetch("/api/stella/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayMessage,
          hiddenContext,
          viewContext,
          mapLineSummary,
        }),
      });

      if (response.status === 429) {
        // Rate limited - mark message as failed
        setRemaining(0);
        setMessages((prev) =>
          prev.map((m) => (m.id === userMessageId ? { ...m, status: "failed" } : m))
        );
        setError("You've reached your daily message limit. Come back tomorrow!");
        return;
      }

      if (response.status === 401) {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMessageId ? { ...m, status: "failed" } : m))
        );
        setError("Please log in to chat with Stella.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      // Success! Update user message status to "sent"
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessageId ? { ...m, status: "sent" } : m))
      );

      // Add assistant message
      const assistantMessage: ChatMessageType = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        createdAt: new Date().toISOString(),
        status: "sent",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Clear pending message data on success
      pendingMessageRef.current = null;

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
      // Mark the user message as failed (but keep it visible!)
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessageId ? { ...m, status: "failed" } : m))
      );
      setError("Couldn't reach Stella. Tap retry to try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Retry a failed message
   */
  const retryMessage = useCallback((messageId: string) => {
    // Find the failed message content
    const failedMessage = messages.find((m) => m.id === messageId);
    if (!failedMessage || failedMessage.status !== "failed") return;

    // Get the hidden context from pendingMessageRef if available
    const hiddenContext = pendingMessageRef.current?.hiddenContext;

    // Retry with the same content
    sendMessageWithContext(failedMessage.content, hiddenContext, false, messageId);
  }, [messages]);

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
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
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
            onRetry={message.status === "failed" ? () => retryMessage(message.id) : undefined}
          />
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isLoading && <TypingIndicator />}
        </AnimatePresence>

        {/* Error message */}
        {error && (
          <div role="alert" className="text-center py-2">
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
                  : viewContext === "2026-report"
                    ? YEAR_2026_QUICK_REPLIES
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
