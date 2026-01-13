/**
 * Stella+ Subscription Plans Configuration
 *
 * Price IDs are stored in stripe-config.ts with separate sandbox/live values.
 * Toggle between modes using STRIPE_MODE environment variable.
 *
 * To create products: npx tsx scripts/setup-stripe-products.ts
 */

import { getStripePrices, getStripeMode } from "./stripe-config";

// Re-export for backward compatibility - dynamically selects based on STRIPE_MODE
export const STRIPE_PRICES = getStripePrices();

// Export mode for debugging
export const CURRENT_STRIPE_MODE = getStripeMode();

// Plan IDs match the UI component (PricingSelector)
// "one_time" is for A/B test variant B (single $19.99 payment)
// "winback" is for email lead re-engagement ($9.99 one-time)
export type PlanId = "trial_3day" | "trial_7day" | "trial_14day" | "one_time" | "winback";

// Map plan IDs to Stripe price keys
const PLAN_TO_PRICE_KEY: Record<PlanId, keyof typeof STRIPE_PRICES> = {
  trial_3day: "TRIAL_3DAY",
  trial_7day: "TRIAL_7DAY",
  trial_14day: "TRIAL_14DAY",
  one_time: "ONE_TIME",
  winback: "WINBACK",
};

// Plan details for UI and checkout
export const SUBSCRIPTION_PLANS: Record<
  PlanId,
  {
    id: PlanId;
    name: string;
    trialPriceCents: number;
    trialPriceDisplay: string;
    trialDays: number;
    monthlyPriceCents: number;
    monthlyPriceDisplay: string;
    stripePriceKey: keyof typeof STRIPE_PRICES;
    description: string;
    recommended?: boolean;
  }
> = {
  trial_3day: {
    id: "trial_3day",
    name: "3-Day Trial",
    trialPriceCents: 299,
    trialPriceDisplay: "$2.99",
    trialDays: 3,
    monthlyPriceCents: 1999,
    monthlyPriceDisplay: "$19.99",
    stripePriceKey: "TRIAL_3DAY",
    description: "Try Stella+ for 3 days",
  },
  trial_7day: {
    id: "trial_7day",
    name: "7-Day Trial",
    trialPriceCents: 599,
    trialPriceDisplay: "$5.99",
    trialDays: 7,
    monthlyPriceCents: 1999,
    monthlyPriceDisplay: "$19.99",
    stripePriceKey: "TRIAL_7DAY",
    description: "Try Stella+ for 7 days",
    recommended: true, // Shown as recommended option
  },
  trial_14day: {
    id: "trial_14day",
    name: "14-Day Trial",
    trialPriceCents: 999,
    trialPriceDisplay: "$9.99",
    trialDays: 14,
    monthlyPriceCents: 1999,
    monthlyPriceDisplay: "$19.99",
    stripePriceKey: "TRIAL_14DAY",
    description: "Try Stella+ for 14 days",
  },
  // A/B test variant B: One-time payment (no subscription)
  one_time: {
    id: "one_time",
    name: "Full Access",
    trialPriceCents: 1999, // $19.99 one-time
    trialPriceDisplay: "$19.99",
    trialDays: 0, // No trial - immediate full access
    monthlyPriceCents: 0, // No recurring charge
    monthlyPriceDisplay: "$0",
    stripePriceKey: "ONE_TIME",
    description: "One-time purchase, lifetime access",
  },
  // Winback offer: Discounted one-time payment for email leads
  winback: {
    id: "winback",
    name: "Special Offer",
    trialPriceCents: 999, // $9.99 one-time
    trialPriceDisplay: "$9.99",
    trialDays: 0, // No trial - immediate full access
    monthlyPriceCents: 0, // No recurring charge
    monthlyPriceDisplay: "$0",
    stripePriceKey: "WINBACK",
    description: "Winback offer for email leads",
  },
};

/**
 * Get the Stripe price ID for a plan
 */
export function getStripePriceId(planId: PlanId): string {
  const plan = SUBSCRIPTION_PLANS[planId];
  const priceId = STRIPE_PRICES[plan.stripePriceKey];

  if (!priceId) {
    throw new Error(
      `Stripe price ID not configured for plan: ${planId}. ` +
        `Run 'npx tsx scripts/setup-stripe-products.ts' to set up Stripe products.`
    );
  }

  return priceId;
}

/**
 * Get the trial days for a plan
 */
export function getTrialDays(planId: PlanId): number {
  return SUBSCRIPTION_PLANS[planId].trialDays;
}

/**
 * Validate that Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  return Boolean(
    STRIPE_PRICES.PRODUCT_ID &&
      STRIPE_PRICES.MONTHLY &&
      STRIPE_PRICES.TRIAL_3DAY &&
      STRIPE_PRICES.TRIAL_7DAY &&
      STRIPE_PRICES.TRIAL_14DAY &&
      STRIPE_PRICES.ONE_TIME &&
      STRIPE_PRICES.WINBACK
  );
}
