"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import type {
  DashboardState,
  DashboardAction,
  DashboardContextValue,
  Element,
} from "@/lib/dashboard-types";
import { DEV_DASHBOARD_STATE } from "@/lib/mock-data";
import BottomNav from "./BottomNav";

// ============================================
// Initial State
// ============================================

const initialDashboardState: DashboardState = {
  isDevMode: false,
  isLoading: true,
  error: null,
  subscriber: null,
  bigThree: null,
  element: null,
  dailyScore: null,
  weeklyForecast: null,
  bestDays: [],
  todayRitual: null,
  chatMessages: [],
  quickReplies: [],
  isChatOpen: false,
};

// ============================================
// Reducer
// ============================================

function dashboardReducer(
  state: DashboardState,
  action: DashboardAction
): DashboardState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "SET_DEV_MODE":
      return { ...state, isDevMode: action.payload };
    case "SET_SUBSCRIBER":
      return { ...state, subscriber: action.payload };
    case "SET_BIG_THREE":
      return { ...state, bigThree: action.payload };
    case "SET_ELEMENT":
      return { ...state, element: action.payload };
    case "SET_DAILY_SCORE":
      return { ...state, dailyScore: action.payload };
    case "SET_WEEKLY_FORECAST":
      return { ...state, weeklyForecast: action.payload };
    case "SET_BEST_DAYS":
      return { ...state, bestDays: action.payload };
    case "SET_TODAY_RITUAL":
      return { ...state, todayRitual: action.payload };
    case "TOGGLE_CHAT":
      return {
        ...state,
        isChatOpen: action.payload ?? !state.isChatOpen,
      };
    case "ADD_CHAT_MESSAGE":
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      };
    case "SET_QUICK_REPLIES":
      return { ...state, quickReplies: action.payload };
    case "HYDRATE_DEV_DATA":
      return { ...state, ...action.payload, isLoading: false };
    default:
      return state;
  }
}

// ============================================
// Context
// ============================================

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardShell");
  }
  return context;
}

// ============================================
// Shell Component
// ============================================

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const searchParams = useSearchParams();
  const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState);

  // Check for dev mode: ?dev=true or ?d=dashboard
  const isDevMode =
    searchParams.get("dev") === "true" ||
    searchParams.get("d") === "dashboard";

  // Initialize on mount
  useEffect(() => {
    if (isDevMode) {
      // Dev mode: Load mock data immediately
      console.log("🧪 Dashboard Dev Mode: Loading mock data");
      dispatch({ type: "HYDRATE_DEV_DATA", payload: DEV_DASHBOARD_STATE });
    } else {
      // Production: Would fetch real user data here
      // For now, show loading then error since auth isn't implemented
      dispatch({ type: "SET_DEV_MODE", payload: false });
      dispatch({ type: "SET_LOADING", payload: false });
      dispatch({
        type: "SET_ERROR",
        payload: "Please use ?dev=true to preview the dashboard",
      });
    }
  }, [isDevMode]);

  // Determine element for theming (based on Sun sign)
  const element: Element | null = state.bigThree?.sun?.element ?? null;

  // Loading state
  if (state.isLoading) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center">
        <div className="stars-layer" />
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-12 h-12 border-2 border-gold-main border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading your cosmic dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // Error state (non-dev mode without auth)
  if (state.error && !isDevMode) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center p-6">
        <div className="stars-layer" />
        <motion.div
          className="relative z-10 text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="glass-card rounded-2xl p-8">
            <h1 className="heading-display text-2xl text-gold mb-4">
              Dashboard Preview
            </h1>
            <p className="text-white/70 mb-6">{state.error}</p>
            <a
              href="/dashboard?dev=true"
              className="gold-button-premium rounded-full px-6 py-3 inline-block"
            >
              Enter Dev Mode
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={{ state, dispatch }}>
      {/* Dev mode indicator */}
      {isDevMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 text-black text-xs text-center py-1 font-medium">
          🧪 Dev Mode — Using mock data (Leo ☀️ / Scorpio 🌙 / Virgo ⬆️)
        </div>
      )}

      {/* Main container with element theming */}
      <div
        data-element={element}
        className="min-h-screen cosmic-bg"
        style={{ paddingTop: isDevMode ? "24px" : 0 }}
      >
        {/* Star background */}
        <div className="stars-layer" />

        {/* Content */}
        <main className="relative z-10 min-h-screen pb-28">
          {children}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </DashboardContext.Provider>
  );
}
