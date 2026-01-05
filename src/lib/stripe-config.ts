/**
 * Stripe Configuration with Sandbox/Live Toggle
 *
 * Toggle between sandbox and live mode using the STRIPE_MODE environment variable:
 * - STRIPE_MODE=sandbox (default) - Uses test keys and test price IDs
 * - STRIPE_MODE=live - Uses live keys and live price IDs
 *
 * IMPORTANT: Make sure your .env.local has the matching keys:
 * - Sandbox: STRIPE_SECRET_KEY=sk_test_... and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
 * - Live: STRIPE_SECRET_KEY=sk_live_... and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
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
// PRICE IDS BY MODE
// ============================================

/**
 * Sandbox (Test) Stripe Price IDs
 * Created with sk_test_... key on 2026-01-05
 */
export const SANDBOX_PRICES = {
  PRODUCT_ID: "prod_TjhwZ3t7O2qmIA",
  MONTHLY: "price_1SmEWaP7gi9mbAmLE4WdDpBV",
  TRIAL_3DAY: "price_1SmEWaP7gi9mbAmLdD4jTG0R",
  TRIAL_7DAY: "price_1SmEWaP7gi9mbAmLwQyAypJ0",
  TRIAL_14DAY: "price_1SmEWaP7gi9mbAmLuDysEb2F",
} as const;

/**
 * Live Stripe Price IDs
 * Created with sk_live_... key
 *
 * To populate: Run `STRIPE_MODE=live npx tsx scripts/setup-stripe-products.ts`
 * with your live key in .env.local
 */
export const LIVE_PRICES = {
  PRODUCT_ID: "", // prod_xxx from live
  MONTHLY: "", // price_xxx ($19.99/month recurring)
  TRIAL_3DAY: "", // price_xxx ($2.99 one-time)
  TRIAL_7DAY: "", // price_xxx ($5.99 one-time)
  TRIAL_14DAY: "", // price_xxx ($9.99 one-time)
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
