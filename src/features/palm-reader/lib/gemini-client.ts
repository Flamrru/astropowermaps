/**
 * Gemini API client for palm line detection
 * Uses Gemini 2.5 Pro for accurate bounding box detection
 */

import type { GeminiAnalysisResult, DetectedLine, PalmLineType } from "../types";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent";

function getConfig() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not configured");
    return null;
  }
  return { apiKey };
}

// Prompt for palm line detection
const PALM_ANALYSIS_PROMPT = `You are an expert palm reader analyzing a palm image.
Identify and locate the following palm lines:

1. Heart Line - The top horizontal line across the palm, starts from edge under pinky
2. Head Line - The middle horizontal line, starts from edge between thumb and index finger
3. Life Line - The curved line around the base of the thumb
4. Fate Line - The vertical line running up the center of the palm (if visible)

For each detected line, provide:
- type: One of "heart", "head", "life", "fate"
- boundingBox: Normalized coordinates (0-1) for the line region
  - x: left edge (0 = left of image, 1 = right)
  - y: top edge (0 = top of image, 1 = bottom)
  - width: width of region (0-1)
  - height: height of region (0-1)
- confidence: How confident you are (0-1)
- curvature: "straight", "curved", or "forked"
- depth: "faint", "medium", or "deep"

Also determine:
- handType: "left" or "right" based on thumb position
- imageQuality: "poor", "acceptable", or "good"

Respond ONLY with valid JSON in this exact format:
{
  "lines": [
    {
      "type": "heart",
      "boundingBox": { "x": 0.1, "y": 0.2, "width": 0.8, "height": 0.1 },
      "confidence": 0.9,
      "curvature": "curved",
      "depth": "deep"
    }
  ],
  "handType": "right",
  "imageQuality": "good"
}`;

export async function analyzeWithGemini(imageBase64: string): Promise<GeminiAnalysisResult> {
  const config = getConfig();

  if (!config) {
    // Return mock data for development when API key is not set
    console.log("📍 Using mock Gemini response (no API key)");
    return getMockGeminiResult();
  }

  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const response = await fetch(`${GEMINI_API_URL}?key=${config.apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: PALM_ANALYSIS_PROMPT },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return {
        success: false,
        lines: [],
        handType: "right",
        imageQuality: "poor",
        error: `API error: ${response.status}`,
      };
    }

    const data = await response.json();

    // Extract text from response
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("📝 Raw Gemini response:", responseText.substring(0, 500));

    // Check for blocked or empty response
    if (!responseText) {
      console.error("Empty response from Gemini. Full data:", JSON.stringify(data, null, 2));
      return {
        success: false,
        lines: [],
        handType: "right",
        imageQuality: "poor",
        error: "Empty response from Gemini - image may have been blocked",
      };
    }

    // Parse JSON from response (may be wrapped in markdown code blocks)
    // Try to find JSON object in the response
    let jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    let jsonStr = jsonMatch ? jsonMatch[1] : null;

    if (!jsonStr) {
      // Try to find raw JSON object
      jsonMatch = responseText.match(/\{[\s\S]*\}/);
      jsonStr = jsonMatch ? jsonMatch[0] : null;
    }

    if (!jsonStr) {
      console.error("Could not find JSON in Gemini response:", responseText);
      return {
        success: false,
        lines: [],
        handType: "right",
        imageQuality: "poor",
        error: "Could not parse response - no JSON found",
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "JSON string:", jsonStr);
      return {
        success: false,
        lines: [],
        handType: "right",
        imageQuality: "poor",
        error: "Invalid JSON in response",
      };
    }

    return {
      success: true,
      lines: parsed.lines || [],
      handType: parsed.handType || "right",
      imageQuality: parsed.imageQuality || "acceptable",
    };
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return {
      success: false,
      lines: [],
      handType: "right",
      imageQuality: "poor",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Mock result for development without API key
function getMockGeminiResult(): GeminiAnalysisResult {
  return {
    success: true,
    lines: [
      {
        type: "heart" as PalmLineType,
        boundingBox: { x: 0.15, y: 0.25, width: 0.7, height: 0.08 },
        confidence: 0.92,
        curvature: "curved",
        depth: "deep",
      },
      {
        type: "head" as PalmLineType,
        boundingBox: { x: 0.12, y: 0.38, width: 0.65, height: 0.07 },
        confidence: 0.88,
        curvature: "straight",
        depth: "medium",
      },
      {
        type: "life" as PalmLineType,
        boundingBox: { x: 0.2, y: 0.35, width: 0.25, height: 0.45 },
        confidence: 0.95,
        curvature: "curved",
        depth: "deep",
      },
      {
        type: "fate" as PalmLineType,
        boundingBox: { x: 0.45, y: 0.4, width: 0.08, height: 0.35 },
        confidence: 0.75,
        curvature: "straight",
        depth: "faint",
      },
    ],
    handType: "right",
    imageQuality: "good",
  };
}
