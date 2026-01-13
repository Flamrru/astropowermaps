import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { CalendarEvent, CalendarEventType, GoalCategory, BestDay } from "@/lib/dashboard-types";
import { calculateMonthPowerDays, getBestDaysForGoal } from "@/lib/astro/power-days";
import { birthDataToJulianDay, calculatePlanetPosition } from "@/lib/astro/calculations";
import { PLANET_ORDER } from "@/lib/astro/planets";
import type { BirthData, PlanetPosition } from "@/lib/astro/types";
import { BYPASS_AUTH, TEST_USER_ID } from "@/lib/auth-bypass";

/** Valid goal categories for the best day picker */
const VALID_GOALS: GoalCategory[] = ["love", "career", "creativity", "clarity", "adventure"];

/**
 * Calendar API
 *
 * Generates calendar events for a given month including:
 * - Power days (calculated from transit aspects to natal chart)
 * - Moon phases (calculated)
 * - Rest days
 *
 * GET /api/content/calendar?month=2026-01
 */

// Moon phase calculation (simplified Meeus algorithm)
// Uses noon UTC for consistency with transit calculations
function getMoonPhase(date: Date): { phase: string; illumination: number } {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  // Calculate Julian Date at noon UTC (add 0.5 for noon)
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jd = day + 0.5 + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Calculate moon phase (0-29.5 day cycle)
  const daysSinceNew = (jd - 2451550.1) % 29.530588853;
  const phase = daysSinceNew / 29.530588853;

  // Calculate illumination percentage
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;

  // Determine phase name
  let phaseName: string;
  if (phase < 0.03 || phase > 0.97) phaseName = "new_moon";
  else if (phase < 0.22) phaseName = "waxing_crescent";
  else if (phase < 0.28) phaseName = "first_quarter";
  else if (phase < 0.47) phaseName = "waxing_gibbous";
  else if (phase < 0.53) phaseName = "full_moon";
  else if (phase < 0.72) phaseName = "waning_gibbous";
  else if (phase < 0.78) phaseName = "last_quarter";
  else phaseName = "waning_crescent";

  return { phase: phaseName, illumination: Math.round(illumination * 100) };
}

// Get all days in a month (using UTC to avoid timezone issues)
function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(Date.UTC(year, month, 1));
  while (date.getUTCMonth() === month) {
    days.push(new Date(date));
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return days;
}

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

    // 2. Parse month parameter (default to current month)
    const searchParams = request.nextUrl.searchParams;
    const monthParam = searchParams.get("month");
    const goalParam = searchParams.get("goal") as GoalCategory | null;

    // Validate goal parameter if provided
    const validGoal = goalParam && VALID_GOALS.includes(goalParam) ? goalParam : null;

    let year: number;
    let month: number;

    if (monthParam) {
      const [y, m] = monthParam.split("-").map(Number);
      year = y;
      month = m - 1; // JavaScript months are 0-indexed
    } else {
      const now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
    }

    // 3. Get all days in the month
    const days = getDaysInMonth(year, month);
    const events: CalendarEvent[] = [];

    // 4. Calculate moon phases and add significant ones
    for (const day of days) {
      const moonData = getMoonPhase(day);
      const dateStr = day.toISOString().split("T")[0];

      // Only add new moon and full moon as events
      if (moonData.phase === "new_moon") {
        events.push({
          type: "new_moon" as CalendarEventType,
          date: dateStr,
          title: "New Moon",
          description: "Perfect for setting intentions and new beginnings",
        });
      } else if (moonData.phase === "full_moon") {
        events.push({
          type: "full_moon" as CalendarEventType,
          date: dateStr,
          title: "Full Moon",
          description: "Time for release, celebration, and manifestation",
        });
      }
    }

    // 5. Get user profile with birth data for power day calculation
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("birth_date, birth_time, birth_place, birth_lat, birth_lng, birth_timezone")
      .eq("user_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Parse and validate birth coordinates
    const lat = typeof profile.birth_lat === 'number' ? profile.birth_lat : parseFloat(profile.birth_lat);
    const lng = typeof profile.birth_lng === 'number' ? profile.birth_lng : parseFloat(profile.birth_lng);

    // Validate coordinates (use 0,0 as fallback if invalid)
    const validLat = Number.isFinite(lat) ? lat : 0;
    const validLng = Number.isFinite(lng) ? lng : 0;

    // Convert profile to BirthData format
    const birthData: BirthData = {
      date: profile.birth_date,
      time: profile.birth_time || "12:00", // Default to noon if unknown
      timeUnknown: !profile.birth_time,
      location: {
        name: profile.birth_place || "Unknown",
        lat: validLat,
        lng: validLng,
        timezone: profile.birth_timezone || "UTC",
      },
    };

    // Calculate natal positions
    const jd = birthDataToJulianDay(birthData);
    const natalPositions: PlanetPosition[] = PLANET_ORDER.map((planetId) =>
      calculatePlanetPosition(planetId, jd)
    );

    // Calculate power days using real transit aspects
    const dailyScores = calculateMonthPowerDays(natalPositions, year, month + 1);

    // Add power days and rest days to events
    for (const dayScore of dailyScores) {
      if (dayScore.dayType === "power") {
        events.push({
          type: "power_day" as CalendarEventType,
          date: dayScore.date,
          title: `Power Day (${dayScore.score}/100)`,
          description: dayScore.description,
        });
      } else if (dayScore.dayType === "rest") {
        events.push({
          type: "rest_day" as CalendarEventType,
          date: dayScore.date,
          title: "Rest Day",
          description: dayScore.description,
        });
      }
    }

    // 7. Sort events by date
    events.sort((a, b) => a.date.localeCompare(b.date));

    // 8. Calculate best days for goal if specified
    let bestDaysForGoal: BestDay[] = [];
    if (validGoal) {
      bestDaysForGoal = getBestDaysForGoal(natalPositions, year, month + 1, validGoal, 5);
    }

    // 9. Format response
    const monthName = new Date(year, month).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    return NextResponse.json({
      month: monthName,
      monthKey: `${year}-${String(month + 1).padStart(2, "0")}`,
      events,
      daysInMonth: days.length,
      firstDayOfWeek: new Date(year, month, 1).getDay(), // 0 = Sunday
      // Best day picker data
      selectedGoal: validGoal,
      bestDaysForGoal,
    });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "Failed to generate calendar" },
      { status: 500 }
    );
  }
}
