/**
 * localStorage utility for persisting astro map data
 * Allows users to navigate to /map after reveal flow without re-entering data
 */

import type { AstrocartographyResult } from "./astro/types";

const STORAGE_KEY = "astro_map_data";
const EXPIRY_DAYS = 30; // Data expires after 30 days

interface StoredData {
  data: AstrocartographyResult;
  savedAt: number; // timestamp
}

/**
 * Save astro data to localStorage
 */
export function saveAstroData(data: AstrocartographyResult): void {
  if (typeof window === "undefined") return;

  try {
    const stored: StoredData = {
      data,
      savedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (err) {
    console.warn("Failed to save astro data to localStorage:", err);
  }
}

/**
 * Load astro data from localStorage (if not expired)
 */
export function loadAstroData(): AstrocartographyResult | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const stored: StoredData = JSON.parse(raw);

    // Check expiry
    const expiryMs = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    if (Date.now() - stored.savedAt > expiryMs) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return stored.data;
  } catch (err) {
    console.warn("Failed to load astro data from localStorage:", err);
    return null;
  }
}

/**
 * Clear saved astro data (for "reset" or "start over")
 */
export function clearAstroData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
