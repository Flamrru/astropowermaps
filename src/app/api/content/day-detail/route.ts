import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { EnhancedDayData, DayRitual } from "@/lib/dashboard-types";
import { calculateEnhancedDayData } from "@/lib/astro/day-transits";
import { birthDataToJulianDay, calculatePlanetPosition } from "@/lib/astro/calculations";
import { PLANET_ORDER } from "@/lib/astro/planets";
import type { BirthData, PlanetPosition } from "@/lib/astro/types";
import { BYPASS_AUTH, TEST_USER_ID } from "@/lib/auth-bypass";

/**
 * Day Detail API
 *
 * Returns enhanced data for a specific day including:
 * - Power score and label
 * - Moon phase and sign
 * - Transit aspects with interpretations
 * - Best for / avoid activities
 * - Ritual and journal prompt (if generated)
 *
 * GET /api/content/day-detail?date=2026-01-15
 */

export async function GET(request: NextRequest) {
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

    // 2. Parse date parameter (required)
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Date parameter required (format: YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // 3. Get user profile with birth data
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("birth_date, birth_time, birth_place, birth_lat, birth_lng, birth_timezone")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 4. Convert profile to BirthData format
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

    // 6. Calculate enhanced day data
    const dayData = calculateEnhancedDayData(dateParam, natalPositions);

    // 7. Try to fetch pre-generated ritual from database (if exists)
    const { data: ritualData } = await supabaseAdmin
      .from("daily_rituals")
      .select("ritual, journal_prompt")
      .eq("user_id", userId)
      .eq("date", dateParam)
      .single();

    // 8. Add ritual and journal prompt if available
    let enhancedData: EnhancedDayData = dayData;

    if (ritualData) {
      enhancedData = {
        ...dayData,
        ritual: ritualData.ritual as DayRitual,
        journalPrompt: ritualData.journal_prompt,
      };
    }

    // 9. Return the enhanced day data
    return NextResponse.json({
      success: true,
      data: enhancedData,
    });
  } catch (error) {
    console.error("Day detail API error:", error);
    return NextResponse.json(
      { error: "Failed to generate day detail" },
      { status: 500 }
    );
  }
}
