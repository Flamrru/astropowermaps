import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { birthDataToJulianDay, calculatePlanetPosition } from "@/lib/astro/calculations";
import { calculateLifetimeTransits } from "@/lib/astro/lifetime-transits";
import { PLANET_ORDER } from "@/lib/astro/planets";
import type { BirthData, PlanetPosition } from "@/lib/astro/types";
import { BYPASS_AUTH, TEST_USER_ID } from "@/lib/auth-bypass";

/**
 * Life Transits API
 *
 * Calculates lifetime special transits for the authenticated user:
 * - Saturn Returns (~age 29, 58, 87)
 * - Jupiter Returns (~every 12 years)
 * - Chiron Return (~age 50)
 * - Outer planet transits to Sun/Moon (Pluto, Neptune, Uranus)
 *
 * GET /api/content/life-transits
 */
export async function GET(_request: NextRequest) {
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

    // 2. Get user profile with birth data
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("birth_date, birth_time, birth_place, birth_lat, birth_lng, birth_timezone")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json(
        { error: "Profile not found. Please complete setup." },
        { status: 404 }
      );
    }

    // 3. Check for cached life transits (keyed by birth date - never changes)
    const cacheKey = profile.birth_date;

    const { data: cached } = await supabaseAdmin
      .from("daily_content")
      .select("content")
      .eq("user_id", userId)
      .eq("content_date", cacheKey)
      .eq("content_type", "life_transits")
      .single();

    if (cached?.content) {
      // Return cached data
      return NextResponse.json(cached.content);
    }

    // 4. No cache found - build birth data object
    const birthData: BirthData = {
      date: profile.birth_date,
      time: profile.birth_time || "12:00", // Default to noon if unknown
      timeUnknown: !profile.birth_time,
      location: {
        name: profile.birth_place,
        lat: parseFloat(profile.birth_lat),
        lng: parseFloat(profile.birth_lng),
        timezone: profile.birth_timezone,
      },
    };

    // 5. Calculate natal positions
    const jd = birthDataToJulianDay(birthData);
    const natalPositions: PlanetPosition[] = PLANET_ORDER.map((planetId) =>
      calculatePlanetPosition(planetId, jd)
    );

    // 6. Calculate lifetime transits
    const report = calculateLifetimeTransits(birthData, natalPositions, {
      lifeSpanYears: 90,
      includeChiron: true,
    });

    // 7. Cache the result (keyed by birth date - never changes)
    await supabaseAdmin.from("daily_content").upsert({
      user_id: userId,
      content_date: cacheKey,
      content_type: "life_transits",
      content: report,
    });

    // 8. Return the report
    return NextResponse.json(report);
  } catch (error) {
    console.error("Life transits API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate life transits" },
      { status: 500 }
    );
  }
}
