import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  SUBSCRIPTION_PLANS,
  type PlanId,
} from "@/lib/subscription-plans";
import { getStripeSecretKey, getStripePrices } from "@/lib/stripe-config";

// Lazy-initialize Stripe with explicit API version for add_invoice_items support
function getStripe() {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error("Stripe secret key is not configured. Set STRIPE_SECRET_KEY_SANDBOX or STRIPE_SECRET_KEY_LIVE");
  }
  // Use explicit API version that supports subscription_data.add_invoice_items
  return new Stripe(key, {
    apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
  });
}

interface CheckoutPayload {
  session_id: string;
  email: string;
  planId?: PlanId; // Optional for backward compatibility, defaults to "trial_7day"
  devMode?: boolean; // True if testing in dev mode (no real lead in DB)
  // Meta CAPI tracking data for deduplication
  metaEventId?: string;  // Event ID for deduplication with client pixel
  fbp?: string;          // Facebook Browser ID (_fbp cookie)
  fbc?: string;          // Facebook Click ID (from fbclid URL param)
}

/**
 * Create a Stripe Checkout Session
 *
 * Supports two modes:
 * 1. SUBSCRIPTION (default): Mixed cart with trial fee + recurring monthly
 * 2. ONE-TIME (planId="one_time"): Single $19.99 payment, no subscription
 *
 * The mode is determined by the planId parameter.
 */
export async function POST(request: NextRequest) {
  try {
    const body: CheckoutPayload = await request.json();

    // Validate required fields
    if (!body.session_id || !body.email) {
      return NextResponse.json(
        { error: "Missing session_id or email" },
        { status: 400 }
      );
    }

    // Default to 7-day trial if not specified
    const planId: PlanId = body.planId || "trial_7day";
    const plan = SUBSCRIPTION_PLANS[planId];

    if (!plan) {
      return NextResponse.json(
        { error: `Invalid plan: ${planId}` },
        { status: 400 }
      );
    }

    // Determine if this is a one-time payment or subscription
    // Both "one_time" ($19.99) and "winback" ($9.99) are one-time payments
    const isOneTimePayment = planId === "one_time" || planId === "winback";
    const paymentVariant = isOneTimePayment ? (planId === "winback" ? "winback" : "single") : "subscription";

    // Get prices based on mode
    const prices = getStripePrices();

    if (isOneTimePayment) {
      // One-time payment mode - need correct price ID based on plan
      const priceId = planId === "winback" ? prices.WINBACK : prices.ONE_TIME;
      if (!priceId || priceId.startsWith("price_TODO")) {
        console.error(`Price ID not configured for plan: ${planId}`);
        return NextResponse.json(
          { error: `${planId} payment not configured yet` },
          { status: 500 }
        );
      }
    } else {
      // Subscription mode - need MONTHLY price ID
      const monthlyPriceId = prices.MONTHLY;
      if (!monthlyPriceId) {
        console.error("Monthly price ID not configured");
        return NextResponse.json(
          { error: "Payment system not configured" },
          { status: 500 }
        );
      }
    }

    // Create idempotency key to prevent duplicate charges
    const idempotencyKey = `checkout_${body.session_id}_${planId}_${Date.now()}`;

    // Get the base URL for return URL
    const origin = request.headers.get("origin") || "http://localhost:3000";

    const stripe = getStripe();

    // Check if customer already exists to prevent duplicate Stripe customers
    let existingCustomerId: string | undefined;
    try {
      const existingCustomers = await stripe.customers.list({
        email: body.email,
        limit: 1,
      });
      if (existingCustomers.data.length > 0) {
        existingCustomerId = existingCustomers.data[0].id;
        console.log(`Reusing existing Stripe customer: ${existingCustomerId}`);
      }
    } catch (err) {
      console.error("Failed to check for existing customer:", err);
    }

    // Common metadata for both modes
    const commonMetadata = {
      app_session_id: body.session_id,
      email: body.email,
      plan_id: planId,
      payment_variant: paymentVariant, // Track A/B test variant
      product_type: isOneTimePayment ? "stella_plus_one_time" : "stella_plus_subscription",
      // Meta CAPI tracking data for deduplication
      meta_event_id: body.metaEventId || "",
      fbp: body.fbp || "",
      fbc: body.fbc || "",
    };

    // Return URL after successful payment
    const returnUrl = body.devMode
      ? `${origin}/setup?sid=${body.session_id}&d=1`
      : `${origin}/setup?sid=${body.session_id}`;

    let checkoutSession: Stripe.Checkout.Session;

    if (isOneTimePayment) {
      // ==========================================
      // ONE-TIME PAYMENT MODE ($19.99 single purchase)
      // ==========================================
      console.log(`Creating ONE-TIME checkout for ${body.email}, plan: ${planId}`);

      checkoutSession = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        mode: "payment", // One-time payment mode
        ...(existingCustomerId
          ? { customer: existingCustomerId }
          : {
              customer_email: body.email,
              customer_creation: "always",
            }),

        // Single one-time line item (use WINBACK or ONE_TIME based on plan)
        line_items: [
          {
            price: planId === "winback" ? prices.WINBACK : prices.ONE_TIME,
            quantity: 1,
          },
        ],

        // No subscription_data for one-time payments

        return_url: returnUrl,
        metadata: {
          ...commonMetadata,
          trial_days: "0", // No trial for one-time
        },
      });
    } else {
      // ==========================================
      // SUBSCRIPTION MODE (trial + recurring)
      // ==========================================
      console.log(`Creating SUBSCRIPTION checkout for ${body.email}, plan: ${planId}`);

      checkoutSession = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        mode: "subscription",
        ...(existingCustomerId
          ? { customer: existingCustomerId }
          : { customer_email: body.email }),

        // Mixed cart: one-time trial fee + recurring subscription
        line_items: [
          // 1. One-time trial access fee (charged on first invoice)
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Stella+ ${plan.name}`,
                description: `${plan.trialDays}-day trial access to Stella+`,
              },
              unit_amount: plan.trialPriceCents,
            },
            quantity: 1,
          },
          // 2. Monthly subscription (trial_period_days applies to this)
          {
            price: prices.MONTHLY,
            quantity: 1,
          },
        ],

        subscription_data: {
          trial_period_days: plan.trialDays,
          metadata: {
            app_session_id: body.session_id,
            plan_id: planId,
            created_from: "checkout",
          },
        },

        return_url: returnUrl,
        metadata: {
          ...commonMetadata,
          trial_days: plan.trialDays.toString(),
        },
      });
    }

    // Store pending purchase record in Supabase
    const { error: dbError } = await supabaseAdmin.from("astro_purchases").insert({
      session_id: body.session_id,
      email: body.email,
      stripe_payment_intent_id: checkoutSession.id,
      amount_cents: plan.trialPriceCents,
      currency: "usd",
      status: "pending",
      idempotency_key: idempotencyKey,
      product_type: "stella_plus",
      metadata: {
        checkout_session_id: checkoutSession.id,
        plan_id: planId,
        trial_days: plan.trialDays,
        monthly_amount_cents: plan.monthlyPriceCents,
        subscription_mode: !isOneTimePayment,
        payment_variant: paymentVariant, // Track A/B test variant
      },
    });

    if (dbError) {
      console.error("Failed to store purchase record:", dbError);
      // Don't fail the request - payment can still work, we'll get it via webhook
    }

    // Return the client secret for the embedded form
    return NextResponse.json({
      clientSecret: checkoutSession.client_secret,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);

    // Handle Stripe errors specifically
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
