/**
 * OpenAI API client for palm line detection and reading generation
 * Uses GPT-4o Vision for line detection and reading generation
 */

import type {
  OpenAIReadingResult,
  PalmReading,
  DetectedLine,
  TraitScore,
  PalmLineType,
  GeminiAnalysisResult,
} from "../types";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

function getConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OPENAI_API_KEY not configured");
    return null;
  }
  return { apiKey };
}

// ============================================
// PALM LINE DETECTION WITH GPT-4o VISION
// ============================================

const LINE_DETECTION_PROMPT = `You are analyzing a photo of a palm. Your task is to find the palm lines and return their EXACT coordinates.

STEP 1 - LOCATE THE PALM:
First, identify where the palm/hand is in the image. Note its position (is it centered? left? right? What percentage of the image does it occupy?)

STEP 2 - FIND THE CREASES:
Look at the ACTUAL skin creases on the palm. The main lines are:
- HEART LINE: Horizontal crease near the top of the palm, below the fingers
- HEAD LINE: Horizontal crease in the middle of the palm
- LIFE LINE: Curved crease that arcs around the thumb mound (thenar eminence)
- FATE LINE: Vertical crease in the center (may not be visible on all palms)

STEP 3 - TRACE EACH LINE:
For each visible crease, provide points that follow the ACTUAL crease path in the photo.

COORDINATE SYSTEM:
- [0.0, 0.0] = top-left corner of the ENTIRE image
- [1.0, 1.0] = bottom-right corner of the ENTIRE image
- Your points must land ON the visible palm, ON the actual creases

EXAMPLE: If the palm is centered and takes up the middle 60% of a landscape photo:
- Palm might span roughly x: 0.25 to 0.75
- Heart line might be around y: 0.35 to 0.40 (near top of palm)
- Life line curves around the thumb area

OUTPUT FORMAT (JSON only, no markdown):
{"lines":[{"type":"heart","points":[[0.3,0.38],[0.4,0.36],[0.5,0.35],[0.6,0.37]],"confidence":0.9,"depth":"deep"}],"handType":"right","imageQuality":"good"}

CRITICAL: Your coordinates MUST match where the creases actually appear in THIS specific photo. If I overlay your points on the image, they should land exactly on the palm lines.`;

export async function detectPalmLinesWithOpenAI(imageBase64: string): Promise<GeminiAnalysisResult> {
  const config = getConfig();

  if (!config) {
    console.log("📍 No OpenAI API key, using mock palm lines");
    return getMockPalmLines();
  }

  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    console.log("🔍 Calling GPT-4o Vision for palm line detection...");

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: LINE_DETECTION_PROMPT },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Data}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI Vision API error:", errorText);
      return {
        success: false,
        lines: [],
        handType: "right",
        imageQuality: "poor",
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || "";

    console.log("📝 GPT-4o response:", responseText.substring(0, 300));

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not parse JSON from GPT-4o response");
      return getMockPalmLines();
    }

    const parsed = JSON.parse(jsonMatch[0]);

    console.log(`✅ GPT-4o detected ${parsed.lines?.length || 0} palm lines`);

    return {
      success: true,
      lines: (parsed.lines || []).map((line: DetectedLine) => ({
        ...line,
        type: line.type as PalmLineType,
      })),
      handType: parsed.handType || "right",
      imageQuality: parsed.imageQuality || "acceptable",
    };
  } catch (error) {
    console.error("GPT-4o palm detection error:", error);
    return getMockPalmLines();
  }
}

// Mock palm lines when API unavailable
function getMockPalmLines(): GeminiAnalysisResult {
  return {
    success: true,
    lines: [
      {
        type: "heart" as PalmLineType,
        points: [[0.15, 0.28], [0.30, 0.26], [0.45, 0.25], [0.60, 0.27], [0.75, 0.30], [0.85, 0.32]],
        confidence: 0.85,
        depth: "medium",
      },
      {
        type: "head" as PalmLineType,
        points: [[0.15, 0.45], [0.30, 0.43], [0.45, 0.42], [0.58, 0.44], [0.70, 0.48]],
        confidence: 0.82,
        depth: "medium",
      },
      {
        type: "life" as PalmLineType,
        points: [[0.38, 0.32], [0.30, 0.40], [0.24, 0.50], [0.22, 0.60], [0.24, 0.70], [0.30, 0.80]],
        confidence: 0.88,
        depth: "deep",
      },
      {
        type: "fate" as PalmLineType,
        points: [[0.48, 0.78], [0.47, 0.65], [0.46, 0.52], [0.45, 0.40]],
        confidence: 0.70,
        depth: "faint",
      },
    ],
    handType: "right",
    imageQuality: "good",
  };
}

