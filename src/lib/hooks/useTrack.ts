"use client";

import { useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import type { EventCategory } from "@/lib/tracking";

const SESSION_KEY = "analytics_session_id";
const SESSION_START_KEY = "analytics_session_start";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Get or create a session ID
 * Sessions expire after 30 minutes of inactivity
 */
function getSessionId(): string {
  if (typeof window === "undefined") return "";

  const now = Date.now();
  const existingSessionId = sessionStorage.getItem(SESSION_KEY);
  const sessionStart = sessionStorage.getItem(SESSION_START_KEY);

  // Check if session is still valid
  if (existingSessionId && sessionStart) {
    const elapsed = now - parseInt(sessionStart, 10);
    if (elapsed < SESSION_TIMEOUT_MS) {
      // Extend session
      sessionStorage.setItem(SESSION_START_KEY, now.toString());
      return existingSessionId;
    }
  }

  // Create new session
  const newSessionId = uuidv4();
  sessionStorage.setItem(SESSION_KEY, newSessionId);
  sessionStorage.setItem(SESSION_START_KEY, now.toString());
  return newSessionId;
}

type TrackFunction = (
  eventName: string,
  properties?: Record<string, unknown>,
  category?: EventCategory
) => void;

/**
 * Hook for tracking user events
 *
 * @example
 * const track = useTrack();
 * track('feature_use', { feature: 'stella_chat' }, 'engagement');
 */
export function useTrack(): TrackFunction {
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    sessionIdRef.current = getSessionId();
  }, []);

  const track = useCallback(
    (
      eventName: string,
      properties: Record<string, unknown> = {},
      category: EventCategory = "engagement"
    ) => {
      // Ensure we have a session ID
      if (!sessionIdRef.current) {
        sessionIdRef.current = getSessionId();
      }

      // Fire and forget - don't await
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: eventName,
          event_category: category,
          properties,
          session_id: sessionIdRef.current,
        }),
      }).catch(() => {
        // Silent fail - tracking should never break the app
      });
    },
    []
  );

  return track;
}

/**
 * Hook for automatic page view tracking
 *
 * @example
 * usePageView('home');
 */
export function usePageView(screen: string, additionalProps?: Record<string, unknown>) {
  const track = useTrack();
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per mount
    if (hasTracked.current) return;
    hasTracked.current = true;

    track(
      "page_view",
      {
        screen,
        ...additionalProps,
      },
      "navigation"
    );
  }, [screen, track, additionalProps]);
}

/**
 * Hook for tracking time spent on a page
 * Tracks when component unmounts
 *
 * @example
 * useTimeOnPage('calendar');
 */
export function useTimeOnPage(screen: string) {
  const track = useTrack();
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();

    return () => {
      const duration = Date.now() - startTimeRef.current;
      // Only track if spent more than 1 second
      if (duration > 1000) {
        track(
          "time_on_page",
          {
            screen,
            duration_ms: duration,
            duration_seconds: Math.round(duration / 1000),
          },
          "engagement"
        );
      }
    };
  }, [screen, track]);
}

/**
 * Convenience function for tracking outside of React components
 * Useful for API routes or utility functions
 */
export async function trackEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
  category: EventCategory = "engagement"
): Promise<void> {
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: eventName,
        event_category: category,
        properties,
      }),
    });
  } catch {
    // Silent fail
  }
}
