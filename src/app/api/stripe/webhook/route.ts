import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendPurchaseEvent } from "@/lib/meta-capi";
import { sendConfirmationEmail } from "@/lib/resend";

// Lazy-initialize Stripe to avoid build-time errors
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key);
}

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  return secret;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("Missing stripe-signature header");
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      const stripe = getStripe();
      const webhookSecret = getWebhookSecret();
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutExpired(session);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  console.log("Payment completed for session:", session.id);

  const appSessionId = session.metadata?.app_session_id;
  const email = session.metadata?.email || session.customer_email;

  if (!appSessionId) {
    console.error("No app_session_id in metadata");
    return;
  }

  // Update astro_purchases to completed
  const { error: purchaseError } = await supabaseAdmin
    .from("astro_purchases")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      stripe_customer_id: session.customer as string,
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .eq("session_id", appSessionId)
    .eq("status", "pending");

  if (purchaseError) {
    console.error("Failed to update purchase:", purchaseError);
  }

  // Update astro_leads.has_purchased to true
  if (email) {
    const { error: leadError } = await supabaseAdmin
      .from("astro_leads")
      .update({ has_purchased: true })
      .eq("session_id", appSessionId);

    if (leadError) {
      console.error("Failed to update lead:", leadError);
    }
  }

  // Send Purchase event to Meta Conversions API
  // This fires server-side for reliable tracking (not blocked by ad blockers)
  if (email) {
    const amountPaid = session.amount_total ? session.amount_total / 100 : 19.0;
    const currency = session.currency?.toUpperCase() || "USD";

    const { success, eventId } = await sendPurchaseEvent({
      email,
      value: amountPaid,
      currency,
    });

    if (success) {
      console.log(`Meta CAPI: Purchase event sent for ${appSessionId}, eventId: ${eventId}`);
    }
  }

  // Send confirmation email with permanent map link via Resend
  if (email && appSessionId) {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://astropowermaps.com";

    const emailResult = await sendConfirmationEmail({
      email,
      sessionId: appSessionId,
      baseUrl,
    });

    if (emailResult.success) {
      console.log(`Confirmation email sent to ${email.substring(0, 3)}***`);
    } else {
      console.error(`Failed to send confirmation email: ${emailResult.error}`);
    }
  }

  console.log(`Payment completed for session ${appSessionId}`);
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  console.log("Checkout expired for session:", session.id);

  const appSessionId = session.metadata?.app_session_id;

  if (!appSessionId) {
    return;
  }

  // Update status to expired
  await supabaseAdmin
    .from("astro_purchases")
    .update({ status: "expired" })
    .eq("session_id", appSessionId)
    .eq("status", "pending");
}
