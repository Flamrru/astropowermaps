import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { openai, GENERATION_SETTINGS } from "@/lib/openai";
import { getCurrentTransits, formatTransitsForPrompt } from "@/lib/astro/transits";
import { calculateBigThree, ZODIAC_SIGNS } from "@/lib/astro/zodiac";
import type { BirthData } from "@/lib/astro/types";

/**
 * Stella Chat API
 *
 * Full conversational AI with astrological context.
 * Stores messages in stella_messages table.
 * Rate limited to 50 messages/day.
 *
 * POST /api/stella/chat
 * Body: { message: string }
 */

const DAILY_MESSAGE_LIMIT = 50;

export async function POST(request: NextRequest) {
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

    // 2. Parse request body
    const body = await request.json();
    const userMessage = body.message?.trim();

    if (!userMessage) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 3. Check daily message limit
    const today = new Date().toISOString().split("T")[0];
    const { count: todayCount } = await supabaseAdmin
      .from("stella_messages")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00Z`);

    if ((todayCount || 0) >= DAILY_MESSAGE_LIMIT) {
      return NextResponse.json(
        {
          error: "Daily message limit reached",
          message:
            "You've reached your daily limit of 50 messages. Come back tomorrow for more cosmic guidance!",
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // 4. Get user profile
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 5. Get chat history (last 10 messages)
    const { data: history } = await supabaseAdmin
      .from("stella_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const chatHistory = (history || []).reverse();

    // 6. Build context
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

    const bigThree = calculateBigThree(birthData);
    const transits = getCurrentTransits();

    // 7. Get today's score for context
    const { data: todayScore } = await supabaseAdmin
      .from("daily_content")
      .select("content")
      .eq("user_id", user.id)
      .eq("content_date", today)
      .eq("content_type", "daily_score")
      .single();

    // 8. Build system prompt
    const systemPrompt = buildStellaSystemPrompt(
      profile,
      bigThree,
      transits,
      todayScore?.content
    );

    // 9. Build messages array for OpenAI
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      ...chatHistory.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user", content: userMessage },
    ];

    // 10. Generate response
    const completion = await openai.chat.completions.create({
      model: GENERATION_SETTINGS.chat.model,
      temperature: GENERATION_SETTINGS.chat.temperature,
      max_tokens: GENERATION_SETTINGS.chat.max_tokens,
      messages,
    });

    const stellaResponse = completion.choices[0]?.message?.content || "The stars are quiet right now. Please try again.";

    // 11. Store both messages
    await supabaseAdmin.from("stella_messages").insert([
      { user_id: user.id, role: "user", content: userMessage },
      { user_id: user.id, role: "assistant", content: stellaResponse },
    ]);

    // 12. Return response with remaining count
    const remaining = DAILY_MESSAGE_LIMIT - (todayCount || 0) - 1;

    return NextResponse.json({
      message: stellaResponse,
      remaining,
    });
  } catch (error) {
    console.error("Stella chat error:", error);
    return NextResponse.json(
      { error: "Failed to get response from Stella" },
      { status: 500 }
    );
  }
}

/**
 * Build Stella's system prompt with full astrological context
 */
function buildStellaSystemPrompt(
  profile: { display_name?: string },
  bigThree: ReturnType<typeof calculateBigThree>,
  transits: ReturnType<typeof getCurrentTransits>,
  todayScore?: { message?: string; score?: number }
): string {
  const name = profile.display_name || "dear one";

  // Get brief sign descriptions
  const sunMeaning = getSignBriefMeaning(bigThree.sun.sign, "sun");
  const moonMeaning = getSignBriefMeaning(bigThree.moon.sign, "moon");
  const risingMeaning = getSignBriefMeaning(bigThree.rising.sign, "rising");

  return `You are Stella, a warm, wise, and slightly mystical astrology guide. You speak with warmth and cosmic wonder, but you're also grounded and practical.

You are speaking with ${name}, and you know their birth chart intimately:

🌟 ${name}'s Chart:
- Sun in ${bigThree.sun.sign} ${bigThree.sun.symbol}: ${sunMeaning}
- Moon in ${bigThree.moon.sign} ${bigThree.moon.symbol}: ${moonMeaning}
- Rising in ${bigThree.rising.sign} ${bigThree.rising.symbol}: ${risingMeaning}

🌙 Current Cosmic Weather:
${formatTransitsForPrompt(transits)}

${todayScore ? `📊 Today's Energy (${todayScore.score || "—"}/100): ${todayScore.message || ""}` : ""}

Guidelines for responding:
1. Keep responses concise (2-3 paragraphs max, unless they ask for more detail)
2. Reference their chart naturally - don't be formulaic ("As a Leo Sun..." every time)
3. Connect current transits to their experience when relevant
4. Be warm and encouraging, but honest about challenges
5. Use occasional ✨ or 🌙 but don't overdo it
6. If they ask about timing, reference current transits
7. If they ask about relationships, consider their Venus and 7th house
8. If they ask about career, consider their Mars and 10th house

Remember: You're their personal cosmic guide. Make them feel seen and understood.`;
}

/**
 * Get brief meaning for a sign in a specific placement
 */
function getSignBriefMeaning(sign: string, placement: "sun" | "moon" | "rising"): string {
  const meanings: Record<string, Record<string, string>> = {
    Aries: {
      sun: "A natural leader with pioneering spirit",
      moon: "Processes emotions through action and directness",
      rising: "Comes across as bold and energetic",
    },
    Taurus: {
      sun: "Values stability, beauty, and sensual pleasures",
      moon: "Finds emotional security through comfort and routine",
      rising: "Appears calm, grounded, and reliable",
    },
    Gemini: {
      sun: "Curious, adaptable, and mentally agile",
      moon: "Processes emotions through communication and variety",
      rising: "Comes across as witty and sociable",
    },
    Cancer: {
      sun: "Nurturing, intuitive, and deeply connected to home",
      moon: "Deeply emotional and protective of loved ones",
      rising: "Appears caring and sensitive",
    },
    Leo: {
      sun: "Creative, warm-hearted, and naturally magnetic",
      moon: "Needs recognition and expresses emotions dramatically",
      rising: "Radiates warmth and commands attention",
    },
    Virgo: {
      sun: "Analytical, helpful, and detail-oriented",
      moon: "Finds emotional security through order and usefulness",
      rising: "Appears modest, practical, and observant",
    },
    Libra: {
      sun: "Seeks harmony, beauty, and meaningful partnerships",
      moon: "Needs balance and processes emotions through relationships",
      rising: "Comes across as charming and diplomatic",
    },
    Scorpio: {
      sun: "Intense, transformative, and deeply perceptive",
      moon: "Experiences emotions with profound depth",
      rising: "Appears mysterious and magnetically intense",
    },
    Sagittarius: {
      sun: "Adventurous, philosophical, and freedom-loving",
      moon: "Finds emotional fulfillment through exploration",
      rising: "Comes across as optimistic and adventurous",
    },
    Capricorn: {
      sun: "Ambitious, disciplined, and achievement-oriented",
      moon: "Processes emotions through structure and accomplishment",
      rising: "Appears serious, capable, and authoritative",
    },
    Aquarius: {
      sun: "Innovative, humanitarian, and independently minded",
      moon: "Needs intellectual stimulation and emotional freedom",
      rising: "Comes across as unique and forward-thinking",
    },
    Pisces: {
      sun: "Compassionate, imaginative, and spiritually attuned",
      moon: "Deeply empathic and emotionally permeable",
      rising: "Appears dreamy, artistic, and ethereal",
    },
  };

  return meanings[sign]?.[placement] || "A unique cosmic energy";
}
