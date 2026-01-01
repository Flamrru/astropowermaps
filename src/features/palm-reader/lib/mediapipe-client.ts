"use client";

/**
 * MediaPipe Hand Landmarker Client
 * Handles real-time hand detection in the browser
 */

import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision";
import type { HandLandmarks, HandDetectionResult, PalmBounds, LANDMARK_INDICES } from "../types";

// Singleton instance
let handLandmarker: HandLandmarker | null = null;
let isInitializing = false;

// MediaPipe model URL
const WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";
const MODEL_PATH = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

/**
 * Initialize the MediaPipe Hand Landmarker
 * Only initializes once (singleton pattern)
 */
export async function initializeHandLandmarker(): Promise<HandLandmarker> {
  // Return existing instance if available
  if (handLandmarker) {
    return handLandmarker;
  }

  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (handLandmarker) {
      return handLandmarker;
    }
  }

  isInitializing = true;

  try {
    console.log("🖐️ Initializing MediaPipe Hand Landmarker...");

    // Load the vision WASM files
    const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

    // Create the hand landmarker
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: MODEL_PATH,
        delegate: "GPU", // Use GPU acceleration if available
      },
      runningMode: "VIDEO", // For real-time camera feed
      numHands: 1, // We only need one hand
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    console.log("✅ MediaPipe Hand Landmarker initialized");
    return handLandmarker;
  } catch (error) {
    console.error("❌ Failed to initialize MediaPipe:", error);
    throw error;
  } finally {
    isInitializing = false;
  }
}

/**
 * Detect hand landmarks from a video frame
 * @param video - HTMLVideoElement with camera feed
 * @param timestamp - Current video timestamp in ms
 */
export function detectHandFromVideo(
  video: HTMLVideoElement,
  timestamp: number
): HandDetectionResult {
  if (!handLandmarker) {
    return {
      detected: false,
      landmarks: null,
      handedness: null,
      confidence: 0,
    };
  }

  try {
    const result = handLandmarker.detectForVideo(video, timestamp);
    return processHandResult(result);
  } catch (error) {
    console.error("Hand detection error:", error);
    return {
      detected: false,
      landmarks: null,
      handedness: null,
      confidence: 0,
    };
  }
}

/**
 * Detect hand landmarks from a static image
 * @param image - HTMLImageElement or ImageData
 */
export async function detectHandFromImage(
  imageElement: HTMLImageElement | HTMLCanvasElement
): Promise<HandDetectionResult> {
  if (!handLandmarker) {
    await initializeHandLandmarker();
  }

  if (!handLandmarker) {
    return {
      detected: false,
      landmarks: null,
      handedness: null,
      confidence: 0,
    };
  }

  try {
    // Switch to IMAGE mode for single image detection
    await handLandmarker.setOptions({ runningMode: "IMAGE" });
    const result = handLandmarker.detect(imageElement);
    // Switch back to VIDEO mode
    await handLandmarker.setOptions({ runningMode: "VIDEO" });
    return processHandResult(result);
  } catch (error) {
    console.error("Hand detection error:", error);
    return {
      detected: false,
      landmarks: null,
      handedness: null,
      confidence: 0,
    };
  }
}

/**
 * Process MediaPipe result into our format
 */
function processHandResult(result: HandLandmarkerResult): HandDetectionResult {
  if (!result.landmarks || result.landmarks.length === 0) {
    return {
      detected: false,
      landmarks: null,
      handedness: null,
      confidence: 0,
    };
  }

  // Get first hand's landmarks
  const landmarks: HandLandmarks = result.landmarks[0].map(lm => ({
    x: lm.x,
    y: lm.y,
    z: lm.z,
  }));

  // Get handedness (Left/Right)
  const handedness = result.handednesses?.[0]?.[0]?.categoryName as "Left" | "Right" | null;
  const confidence = result.handednesses?.[0]?.[0]?.score || 0;

  return {
    detected: true,
    landmarks,
    handedness,
    confidence,
  };
}

