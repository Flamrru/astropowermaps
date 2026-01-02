/**
 * Roboflow API Client for Palm Line Detection
 * Server-side only - keeps API key secure
 */

import type { RoboflowResponse, RoboflowPrediction, DetectedLine, PalmLineType } from "../types";

// Roboflow API configuration
const ROBOFLOW_API_URL = "https://detect.roboflow.com";

// Available models to try (in order of preference)
const MODELS = {
  // Palm line detection - object detection
  PALM_LINE_DETECTION: {
    workspace: "palm-reading-test",
    project: "palm-line-detection-9zzh0",
    version: "1",
  },
  // Palm reading - instance segmentation
  PALM_READING_SEG: {
    workspace: "leo-ueno",
    project: "palm-reading-b3tep",
    version: "1",
  },
  // Palm lines recognition - keypoint detection
  PALM_LINES_KEYPOINT: {
    workspace: "tesou",
    project: "palm-lines-recognition-wemy5",
    version: "1",
  },
};

// Try object detection first - it at least detects the lines exist
// We'll use MediaPipe landmarks to position lines anatomically if needed
const DEFAULT_MODEL = MODELS.PALM_LINE_DETECTION;

function getConfig() {
  const apiKey = process.env.ROBOFLOW_API_KEY;
  if (!apiKey) {
    console.warn("ROBOFLOW_API_KEY not configured");
    return null;
  }
  return { apiKey };
}

/**
 * Detect palm lines from a cropped palm image using Roboflow
 * @param imageBase64 - Base64 encoded image of the palm (already cropped)
 * @param model - Which model to use
 */
