import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendPurchaseEvent } from "@/lib/meta-capi";
import { sendConfirmationEmail } from "@/lib/resend";
import { moveSubscriberToCustomers } from "@/lib/mailerlite";
import { getStripeSecretKey, getStripeWebhookSecret } from "@/lib/stripe-config";

// Lazy-initialize Stripe to avoid build-time errors
function getStripe() {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error("Stripe secret key is not configured. Set STRIPE_SECRET_KEY_SANDBOX or STRIPE_SECRET_KEY_LIVE");
  }
  return new Stripe(key);
}

function getWebhookSecretValue() {
  const secret = getStripeWebhookSecret();
  if (!secret) {
    throw new Error("Stripe webhook secret is not configured. Set STRIPE_WEBHOOK_SECRET_SANDBOX or STRIPE_WEBHOOK_SECRET_LIVE");
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
      const webhookSecret = getWebhookSecretValue();
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
      // Checkout completion (works for both one-time and subscription)
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

      // Subscription lifecycle events
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      // Trial ending reminder (3 days before)
      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Trial ending soon for customer: ${subscription.customer}`);
        // TODO: Send trial ending email if desired
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
  console.log("Checkout completed for session:", session.id);
  console.log("Mode:", session.mode);

  const appSessionId = session.metadata?.app_session_id;
  const email = session.metadata?.email || session.customer_email;
  const planId = session.metadata?.plan_id;
  const trialDays = parseInt(session.metadata?.trial_days || "0", 10);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://astropowermaps.com";

  if (!appSessionId) {
    console.error("No app_session_id in metadata");
    return;
  }

  if (!email) {
    console.error("No email in session metadata");
    return;
  }

  // In subscription mode, Stripe creates the subscription automatically
  // We just extract it from the session - no manual creation needed!
  let subscriptionId: string | null = session.subscription as string | null;

  if (session.mode === "subscription" && subscriptionId) {
    console.log(`Subscription created by Stripe: ${subscriptionId}`);
  }

  // Legacy support: create subscription for old payment-mode checkouts
  const createSubscription = session.metadata?.create_subscription === "true";
  const stripe = getStripe();

  if (createSubscription && session.mode === "payment" && trialDays > 0) {
    try {
      const customerId = session.customer as string;

      // Get the payment method from the payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent as string
      );
      const paymentMethodId = paymentIntent.payment_method as string;

      if (!paymentMethodId) {
        console.error("No payment method found on payment intent");
      } else {
        // Set payment method as default for customer
        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });

        // Calculate trial end date
        const trialEnd = Math.floor(Date.now() / 1000) + trialDays * 24 * 60 * 60;

        // Create or get the monthly price
        // For simplicity, we create the price inline. In production, use a pre-created price ID.
        const monthlyPriceCents = parseInt(session.metadata?.monthly_price_cents || "1999", 10);

        // First, find or create the Stella+ product
        const products = await stripe.products.list({
          limit: 1,
        });

        let productId: string;
        const existingProduct = products.data.find(
          (p) => p.metadata?.app === "astropowermaps" && p.metadata?.type === "stella_plus"
        );

        if (existingProduct) {
          productId = existingProduct.id;
        } else {
          const newProduct = await stripe.products.create({
            name: "Stella+ Monthly",
            description: "Your personal AI astrologer with daily cosmic guidance.",
            metadata: {
              app: "astropowermaps",
              type: "stella_plus",
            },
          });
          productId = newProduct.id;
        }

        // Find or create the monthly price
        const prices = await stripe.prices.list({
          product: productId,
          limit: 10,
        });

        let priceId: string;
        const existingPrice = prices.data.find(
          (p) =>
            p.recurring?.interval === "month" &&
            p.unit_amount === monthlyPriceCents &&
            p.active
        );

        if (existingPrice) {
          priceId = existingPrice.id;
        } else {
          const newPrice = await stripe.prices.create({
            product: productId,
            unit_amount: monthlyPriceCents,
            currency: "usd",
            recurring: {
              interval: "month",
            },
          });
          priceId = newPrice.id;
        }

        // Create subscription with trial
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          trial_end: trialEnd,
          default_payment_method: paymentMethodId,
          metadata: {
            app_session_id: appSessionId,
            plan_id: planId || "",
            created_from: "trial_checkout",
          },
        });

        subscriptionId = subscription.id;
        console.log(`Subscription created: ${subscriptionId} (trial ends: ${new Date(trialEnd * 1000).toISOString()})`);
      }
    } catch (subError) {
      console.error("Failed to create subscription:", subError);
      // Don't fail the whole webhook - user still paid for trial
    }
  }

  // Update astro_purchases to completed
  const { error: purchaseError } = await supabaseAdmin
    .from("astro_purchases")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      stripe_customer_id: session.customer as string,
      stripe_payment_intent_id: session.payment_intent as string || null,
      metadata: {
        checkout_session_id: session.id,
        plan_id: planId,
        subscription_id: subscriptionId,
        subscription_mode: Boolean(subscriptionId),
      },
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

      // Calculate trial end for profile
      const trialEndDate = trialDays > 0
        ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

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
            subscription_status: subscriptionId ? "trialing" : "active",
            subscription_id: subscriptionId || null,
            subscription_trial_end: trialEndDate,
            stripe_customer_id: session.customer as string,
          },
          { onConflict: "user_id" }
        );

      if (profileError) {
        console.error("Failed to create/update profile:", profileError);
      } else {
        console.log(`Profile: Created/updated for ${email.substring(0, 3)}***`);
      }

      // Note: Users now set their password during checkout on /account-setup page
      // No magic link needed - they can log in with email + password anytime
    } catch (authSetupError) {
      console.error("Auth setup failed:", authSetupError);
      // Continue anyway - email will still be sent with map link
    }
  }

  // Send Purchase event to Meta Conversions API
  const amountPaid = session.amount_total ? session.amount_total / 100 : 19.0;
  const currency = session.currency?.toUpperCase() || "USD";

  // Get Meta tracking data from session metadata (stored during checkout creation)
  const metaEventId = session.metadata?.meta_event_id;
  const fbp = session.metadata?.fbp;
  const fbc = session.metadata?.fbc;

  const { success: metaSuccess, eventId } = await sendPurchaseEvent({
    email,
    value: amountPaid,
    currency,
    // Deduplication: use same event ID as client-side pixel
    eventId: metaEventId || undefined,
    // Facebook identifiers for better match rate
    fbp: fbp || undefined,
    fbc: fbc || undefined,
    eventSourceUrl: `${baseUrl}/reveal`,
  });

  if (metaSuccess) {
    console.log(`Meta CAPI: Purchase event sent for ${appSessionId}, eventId: ${eventId}, deduped: ${Boolean(metaEventId)}`);
  }

  // Send confirmation email with permanent map link via Resend
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

// ========================================
// SUBSCRIPTION LIFECYCLE HANDLERS
// ========================================

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log("Subscription created:", subscription.id);
  console.log("Status:", subscription.status);
  console.log("Trial end:", subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : "none");

  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = mapSubscriptionStatus(subscription.status);

  // Update user_profiles with subscription info
  const { error } = await supabaseAdmin
    .from("user_profiles")
    .update({
      subscription_id: subscriptionId,
      subscription_status: status,
      subscription_trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Failed to update profile with subscription:", error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log("Subscription updated:", subscription.id);
  console.log("Status:", subscription.status);

  const customerId = subscription.customer as string;
  const status = mapSubscriptionStatus(subscription.status);

  // Update user_profiles with new status
  const { error } = await supabaseAdmin
    .from("user_profiles")
    .update({
      subscription_status: status,
      subscription_trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Failed to update profile subscription status:", error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log("Subscription deleted/cancelled:", subscription.id);

  const customerId = subscription.customer as string;

  // Update user_profiles to cancelled status
  const { error } = await supabaseAdmin
    .from("user_profiles")
    .update({
      subscription_status: "cancelled",
      subscription_cancelled_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Failed to update profile for cancelled subscription:", error);
  }
}

/**
 * Map Stripe subscription status to our internal status
 */
function mapSubscriptionStatus(stripeStatus: Stripe.Subscription.Status): string {
  switch (stripeStatus) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "cancelled";
    case "unpaid":
      return "unpaid";
    case "incomplete":
    case "incomplete_expired":
      return "incomplete";
    case "paused":
      return "paused";
    default:
      return stripeStatus;
  }
}
