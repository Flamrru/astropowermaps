import { loadStripe, Stripe } from "@stripe/stripe-js";

// Client-side Stripe instance (singleton pattern)
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};
