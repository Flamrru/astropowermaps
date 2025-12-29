"use client";

import { createContext, useContext } from "react";
import { UTMParams } from "./quiz-state";
import type { AstrocartographyResult } from "./astro/types";

// Re-export types that consumers need
export type { AstrocartographyResult };

// Types for birth data (local to reveal flow)
export interface BirthLocation {
  name: string;
  lat: number;
  lng: number;
  timezone: string; // IANA timezone e.g. "America/New_York"
}

export interface BirthData {
  date: string; // "1990-05-15"
  time: string; // "14:30" or "12:00"
  timeUnknown: boolean;
  location: BirthLocation;
  birthDatetimeUtc?: string; // Computed UTC for consistency
}

// Map highlight for onboarding animations
export interface MapHighlight {
  kind: "planetLine" | "lineType" | "city" | "none";
  ids: string[]; // planet names, line types, or city names
  pulse?: boolean;
}

// Simplified forecast types for reveal flow state display
// (simpler than the full YearForecast from transit-types.ts)
export interface MonthForecast {
  month: number;
  scores: {
    love: number;
    career: number;
    growth: number;
    home: number;
  };
  overall: number;
  isPowerMonth: boolean;
}

export interface YearForecast {
  year: number;
  months: MonthForecast[];
  powerMonths: number[]; // Top 3 months
  avoidMonths: number[]; // Bottom 3 months
}

// Main reveal state
export interface RevealState {
  stepIndex: number; // 1-10

  // User data (from quiz)
  email: string;
  session_id: string;
  utm: UTMParams;
  quizAnswers: {
    q1: string | null;
    q2: string[];
  };

  // Birth data (collected in step 1)
  birthData: BirthData | null;

  // Calculated data
  astroData: AstrocartographyResult | null;
  forecastData: YearForecast | null;

  // Map highlight state (for onboarding animations)
  mapHighlight: MapHighlight | null;

  // UI state
  isLoading: boolean;
  hasEmail: boolean; // True if coming from quiz with email

  // Purchase state
  paymentComplete: boolean;
  orderId: string | null;
}

export type RevealAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_BIRTH_DATA"; payload: BirthData }
  | { type: "SET_ASTRO_DATA"; payload: AstrocartographyResult }
  | { type: "SET_FORECAST_DATA"; payload: YearForecast }
  | { type: "SET_MAP_HIGHLIGHT"; payload: MapHighlight | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_PAYMENT_COMPLETE"; payload: { orderId: string } }
  | {
      type: "HYDRATE";
      payload: {
        email: string;
        session_id: string;
        utm?: UTMParams;
        quizAnswers?: { q1: string | null; q2: string[] };
      };
    };

export const initialRevealState: RevealState = {
  stepIndex: 1,
  email: "",
  session_id: "",
  utm: {},
  quizAnswers: { q1: null, q2: [] },
  birthData: null,
  astroData: null,
  forecastData: null,
  mapHighlight: null,
  isLoading: false,
  hasEmail: false,
  paymentComplete: false,
  orderId: null,
};

export function revealReducer(
  state: RevealState,
  action: RevealAction
): RevealState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, stepIndex: action.payload };

    case "NEXT_STEP":
      return { ...state, stepIndex: Math.min(state.stepIndex + 1, 10) };

    case "PREV_STEP":
      return { ...state, stepIndex: Math.max(state.stepIndex - 1, 1) };

    case "SET_BIRTH_DATA":
      return { ...state, birthData: action.payload };

    case "SET_ASTRO_DATA":
      return { ...state, astroData: action.payload };

    case "SET_FORECAST_DATA":
      return { ...state, forecastData: action.payload };

    case "SET_MAP_HIGHLIGHT":
      return { ...state, mapHighlight: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_EMAIL":
      // Don't set hasEmail here - it should only be true when coming from quiz
      // or after form submission. Setting it on every keystroke hides the field!
      return { ...state, email: action.payload };

    case "SET_PAYMENT_COMPLETE":
      return {
        ...state,
        paymentComplete: true,
        orderId: action.payload.orderId,
      };

    case "HYDRATE":
      return {
        ...state,
        email: action.payload.email,
        session_id: action.payload.session_id,
        utm: action.payload.utm || {},
        quizAnswers: action.payload.quizAnswers || { q1: null, q2: [] },
        hasEmail: true,
      };

    default:
      return state;
  }
}

// Context
interface RevealContextType {
  state: RevealState;
  dispatch: React.Dispatch<RevealAction>;
}

export const RevealContext = createContext<RevealContextType | null>(null);

export function useReveal() {
  const context = useContext(RevealContext);
  if (!context) {
    throw new Error("useReveal must be used within a RevealProvider");
  }
  return context;
}

// Helper to calculate map opacity based on step
export function getMapOpacity(step: number): number {
  if (step === 1) return 0.3; // Subtle background during birth data entry
  if (step === 2) return 0.4; // Slightly more visible during generation
  if (step === 3) return 1; // Full opacity during reveal
  if (step >= 4 && step <= 7) return 0.45; // Increased visibility during onboarding
  if (step >= 8) return 0.2; // More dimmed during paywall
  return 0.3;
}
