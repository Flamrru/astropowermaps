import { UTMParams } from "./quiz-state";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const STORAGE_KEY = "powermap_utm";

/**
 * Parse UTM parameters from the current URL
 */
export function parseUTMParams(): UTMParams {
  if (typeof window === "undefined") return {};

  // First check localStorage for previously stored UTMs
  const stored = getStoredUTM();

  // Then check URL params (these take precedence)
  const urlParams = new URLSearchParams(window.location.search);
  const utm: UTMParams = { ...stored };

  UTM_KEYS.forEach((key) => {
    const value = urlParams.get(key);
    if (value) {
      utm[key] = value;
    }
  });

  // Store for persistence across page refreshes
  if (Object.keys(utm).length > 0) {
    storeUTM(utm);
  }

  return utm;
}

/**
 * Store UTM params in localStorage
 */
function storeUTM(utm: UTMParams): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
  } catch {
    // localStorage might not be available
  }
}

/**
 * Get stored UTM params from localStorage
 */
function getStoredUTM(): UTMParams {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}
