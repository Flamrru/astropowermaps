import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  SUBSCRIPTION_PLANS,
  type PlanId,
} from "@/lib/subscription-plans";

// Lazy-initialize Stripe to avoid build-time errors when env vars aren't set
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key);
}

interface CheckoutPayload {
  session_id: string;
  email: string;
  planId?: PlanId; // Optional for backward compatibility, defaults to "trial_7day"
}

/**
 * Create a Stripe Checkout Session for trial payment
 *
 * Flow:
 * 1. User pays trial fee ($2.99/5.99/9.99) via one-time payment
 * 2. Webhook creates subscription with trial period (customer won't be charged until trial ends)
 * 3. After trial, subscription auto-charges $19.99/month
 *
 * This approach is cleaner than mixing one-time and subscription charges in a single checkout.
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

    // Create idempotency key to prevent duplicate charges
    const idempotencyKey = `checkout_${body.session_id}_${planId}_${Date.now()}`;

    // Get the base URL for return URL
    const origin = request.headers.get("origin") || "http://localhost:3000";

    // Create Stripe Checkout Session for ONE-TIME trial payment
    // The subscription will be created in the webhook after payment succeeds
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment", // One-time payment for trial fee
      customer_email: body.email,

      // Save payment method for future subscription charges
      payment_intent_data: {
        setup_future_usage: "off_session", // Allow charging later without customer present
      },

      // Trial fee line item
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Stella+ ${plan.name}`,
              description: `${plan.trialDays}-day trial access to Stella+. After trial ends, you'll be charged $19.99/month. Cancel anytime.`,
            },
            unit_amount: plan.trialPriceCents,
          },
          quantity: 1,
        },
      ],

      // Return URL after successful payment
      return_url: `${origin}/reveal?payment_status=complete&session_id={CHECKOUT_SESSION_ID}`,

      // Store our session_id in metadata for webhook
      metadata: {
        app_session_id: body.session_id,
        email: body.email,
        plan_id: planId,
        trial_days: plan.trialDays.toString(),
        monthly_price_cents: plan.monthlyPriceCents.toString(),
        product_type: "stella_plus_trial",
        // Flag to tell webhook to create subscription
        create_subscription: "true",
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
