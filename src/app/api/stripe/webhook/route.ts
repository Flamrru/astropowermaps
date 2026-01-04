import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendPurchaseEvent } from "@/lib/meta-capi";
import { sendConfirmationEmail } from "@/lib/resend";
import { moveSubscriberToCustomers } from "@/lib/mailerlite";

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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://astropowermaps.com";

  if (!appSessionId) {
    console.error("No app_session_id in metadata");
    return;
  }

  if (!email) {
    console.error("No email in session metadata");
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

  // Update astro_leads.has_purchased to true and fetch lead data for profile
  const { data: lead, error: leadError } = await supabaseAdmin
    .from("astro_leads")
    .update({ has_purchased: true })
    .eq("session_id", appSessionId)
    .select("*")
    .single();

  if (leadError) {
    console.error("Failed to update/fetch lead:", leadError);
  }

  // Move subscriber from Leads to Customers in MailerLite
  const mailerliteResult = await moveSubscriberToCustomers(email);
  if (mailerliteResult.success) {
    console.log(`MailerLite: Moved ${email.substring(0, 3)}*** to Customers`);
  } else if (mailerliteResult.error) {
    console.error(`MailerLite error: ${mailerliteResult.error}`);
  }

  // ========================================
  // CREATE SUPABASE AUTH USER & PROFILE
  // ========================================
  let magicLink: string | undefined;

  if (lead && lead.birth_date) {
    try {
      // 1. Check if auth user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u) => u.email === email);

      let authUserId: string;

      if (existingUser) {
        // User already exists (maybe they paid before and came back)
        authUserId = existingUser.id;
        console.log(`Auth: Found existing user for ${email.substring(0, 3)}***`);
      } else {
        // 2. Create new Supabase auth user
        const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          email_confirm: true, // Skip email verification - they paid!
        });

        if (authError || !newAuthUser.user) {
          console.error("Failed to create auth user:", authError);
          throw authError;
        }

        authUserId = newAuthUser.user.id;
        console.log(`Auth: Created new user for ${email.substring(0, 3)}***`);
      }

      // 3. Create or update user_profiles record with birth data from lead
      const { error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .upsert(
          {
            user_id: authUserId,
            display_name: null, // Will be set in /setup
            account_status: "pending_setup",
            birth_date: lead.birth_date,
            birth_time: lead.birth_time || null,
            birth_time_unknown: lead.birth_time_unknown || false,
            birth_place: lead.birth_location_name,
            birth_lat: lead.birth_location_lat,
            birth_lng: lead.birth_location_lng,
            birth_timezone: lead.birth_location_timezone,
            subscription_status: "active",
            stripe_customer_id: session.customer as string,
          },
          { onConflict: "user_id" }
        );

      if (profileError) {
        console.error("Failed to create/update profile:", profileError);
      } else {
        console.log(`Profile: Created/updated for ${email.substring(0, 3)}***`);
      }

      // 4. Generate magic link for dashboard access
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
          redirectTo: `${baseUrl}/auth/callback?next=/setup`,
        },
      });

      if (linkError) {
        console.error("Failed to generate magic link:", linkError);
      } else if (linkData?.properties?.action_link) {
        magicLink = linkData.properties.action_link;
        console.log(`Magic link generated for ${email.substring(0, 3)}***`);
      }
    } catch (authSetupError) {
      console.error("Auth setup failed:", authSetupError);
      // Continue anyway - email will still be sent with map link
    }
  }

  // Send Purchase event to Meta Conversions API
  const amountPaid = session.amount_total ? session.amount_total / 100 : 19.0;
  const currency = session.currency?.toUpperCase() || "USD";

  const { success: metaSuccess, eventId } = await sendPurchaseEvent({
    email,
    value: amountPaid,
    currency,
  });

  if (metaSuccess) {
    console.log(`Meta CAPI: Purchase event sent for ${appSessionId}, eventId: ${eventId}`);
  }

  // Send confirmation email with permanent map link + magic link via Resend
  const emailResult = await sendConfirmationEmail({
    email,
    sessionId: appSessionId,
    baseUrl,
    magicLink, // NEW: Include magic link for dashboard access
  });

  if (emailResult.success) {
    console.log(`Confirmation email sent to ${email.substring(0, 3)}***`);
  } else {
    console.error(`Failed to send confirmation email: ${emailResult.error}`);
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
