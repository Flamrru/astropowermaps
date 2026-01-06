import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { openai, GENERATION_SETTINGS } from "@/lib/openai";
import { getCurrentTransits, formatTransitsForPrompt } from "@/lib/astro/transits";
import { calculateFullChart, formatChartForPrompt, FullChart } from "@/lib/astro/chart";
import { ASPECT_SYMBOLS, ASPECTS, AspectType } from "@/lib/astro/transit-types";
import type { BirthData } from "@/lib/astro/types";
import { BYPASS_AUTH, TEST_USER_ID } from "@/lib/auth-bypass";

/**
 * Daily Power Score API
 *
 * Generates or retrieves a personalized daily power score.
 * Caches results in daily_content table (one per user per day).
 *
 * POST /api/content/daily-score
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
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
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
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // 3. Check for cached score today
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const { data: cached } = await supabaseAdmin
      .from("daily_content")
      .select("content")
      .eq("user_id", userId)
      .eq("content_date", today)
      .eq("content_type", "daily_score")
      .single();

    if (cached?.content) {
      // Return cached score
      return NextResponse.json(cached.content);
    }

    // 4. Parse and validate birth coordinates
    const lat = typeof profile.birth_lat === 'number' ? profile.birth_lat : parseFloat(profile.birth_lat);
    const lng = typeof profile.birth_lng === 'number' ? profile.birth_lng : parseFloat(profile.birth_lng);

    // Validate coordinates (use 0,0 as fallback if invalid)
    const validLat = Number.isFinite(lat) ? lat : 0;
    const validLng = Number.isFinite(lng) ? lng : 0;

    // 5. Build birth data for calculations
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

    // 5. Calculate full chart and current transits
    const chart = calculateFullChart(birthData);
    const transits = getCurrentTransits();

    // 6. Calculate transit aspects to natal chart
    const transitAspects = calculateTransitAspects(chart, transits);

    // 7. Generate score with OpenAI
    const prompt = buildDailyScorePrompt(profile, chart, transits, transitAspects);

    const completion = await openai.chat.completions.create({
      model: GENERATION_SETTINGS.daily.model,
      reasoning_effort: GENERATION_SETTINGS.daily.reasoning_effort,
      verbosity: GENERATION_SETTINGS.daily.verbosity,
      max_completion_tokens: GENERATION_SETTINGS.daily.max_completion_tokens,
      messages: [
        {
          role: "system",
          content:
            "You are Stella, a warm and insightful astrologer. Generate personalized daily guidance based on the user's birth chart and current planetary transits. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    console.log("OpenAI daily-score response:", responseText.substring(0, 200));

    let score;

    try {
      score = JSON.parse(responseText);
    } catch {
      // Fallback if JSON parsing fails
      score = {
        score: 75,
        message: "The stars align to support your intentions today.",
        focusAreas: ["mindfulness", "creativity"],
      };
    }

    // Validate response has required fields - if not, use fallback
    if (!score.score || !score.message) {
      console.warn("OpenAI returned incomplete response, using fallback");
      score = {
        score: 75,
        message: "The stars align to support your intentions today.",
        focusAreas: ["mindfulness", "creativity"],
      };
    }

    // Add metadata
    const dailyScore = {
      ...score,
      date: today,
      generatedAt: new Date().toISOString(),
    };

    // Only cache if we have valid data
    if (dailyScore.score && dailyScore.message) {
      await supabaseAdmin.from("daily_content").upsert({
        user_id: userId,
        content_date: today,
        content_type: "daily_score",
        content: dailyScore,
      });
    }

    return NextResponse.json(dailyScore);
  } catch (error) {
    console.error("Daily score error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate daily score", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Transit aspect info
 */
interface TransitAspectInfo {
  transit: string;
  natal: string;
  type: AspectType;
  orb: number;
  nature: string;
}

/**
 * Calculate transit aspects to natal chart
 */
