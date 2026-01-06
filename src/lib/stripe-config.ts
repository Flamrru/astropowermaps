/**
 * Stripe Configuration with Sandbox/Live Toggle
 *
 * Toggle between sandbox and live mode using the STRIPE_MODE environment variable:
 * - STRIPE_MODE=sandbox (default) - Uses test keys and test price IDs
 * - STRIPE_MODE=live - Uses live keys and live price IDs
 *
 * Environment variables (both sets can exist simultaneously):
 *
 * SANDBOX (test mode):
 *   STRIPE_SECRET_KEY_SANDBOX=sk_test_...
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_SANDBOX=pk_test_...
 *   STRIPE_WEBHOOK_SECRET_SANDBOX=whsec_...
 *
 * LIVE (production):
 *   STRIPE_SECRET_KEY_LIVE=sk_live_...
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_...
 *   STRIPE_WEBHOOK_SECRET_LIVE=whsec_...
 *
 * MODE TOGGLE:
 *   STRIPE_MODE=sandbox (default) or STRIPE_MODE=live
 */

// ============================================
// MODE DETECTION
// ============================================

export type StripeMode = "sandbox" | "live";

/**
 * Get the current Stripe mode from environment
 * Defaults to 'sandbox' for safety
 */
export function getStripeMode(): StripeMode {
  const mode = process.env.STRIPE_MODE?.toLowerCase();
  if (mode === "live") return "live";
  return "sandbox"; // Default to sandbox for safety
}

/**
 * Check if we're in live mode
 */
export function isLiveMode(): boolean {
  return getStripeMode() === "live";
}

// ============================================
// API KEY RETRIEVAL (based on current mode)
// ============================================

/**
 * Get the Stripe secret key for the current mode (server-side only)
 * Falls back to legacy STRIPE_SECRET_KEY if mode-specific key not found
 */
export function getStripeSecretKey(): string {
  const mode = getStripeMode();

  if (mode === "live") {
    return (
      process.env.STRIPE_SECRET_KEY_LIVE ||
      process.env.STRIPE_SECRET_KEY ||
      ""
    );
  }

  return (
    process.env.STRIPE_SECRET_KEY_SANDBOX ||
    process.env.STRIPE_SECRET_KEY ||
    ""
  );
}

/**
 * Get the Stripe publishable key for the current mode (client-side)
 * Falls back to legacy key if mode-specific key not found
 */
export function getStripePublishableKey(): string {
  const mode = getStripeMode();

  if (mode === "live") {
    return (
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE ||
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      ""
    );
  }

  return (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_SANDBOX ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    ""
  );
}

/**
 * Get the Stripe webhook secret for the current mode
 * Falls back to legacy key if mode-specific key not found
 */
export function getStripeWebhookSecret(): string {
  const mode = getStripeMode();

  if (mode === "live") {
    return (
      process.env.STRIPE_WEBHOOK_SECRET_LIVE ||
      process.env.STRIPE_WEBHOOK_SECRET ||
      ""
    );
  }

  return (
    process.env.STRIPE_WEBHOOK_SECRET_SANDBOX ||
    process.env.STRIPE_WEBHOOK_SECRET ||
    ""
  );
}

// ============================================
// PRICE IDS BY MODE
// ============================================

/**
 * Sandbox (Test) Stripe Price IDs
 * Created: 2026-01-06
 */
export const SANDBOX_PRICES = {
  PRODUCT_ID: "prod_TjxLY35zJk4P9d",
  MONTHLY: "price_1SmTR41yURwpWT9L40Irv9XX",
  TRIAL_3DAY: "price_1SmTR51yURwpWT9LlMpZuAeb",
  TRIAL_7DAY: "price_1SmTR51yURwpWT9LPgwiQfeg",
  TRIAL_14DAY: "price_1SmTR51yURwpWT9Ltlu1jKs0",
} as const;

/**
 * Live Stripe Price IDs
 * Created: 2026-01-06
 */
export const LIVE_PRICES = {
  PRODUCT_ID: "prod_TjyPosxufr6NyV",
  MONTHLY: "price_1SmUSo24zElYF83GwqEY7603",
  TRIAL_3DAY: "price_1SmUSo24zElYF83GjfNr9sm6",
  TRIAL_7DAY: "price_1SmUSp24zElYF83GVaK13YFO",
  TRIAL_14DAY: "price_1SmUSp24zElYF83GmsTPZYdc",
} as const;

// ============================================
// ACTIVE PRICES (Based on current mode)
// ============================================

/**
 * Get the active Stripe prices based on current mode
 */
export function getStripePrices() {
  return isLiveMode() ? LIVE_PRICES : SANDBOX_PRICES;
}

/**
 * Validate that the current mode has prices configured
 */
export function validateStripePrices(): { valid: boolean; missing: string[] } {
  const prices = getStripePrices();
  const missing: string[] = [];

  if (!prices.PRODUCT_ID) missing.push("PRODUCT_ID");
  if (!prices.MONTHLY) missing.push("MONTHLY");
  if (!prices.TRIAL_3DAY) missing.push("TRIAL_3DAY");
  if (!prices.TRIAL_7DAY) missing.push("TRIAL_7DAY");
  if (!prices.TRIAL_14DAY) missing.push("TRIAL_14DAY");

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Log current Stripe configuration (for debugging)
 */
export function logStripeConfig() {
  const mode = getStripeMode();
  const prices = getStripePrices();
  const validation = validateStripePrices();

  console.log("=".repeat(50));
  console.log(`Stripe Mode: ${mode.toUpperCase()}`);
  console.log(`Product ID: ${prices.PRODUCT_ID || "(not set)"}`);
  console.log(`Prices configured: ${validation.valid ? "Yes" : "No"}`);
  if (!validation.valid) {
    console.log(`Missing: ${validation.missing.join(", ")}`);
  }
  console.log("=".repeat(50));
}
