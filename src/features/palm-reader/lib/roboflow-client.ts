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
 *
 * Palm anatomy reference:
 * - Heart line: Uppermost horizontal, curves from pinky edge toward index/middle
 * - Head line: Middle horizontal, starts between thumb/index, runs across palm
 * - Life line: Curved arc around the thumb mount (thenar eminence)
 * - Fate line: Vertical from wrist toward middle finger, often with slight curve
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
  const thumbMCP = landmarks[2];
  const indexMCP = landmarks[5];
  const middleMCP = landmarks[9];
  const ringMCP = landmarks[13];
  const pinkyMCP = landmarks[17];

  // Calculate palm dimensions for proportional positioning
  const palmHeight = wrist.y - middleMCP.y; // Vertical span of palm
  const palmWidth = Math.abs(pinkyMCP.x - thumbCMC.x); // Horizontal span

  // Average Y of finger bases (MCP joints) - this is our "top of palm" reference
  const fingerBaseY = (indexMCP.y + middleMCP.y + ringMCP.y + pinkyMCP.y) / 4;

  // Helper to interpolate between two points
  const lerp = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });

  // ===========================================
  // HEART LINE: Uppermost crease on the palm
  // Runs from pinky edge, curves up slightly in middle, ends near index
  // Position: About 15-20% down from finger bases into the palm
  // ===========================================
  const heartOffset = palmHeight * 0.18; // 18% into the palm from finger bases
  const heartStartX = pinkyMCP.x;
  const heartEndX = indexMCP.x;

  // Heart line typically curves upward (toward fingers) in the middle
  const heartLine: [number, number][] = [
    [heartStartX, fingerBaseY + heartOffset],
    [lerp(pinkyMCP, ringMCP, 0.5).x, fingerBaseY + heartOffset - palmHeight * 0.02],
    [middleMCP.x, fingerBaseY + heartOffset - palmHeight * 0.03], // Highest point
    [lerp(middleMCP, indexMCP, 0.5).x, fingerBaseY + heartOffset - palmHeight * 0.02],
    [heartEndX, fingerBaseY + heartOffset + palmHeight * 0.01],
  ];

  // ===========================================
  // HEAD LINE: Starts between thumb and index, runs across palm
  // More horizontal than heart line, may slope down slightly
  // Position: About 35-40% down from finger bases
  // ===========================================
  const headOffset = palmHeight * 0.38;

  // Head line starts at the edge of palm between thumb and index
  const headStartX = indexMCP.x + (thumbCMC.x - indexMCP.x) * 0.3;
  const headStartY = fingerBaseY + headOffset;

  // Head line typically runs fairly straight or slopes down slightly toward pinky side
  const headEndX = pinkyMCP.x - palmWidth * 0.05;
  const headEndY = fingerBaseY + headOffset + palmHeight * 0.08; // Slight downward slope

  const headLine: [number, number][] = [
    [headStartX, headStartY],
    [lerp({ x: headStartX, y: headStartY }, { x: middleMCP.x, y: headStartY + palmHeight * 0.02 }, 0.5).x,
     lerp({ x: headStartX, y: headStartY }, { x: middleMCP.x, y: headStartY + palmHeight * 0.02 }, 0.5).y],
    [middleMCP.x, headStartY + palmHeight * 0.03],
    [lerp({ x: middleMCP.x, y: headStartY + palmHeight * 0.03 }, { x: headEndX, y: headEndY }, 0.5).x,
     lerp({ x: middleMCP.x, y: headStartY + palmHeight * 0.03 }, { x: headEndX, y: headEndY }, 0.5).y],
    [headEndX, headEndY],
  ];

  // ===========================================
  // LIFE LINE: Curves around thumb mount
  // Starts between thumb/index, curves around toward wrist
  // Should follow the natural curve of the thenar eminence
  // ===========================================

  // Life line starts near where head line starts
  const lifeStartX = headStartX;
  const lifeStartY = headStartY - palmHeight * 0.05;

  // Life line curves around thumb and ends toward wrist
  const lifeEndX = thumbCMC.x + palmWidth * 0.15;
  const lifeEndY = wrist.y - palmHeight * 0.15;

  // Control points for the curve - should arc around the thumb mount
  const lifeMid1X = thumbMCP.x + palmWidth * 0.08;
  const lifeMid1Y = lifeStartY + (lifeEndY - lifeStartY) * 0.35;

  const lifeMid2X = thumbCMC.x + palmWidth * 0.12;
  const lifeMid2Y = lifeStartY + (lifeEndY - lifeStartY) * 0.65;

  const lifeLine: [number, number][] = [
    [lifeStartX, lifeStartY],
    [lifeMid1X, lifeMid1Y],
    [lifeMid2X, lifeMid2Y],
    [lifeEndX, lifeEndY],
  ];

  // ===========================================
  // FATE LINE: Vertical line from wrist toward middle finger
  // Often has a slight S-curve, not perfectly straight
  // Not everyone has a prominent fate line
  // ===========================================
  const fateStartX = middleMCP.x + palmWidth * 0.02; // Slightly offset from middle
  const fateStartY = wrist.y - palmHeight * 0.08;

  const fateEndX = middleMCP.x;
  const fateEndY = fingerBaseY + palmHeight * 0.25; // Ends well below finger bases

  // Add subtle S-curve
  const fateLine: [number, number][] = [
    [fateStartX, fateStartY],
    [fateStartX - palmWidth * 0.02, lerp({ x: 0, y: fateStartY }, { x: 0, y: fateEndY }, 0.33).y],
    [fateEndX + palmWidth * 0.01, lerp({ x: 0, y: fateStartY }, { x: 0, y: fateEndY }, 0.66).y],
    [fateEndX, fateEndY],
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
