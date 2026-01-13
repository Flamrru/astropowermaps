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
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Check, ArrowRight } from "lucide-react";

// Helper to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

// Helper to extract Facebook Click ID (fbc) from URL or cookie
function extractFbc(): string | null {
  if (typeof window === "undefined") return null;
  const urlParams = new URLSearchParams(window.location.search);
  const fbclid = urlParams.get("fbclid");
  // If fbclid in URL, format as fbc; otherwise try cookie
  if (fbclid) {
    return `fb.1.${Date.now()}.${fbclid}`;
  }
  return getCookie("_fbc");
}

// Generate unique event ID for Meta deduplication
function generateMetaEventId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

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

  // Password creation state (shown after payment)
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Get plan details for tracking
  const plan = SUBSCRIPTION_PLANS[planId];

  // Generate a session_id if one doesn't exist (for dev mode direct access)
  const sessionId = useMemo(() => {
    return state.session_id || uuidv4();
  }, [state.session_id]);

  // Fetch client secret from our API
  const fetchClientSecret = useCallback(async () => {
    try {
      // Track InitiateCheckout when user reaches payment step
      trackMetaEvent("InitiateCheckout", {
        value: plan.trialPriceCents / 100,
        currency: "USD",
        content_type: "subscription",
        content_name: `Stella+ ${plan.name}`,
        content_ids: [planId],
      });
      console.log("[StripeCheckout] InitiateCheckout event fired");

      // Validate email - use fallback if invalid
      const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const email = isValidEmail(state.email) ? state.email : "test@example.com";

      // Check URL params
      const urlParams = new URLSearchParams(window.location.search);
      const isDevMode = urlParams.has("d");
      const offer = urlParams.get("offer"); // "win", "full", or null (quiz/ads)

      // Save email to localStorage for account setup page
      if (email) {
        localStorage.setItem("stella_email", email);
      }

      // Generate Meta event ID for deduplication (client + server will use same ID)
      const metaEventId = generateMetaEventId("purchase");
      localStorage.setItem("meta_purchase_event_id", metaEventId);

      // Extract Facebook identifiers for CAPI
      const fbp = getCookie("_fbp");
      const fbc = extractFbc();

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          email,
          planId, // Pass selected plan to API
          devMode: isDevMode, // Pass dev mode flag
          offer: offer || undefined, // "win"/"full" = email, undefined = quiz/ads
          // Meta tracking data for CAPI deduplication
          metaEventId,
          fbp: fbp || undefined,
          fbc: fbc || undefined,
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

  // Handle checkout completion - show password form
  const handleComplete = useCallback(() => {
    console.log("[StripeCheckout] handleComplete called - payment successful!");

    // Retrieve event ID for deduplication with CAPI (stored in fetchClientSecret)
    const metaEventId = localStorage.getItem("meta_purchase_event_id");
    console.log("[StripeCheckout] metaEventId from localStorage:", metaEventId);

    // Track Purchase event client-side with eventID for deduplication
    trackMetaEvent("Purchase", {
      value: plan.trialPriceCents / 100,
      currency: "USD",
      content_type: "subscription",
      content_name: `Stella+ ${plan.name}`,
      content_ids: [planId],
      eventID: metaEventId || undefined,  // Same ID will be used by CAPI
    });

    // Mark payment as complete in reveal state
    dispatch({
      type: "SET_PAYMENT_COMPLETE",
      payload: { orderId: sessionId },
    });

    onComplete?.();

    // Show password creation form
    setShowPasswordForm(true);
  }, [dispatch, sessionId, onComplete, plan, planId]);

  // Handle password creation and redirect to map
  const handleCreateAccount = async () => {
    setPasswordError(null);

    // Validate passwords
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    setIsCreatingAccount(true);

    try {
      // Create account with password via API
      const response = await fetch("/api/auth/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: state.email,
          password,
          sessionId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create account");
      }

      // Redirect to map (full app with navigation)
      window.location.href = "/map";
    } catch (err) {
      console.error("Account creation error:", err);
      setPasswordError(err instanceof Error ? err.message : "Failed to create account");
      setIsCreatingAccount(false);
    }
  };

  // Skip password and go directly to map
  const handleSkipPassword = () => {
    window.location.href = "/map";
  };

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

  // Show password creation form after payment
  if (showPasswordForm) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-6"
        style={{
          background: "rgba(10, 10, 25, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Success checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #4ade80, #22c55e)",
            boxShadow: "0 0 30px rgba(74, 222, 128, 0.4)",
          }}
        >
          <Check className="w-8 h-8 text-black" strokeWidth={3} />
        </motion.div>

        <h3 className="text-xl font-bold text-white text-center mb-2">
          Payment Successful!
        </h3>
        <p className="text-white/60 text-sm text-center mb-6">
          Create a password to access your account anytime
        </p>

        {/* Password error */}
        {passwordError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm text-center">{passwordError}</p>
          </div>
        )}

        {/* Password input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white/70 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Lock className="w-5 h-5 text-white/40" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full pl-12 pr-12 py-3 rounded-xl text-white placeholder:text-white/30 text-base"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Confirm password input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white/70 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <Lock className="w-5 h-5 text-white/40" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder:text-white/30 text-base"
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            />
          </div>
        </div>

        {/* Create account button */}
        <motion.button
          onClick={handleCreateAccount}
          disabled={isCreatingAccount || !password || !confirmPassword}
          className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 mb-3"
          style={{
            background: "linear-gradient(135deg, #E8C547 0%, #C9A227 100%)",
            color: "#1a1400",
            opacity: isCreatingAccount || !password || !confirmPassword ? 0.6 : 1,
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {isCreatingAccount ? (
            <>
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create Account & View Map</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        {/* Skip option */}
        <button
          onClick={handleSkipPassword}
          className="w-full text-white/50 text-sm hover:text-white/70 transition-colors"
        >
          Skip for now →
        </button>
      </motion.div>
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
