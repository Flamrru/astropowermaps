"use client";

import { useCallback, useState, useMemo } from "react";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { useReveal } from "@/lib/reveal-state";
import { v4 as uuidv4 } from "uuid";
import { trackMetaEvent } from "@/components/MetaPixel";
import { SUBSCRIPTION_PLANS, type PlanId } from "@/lib/subscription-plans";

interface StripeCheckoutProps {
  planId?: PlanId; // Selected plan from PricingSelector
  onComplete?: () => void;
}

export default function StripeCheckout({
  planId = "trial_7day",
  onComplete,
}: StripeCheckoutProps) {
  const { state, dispatch } = useReveal();
  const [error, setError] = useState<string | null>(null);

  // Get plan details for tracking
  const plan = SUBSCRIPTION_PLANS[planId];

  // Generate a session_id if one doesn't exist (for dev mode direct access)
  const sessionId = useMemo(() => {
    return state.session_id || uuidv4();
  }, [state.session_id]);

  // Fetch client secret from our API
  const fetchClientSecret = useCallback(async () => {
    try {
      // Validate email - use fallback if invalid
      const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const email = isValidEmail(state.email) ? state.email : "test@example.com";

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          email,
          planId, // Pass selected plan to API
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const data = await response.json();
      return data.clientSecret;
    } catch (err) {
      console.error("Error fetching client secret:", err);
      setError(err instanceof Error ? err.message : "Failed to load checkout");
      throw err;
    }
  }, [sessionId, state.email, planId]);

  // Handle checkout completion
  const handleComplete = useCallback(() => {
    // Track Purchase event client-side (backup for CAPI)
    // Use trial price from selected plan
    trackMetaEvent("Purchase", {
      value: plan.trialPriceCents / 100,
      currency: "USD",
      content_type: "subscription",
      content_name: `Stella+ ${plan.name}`,
      content_ids: [planId],
    });

    // Mark payment as complete in reveal state
    dispatch({
      type: "SET_PAYMENT_COMPLETE",
      payload: { orderId: sessionId },
    });
    dispatch({ type: "NEXT_STEP" });
    onComplete?.();
  }, [dispatch, sessionId, onComplete, plan, planId]);

  const stripePromise = getStripe();

  if (!stripePromise) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
        <p className="text-red-400 text-sm text-center">
          Payment system not configured. Please contact support.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
        <p className="text-red-400 text-sm text-center">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 text-white/60 text-xs underline block mx-auto"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div
      className="stripe-checkout-wrapper rounded-2xl overflow-hidden relative"
      style={{
        background: "rgba(10, 10, 25, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)",
        zIndex: 100,
        isolation: "isolate", // Create new stacking context for iframe
      }}
    >
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{
          fetchClientSecret,
          onComplete: handleComplete,
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
