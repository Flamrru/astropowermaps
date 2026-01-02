"use client";

import { createContext, useContext } from "react";
import type {
  PalmReaderState,
  PalmStep,
  PalmAnalysisResult,
  ChatMessage,
  HandLandmarks,
  PalmBounds,
} from "../types";

// Generate a simple unique ID (works both client and server)
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// ============================================
// Actions
// ============================================

export type PalmAction =
  | { type: "SET_STEP"; payload: PalmStep }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_CAPTURED_IMAGE"; payload: string }
  | { type: "SET_HAND_LANDMARKS"; payload: HandLandmarks | null }
  | { type: "SET_PALM_BOUNDS"; payload: PalmBounds | null }
  | { type: "SET_HANDEDNESS"; payload: "Left" | "Right" | null }
  | { type: "SET_CAPTURING"; payload: boolean }
  | { type: "SET_CAMERA_ERROR"; payload: string }
  | { type: "START_ANALYSIS" }
  | { type: "SET_ANALYSIS_PROGRESS"; payload: number }
  | { type: "SET_ANALYSIS_RESULT"; payload: PalmAnalysisResult | null }
  | { type: "SET_ANALYSIS_ERROR"; payload: string }
  | { type: "ADD_CHAT_MESSAGE"; payload: ChatMessage }
  | { type: "SET_CHAT_LOADING"; payload: boolean }
  | { type: "RESET" };

// ============================================
// Initial State
// ============================================

export const initialPalmState: PalmReaderState = {
  step: 1,
  capturedImage: null,
  handLandmarks: null,
  palmBounds: null,
  handedness: null,
  isCapturing: false,
  cameraError: null,
  isAnalyzing: false,
  analysisProgress: 0,
  analysisResult: null,
  analysisError: null,
  chatMessages: [],
  isChatLoading: false,
  sessionId: "",
};

// Create initial state with session ID (call this on client side)
export function createInitialState(): PalmReaderState {
  return {
    ...initialPalmState,
    sessionId: generateId(),
  };
}

// ============================================
// Reducer
// ============================================

export function palmReducer(
  state: PalmReaderState,
  action: PalmAction
): PalmReaderState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, step: action.payload };

    case "NEXT_STEP":
      return { ...state, step: Math.min(state.step + 1, 5) as PalmStep };

    case "PREV_STEP":
      return { ...state, step: Math.max(state.step - 1, 1) as PalmStep };

    case "SET_CAPTURED_IMAGE":
      return { ...state, capturedImage: action.payload };

    case "SET_HAND_LANDMARKS":
      return { ...state, handLandmarks: action.payload };

    case "SET_PALM_BOUNDS":
      return { ...state, palmBounds: action.payload };

    case "SET_HANDEDNESS":
      return { ...state, handedness: action.payload };

    case "SET_CAPTURING":
      return { ...state, isCapturing: action.payload };

    case "SET_CAMERA_ERROR":
      return { ...state, cameraError: action.payload };

    case "START_ANALYSIS":
      return {
        ...state,
        isAnalyzing: true,
        analysisProgress: 0,
        analysisError: null,
      };

    case "SET_ANALYSIS_PROGRESS":
      return { ...state, analysisProgress: action.payload };

    case "SET_ANALYSIS_RESULT":
      return {
        ...state,
        isAnalyzing: false,
        analysisProgress: 100,
        analysisResult: action.payload,
      };

    case "SET_ANALYSIS_ERROR":
      return {
        ...state,
        isAnalyzing: false,
        analysisError: action.payload,
      };

    case "ADD_CHAT_MESSAGE":
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      };

    case "SET_CHAT_LOADING":
      return { ...state, isChatLoading: action.payload };

    case "RESET":
      return createInitialState();

    default:
      return state;
  }
}

// ============================================
// Context
// ============================================

interface PalmContextType {
  state: PalmReaderState;
  dispatch: React.Dispatch<PalmAction>;
}

export const PalmContext = createContext<PalmContextType | null>(null);

export function usePalm() {
  const context = useContext(PalmContext);
  if (!context) {
    throw new Error("usePalm must be used within PalmReaderShell");
  }
  return context;
}

// ============================================
// Step Labels (for progress indicator)
// ============================================

export const PALM_STEP_LABELS: Record<PalmStep, string> = {
  1: "Welcome",
  2: "Capture",
  3: "Analyzing",
  4: "Results",
  5: "Chat",
};