// System prompt for Stella the palm reader
const STELLA_SYSTEM_PROMPT = `You are Stella, a celestial palm reader who combines ancient palmistry wisdom with mystical insight.

Your personality:
- Warm, wise, and slightly mysterious
- You speak with gentle authority
- You weave cosmic/stellar metaphors into readings
- You're encouraging but honest
- You never make definitive predictions, only reveal tendencies and potentials

When generating a palm reading:
1. Analyze the detected palm lines and their characteristics
2. Create meaningful interpretations based on traditional palmistry
3. Generate scores (0-100) for each trait based on line analysis
4. Provide insights that feel personal and meaningful
5. End with wisdom that empowers the person`;

// Generate reading prompt based on detected lines
function generateReadingPrompt(lines: DetectedLine[]): string {
  const lineDescriptions = lines
    .map((line) => {
      return `- ${line.type.toUpperCase()} LINE: confidence ${Math.round(line.confidence * 100)}%, ${line.curvature}, ${line.depth} depth`;
    })
    .join("\n");

  return `Based on this palm analysis, generate a personalized reading:

DETECTED LINES:
${lineDescriptions}

Generate a reading in this exact JSON format:
{
  "summary": "2-3 sentence overview of what the palm reveals",
  "traits": [
    {
      "id": "love-destiny",
      "label": "Love Destiny",
      "score": 75,
      "description": "Brief insight about romantic nature",
      "lineSource": "heart"
    },
    {
      "id": "career-path",
      "label": "Career Path",
      "score": 82,
      "description": "Brief insight about professional drive",
      "lineSource": "fate"
    },
    {
      "id": "inner-wisdom",
      "label": "Inner Wisdom",
      "score": 68,
      "description": "Brief insight about intuition and thinking",
      "lineSource": "head"
    },
    {
      "id": "life-force",
      "label": "Life Force",
      "score": 90,
      "description": "Brief insight about vitality",
      "lineSource": "life"
    },
    {
      "id": "heart-connection",
      "label": "Heart Connection",
      "score": 71,
      "description": "Brief insight about emotional depth",
      "lineSource": "heart"
    }
  ],
  "insights": {
    "love": "2-3 sentences about love and relationships based on heart line",
    "career": "2-3 sentences about career path based on fate and head lines",
    "health": "2-3 sentences about vitality based on life line",
    "spirituality": "2-3 sentences about spiritual nature"
  },
  "advice": "1-2 sentences of empowering guidance",
  "stellaQuote": "A short mystical quote that feels personal to this reading"
}

Make the scores feel realistic and varied (not all high or all low).
Base interpretations on the actual line characteristics provided.
Respond ONLY with valid JSON.`;
}

