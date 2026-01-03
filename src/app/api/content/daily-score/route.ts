import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { openai, GENERATION_SETTINGS } from "@/lib/openai";
import { getCurrentTransits, formatTransitsForPrompt } from "@/lib/astro/transits";
import { calculateBigThree } from "@/lib/astro/zodiac";
import type { BirthData } from "@/lib/astro/types";

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
    // 1. Get authenticated user
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

    // 2. Get user profile with birth data
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
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
      .eq("user_id", user.id)
      .eq("content_date", today)
      .eq("content_type", "daily_score")
      .single();

    if (cached?.content) {
      // Return cached score
      return NextResponse.json(cached.content);
    }

    // 4. Build birth data for calculations
    const birthData: BirthData = {
      date: profile.birth_date,
      time: profile.birth_time || "12:00", // Default to noon if unknown
      timeUnknown: !profile.birth_time,
      location: {
        name: profile.birth_place || "Unknown",
        lat: profile.birth_lat || 0,
        lng: profile.birth_lng || 0,
        timezone: profile.birth_timezone || "UTC",
      },
    };

    // 5. Calculate Big Three and current transits
    const bigThree = calculateBigThree(birthData);
    const transits = getCurrentTransits();

    // 6. Generate score with OpenAI
    const prompt = buildDailyScorePrompt(profile, bigThree, transits);

    const completion = await openai.chat.completions.create({
      model: GENERATION_SETTINGS.daily.model,
      temperature: GENERATION_SETTINGS.daily.temperature,
      max_tokens: GENERATION_SETTINGS.daily.max_tokens,
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

    // Add metadata
    const dailyScore = {
      ...score,
      date: today,
      generatedAt: new Date().toISOString(),
    };

    // 7. Cache the result
    await supabaseAdmin.from("daily_content").upsert({
      user_id: user.id,
      content_date: today,
      content_type: "daily_score",
      content: dailyScore,
    });

    return NextResponse.json(dailyScore);
  } catch (error) {
    console.error("Daily score error:", error);
    return NextResponse.json(
      { error: "Failed to generate daily score" },
      { status: 500 }
    );
  }
}

/**
 * Build the prompt for GPT to generate a daily score
 */
function buildDailyScorePrompt(
  profile: { display_name?: string; birth_place?: string },
  bigThree: ReturnType<typeof calculateBigThree>,
  transits: ReturnType<typeof getCurrentTransits>
): string {
  return `Generate a personalized daily power score for ${profile.display_name || "this user"}.

User's Birth Chart:
- Sun: ${bigThree.sun.sign} at ${Math.round(bigThree.sun.degree)}°
- Moon: ${bigThree.moon.sign} at ${Math.round(bigThree.moon.degree)}°
- Rising: ${bigThree.rising.sign}
- Birth Location: ${profile.birth_place || "Unknown"}

${formatTransitsForPrompt(transits)}

Generate a JSON response with this exact structure:
{
  "score": <number 0-100 representing today's cosmic alignment for this user>,
  "message": "<2-3 sentences of personalized guidance referencing their ${bigThree.sun.sign} Sun, ${bigThree.moon.sign} Moon, and current transits>",
  "avoid": "<Optional: 1 sentence warning if any challenging aspects today, or null if none>",
  "focusAreas": ["<area1>", "<area2>"] // 2-3 relevant focus areas like "creativity", "communication", "self-care", "career", "relationships"
}

Make the message feel personal by:
1. Referencing their specific signs naturally (not formulaic)
2. Connecting current transits to their chart
3. Giving actionable guidance they can use today

The score should reflect how well today's transits support their natal chart.`;
}
