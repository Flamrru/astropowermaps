"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Hook to track first-time visits using localStorage
 *
 * @param key - localStorage key for this specific feature
 * @returns Object with isFirstVisit state and control functions
 */
export function useFirstVisit(key: string = "astro-map-visited") {
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Check localStorage on mount
  useEffect(() => {
    try {
      const visited = localStorage.getItem(key);
      setIsFirstVisit(!visited);
    } catch {
      // localStorage may not be available (SSR, private mode, etc.)
      setIsFirstVisit(false);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  // Mark as visited
  const markVisited = useCallback(() => {
    try {
      localStorage.setItem(key, "true");
      setIsFirstVisit(false);
    } catch {
      // Silently fail if localStorage is not available
      setIsFirstVisit(false);
    }
  }, [key]);

  // Reset for testing
  const reset = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setIsFirstVisit(true);
    } catch {
      // Silently fail
    }
  }, [key]);

  return {
    isFirstVisit,
    isLoading,
    markVisited,
    reset,
  };
}

export default useFirstVisit;
