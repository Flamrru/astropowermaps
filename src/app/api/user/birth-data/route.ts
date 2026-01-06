import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { calculateBigThree } from "@/lib/astro/zodiac";
import type { BirthData } from "@/lib/astro/types";
import { BYPASS_AUTH, TEST_USER_ID } from "@/lib/auth-bypass";

/**
 * User Birth Data API
 *
 * Returns the user's birth data and calculated Big Three (Sun, Moon, Rising).
 * This is used by client-side components that need astronomical calculations
 * which must run on the server (astronomia library).
 *
 * GET /api/user/birth-data
 */
export async function GET() {
  try {
    // 1. Get user ID
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

    // 2. Get user profile with birth data
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("birth_date, birth_time, birth_time_unknown, birth_place, birth_lat, birth_lng, birth_timezone")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 3. Check if birth data is complete
    if (!profile.birth_date || !profile.birth_lat || !profile.birth_lng) {
      return NextResponse.json({
        success: true,
        birthData: null,
        bigThree: null,
        message: "Birth data incomplete",
      });
    }

    // 4. Convert to BirthData format
    const birthData: BirthData = {
      date: profile.birth_date,
      time: profile.birth_time || "12:00",
      timeUnknown: profile.birth_time_unknown || !profile.birth_time,
      location: {
        name: profile.birth_place || "Unknown",
        lat: parseFloat(profile.birth_lat),
        lng: parseFloat(profile.birth_lng),
        timezone: profile.birth_timezone || "UTC",
      },
    };

    // 5. Calculate Big Three (runs on server where astronomia works)
    const bigThree = calculateBigThree(birthData);

    return NextResponse.json({
      success: true,
      birthData,
      bigThree,
    });
  } catch (error) {
    console.error("Birth data API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch birth data" },
      { status: 500 }
    );
  }
}