function calculateTransitAspects(
  chart: FullChart,
  transits: ReturnType<typeof getCurrentTransits>
): TransitAspectInfo[] {
  const aspects: TransitAspectInfo[] = [];

  // Transit planets to check
  const transitPlanets = [
    { id: "sun", lon: getTransitLongitude(transits.sun.degree, transits.sun.sign) },
    { id: "moon", lon: getTransitLongitude(transits.moon.degree, transits.moon.sign) },
    { id: "mercury", lon: getTransitLongitude(transits.mercury.degree, transits.mercury.sign) },
    { id: "venus", lon: getTransitLongitude(transits.venus.degree, transits.venus.sign) },
    { id: "mars", lon: getTransitLongitude(transits.mars.degree, transits.mars.sign) },
  ];

  // Check each transit against natal positions
  for (const transit of transitPlanets) {
    for (const natal of chart.planetPositions) {
      const aspect = detectTransitAspect(transit.lon, natal.longitude);
      if (aspect) {
        aspects.push({
          transit: transit.id,
          natal: natal.id,
          type: aspect.type,
          orb: aspect.orb,
          nature: ASPECTS[aspect.type].nature,
        });
      }
    }
  }

  // Sort by orb (tightest first)
  aspects.sort((a, b) => a.orb - b.orb);

  return aspects.slice(0, 6); // Return top 6 aspects
}

/**
 * Get longitude from degree and sign
 */
function getTransitLongitude(degree: number, sign: string): number {
  const signOrder = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                     "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const signIndex = signOrder.indexOf(sign);
  return signIndex * 30 + degree;
}

/**
 * Detect aspect between transit and natal longitude
 */
function detectTransitAspect(
  transitLon: number,
  natalLon: number
): { type: AspectType; orb: number } | null {
  let diff = Math.abs(transitLon - natalLon);
  if (diff > 180) diff = 360 - diff;

  for (const [aspectType, config] of Object.entries(ASPECTS)) {
    const orb = Math.abs(diff - config.degrees);
    if (orb <= config.orb) {
      return { type: aspectType as AspectType, orb };
    }
  }
  return null;
}

/**
 * Build the prompt for GPT to generate a daily score
 */
function buildDailyScorePrompt(
  profile: { display_name?: string; birth_place?: string },
  chart: FullChart,
  transits: ReturnType<typeof getCurrentTransits>,
  transitAspects: TransitAspectInfo[]
): string {
  const name = profile.display_name || "this user";
  const bigThree = chart.bigThree;

  // Format transit aspects for prompt
  const aspectsText = transitAspects.length > 0
    ? transitAspects.map(a => {
        const symbol = ASPECT_SYMBOLS[a.type];
        return `- Transit ${a.transit} ${symbol} natal ${a.natal} (${a.orb.toFixed(1)}° orb, ${a.nature})`;
      }).join("\n")
    : "No major transit aspects today";

  // Identify challenging vs supportive aspects
  const challengingAspects = transitAspects.filter(a =>
    a.nature === "challenging" || a.nature === "minor-challenging"
  );
  const supportiveAspects = transitAspects.filter(a =>
    a.nature === "harmonious" || a.nature === "minor-harmonious"
  );

  return `Generate a personalized daily power score for ${name}.

NATAL CHART:
- Sun: ${bigThree.sun.sign} ${bigThree.sun.symbol} at ${Math.round(bigThree.sun.degree)}°
- Moon: ${bigThree.moon.sign} ${bigThree.moon.symbol} at ${Math.round(bigThree.moon.degree)}°
- Rising: ${bigThree.rising.sign} ${bigThree.rising.symbol}
- North Node: ${chart.nodes.northNode.formatted} (${chart.nodeThemes.northTheme})
${chart.houses ? `- MC (Career): ${chart.houses.cusps[9].formatted}` : ""}

${formatTransitsForPrompt(transits)}

TODAY'S TRANSIT ASPECTS TO NATAL CHART:
${aspectsText}

${challengingAspects.length > 0 ? `⚠️ Challenging aspects: ${challengingAspects.length}` : ""}
${supportiveAspects.length > 0 ? `✨ Supportive aspects: ${supportiveAspects.length}` : ""}

Generate a JSON response with this exact structure:
{
  "score": <number 0-100 based on aspect balance: more supportive = higher, more challenging = lower>,
  "message": "<2-3 sentences of personalized guidance. Reference specific transit aspects when relevant. For a ${bigThree.sun.sign} Sun with ${bigThree.moon.sign} Moon...>",
  "avoid": "<1 sentence warning if challenging aspects present, or null if none>",
  "focusAreas": ["<area1>", "<area2>"] // 2-3 focus areas based on which natal planets are activated
}

Scoring guidance:
- 80-100: Multiple trines/sextiles to personal planets, no challenging aspects
- 60-79: Mixed aspects, more supportive than challenging
- 40-59: Balanced or slightly challenging
- 20-39: Multiple squares/oppositions to personal planets
- 0-19: Very challenging day (rare)

Make the message feel personal by referencing the specific transit aspects activating their chart.`;
}
