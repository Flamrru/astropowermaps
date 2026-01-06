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
 * Create a Stripe Checkout Session for subscription with paid trial
 *
 * Uses Stripe's "mixed cart" approach:
 * 1. One-time line item for trial fee (charged immediately on first invoice)
 * 2. Recurring line item for subscription (trial_period_days delays first charge)
 * 3. Stripe creates subscription automatically - NO webhook needed for subscription!
 * 4. After trial ends, customer is charged $19.99/month
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

    // Create Stripe Checkout Session in SUBSCRIPTION mode with mixed cart
    // Stripe handles subscription creation automatically!
    const stripe = getStripe();

    // Check if customer already exists to prevent duplicate Stripe customers
    // This is important when users re-purchase after cancelling
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
      // Continue without existing customer - will create new one
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "subscription",
      // Use existing customer if found, otherwise let Stripe create new one
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
          price: monthlyPriceId,
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

      // Return URL after successful payment
      return_url: body.devMode
        ? `${origin}/setup?sid=${body.session_id}&d=1`
        : `${origin}/setup?sid=${body.session_id}`,

      metadata: {
        app_session_id: body.session_id,
        email: body.email,
        plan_id: planId,
        trial_days: plan.trialDays.toString(),
        product_type: "stella_plus_subscription",
        // Meta CAPI tracking data for deduplication
        meta_event_id: body.metaEventId || "",
        fbp: body.fbp || "",
        fbc: body.fbc || "",
      },
    });

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
