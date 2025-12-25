"use client";

import { createContext, useContext } from "react";
import { v4 as uuidv4 } from "uuid";

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export interface QuizState {
  stepIndex: number;
  answer_q1: string | null;
  answer_q2: string[]; // Multi-select array
  email: string;
  utm: UTMParams;
  session_id: string;
}

export type QuizAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_ANSWER_Q1"; payload: string }
  | { type: "TOGGLE_ANSWER_Q2"; payload: string } // Toggle for multi-select
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_UTM"; payload: UTMParams };

export const initialQuizState: QuizState = {
  stepIndex: 1,
  answer_q1: null,
  answer_q2: [], // Empty array for multi-select
  email: "",
  utm: {},
  session_id: typeof window !== "undefined" ? uuidv4() : "",
};

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, stepIndex: action.payload };
    case "NEXT_STEP":
      return { ...state, stepIndex: Math.min(state.stepIndex + 1, 10) };
    case "PREV_STEP":
      return { ...state, stepIndex: Math.max(state.stepIndex - 1, 1) };
    case "SET_ANSWER_Q1":
      return { ...state, answer_q1: action.payload };
    case "TOGGLE_ANSWER_Q2":
      // Toggle: add if not present, remove if present
      const isSelected = state.answer_q2.includes(action.payload);
      return {
        ...state,
        answer_q2: isSelected
          ? state.answer_q2.filter((item) => item !== action.payload)
          : [...state.answer_q2, action.payload],
      };
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "SET_UTM":
      return { ...state, utm: action.payload };
    default:
      return state;
  }
}

interface QuizContextType {
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
}

export const QuizContext = createContext<QuizContextType | null>(null);

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}
