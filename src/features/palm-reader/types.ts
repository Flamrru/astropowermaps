// ============================================
// MediaPipe Hand Landmarks (21 points)
// ============================================

export interface HandLandmark {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  z: number; // Depth (wrist = origin)
}

// 21 landmarks per hand
export type HandLandmarks = HandLandmark[];

// Landmark indices for reference
export const LANDMARK_INDICES = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
} as const;

export interface HandDetectionResult {
  detected: boolean;
  landmarks: HandLandmarks | null;
  handedness: "Left" | "Right" | null;
  confidence: number;
}

// Palm bounding box calculated from landmarks
export interface PalmBounds {
  x: number;      // Top-left X (0-1)
  y: number;      // Top-left Y (0-1)
  width: number;  // Width (0-1)
  height: number; // Height (0-1)
}

// ============================================
// Roboflow Line Detection Response
// ============================================

export interface RoboflowPrediction {
  x: number;        // Center X in pixels
  y: number;        // Center Y in pixels
  width: number;    // Box width in pixels
  height: number;   // Box height in pixels
  confidence: number;
  class: string;    // "heart", "head", "life", "fate", etc.
  points?: { x: number; y: number }[]; // For segmentation/keypoint models
}

export interface RoboflowResponse {
  predictions: RoboflowPrediction[];
  image: {
    width: number;
    height: number;
  };
}

// ============================================
// Palm Line Detection (Legacy + New)
// ============================================

export interface BoundingBox {
  x: number; // Top-left X (0-1 normalized)
  y: number; // Top-left Y (0-1 normalized)
  width: number; // Width (0-1 normalized)
  height: number; // Height (0-1 normalized)
}

export type PalmLineType =
  | "heart" // Upper horizontal line
  | "head" // Middle horizontal line
  | "life" // Curved line around thumb
  | "fate" // Vertical line (center)
  | "sun" // Below ring finger
  | "marriage"; // Small lines below pinky

export interface DetectedLine {
  type: PalmLineType;
  boundingBox?: BoundingBox; // Legacy format
  points?: [number, number][]; // New format: array of [x, y] normalized coordinates
  confidence: number; // 0-1
  curvature?: "straight" | "curved" | "forked";
  breaks?: number; // Number of breaks in line
  depth?: "faint" | "medium" | "deep";
}

export interface GeminiAnalysisResult {
  success: boolean;
  lines: DetectedLine[];
  handType: "left" | "right";
  imageQuality: "poor" | "acceptable" | "good";
  error?: string;
  // Debug: landmarks used for line calculation
  landmarks?: { x: number; y: number }[];
}

// ============================================
// Palm Reading Content (OpenAI response)
// ============================================

export interface TraitScore {
  id: string;
  label: string; // "Love Destiny", "Career Path"
  score: number; // 0-100
  description: string; // Short explanation
  lineSource: PalmLineType; // Which palm line this relates to
}

export interface PalmReading {
  summary: string; // 2-3 sentence overview
  traits: TraitScore[]; // Array of scored traits
  insights: {
    love: string;
    career: string;
    health: string;
    spirituality: string;
  };
  advice: string; // Closing guidance
  stellaQuote: string; // Mystical quote from Stella
}

export interface OpenAIReadingResult {
  success: boolean;
  reading: PalmReading;
  error?: string;
}

// ============================================
// Combined Analysis Result
// ============================================

export interface PalmAnalysisResult {
  id: string; // UUID for this reading
  timestamp: string; // ISO date
  imageBase64: string; // Original captured image
  geminiResult: GeminiAnalysisResult;
  openaiResult: OpenAIReadingResult;
}

// ============================================
// Chat Types
// ============================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  readingId: string;
  message: string;
  context: PalmReading; // Previous reading for context
}

// ============================================
// State Management
// ============================================

export type PalmStep = 1 | 2 | 3 | 4 | 5;

export interface PalmReaderState {
  step: PalmStep;

  // Capture state
  capturedImage: string | null; // Base64 data URL
  handLandmarks: HandLandmarks | null; // MediaPipe landmarks
  palmBounds: PalmBounds | null; // Calculated palm region
  handedness: "Left" | "Right" | null; // Which hand was detected
  isCapturing: boolean;
  cameraError: string | null;

  // Analysis state
  isAnalyzing: boolean;
  analysisProgress: number; // 0-100
  analysisResult: PalmAnalysisResult | null;
  analysisError: string | null;

  // Chat state
  chatMessages: ChatMessage[];
  isChatLoading: boolean;

  // Session
  sessionId: string;
}

// ============================================
// Default Trait Configuration
// ============================================

export const DEFAULT_TRAITS: Omit<TraitScore, "score" | "description">[] = [
  { id: "love-destiny", label: "Love Destiny", lineSource: "heart" },
  { id: "career-path", label: "Career Path", lineSource: "fate" },
  { id: "inner-wisdom", label: "Inner Wisdom", lineSource: "head" },
  { id: "life-force", label: "Life Force", lineSource: "life" },
  { id: "heart-connection", label: "Heart Connection", lineSource: "heart" },
];

// ============================================
// Line Colors for Canvas Overlay
// ============================================

export const LINE_COLORS: Record<PalmLineType, string> = {
  heart: "#E8C547", // Gold
  head: "#9B7ED9", // Purple
  life: "#6EE7B7", // Green
  fate: "#F472B6", // Pink
  sun: "#FCD34D", // Yellow
  marriage: "#E8A4C9", // Light pink
};
