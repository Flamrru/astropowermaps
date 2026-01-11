import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { openai, GENERATION_SETTINGS } from "@/lib/openai";
import { getCurrentTransits, formatTransitsForPrompt } from "@/lib/astro/transits";
import { calculateFullChart, FullChart } from "@/lib/astro/chart";
import { calculateDailyScore, DailyScore, DayType } from "@/lib/astro/power-days";
import { get2026Transits } from "@/lib/astro/transit-calculations";
import type { BirthData } from "@/lib/astro/types";
import { BYPASS_AUTH, TEST_USER_ID } from "@/lib/auth-bypass";

/**
 * Weekly Forecast API
 *
 * Generates or retrieves a personalized weekly forecast.
 * Caches results for the week (Monday-based).
 *
 * POST /api/content/weekly-forecast
 */
export async function POST(request: NextRequest) {
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
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 3. Calculate week start (Monday)
    const weekStart = getWeekStart();

    // 4. Check for cached forecast this week
    const { data: cached } = await supabaseAdmin
      .from("daily_content")
      .select("content")
      .eq("user_id", userId)
      .eq("content_date", weekStart)
      .eq("content_type", "weekly_forecast")
      .single();

    if (cached?.content) {
      return NextResponse.json(cached.content);
    }

    // 5. Parse and validate birth coordinates
    const lat = typeof profile.birth_lat === 'number' ? profile.birth_lat : parseFloat(profile.birth_lat);
    const lng = typeof profile.birth_lng === 'number' ? profile.birth_lng : parseFloat(profile.birth_lng);

    // Validate coordinates (use 0,0 as fallback if invalid)
    const validLat = Number.isFinite(lat) ? lat : 0;
    const validLng = Number.isFinite(lng) ? lng : 0;

    // 6. Build birth data for calculations
    const birthData: BirthData = {
      date: profile.birth_date,
      time: profile.birth_time || "12:00",
      timeUnknown: !profile.birth_time,
      location: {
        name: profile.birth_place || "Unknown",
        lat: validLat,
        lng: validLng,
        timezone: profile.birth_timezone || "UTC",
      },
    };

    // 6. Calculate full chart and current transits
    const chart = calculateFullChart(birthData);
    const transits = getCurrentTransits();

    // 7. Calculate power days for each day of the week (consistent with calendar)
    const transitCache = get2026Transits();
    const natalPositions = chart.planetPositions;
    const weekDaysData = getWeekDaysWithISO(weekStart);

    const calculatedDays: CalculatedDayInfo[] = weekDaysData.map(({ day, isoDate, displayDate }) => {
      const dailyScore = calculateDailyScore(natalPositions, isoDate, transitCache);
      return {
        day,
        isoDate,
        displayDate,
        score: dailyScore.score,
        dayType: dailyScore.dayType,
        description: dailyScore.description,
      };
    });

    // 8. Generate forecast with OpenAI (with calculated power days context)
    const prompt = buildWeeklyForecastPrompt(profile, chart, transits, weekStart, calculatedDays);

    const completion = await openai.chat.completions.create({
      model: GENERATION_SETTINGS.weekly.model,
      reasoning_effort: GENERATION_SETTINGS.weekly.reasoning_effort,
      verbosity: GENERATION_SETTINGS.weekly.verbosity,
      max_completion_tokens: GENERATION_SETTINGS.weekly.max_completion_tokens,
      messages: [
        {
          role: "system",
          content:
            "You are Stella, a warm and insightful astrologer. Generate personalized weekly forecasts that feel authentic and actionable. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";

    let forecast;

    try {
      forecast = JSON.parse(responseText);
    } catch {
      // Fallback if JSON parsing fails - theme/summary only (powerDays come from calculation)
      forecast = {
        theme: "Renewal",
        summary: "This week brings opportunities for growth and reflection.",
        keyInsight: "Trust your intuition this week.",
      };
    }

    // Validate response has required fields - if not, use fallback
    if (!forecast.theme || !forecast.summary) {
      console.warn("OpenAI returned incomplete weekly forecast, using fallback");
      forecast = {
        theme: "Renewal",
        summary: "This week brings opportunities for growth and reflection.",
        keyInsight: "Trust your intuition this week.",
      };
    }

    // Build powerDays from calculated scores (consistent with calendar)
    const powerDays = calculatedDays
      .filter(d => d.dayType === "power")
      .map(d => ({
        day: d.day,
        date: d.displayDate,
        energy: d.description,
        score: d.score,
      }));

    // Build cautionDays (rest days) from calculated scores
    const cautionDays = calculatedDays
      .filter(d => d.dayType === "rest")
      .map(d => d.day);

    // Merge AI narrative with calculated power days
    const weeklyForecast = {
      theme: forecast.theme,
      summary: forecast.summary,
      powerDays,      // FROM CALCULATION - consistent with calendar
      cautionDays,    // FROM CALCULATION - consistent with calendar
      keyInsight: forecast.keyInsight,
      weekStart,
      generatedAt: new Date().toISOString(),
    };

    // Only cache if we have valid data
    if (weeklyForecast.theme && weeklyForecast.summary) {
      await supabaseAdmin.from("daily_content").upsert({
        user_id: userId,
        content_date: weekStart,
        content_type: "weekly_forecast",
        content: weeklyForecast,
      });
    }

    return NextResponse.json(weeklyForecast);
  } catch (error) {
    console.error("Weekly forecast error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate weekly forecast", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Get the Monday of the current week (ISO format)
 */
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}

/**
 * Get array of day names and dates for the week (with ISO dates for calculations)
 */
function getWeekDaysWithISO(weekStart: string): Array<{
  day: string;
  isoDate: string;
  displayDate: string;
}> {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const start = new Date(weekStart);

  return days.map((day, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const isoDate = date.toISOString().split("T")[0];
    const displayDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { day, isoDate, displayDate };
  });
}

/**
 * Calculated day info for power days integration
 */
interface CalculatedDayInfo {
  day: string;
  isoDate: string;
  displayDate: string;
  score: number;
  dayType: DayType;
  description: string;
}

/**
 * Build the prompt for weekly forecast generation
 * Now includes calculated power days data for AI context
 */
function buildWeeklyForecastPrompt(
  profile: { display_name?: string; birth_place?: string },
  chart: FullChart,
  transits: ReturnType<typeof getCurrentTransits>,
  weekStart: string,
  calculatedDays: CalculatedDayInfo[]
): string {
  const bigThree = chart.bigThree;

  // Format calculated days for AI context
  const daysWithScores = calculatedDays
    .map(d => {
      const marker = d.dayType === "power" ? "POWER DAY" : d.dayType === "rest" ? "REST DAY" : "";
      return `- ${d.day} (${d.displayDate}): ${d.score}/100 ${marker ? `[${marker}]` : ""} - ${d.description}`;
    })
    .join("\n");

  // Identify power days and rest days for summary
  const powerDayNames = calculatedDays.filter(d => d.dayType === "power").map(d => d.day);
  const restDayNames = calculatedDays.filter(d => d.dayType === "rest").map(d => d.day);

  return `Generate a personalized weekly forecast for ${profile.display_name || "this user"}.

User's Birth Chart:
- Sun: ${bigThree.sun.sign} ${bigThree.sun.symbol} (${bigThree.sun.element} element)
- Moon: ${bigThree.moon.sign} ${bigThree.moon.symbol} (emotional nature)
- Rising: ${bigThree.rising.sign} ${bigThree.rising.symbol} (outward expression)
- North Node: ${chart.nodes.northNode.formatted} (${chart.nodeThemes.northTheme})
${chart.houses ? `- MC (Career): ${chart.houses.cusps[9].formatted}` : ""}

${formatTransitsForPrompt(transits)}

CALCULATED ENERGY SCORES FOR THIS WEEK (based on transit aspects to natal chart):
${daysWithScores}

${powerDayNames.length > 0 ? `Power Days (score 70+): ${powerDayNames.join(", ")}` : "No power days this week (all scores below 70)"}
${restDayNames.length > 0 ? `Rest Days (score 30-): ${restDayNames.join(", ")}` : ""}

Generate a JSON response with this exact structure:
{
  "theme": "<single word or short phrase capturing the week's energy, e.g., 'Transformation', 'New Beginnings', 'Inner Work'>",
  "summary": "<2-3 paragraphs of personalized forecast. Reference the specific power days and rest days listed above. Explain what makes those days special based on the transit descriptions.>",
  "keyInsight": "<one memorable sentence they'll remember all week>"
}

IMPORTANT: Do NOT include "powerDays" or "cautionDays" in your response - they will be added automatically from the calculated scores above.

Guidelines:
- Reference the SPECIFIC days marked as POWER DAYS in your summary
- If there are REST DAYS, mention them as days to take it easy
- Reference their ${bigThree.sun.sign} Sun energy when discussing actions
- Reference their ${bigThree.moon.sign} Moon when discussing emotions or intuition
- Reference their North Node theme when discussing growth opportunities
- Make the summary feel like a personal letter from their astrologer
- The keyInsight should be quotable and specific to their chart`;
}
