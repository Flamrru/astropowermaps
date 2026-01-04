import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { openai, GENERATION_SETTINGS } from "@/lib/openai";
import { getCurrentTransits } from "@/lib/astro/transits";
import { calculateBigThree } from "@/lib/astro/zodiac";
import type { BirthData } from "@/lib/astro/types";
import { BYPASS_AUTH, TEST_USER_ID } from "@/lib/auth-bypass";

/**
 * Ritual Prompt API
 *
 * Generates a personalized daily journal prompt based on Moon sign
 * and current lunar phase. Designed to feel deeply personal.
 *
 * POST /api/content/ritual
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

    // 2. Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 3. Check for cached ritual today
    const today = new Date().toISOString().split("T")[0];

    const { data: cached } = await supabaseAdmin
      .from("daily_content")
      .select("content")
      .eq("user_id", userId)
      .eq("content_date", today)
      .eq("content_type", "ritual")
      .single();

    if (cached?.content) {
      return NextResponse.json(cached.content);
    }

    // 4. Build birth data
    const birthData: BirthData = {
      date: profile.birth_date,
      time: profile.birth_time || "12:00",
      timeUnknown: !profile.birth_time,
      location: {
        name: profile.birth_place || "Unknown",
        lat: profile.birth_lat || 0,
        lng: profile.birth_lng || 0,
        timezone: profile.birth_timezone || "UTC",
      },
    };

    // 5. Calculate Big Three and transits
    const bigThree = calculateBigThree(birthData);
    const transits = getCurrentTransits();

    // 6. Generate ritual prompt with OpenAI
    const prompt = buildRitualPrompt(profile, bigThree, transits);

    const completion = await openai.chat.completions.create({
      model: GENERATION_SETTINGS.ritual.model,
      reasoning_effort: GENERATION_SETTINGS.ritual.reasoning_effort,
      verbosity: GENERATION_SETTINGS.ritual.verbosity,
      max_completion_tokens: GENERATION_SETTINGS.ritual.max_completion_tokens,
      messages: [
        {
          role: "system",
          content:
            "You are Stella, a gentle and wise astrologer who creates deeply personal journal prompts. Your prompts help people connect with their inner world through the lens of their Moon sign. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || "{}";
    let ritual;

    try {
      ritual = JSON.parse(responseText);
    } catch {
      // Fallback
      ritual = {
        type: "daily",
        category: "reflection",
        personalizedPrompt: `As a ${bigThree.moon.sign} Moon, take a moment to reflect on what you're feeling today.`,
        signReference: bigThree.moon.sign,
      };
    }

    // Add metadata
    const ritualPrompt = {
      id: crypto.randomUUID(),
      ...ritual,
      date: today,
      generatedAt: new Date().toISOString(),
    };

    // 7. Cache the result
    await supabaseAdmin.from("daily_content").upsert({
      user_id: userId,
      content_date: today,
      content_type: "ritual",
      content: ritualPrompt,
    });

    return NextResponse.json(ritualPrompt);
  } catch (error) {
    console.error("Ritual prompt error:", error);
    return NextResponse.json(
      { error: "Failed to generate ritual prompt" },
      { status: 500 }
    );
  }
}

/**
 * Ritual categories based on lunar phases
 */
function getCategoryFromLunarPhase(phaseName: string): string {
  const categoryMap: Record<string, string> = {
    "New Moon": "intention",
    "Waxing Crescent": "intention",
    "First Quarter": "gratitude",
    "Waxing Gibbous": "gratitude",
    "Full Moon": "release",
    "Waning Gibbous": "release",
    "Last Quarter": "reflection",
    "Waning Crescent": "reflection",
  };
  return categoryMap[phaseName] || "reflection";
}

/**
 * Build prompt for ritual/journal generation
 */
function buildRitualPrompt(
  profile: { display_name?: string },
  bigThree: ReturnType<typeof calculateBigThree>,
  transits: ReturnType<typeof getCurrentTransits>
): string {
  const category = getCategoryFromLunarPhase(transits.lunarPhase.name);
  const userName = profile.display_name || "dear one";

  return `Create a personalized daily journal prompt for ${userName}.

Their Chart:
- Moon Sign: ${bigThree.moon.sign} (this is their emotional nature - VERY important for rituals)
- Sun Sign: ${bigThree.sun.sign} (their core identity)
- Rising Sign: ${bigThree.rising.sign}

Current Lunar Phase: ${transits.lunarPhase.name} ${transits.lunarPhase.emoji} (${transits.lunarPhase.illumination}% illuminated)
Transit Moon: ${transits.moon.formatted}

Suggested Category: "${category}" (based on lunar phase)

Generate a JSON response:
{
  "type": "daily",
  "category": "<${category} or another if more fitting>",
  "personalizedPrompt": "<A 2-3 sentence journal prompt that feels deeply personal. Start with 'As a ${bigThree.moon.sign} Moon...' and reference how they process emotions. Connect to the current ${transits.lunarPhase.name} energy. End with a gentle question for them to journal about.>",
  "signReference": "${bigThree.moon.sign}"
}

Guidelines:
- The prompt should feel like it was written JUST for them
- Reference their ${bigThree.moon.sign} Moon's specific traits (e.g., Scorpio Moon feels deeply, Gemini Moon processes through words)
- Connect to the ${transits.lunarPhase.name} energy (${category})
- Keep it warm and inviting, not prescriptive
- The question at the end should be open-ended`;
}
