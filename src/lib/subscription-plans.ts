/**
 * Stella+ Subscription Plans Configuration
 *
 * Price IDs are populated by running: npx tsx scripts/setup-stripe-products.ts
 *
 * IMPORTANT: These are SANDBOX/TEST IDs. For production, create separate
 * products in your live Stripe account and update these values.
 */

// Stripe Price IDs (populated after running setup script)
// TODO: Run `npx tsx scripts/setup-stripe-products.ts` and update these values
export const STRIPE_PRICES = {
  PRODUCT_ID: "", // Will be like: prod_xxx
  MONTHLY: "", // Will be like: price_xxx ($19.99/month recurring)
  TRIAL_3DAY: "", // Will be like: price_xxx ($2.99 one-time)
  TRIAL_7DAY: "", // Will be like: price_xxx ($5.99 one-time)
  TRIAL_14DAY: "", // Will be like: price_xxx ($9.99 one-time)
} as const;

// Plan IDs match the UI component (PricingSelector)
export type PlanId = "trial_3day" | "trial_7day" | "trial_14day";

// Map plan IDs to Stripe price keys
const PLAN_TO_PRICE_KEY: Record<PlanId, keyof typeof STRIPE_PRICES> = {
  trial_3day: "TRIAL_3DAY",
  trial_7day: "TRIAL_7DAY",
  trial_14day: "TRIAL_14DAY",
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
      STRIPE_PRICES.TRIAL_14DAY
  );
}
