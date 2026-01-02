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
 * Calculate palm line positions using FIXED ANATOMICAL PERCENTAGES
 *
 * SIMPLIFIED APPROACH:
 * Palm creases are in roughly the same relative position on ALL hands.
 * Instead of complex landmark calculations, we:
 * 1. Find the palm bounding box from landmarks
 * 2. Use fixed percentage positions for each line
 * 3. Mirror X coordinates for left vs right hand
 *
 * This is how competitor apps like Astroline do it - "good enough" positioning
 * that works for any hand, rather than trying to detect actual creases.
 */
function calculateLinesFromLandmarks(
  landmarks: { x: number; y: number }[],
  palmBounds?: { x: number; y: number; width: number; height: number } | null
): DetectedLine[] {
  // Get key landmarks to determine palm bounds and orientation
  const wrist = landmarks[0];
  const thumbCMC = landmarks[1];
  const indexMCP = landmarks[5];
  const middleMCP = landmarks[9];
  const pinkyMCP = landmarks[17];

  // Determine hand orientation: is thumb on left or right?
  // Left hand (palm facing camera): thumb on RIGHT side (thumbCMC.x > middleMCP.x)
  // Right hand (palm facing camera): thumb on LEFT side (thumbCMC.x < middleMCP.x)
  const isLeftHand = thumbCMC.x > middleMCP.x;

  // Calculate palm bounding box
  const fingerBaseY = Math.min(indexMCP.y, middleMCP.y, pinkyMCP.y);
  const palmTop = fingerBaseY;
  const palmBottom = wrist.y;
  const palmHeight = palmBottom - palmTop;

  // For width, use the span from pinky to thumb
  const palmLeft = Math.min(pinkyMCP.x, thumbCMC.x, indexMCP.x);
  const palmRight = Math.max(pinkyMCP.x, thumbCMC.x, indexMCP.x);
  const palmWidth = palmRight - palmLeft;

  // Helper: convert percentage to actual coordinates
  // xPct: 0 = pinky side, 1 = thumb side
  // yPct: 0 = finger bases (top), 1 = wrist (bottom)
  const toCoord = (xPct: number, yPct: number): [number, number] => {
    const y = palmTop + palmHeight * yPct;
    // Flip X based on hand orientation
    let x: number;
    if (isLeftHand) {
      // Left hand: thumb on right, pinky on left
      // xPct 0 = left (pinky), xPct 1 = right (thumb)
      x = palmLeft + palmWidth * xPct;
    } else {
      // Right hand: thumb on left, pinky on right
      // Need to flip: xPct 0 = right (pinky), xPct 1 = left (thumb)
      x = palmRight - palmWidth * xPct;
    }
    return [x, y];
  };

  // ===========================================
  // HEART LINE: Uppermost crease (~15-20% down)
  // Horizontal with slight upward curve in middle
  // Runs from pinky side toward index/middle
  // ===========================================
  const heartLine: [number, number][] = [
    toCoord(0.08, 0.18),   // Start: pinky edge
    toCoord(0.28, 0.14),   // Curve up
    toCoord(0.48, 0.12),   // Peak (highest point)
    toCoord(0.65, 0.14),   // Curve down
    toCoord(0.78, 0.18),   // End: near index
  ];

  // ===========================================
  // HEAD LINE: Middle crease (~35-45% down)
  // Starts between thumb/index, runs across palm
  // Slopes slightly downward toward pinky
  // ===========================================
  const headLine: [number, number][] = [
    toCoord(0.72, 0.35),   // Start: thumb/index area
    toCoord(0.55, 0.38),   // Gentle curve
    toCoord(0.40, 0.42),   // Middle of palm
    toCoord(0.25, 0.46),   // Continue across
    toCoord(0.12, 0.50),   // End: pinky edge (slightly lower)
  ];

  // ===========================================
  // LIFE LINE: Curved arc around thumb mount
  // Wraps the thenar eminence (fleshy thumb base)
  // Should curve AROUND it, not too far to edge
  // ===========================================
  const lifeLine: [number, number][] = [
    toCoord(0.68, 0.28),   // Start: between thumb/index
    toCoord(0.78, 0.42),   // Curve toward thumb
    toCoord(0.82, 0.56),   // Apex of curve (not too far!)
    toCoord(0.78, 0.70),   // Continue curve back
    toCoord(0.68, 0.84),   // End: toward wrist
  ];

  // ===========================================
  // FATE LINE: Vertical from wrist to mid-palm
  // Runs up the center with subtle S-curve
  // ===========================================
  const fateLine: [number, number][] = [
    toCoord(0.42, 0.82),   // Start: near wrist, center
    toCoord(0.40, 0.62),   // Slight curve
    toCoord(0.44, 0.42),   // Back toward center
    toCoord(0.48, 0.28),   // End: below middle finger
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