export async function generateReading(
  lines: DetectedLine[]
): Promise<OpenAIReadingResult> {
  const config = getConfig();

  if (!config) {
    // Return mock data for development when API key is not set
    console.log("📍 Using mock OpenAI response (no API key)");
    return getMockOpenAIResult(lines);
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // Use gpt-4o as fallback, can upgrade to gpt-5.2 when available
        messages: [
          { role: "system", content: STELLA_SYSTEM_PROMPT },
          { role: "user", content: generateReadingPrompt(lines) },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return {
        success: false,
        reading: getDefaultReading(),
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not parse JSON from OpenAI response:", responseText);
      return {
        success: false,
        reading: getDefaultReading(),
        error: "Could not parse response",
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      reading: parsed as PalmReading,
    };
  } catch (error) {
    console.error("OpenAI reading error:", error);
    return {
      success: false,
      reading: getDefaultReading(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Generate chat response
export async function generateChatResponse(
  message: string,
  readingContext: PalmReading
): Promise<{ success: boolean; response: string; error?: string }> {
  const config = getConfig();

  if (!config) {
    return {
      success: true,
      response:
        "I sense great curiosity in your question. The lines on your palm suggest you're someone who seeks deeper understanding. Let me share what I see... (This is a placeholder response - configure OPENAI_API_KEY for real responses)",
    };
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: STELLA_SYSTEM_PROMPT },
          {
            role: "assistant",
            content: `I've just given this person their palm reading. Here's what I found:\n\nSummary: ${readingContext.summary}\n\nTraits: ${readingContext.traits.map((t) => `${t.label}: ${t.score}%`).join(", ")}\n\nNow they have a follow-up question.`,
          },
          { role: "user", content: message },
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        response: "",
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || "";

    return {
      success: true,
      response: responseText,
    };
  } catch (error) {
    return {
      success: false,
      response: "",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Default reading for errors
function getDefaultReading(): PalmReading {
  return {
    summary:
      "Your palm reveals a fascinating story written by the stars themselves.",
    traits: [
      {
        id: "love-destiny",
        label: "Love Destiny",
        score: 72,
        description: "A deep capacity for meaningful connection",
        lineSource: "heart",
      },
      {
        id: "career-path",
        label: "Career Path",
        score: 78,
        description: "Strong drive toward purposeful work",
        lineSource: "fate",
      },
      {
        id: "inner-wisdom",
        label: "Inner Wisdom",
        score: 65,
        description: "Natural intuition guides your decisions",
        lineSource: "head",
      },
      {
        id: "life-force",
        label: "Life Force",
        score: 85,
        description: "Abundant energy flows through you",
        lineSource: "life",
      },
      {
        id: "heart-connection",
        label: "Heart Connection",
        score: 70,
        description: "Emotional depth enriches your relationships",
        lineSource: "heart",
      },
    ],
    insights: {
      love: "Your heart line speaks of deep emotional capacity and a desire for authentic connection.",
      career:
        "The fate line suggests you're destined for work that aligns with your values.",
      health:
        "Your life line radiates vitality and resilience through life's journey.",
      spirituality:
        "There's a natural connection to something greater than yourself.",
    },
    advice:
      "Trust the wisdom already written in your hands. The stars have mapped your potential—now it's time to walk the path.",
    stellaQuote:
      "In your palm, I see not fate carved in stone, but possibilities written in starlight.",
  };
}

// Mock result for development without API key
function getMockOpenAIResult(lines: DetectedLine[]): OpenAIReadingResult {
  // Generate somewhat varied scores based on line characteristics
  const heartLine = lines.find((l) => l.type === "heart");
  const headLine = lines.find((l) => l.type === "head");
  const lifeLine = lines.find((l) => l.type === "life");
  const fateLine = lines.find((l) => l.type === "fate");

  const baseScore = (line: DetectedLine | undefined) => {
    if (!line) return 60;
    let score = 70;
    if (line.depth === "deep") score += 15;
    if (line.depth === "faint") score -= 10;
    if (line.confidence > 0.9) score += 5;
    return Math.min(95, Math.max(45, score + Math.floor(Math.random() * 10) - 5));
  };

  return {
    success: true,
    reading: {
      summary:
        "Your palm reveals a soul guided by both passion and wisdom. The celestial patterns I see speak of someone at a pivotal moment—where past lessons meet future possibilities.",
      traits: [
        {
          id: "love-destiny",
          label: "Love Destiny",
          score: baseScore(heartLine),
          description:
            heartLine?.curvature === "curved"
              ? "Your curved heart line reveals a romantic, emotionally expressive nature"
              : "Your heart line shows a balanced approach to love and relationships",
          lineSource: "heart",
        },
        {
          id: "career-path",
          label: "Career Path",
          score: baseScore(fateLine),
          description: fateLine
            ? "A clear fate line suggests strong career direction and ambition"
            : "Your path unfolds with flexibility—many doors await your choosing",
          lineSource: "fate",
        },
        {
          id: "inner-wisdom",
          label: "Inner Wisdom",
          score: baseScore(headLine),
          description:
            headLine?.curvature === "straight"
              ? "A straight head line indicates logical, analytical thinking"
              : "Your curved head line reveals creative, intuitive thought patterns",
          lineSource: "head",
        },
        {
          id: "life-force",
          label: "Life Force",
          score: baseScore(lifeLine),
          description:
            lifeLine?.depth === "deep"
              ? "A deep life line radiates exceptional vitality and resilience"
              : "Your life line carries steady, sustainable energy",
          lineSource: "life",
        },
        {
          id: "heart-connection",
          label: "Heart Connection",
          score: baseScore(heartLine) - 5,
          description:
            "The depth of your heart line speaks to your capacity for emotional bonds",
          lineSource: "heart",
        },
      ],
      insights: {
        love: "Your heart line curves gracefully toward the fingers of Jupiter and Saturn, suggesting someone who loves deeply and seeks meaningful partnership. You give generously but remember—the stars remind you to receive with equal grace.",
        career:
          "The intersection of your head and fate lines creates what ancient palmists called a 'star of purpose.' Your work is meant to be more than labor—it's expression of your authentic self.",
        health:
          "Your life line sweeps in a strong arc around the Mount of Venus, indicating robust vitality. The consistency of this line suggests good stamina, though the slight feathering reminds you to honor rest as much as action.",
        spirituality:
          "Between the lines, I see the markings of an old soul. You've always felt connected to something beyond the visible—trust this knowing, for it guides you true.",
      },
      advice:
        "The map in your hands shows many paths, but only you can choose which to walk. Trust your heart line's wisdom, follow your fate line's direction, and let your life line's energy fuel the journey.",
      stellaQuote:
        "What the stars begin, your choices complete. Your palm holds not destiny, but invitation.",
    },
  };
}
