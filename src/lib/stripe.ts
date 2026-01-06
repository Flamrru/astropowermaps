import { loadStripe, Stripe } from "@stripe/stripe-js";

/**
 * Get the correct Stripe publishable key based on STRIPE_MODE
 *
 * Checks for mode-specific keys first, falls back to legacy key.
 * Mode is determined by NEXT_PUBLIC_STRIPE_MODE env var.
 */
function getPublishableKey(): string | null {
  const mode = process.env.NEXT_PUBLIC_STRIPE_MODE?.toLowerCase() || "sandbox";

  if (mode === "live") {
    return (
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE ||
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      null
    );
  }

  return (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_SANDBOX ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    null
  );
}

// Client-side Stripe instance (singleton pattern)
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    const key = getPublishableKey();
    if (!key) {
      console.error("Missing Stripe publishable key. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_SANDBOX or NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE");
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};
