import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/stripe-config";

// Lazy-initialize Stripe to avoid build-time errors when env vars aren't set
function getStripe() {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error("Stripe secret key is not configured. Set STRIPE_SECRET_KEY_SANDBOX or STRIPE_SECRET_KEY_LIVE");
  }
  return new Stripe(key);
}

/**
 * GET /api/stripe/lookup-session?checkout_session_id=cs_xxx
 *
 * Looks up the app_session_id from a Stripe checkout session.
 * This is needed because Stripe's return_url only supports {CHECKOUT_SESSION_ID}
 * as a template variable, not our custom app_session_id.
 *
 * Returns: { app_session_id: "uuid", email: "user@example.com" }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutSessionId = searchParams.get("checkout_session_id");

    if (!checkoutSessionId) {
      return NextResponse.json(
        { error: "Missing checkout_session_id parameter" },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.retrieve(
      checkoutSessionId
    );

    // Extract our app_session_id from metadata
    const appSessionId = checkoutSession.metadata?.app_session_id;
    const email =
      checkoutSession.metadata?.email || checkoutSession.customer_email;

    if (!appSessionId) {
      console.error(
        "No app_session_id in checkout session metadata:",
        checkoutSessionId
      );
      return NextResponse.json(
        { error: "Session not found or invalid" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      app_session_id: appSessionId,
      email: email || null,
      payment_status: checkoutSession.payment_status,
    });
  } catch (error) {
    console.error("Error looking up session:", error);

    // Handle Stripe errors specifically
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to look up session" },
      { status: 500 }
    );
  }
}