export async function detectPalmLinesWithRoboflow(
  imageBase64: string,
  model = DEFAULT_MODEL
): Promise<{ success: boolean; predictions: RoboflowPrediction[]; imageSize: { width: number; height: number }; error?: string }> {
  const config = getConfig();

  if (!config) {
    console.log("📍 No Roboflow API key, using fallback detection");
    return {
      success: false,
      predictions: [],
      imageSize: { width: 0, height: 0 },
      error: "ROBOFLOW_API_KEY not configured",
    };
  }

  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // Build API URL
    const url = `${ROBOFLOW_API_URL}/${model.project}/${model.version}?api_key=${config.apiKey}`;

    console.log(`🔍 Calling Roboflow API: ${model.project}/${model.version}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: base64Data,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Roboflow API error:", response.status, errorText);
      return {
        success: false,
        predictions: [],
        imageSize: { width: 0, height: 0 },
        error: `Roboflow API error: ${response.status}`,
      };
    }

    const data: RoboflowResponse = await response.json();

    console.log(`✅ Roboflow detected ${data.predictions?.length || 0} objects`);
    console.log("📦 Predictions:", JSON.stringify(data.predictions?.map(p => ({
      class: p.class,
      hasPoints: !!(p.points && p.points.length > 0),
      pointCount: p.points?.length || 0,
      confidence: p.confidence
    }))));

    return {
      success: true,
      predictions: data.predictions || [],
      imageSize: data.image || { width: 0, height: 0 },
    };
  } catch (error) {
    console.error("Roboflow detection error:", error);
    return {
      success: false,
      predictions: [],
      imageSize: { width: 0, height: 0 },
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Convert Roboflow predictions to our DetectedLine format
 */
export function convertRoboflowToLines(
  predictions: RoboflowPrediction[],
  imageWidth: number,
  imageHeight: number
): DetectedLine[] {
  const lines: DetectedLine[] = [];

  // Map Roboflow class names to our PalmLineType
  const classMapping: Record<string, PalmLineType> = {
    "heart": "heart",
    "heart_line": "heart",
    "heart-line": "heart",
    "heartline": "heart",
    "head": "head",
    "head_line": "head",
    "head-line": "head",
    "headline": "head",
    "life": "life",
    "life_line": "life",
    "life-line": "life",
    "lifeline": "life",
    "fate": "fate",
    "fate_line": "fate",
    "fate-line": "fate",
    "fateline": "fate",
    "sun": "sun",
    "marriage": "marriage",
  };

  for (const pred of predictions) {
    const lineType = classMapping[pred.class.toLowerCase()];
    if (!lineType) {
      console.log(`Unknown palm line class: ${pred.class}`);
      continue;
    }

    // If the model provides points (segmentation/keypoint), use them
    if (pred.points && pred.points.length >= 2) {
      const normalizedPoints: [number, number][] = pred.points.map(p => [
        p.x / imageWidth,
        p.y / imageHeight,
      ]);

      lines.push({
        type: lineType,
        points: normalizedPoints,
        confidence: pred.confidence,
        depth: pred.confidence > 0.8 ? "deep" : pred.confidence > 0.5 ? "medium" : "faint",
      });
    } else {
      // For object detection, generate points from bounding box
      // Convert center-based coordinates to normalized
      const x = pred.x / imageWidth;
      const y = pred.y / imageHeight;
      const w = pred.width / imageWidth;
      const h = pred.height / imageHeight;

      // Generate line points based on line type and bounding box
      const points = generateLineFromBoundingBox(lineType, x, y, w, h);

      lines.push({
        type: lineType,
        points,
        boundingBox: {
          x: x - w / 2,
          y: y - h / 2,
          width: w,
          height: h,
        },
        confidence: pred.confidence,
        depth: pred.confidence > 0.8 ? "deep" : pred.confidence > 0.5 ? "medium" : "faint",
      });
    }
  }

  return lines;
}

/**
 * Generate line points from a bounding box
 * This creates a smooth curve within the detected region
 */
function generateLineFromBoundingBox(
  type: PalmLineType,
  centerX: number,
  centerY: number,
  width: number,
  height: number
): [number, number][] {
  const left = centerX - width / 2;
  const right = centerX + width / 2;
  const top = centerY - height / 2;
  const bottom = centerY + height / 2;

  switch (type) {
    case "heart":
    case "head":
      // Horizontal lines with slight curve
      const curveAmount = type === "heart" ? -0.02 : 0.02;
      return [
        [left, centerY],
        [left + width * 0.25, centerY + curveAmount],
        [centerX, centerY + curveAmount * 2],
        [right - width * 0.25, centerY + curveAmount],
        [right, centerY],
      ];

    case "life":
      // Curved arc around thumb area
      return [
        [right, top],
        [centerX + width * 0.2, top + height * 0.2],
        [centerX - width * 0.1, centerY],
        [left + width * 0.1, bottom - height * 0.2],
        [left, bottom],
      ];

    case "fate":
      // Vertical line
      return [
        [centerX, bottom],
        [centerX, centerY + height * 0.25],
        [centerX, centerY],
        [centerX, centerY - height * 0.25],
        [centerX, top],
      ];

    default:
      // Generic horizontal line
      return [
        [left, centerY],
        [right, centerY],
      ];
  }
}

/**
 * Get anatomically-positioned palm lines based on MediaPipe landmarks
 * These follow typical palm line anatomy relative to hand structure
 *
 * @param landmarks - Optional MediaPipe hand landmarks (21 points, normalized 0-1)
 * @param palmBounds - Optional palm bounding box for coordinate mapping
 */
export function getMockPalmLines(
  landmarks?: { x: number; y: number }[] | null,
  palmBounds?: { x: number; y: number; width: number; height: number } | null
): DetectedLine[] {
  // If we have landmarks, calculate anatomically accurate positions
  if (landmarks && landmarks.length >= 21) {
    return calculateLinesFromLandmarks(landmarks, palmBounds);
  }

  // Fallback to generic positions (centered palm assumption)
  return [
    {
      type: "heart",
      points: [
        [0.15, 0.28],
        [0.30, 0.26],
        [0.45, 0.25],
        [0.60, 0.27],
        [0.75, 0.30],
        [0.85, 0.33],
      ],
      confidence: 0.85,
      depth: "medium",
    },
    {
      type: "head",
      points: [
        [0.15, 0.42],
        [0.28, 0.40],
        [0.42, 0.39],
        [0.55, 0.41],
        [0.68, 0.45],
      ],
      confidence: 0.82,
      depth: "medium",
    },
    {
      type: "life",
      points: [
        [0.40, 0.30],
        [0.32, 0.38],
        [0.26, 0.48],
        [0.23, 0.58],
        [0.25, 0.68],
        [0.30, 0.78],
      ],
      confidence: 0.88,
      depth: "deep",
    },
    {
      type: "fate",
      points: [
        [0.50, 0.78],
        [0.49, 0.65],
        [0.48, 0.52],
        [0.47, 0.40],
      ],
      confidence: 0.65,
      depth: "faint",
    },
  ];
}

/**
 * Calculate palm line positions from MediaPipe hand landmarks
 * Uses anatomical knowledge of where palm lines typically appear
 */
function calculateLinesFromLandmarks(
  landmarks: { x: number; y: number }[],
  palmBounds?: { x: number; y: number; width: number; height: number } | null
): DetectedLine[] {
  // Key landmarks:
  // 0 = Wrist
  // 1-4 = Thumb (CMC, MCP, IP, TIP)
  // 5-8 = Index (MCP, PIP, DIP, TIP)
  // 9-12 = Middle (MCP, PIP, DIP, TIP)
  // 13-16 = Ring (MCP, PIP, DIP, TIP)
  // 17-20 = Pinky (MCP, PIP, DIP, TIP)

  const wrist = landmarks[0];
  const thumbCMC = landmarks[1];
  const indexMCP = landmarks[5];
  const middleMCP = landmarks[9];
  const ringMCP = landmarks[13];
  const pinkyMCP = landmarks[17];

  // Helper to interpolate between two points
  const lerp = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });

  // Helper to add slight curve offset
  const curve = (p: { x: number; y: number }, offset: number) => ({
    x: p.x,
    y: p.y + offset,
  });

  // HEART LINE: Runs from below pinky MCP to below index MCP
  // Slightly curved, highest on the palm
  const heartStart = { x: pinkyMCP.x, y: pinkyMCP.y + 0.05 };
  const heartEnd = { x: indexMCP.x - 0.02, y: indexMCP.y + 0.08 };
  const heartMid = lerp(heartStart, heartEnd, 0.5);
  const heartLine: [number, number][] = [
    [heartStart.x, heartStart.y],
    [lerp(heartStart, heartMid, 0.5).x, lerp(heartStart, heartMid, 0.5).y - 0.02],
    [heartMid.x, heartMid.y - 0.03],
    [lerp(heartMid, heartEnd, 0.5).x, lerp(heartMid, heartEnd, 0.5).y - 0.02],
    [heartEnd.x, heartEnd.y],
  ];

  // HEAD LINE: Runs from between thumb/index across palm
  // Below heart line, often straighter
  const headStart = { x: (thumbCMC.x + indexMCP.x) / 2, y: (thumbCMC.y + indexMCP.y) / 2 + 0.05 };
  const headEnd = { x: pinkyMCP.x + 0.03, y: (pinkyMCP.y + wrist.y) / 2 };
  const headMid = lerp(headStart, headEnd, 0.5);
  const headLine: [number, number][] = [
    [headStart.x, headStart.y],
    [lerp(headStart, headMid, 0.5).x, lerp(headStart, headMid, 0.5).y + 0.01],
    [headMid.x, headMid.y + 0.02],
    [lerp(headMid, headEnd, 0.5).x, lerp(headMid, headEnd, 0.5).y + 0.02],
    [headEnd.x, headEnd.y],
  ];

  // LIFE LINE: Curves around thumb mount from near index down toward wrist
  const lifeStart = { x: (thumbCMC.x + indexMCP.x) / 2 - 0.02, y: indexMCP.y + 0.03 };
  const lifeEnd = { x: thumbCMC.x + 0.05, y: wrist.y - 0.05 };
  const lifeMid1 = { x: thumbCMC.x + 0.08, y: lifeStart.y + (lifeEnd.y - lifeStart.y) * 0.3 };
  const lifeMid2 = { x: thumbCMC.x + 0.06, y: lifeStart.y + (lifeEnd.y - lifeStart.y) * 0.6 };
  const lifeLine: [number, number][] = [
    [lifeStart.x, lifeStart.y],
    [lifeMid1.x, lifeMid1.y],
    [lifeMid2.x, lifeMid2.y],
    [lifeEnd.x, lifeEnd.y],
  ];

  // FATE LINE: Vertical from wrist up toward middle finger
  const fateStart = { x: middleMCP.x, y: wrist.y - 0.03 };
  const fateEnd = { x: middleMCP.x - 0.01, y: middleMCP.y + 0.12 };
  const fateLine: [number, number][] = [
    [fateStart.x, fateStart.y],
    [lerp(fateStart, fateEnd, 0.33).x, lerp(fateStart, fateEnd, 0.33).y],
    [lerp(fateStart, fateEnd, 0.66).x - 0.01, lerp(fateStart, fateEnd, 0.66).y],
    [fateEnd.x, fateEnd.y],
  ];

  return [
    {
      type: "heart",
      points: heartLine,
      confidence: 0.90,
      depth: "medium",
    },
    {
      type: "head",
      points: headLine,
      confidence: 0.88,
      depth: "medium",
    },
    {
      type: "life",
      points: lifeLine,
      confidence: 0.92,
      depth: "deep",
    },
    {
      type: "fate",
      points: fateLine,
      confidence: 0.70,
      depth: "faint",
    },
  ];
}
