import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Initialize Stripe with the secret key (server-side only)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Product configuration
const PRODUCT_NAME = "2026 Astro Power Map";
const PRICE_CENTS = 2700; // $27.00
const CURRENCY = "usd";

interface CheckoutPayload {
  session_id: string;
  email: string;
}

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

    // Create idempotency key to prevent duplicate charges
    const idempotencyKey = `checkout_${body.session_id}_${Date.now()}`;

    // Get the base URL for return URL
    const origin = request.headers.get("origin") || "http://localhost:3000";

    // Create Stripe Checkout Session in embedded mode
    const checkoutSession = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      customer_email: body.email,
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: PRODUCT_NAME,
              description: "Your personalized 2026 astrocartography power map with power months, power cities, and timing insights.",
            },
            unit_amount: PRICE_CENTS,
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
        product_type: "2026_power_map",
      },
    });

    // Store pending purchase record in Supabase
    const { error: dbError } = await supabaseAdmin.from("astro_purchases").insert({
      session_id: body.session_id,
      email: body.email,
      stripe_payment_intent_id: checkoutSession.id, // Store checkout session ID
      amount_cents: PRICE_CENTS,
      currency: CURRENCY,
      status: "pending",
      idempotency_key: idempotencyKey,
      product_type: "2026_power_map",
      metadata: {
        checkout_session_id: checkoutSession.id,
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