/**
 * Calculate palm bounding box from landmarks
 * This defines the region to crop for Roboflow
 */
export function calculatePalmBounds(landmarks: HandLandmarks): PalmBounds {
  // Key landmarks for palm region:
  // 0 = Wrist
  // 5 = Index MCP (base)
  // 9 = Middle MCP
  // 13 = Ring MCP
  // 17 = Pinky MCP

  const palmLandmarks = [
    landmarks[0],  // Wrist
    landmarks[1],  // Thumb CMC
    landmarks[5],  // Index MCP
    landmarks[9],  // Middle MCP
    landmarks[13], // Ring MCP
    landmarks[17], // Pinky MCP
  ];

  // Find bounding box
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (const lm of palmLandmarks) {
    minX = Math.min(minX, lm.x);
    maxX = Math.max(maxX, lm.x);
    minY = Math.min(minY, lm.y);
    maxY = Math.max(maxY, lm.y);
  }

  // Add padding (20% on each side)
  const width = maxX - minX;
  const height = maxY - minY;
  const paddingX = width * 0.2;
  const paddingY = height * 0.2;

  return {
    x: Math.max(0, minX - paddingX),
    y: Math.max(0, minY - paddingY),
    width: Math.min(1 - (minX - paddingX), width + paddingX * 2),
    height: Math.min(1 - (minY - paddingY), height + paddingY * 2),
  };
}

/**
 * Draw hand skeleton on canvas (for live preview)
 */
export function drawHandSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: HandLandmarks,
  canvasWidth: number,
  canvasHeight: number,
  options: {
    color?: string;
    lineWidth?: number;
    pointRadius?: number;
  } = {}
) {
  const {
    color = "#C9A227",
    lineWidth = 2,
    pointRadius = 4,
  } = options;

  // Finger connections (landmark indices)
  const connections = [
    // Thumb
    [0, 1], [1, 2], [2, 3], [3, 4],
    // Index
    [0, 5], [5, 6], [6, 7], [7, 8],
    // Middle
    [0, 9], [9, 10], [10, 11], [11, 12],
    // Ring
    [0, 13], [13, 14], [14, 15], [15, 16],
    // Pinky
    [0, 17], [17, 18], [18, 19], [19, 20],
    // Palm connections
    [5, 9], [9, 13], [13, 17],
  ];

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";

  // Draw connections
  for (const [i, j] of connections) {
    const p1 = landmarks[i];
    const p2 = landmarks[j];

    ctx.beginPath();
    ctx.moveTo(p1.x * canvasWidth, p1.y * canvasHeight);
    ctx.lineTo(p2.x * canvasWidth, p2.y * canvasHeight);
    ctx.stroke();
  }

  // Draw points
  ctx.fillStyle = color;
  for (const lm of landmarks) {
    ctx.beginPath();
    ctx.arc(
      lm.x * canvasWidth,
      lm.y * canvasHeight,
      pointRadius,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

/**
 * Check if the detected hand is an open palm (good for reading)
 */
export function isOpenPalm(landmarks: HandLandmarks): boolean {
  // Check if fingers are extended (not curled)
  // Compare fingertip Y to MCP (base) Y
  // For an open palm facing camera, fingertips should be above MCPs

  const fingerChecks = [
    // Index: tip (8) vs MCP (5)
    landmarks[8].y < landmarks[5].y,
    // Middle: tip (12) vs MCP (9)
    landmarks[12].y < landmarks[9].y,
    // Ring: tip (16) vs MCP (13)
    landmarks[16].y < landmarks[13].y,
    // Pinky: tip (20) vs MCP (17)
    landmarks[20].y < landmarks[17].y,
  ];

  // At least 3 fingers should be extended
  const extendedCount = fingerChecks.filter(Boolean).length;
  return extendedCount >= 3;
}

/**
 * Clean up MediaPipe resources
 */
export function closeHandLandmarker() {
  if (handLandmarker) {
    handLandmarker.close();
    handLandmarker = null;
  }
}
