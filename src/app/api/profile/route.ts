import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { BYPASS_AUTH, TEST_USER_ID } from "@/lib/auth-bypass";

interface ProfileUpdatePayload {
  displayName?: string;
  birthTime?: string;
  birthPlace?: string;
  birthLat?: number;
  birthLng?: number;
  birthTimezone?: string;
  preferences?: {
    theme?: "dark" | "light";
    units?: "km" | "miles";
  };
}

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

/**
 * PATCH /api/profile - Update current user's profile
 *
 * Allowed updates:
 * - displayName: User's display name
 * - birthTime: ONLY if birth_time_unknown is true
 * - preferences: Theme, units, etc.
 */
export async function PATCH(request: NextRequest) {
  try {
    const body: ProfileUpdatePayload = await request.json();

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

    // 2. Get current profile to check constraints
    const { data: currentProfile, error: fetchError } = await supabaseAdmin
      .from("user_profiles")
      .select("birth_time_unknown, preferences, birth_time_last_updated, birth_location_last_updated")
      .eq("user_id", userId)
      .single();

    if (fetchError || !currentProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 3. Build update object
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Display name
    if (body.displayName !== undefined) {
      updates.display_name = body.displayName.trim() || null;
    }

    // Check rate limit for birth TIME (once per month)
    if (body.birthTime !== undefined && currentProfile.birth_time_last_updated) {
      const lastUpdate = new Date(currentProfile.birth_time_last_updated);
      const now = new Date();
      const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceUpdate < 30) {
        const nextDate = new Date(lastUpdate);
        nextDate.setDate(nextDate.getDate() + 30);
        return NextResponse.json({
          error: "rate_limit",
          message: "You can only update your birth time once per month",
          nextUpdateDate: nextDate.toISOString()
        }, { status: 429 });
      }
    }

    // Check rate limit for birth LOCATION (once per month)
    if (body.birthPlace !== undefined && currentProfile.birth_location_last_updated) {
      const lastUpdate = new Date(currentProfile.birth_location_last_updated);
      const now = new Date();
      const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceUpdate < 30) {
        const nextDate = new Date(lastUpdate);
        nextDate.setDate(nextDate.getDate() + 30);
        return NextResponse.json({
          error: "rate_limit",
          message: "You can only update your birth location once per month",
          nextUpdateDate: nextDate.toISOString()
        }, { status: 429 });
      }
    }

    // Birth time update
    if (body.birthTime !== undefined) {
      // Validate time format (HH:MM)
      if (!/^\d{2}:\d{2}$/.test(body.birthTime)) {
        return NextResponse.json(
          { error: "Invalid time format. Use HH:MM" },
          { status: 400 }
        );
      }
      updates.birth_time = body.birthTime;
      updates.birth_time_unknown = false;
      updates.birth_time_last_updated = new Date().toISOString();
    }

    // Birth location update
    if (body.birthPlace !== undefined) {
      updates.birth_place = body.birthPlace;
      updates.birth_lat = body.birthLat;
      updates.birth_lng = body.birthLng;
      updates.birth_timezone = body.birthTimezone;
      updates.birth_location_last_updated = new Date().toISOString();
    }

    // Preferences - merge with existing
    if (body.preferences) {
      const existingPrefs = currentProfile.preferences || {};
      updates.preferences = {
        ...existingPrefs,
        ...body.preferences,
      };
    }

    // 4. Update profile
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from("user_profiles")
      .update(updates)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    // 5. Transform to camelCase for frontend
    const transformedProfile = {
      id: updatedProfile.id,
      userId: updatedProfile.user_id,
      displayName: updatedProfile.display_name,
      accountStatus: updatedProfile.account_status,
      birthDate: updatedProfile.birth_date,
      birthTime: updatedProfile.birth_time,
      birthTimeUnknown: updatedProfile.birth_time_unknown,
      birthPlace: updatedProfile.birth_place,
      birthLat: updatedProfile.birth_lat,
      birthLng: updatedProfile.birth_lng,
      birthTimezone: updatedProfile.birth_timezone,
      subscriptionStatus: updatedProfile.subscription_status,
      stripeCustomerId: updatedProfile.stripe_customer_id,
      preferences: updatedProfile.preferences,
      createdAt: updatedProfile.created_at,
      updatedAt: updatedProfile.updated_at,
    };

    return NextResponse.json({ profile: transformedProfile });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
