import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { BYPASS_AUTH, TEST_USER_ID } from "@/lib/auth-bypass";
import { getStripeSecretKey } from "@/lib/stripe-config";

/**
 * Lazy-initialize Stripe to avoid build-time errors
 */
function getStripe() {
  const key = getStripeSecretKey();
  if (!key) {
    throw new Error("Stripe secret key is not configured. Set STRIPE_SECRET_KEY_SANDBOX or STRIPE_SECRET_KEY_LIVE");
  }
  return new Stripe(key);
}

interface CancelPayload {
  reason?: string;
  applyDiscount?: boolean;
}

/**
 * Stripe Cancel Subscription API
 *
 * POST /api/stripe/cancel - Cancel subscription at end of billing period
 *
 * Options:
 * - reason: Why the user is cancelling (for analytics)
 * - applyDiscount: If true, apply 50% off coupon instead of cancelling
 */
export async function POST(request: NextRequest) {
  try {
    const body: CancelPayload = await request.json().catch(() => ({}));

    // 1. Get user ID (bypass auth for testing)
    let userId: string;

    if (BYPASS_AUTH) {
      userId = TEST_USER_ID;
    } else {
      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = user.id;
    }

    // 2. Get user's subscription from profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("stripe_customer_id, subscription_id, subscription_status")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile.subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    const stripe = getStripe();

    // 3. If user accepted discount offer, apply coupon instead of cancelling
    if (body.applyDiscount) {
      try {
        // Find or create 50% off coupon
        let couponId = "STELLA_RETENTION_50";
        try {
          await stripe.coupons.retrieve(couponId);
        } catch {
          // Coupon doesn't exist, create it
          await stripe.coupons.create({
            id: couponId,
            percent_off: 50,
            duration: "once",
            name: "Retention Offer - 50% Off",
          });
        }

        // Apply coupon to subscription via discounts
        await stripe.subscriptions.update(profile.subscription_id, {
          discounts: [{ coupon: couponId }],
        });

        // Log the retention save
        console.log(`Retention save: User ${userId} accepted 50% discount`);

        return NextResponse.json({
          success: true,
          action: "discount_applied",
          message: "50% discount applied to your next billing cycle!",
        });
      } catch (discountError) {
        console.error("Failed to apply discount:", discountError);
        // Fall through to cancellation if discount fails
      }
    }

    // 4. Cancel subscription at period end (not immediately)
    const subscription = await stripe.subscriptions.update(
      profile.subscription_id,
      {
        cancel_at_period_end: true,
        metadata: {
          cancellation_reason: body.reason || "not_specified",
          cancelled_by: userId,
          cancelled_at: new Date().toISOString(),
        },
      }
    ) as Stripe.Subscription;

    // 5. Update our database with cancellation info
    await supabaseAdmin
      .from("user_profiles")
      .update({
        subscription_status: "cancelling",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    // 6. Log cancellation reason for analytics
    if (body.reason) {
      console.log(`Cancellation: User ${userId} - Reason: ${body.reason}`);
    }

    // Get current period end from the first subscription item
    const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

    return NextResponse.json({
      success: true,
      action: "cancelled",
      cancelAt: subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : null,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null,
    });
  } catch (error) {
    console.error("Subscription cancel error:", error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
