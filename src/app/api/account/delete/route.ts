import { NextResponse } from "next/server";
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

/**
 * Delete Account API
 *
 * DELETE /api/account/delete - Permanently delete user account
 *
 * This will:
 * 1. Cancel any active subscription immediately
 * 2. Delete the Supabase auth user
 * 3. Delete the user_profiles record
 * 4. Anonymize lead data (keep for analytics, remove PII)
 */
export async function DELETE() {
  try {
    // 1. Get user ID and email
    let userId: string;
    let userEmail: string | undefined;

    if (BYPASS_AUTH) {
      // In dev mode, don't actually delete
      return NextResponse.json(
        { error: "Account deletion disabled in dev mode" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = user.id;
    userEmail = user.email;

    // 2. Get user's profile to check subscription
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("stripe_customer_id, subscription_id, subscription_status")
      .eq("user_id", userId)
      .single();

    // 3. Cancel subscription immediately if active
    if (profile?.subscription_id && profile.subscription_status !== "cancelled") {
      try {
        const stripe = getStripe();
        await stripe.subscriptions.cancel(profile.subscription_id);
        console.log(`Cancelled subscription ${profile.subscription_id} for account deletion`);
      } catch (stripeError) {
        console.error("Failed to cancel subscription during deletion:", stripeError);
        // Continue with deletion anyway
      }
    }

    // 4. Delete user_profiles record
    const { error: profileDeleteError } = await supabaseAdmin
      .from("user_profiles")
      .delete()
      .eq("user_id", userId);

    if (profileDeleteError) {
      console.error("Failed to delete profile:", profileDeleteError);
    }

    // 5. Anonymize astro_leads (keep data for analytics, remove PII)
    if (userEmail) {
      await supabaseAdmin
        .from("astro_leads")
        .update({
          email: `deleted_${Date.now()}@anonymized.local`,
          // Keep other fields for analytics
        })
        .eq("email", userEmail);
    }

    // 6. Delete auth user
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (authDeleteError) {
      console.error("Failed to delete auth user:", authDeleteError);
      return NextResponse.json(
        { error: "Failed to delete account. Please contact support." },
        { status: 500 }
      );
    }

    console.log(`Account deleted: ${userId}`);

    return NextResponse.json({
      success: true,
      message: "Your account has been permanently deleted.",
    });
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
