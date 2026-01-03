import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { CalendarEvent, CalendarEventType } from "@/lib/dashboard-types";

/**
 * Calendar API
 *
 * Generates calendar events for a given month including:
 * - Power days (from weekly forecasts)
 * - Moon phases (calculated)
 * - Rest days
 *
 * GET /api/content/calendar?month=2026-01
 */

// Moon phase calculation (simplified Meeus algorithm)
function getMoonPhase(date: Date): { phase: string; illumination: number } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Calculate Julian Date
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

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

// Get all days in a month
function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse month parameter (default to current month)
    const searchParams = request.nextUrl.searchParams;
    const monthParam = searchParams.get("month");

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

    // 5. Get power days from weekly forecasts for this month
    const monthStart = new Date(year, month, 1).toISOString().split("T")[0];
    const monthEnd = new Date(year, month + 1, 0).toISOString().split("T")[0];

    const { data: forecasts } = await supabaseAdmin
      .from("daily_content")
      .select("content")
      .eq("user_id", user.id)
      .eq("content_type", "weekly_forecast")
      .gte("content_date", monthStart)
      .lte("content_date", monthEnd);

    // Extract power days from forecasts
    if (forecasts) {
      for (const forecast of forecasts) {
        const content = forecast.content as {
          powerDays?: Array<{ day: string; date: string; energy: string; score: number }>;
          weekStart?: string;
        };

        if (content.powerDays && content.weekStart) {
          for (const powerDay of content.powerDays) {
            // Convert day name + week start to actual date
            const weekStart = new Date(content.weekStart);
            const dayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].indexOf(powerDay.day);

            if (dayIndex >= 0) {
              const powerDate = new Date(weekStart);
              powerDate.setDate(weekStart.getDate() + dayIndex);
              const powerDateStr = powerDate.toISOString().split("T")[0];

              // Only add if in the requested month
              if (powerDateStr >= monthStart && powerDateStr <= monthEnd) {
                events.push({
                  type: "power_day" as CalendarEventType,
                  date: powerDateStr,
                  title: `Power Day (${powerDay.score}/100)`,
                  description: powerDay.energy,
                });
              }
            }
          }
        }
      }
    }

    // 6. Add some rest days (days with challenging transits - simplified)
    // For now, just mark days that aren't power days and have waning moon
    for (const day of days) {
      const dateStr = day.toISOString().split("T")[0];
      const moonData = getMoonPhase(day);
      const hasPowerDay = events.some((e) => e.date === dateStr && e.type === "power_day");

      // Mark as rest day if it's a last quarter moon and not a power day
      if (moonData.phase === "last_quarter" && !hasPowerDay) {
        events.push({
          type: "rest_day" as CalendarEventType,
          date: dateStr,
          title: "Rest Day",
          description: "Take it easy - the moon suggests reflection over action",
        });
      }
    }

    // 7. Sort events by date
    events.sort((a, b) => a.date.localeCompare(b.date));

    // 8. Format response
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
    });
  } catch (error) {
    console.error("Calendar API error:", error);
    return NextResponse.json(
      { error: "Failed to generate calendar" },
      { status: 500 }
    );
  }
}
