import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { BYPASS_AUTH, TEST_USER_ID } from "@/lib/auth-bypass";

/**
 * Profile API
 *
 * GET /api/profile - Fetch current user's profile
 */
export async function GET() {
  try {
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

    // 2. Fetch profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 3. Transform to camelCase for frontend
    const transformedProfile = {
      id: profile.id,
      userId: profile.user_id,
      displayName: profile.display_name,
      accountStatus: profile.account_status,
      birthDate: profile.birth_date,
      birthTime: profile.birth_time,
      birthTimeUnknown: profile.birth_time_unknown,
      birthPlace: profile.birth_place,
      birthLat: profile.birth_lat,
      birthLng: profile.birth_lng,
      birthTimezone: profile.birth_timezone,
      subscriptionStatus: profile.subscription_status,
      stripeCustomerId: profile.stripe_customer_id,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

    return NextResponse.json({ profile: transformedProfile });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
