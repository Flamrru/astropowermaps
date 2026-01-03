import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { openai, GENERATION_SETTINGS } from "@/lib/openai";
import { getCurrentTransits, formatTransitsForPrompt } from "@/lib/astro/transits";
import { calculateFullChart, formatChartForPrompt, formatAspectsForPrompt, FullChart } from "@/lib/astro/chart";
import { HOUSE_MEANINGS } from "@/lib/astro/houses";
import { ASPECT_SYMBOLS, AspectType } from "@/lib/astro/transit-types";
import type { BirthData } from "@/lib/astro/types";
import { BYPASS_AUTH, TEST_USER_ID } from "@/lib/auth-bypass";

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
      .eq("user_id", userId)
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
      .eq("user_id", userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 5. Get chat history (last 10 messages)
    const { data: history } = await supabaseAdmin
      .from("stella_messages")
      .select("role, content")
      .eq("user_id", userId)
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

    const chart = calculateFullChart(birthData);
    const transits = getCurrentTransits();

    // 7. Get today's score for context
    const { data: todayScore } = await supabaseAdmin
      .from("daily_content")
      .select("content")
      .eq("user_id", userId)
      .eq("content_date", today)
      .eq("content_type", "daily_score")
      .single();

    // 8. Build system prompt with FULL chart context
    const systemPrompt = buildStellaSystemPrompt(
      profile,
      chart,
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
      max_completion_tokens: GENERATION_SETTINGS.chat.max_completion_tokens,
      messages,
    });

    const stellaResponse = completion.choices[0]?.message?.content || "The stars are quiet right now. Please try again.";

    // 11. Store both messages
    await supabaseAdmin.from("stella_messages").insert([
      { user_id: userId, role: "user", content: userMessage },
      { user_id: userId, role: "assistant", content: stellaResponse },
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
 * Build Stella's system prompt with FULL astrological context
 * Including houses, nodes, and natal aspects
 */
function buildStellaSystemPrompt(
  profile: { display_name?: string },
  chart: FullChart,
  transits: ReturnType<typeof getCurrentTransits>,
  todayScore?: { message?: string; score?: number }
): string {
  const name = profile.display_name || "dear one";
  const bigThree = chart.bigThree;

  // Get brief sign descriptions
  const sunMeaning = getSignBriefMeaning(bigThree.sun.sign, "sun");
  const moonMeaning = getSignBriefMeaning(bigThree.moon.sign, "moon");
  const risingMeaning = getSignBriefMeaning(bigThree.rising.sign, "rising");

  // Build houses section (if available)
  let housesSection = "";
  if (chart.houses) {
    const h = chart.houses;
    housesSection = `
🏠 HOUSES (${h.system.toUpperCase()} system):
- 1st House (Self): ${h.cusps[0].formatted}
- 4th House (Home/IC): ${h.cusps[3].formatted}
- 7th House (Relationships): ${h.cusps[6].formatted}
- 10th House (Career/MC): ${h.cusps[9].formatted}`;

    // Add planet house placements
    if (chart.housePlacements) {
      const keyPlacements = chart.housePlacements
        .filter(p => ["sun", "moon", "venus", "mars"].includes(p.point as string))
        .map(p => `- ${p.point} in House ${p.house}`)
        .join("\n");
      if (keyPlacements) {
        housesSection += `\n\nPlanet Placements:\n${keyPlacements}`;
      }
    }
  }

  // Build natal aspects section (top 5)
  let aspectsSection = "";
  if (chart.natalAspects.length > 0) {
    const topAspects = chart.natalAspects.slice(0, 5).map(a => {
      const symbol = ASPECT_SYMBOLS[a.aspectType as AspectType] || a.aspectType;
      return `- ${a.planet1} ${symbol} ${a.planet2} (${a.orb.toFixed(1)}°)`;
    }).join("\n");
    aspectsSection = `\n\n🔮 KEY NATAL ASPECTS:\n${topAspects}`;
  }

  return `You are Stella, a warm, wise, and slightly mystical astrology guide. You speak with warmth and cosmic wonder, but you're also grounded and practical.

You are speaking with ${name}, and you know their COMPLETE birth chart intimately:

🌟 ${name}'s CORE PLACEMENTS:
- Sun in ${bigThree.sun.sign} ${bigThree.sun.symbol} at ${Math.round(bigThree.sun.degree)}°: ${sunMeaning}
- Moon in ${bigThree.moon.sign} ${bigThree.moon.symbol} at ${Math.round(bigThree.moon.degree)}°: ${moonMeaning}
- Rising in ${bigThree.rising.sign} ${bigThree.rising.symbol}: ${risingMeaning}

☊ LUNAR NODES (Soul Purpose):
- North Node in ${chart.nodes.northNode.formatted}: ${chart.nodeThemes.northTheme}
- South Node in ${chart.nodes.southNode.formatted}: ${chart.nodeThemes.southTheme}
${housesSection}${aspectsSection}

🌙 CURRENT COSMIC WEATHER:
${formatTransitsForPrompt(transits)}

${todayScore ? `📊 Today's Energy (${todayScore.score || "—"}/100): ${todayScore.message || ""}` : ""}

CRITICAL - RESPONSE LENGTH:
- DEFAULT: 2-4 sentences. Short, punchy, personal.
- ONLY expand to 2 short paragraphs if user asks a complex question
- NEVER write 3+ paragraphs unless user explicitly asks for "more detail" or "deep dive"
- This is a MOBILE chat app - responses must fit on a phone screen without endless scrolling

STYLE:
- Warm but brief - like texting a wise friend, not reading an essay
- One key insight per response, not everything you know
- Reference ONE chart placement per response, not all of them
- Use 1 emoji max per message (✨ or 🌙), sometimes none
- End with a question or gentle prompt to keep conversation flowing

EXAMPLES OF GOOD LENGTH:
❌ BAD: "Your Venus in Scorpio combined with your Moon in Pisces and your 7th house ruler being... [300 words]"
✅ GOOD: "With Venus in Scorpio, you love deeply and completely—no half measures ✨ Right now Saturn's asking: are they meeting you at that depth?"

TOPIC HINTS (pick ONE to mention, not all):
- Love → Venus or 7th house
- Career → MC or Mars
- Purpose → North Node
- Emotions → Moon

Make them feel seen with precision, not volume.`;
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
