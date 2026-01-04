import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  birthDataToJulianDay,
  calculatePlanetPosition,
  calculateAstrocartography,
} from "@/lib/astro/calculations";
import { calculatePowerMonths, calculatePowerMonthsWithConfidence } from "@/lib/astro/power-months";
import { PLANET_ORDER } from "@/lib/astro/planets";
import type { BirthData, PlanetPosition, PlanetaryLine } from "@/lib/astro/types";
import type { YearForecast } from "@/lib/astro/transit-types";
import { BYPASS_AUTH, TEST_USER_ID } from "@/lib/auth-bypass";

/**
 * Year Forecast API
 *
 * Returns the 2026 power months forecast and astrocartography lines
 * for the authenticated user. Used by the Calendar's "2026" tab.
 *
 * GET /api/content/year-forecast
 *
 * Returns:
 * - forecast: YearForecast (power score, best months, etc.)
 * - lines: PlanetaryLine[] (for power city calculations)
 */

interface YearForecastResponse {
  success: boolean;
  forecast?: YearForecast;
  lines?: PlanetaryLine[];
  error?: string;
}

export async function GET(_request: NextRequest): Promise<NextResponse<YearForecastResponse>> {
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
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
      userId = user.id;
    }

    // 2. Check for cached year forecast
    const currentYear = new Date().getFullYear();
    const cacheKey = `${currentYear}-01-01`;

    const { data: cached } = await supabaseAdmin
      .from("daily_content")
      .select("content")
      .eq("user_id", userId)
      .eq("content_date", cacheKey)
      .eq("content_type", "year_forecast")
      .single();

    if (cached?.content) {
      // Return cached data
      return NextResponse.json(cached.content as YearForecastResponse);
    }

    // 3. Get user profile with birth data
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("birth_date, birth_time, birth_place, birth_lat, birth_lng, birth_timezone")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json(
        { success: false, error: "Profile not found. Please complete setup." },
        { status: 404 }
      );
    }

    // 3. Build birth data object
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

    // 4. Calculate natal positions
    const jd = birthDataToJulianDay(birthData);
    const natalPositions: PlanetPosition[] = PLANET_ORDER.map((planetId) =>
      calculatePlanetPosition(planetId, jd)
    );

    // 5. Calculate power months forecast
    let forecast: YearForecast;

    if (birthData.timeUnknown) {
      // Use confidence-based calculation with default "unknown" window
      forecast = calculatePowerMonthsWithConfidence(
        birthData,
        birthData.timeWindow || "unknown"
      );
    } else {
      forecast = calculatePowerMonths(natalPositions);
    }

    // 6. Calculate astrocartography lines (for power cities)
    const astroResult = calculateAstrocartography(birthData);
    const lines = astroResult.lines;

    // 7. Build response
    const response: YearForecastResponse = {
      success: true,
      forecast,
      lines,
    };

    // 8. Cache the result for the year
    await supabaseAdmin.from("daily_content").upsert({
      user_id: userId,
      content_date: cacheKey,
      content_type: "year_forecast",
      content: response,
    });

    // 9. Return response
    return NextResponse.json(response);
  } catch (error) {
    console.error("Year forecast API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate year forecast" },
      { status: 500 }
    );
  }
}
