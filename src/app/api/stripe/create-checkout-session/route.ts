import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  SUBSCRIPTION_PLANS,
  type PlanId,
} from "@/lib/subscription-plans";
import { getStripeSecretKey, getStripePrices } from "@/lib/stripe-config";

// Lazy-initialize Stripe to avoid build-time errors when env vars aren't set
function getStripe() {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error("Stripe secret key is not configured. Set STRIPE_SECRET_KEY_SANDBOX or STRIPE_SECRET_KEY_LIVE");
  }
  return new Stripe(key);
}

interface CheckoutPayload {
  session_id: string;
  email: string;
  planId?: PlanId; // Optional for backward compatibility, defaults to "trial_7day"
  devMode?: boolean; // True if testing in dev mode (no real lead in DB)
}

/**
 * Create a Stripe Checkout Session for subscription with paid trial
 *
 * Uses Stripe's recommended pattern:
 * 1. Subscription mode checkout with trial_period_days
 * 2. add_invoice_items charges trial fee ($2.99/5.99/9.99) on first invoice
 * 3. Stripe automatically creates subscription with trial
 * 4. After trial ends, customer is charged $19.99/month automatically
 *
 * This is cleaner than payment mode + webhook subscription creation.
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

    // Get the monthly subscription price ID
    const prices = getStripePrices();
    const monthlyPriceId = prices.MONTHLY;

    if (!monthlyPriceId) {
      console.error("Monthly price ID not configured");
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 500 }
      );
    }

    // Create idempotency key to prevent duplicate charges
    const idempotencyKey = `checkout_${body.session_id}_${planId}_${Date.now()}`;

    // Get the base URL for return URL
    const origin = request.headers.get("origin") || "http://localhost:3000";

    // Create Stripe Checkout Session in SUBSCRIPTION mode
    // Stripe handles subscription creation automatically - much cleaner!
    const stripe = getStripe();

    // Build checkout session params
    // Using type assertion because Stripe SDK types don't include add_invoice_items yet
    const checkoutParams = {
      ui_mode: "embedded" as const,
      mode: "subscription" as const,
      customer_email: body.email,

      // Monthly subscription price ($19.99/mo)
      line_items: [
        {
          price: monthlyPriceId,
          quantity: 1,
        },
      ],

      subscription_data: {
        // Trial period - customer won't be charged subscription until this ends
        trial_period_days: plan.trialDays,

        // One-time trial fee charged immediately on first invoice
        // This is the $2.99/$5.99/$9.99 upfront charge
        add_invoice_items: [
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
        ],

        // Metadata on subscription for tracking
        metadata: {
          app_session_id: body.session_id,
          plan_id: planId,
          created_from: "checkout",
        },
      },

      // Return URL after successful payment - go to setup page
      return_url: body.devMode
        ? `${origin}/setup?sid=${body.session_id}&d=1`
        : `${origin}/setup?sid=${body.session_id}`,

      // Store our session_id in metadata for webhook
      metadata: {
        app_session_id: body.session_id,
        email: body.email,
        plan_id: planId,
        trial_days: plan.trialDays.toString(),
        product_type: "stella_plus_subscription",
      },
    };

    const checkoutSession = await stripe.checkout.sessions.create(
      checkoutParams as Stripe.Checkout.SessionCreateParams
    );

    // Store pending purchase record in Supabase
    const { error: dbError } = await supabaseAdmin.from("astro_purchases").insert({
      session_id: body.session_id,
      email: body.email,
      stripe_payment_intent_id: checkoutSession.id, // Store checkout session ID
      amount_cents: plan.trialPriceCents, // Initial trial charge
      currency: "usd",
      status: "pending",
      idempotency_key: idempotencyKey,
      product_type: "stella_plus",
      metadata: {
        checkout_session_id: checkoutSession.id,
        plan_id: planId,
        trial_days: plan.trialDays,
        monthly_amount_cents: plan.monthlyPriceCents,
        subscription_mode: true,
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
