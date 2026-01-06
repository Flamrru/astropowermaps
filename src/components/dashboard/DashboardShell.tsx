"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type {
  DashboardState,
  DashboardAction,
  DashboardContextValue,
  Element,
} from "@/lib/dashboard-types";
import { DEV_DASHBOARD_STATE } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
// Note: calculateBigThree moved to server-side API (/api/user/birth-data)
// because astronomia library doesn't work client-side
import type { BirthData } from "@/lib/astro/types";
import BottomNav from "./BottomNav";
import { BYPASS_AUTH, USE_MOCK_DATA, TEST_USER_ID } from "@/lib/auth-bypass";
import { OnboardingProvider } from "@/components/onboarding";

// ============================================
// Initial State
// ============================================

const initialDashboardState: DashboardState = {
  isDevMode: false,
  isLoading: true,
  error: null,
  subscriber: null,
  birthData: null,
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
    case "SET_BIRTH_DATA":
      return { ...state, birthData: action.payload };
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
  /** Variant for different page layouts */
  variant?: "default" | "map";
  /** Callback when user interacts (for auto-hide nav on map) */
  onMapInteraction?: () => void;
}

export default function DashboardShell({
  children,
  variant = "default",
  onMapInteraction,
}: DashboardShellProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState);

  // Check for dev mode (mock data): ?dev=true or ?d=dashboard or USE_MOCK_DATA enabled
  // Note: BYPASS_AUTH is separate - it allows testing without login, but still uses real calculations
  const isDevMode =
    USE_MOCK_DATA ||
    searchParams.get("dev") === "true" ||
    searchParams.get("d") === "dashboard";

  // Initialize on mount - check auth or load dev data
  useEffect(() => {
    const initDashboard = async () => {
      if (isDevMode) {
        // Dev mode: Load mock data immediately (no API calls)
        console.log("🧪 Dashboard Dev Mode: Loading mock data");
        dispatch({ type: "HYDRATE_DEV_DATA", payload: DEV_DASHBOARD_STATE });
        return;
      }

      // Real mode: Use real calculations (either authenticated user or test user with BYPASS_AUTH)
      try {
        const supabase = createClient();
        let userId: string;
        let userEmail: string = "";

        if (BYPASS_AUTH) {
          // Auth bypass: Use test user but still fetch real data
          console.log("🔓 Auth Bypass: Using test user with REAL calculations");
          userId = TEST_USER_ID;
          userEmail = "test@stellaplus.app";
        } else {
          // Production: Check for authenticated user
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            // Not authenticated, redirect to login
            router.push("/login?redirect=/home");
            return;
          }
          userId = user.id;
          userEmail = user.email || "";
        }

        // Check user profile status
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("account_status, display_name, birth_date, birth_time, birth_place, birth_lat, birth_lng, birth_timezone, created_at")
          .eq("user_id", userId)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
        }

        // If no profile or pending setup, redirect to setup
        if (!profile || profile.account_status === "pending_setup") {
          router.push("/setup");
          return;
        }

        // User is authenticated and set up!
        // Fetch real AI-generated content
        dispatch({ type: "SET_DEV_MODE", payload: false });

        // Set subscriber info
        dispatch({
          type: "SET_SUBSCRIBER",
          payload: {
            id: userId,
            email: userEmail,
            displayName: profile.display_name || "Stargazer",
            subscriptionStatus: "active", // TODO: Check actual subscription
            createdAt: profile.created_at || new Date().toISOString(),
          },
        });

        // Fetch birth data and Big Three from server API
        // (astronomia library only works server-side)
        try {
          const birthDataRes = await fetch("/api/user/birth-data");
          if (birthDataRes.ok) {
            const birthDataResult = await birthDataRes.json();
            if (birthDataResult.success && birthDataResult.birthData && birthDataResult.bigThree) {
              dispatch({ type: "SET_BIRTH_DATA", payload: birthDataResult.birthData });
              dispatch({ type: "SET_BIG_THREE", payload: birthDataResult.bigThree });
              dispatch({ type: "SET_ELEMENT", payload: birthDataResult.bigThree.sun.element });
            }
          }
        } catch (birthDataError) {
          console.error("Birth data fetch error:", birthDataError);
          // Continue without birth data - dashboard still works, map won't
        }

        // Fetch AI content in parallel (non-blocking)
        try {
          const [scoreRes, forecastRes, ritualRes] = await Promise.all([
            fetch("/api/content/daily-score", { method: "POST" }),
            fetch("/api/content/weekly-forecast", { method: "POST" }),
            fetch("/api/content/ritual", { method: "POST" }),
          ]);

          // Parse responses
          const [dailyScore, weeklyForecast, ritual] = await Promise.all([
            scoreRes.ok ? scoreRes.json() : null,
            forecastRes.ok ? forecastRes.json() : null,
            ritualRes.ok ? ritualRes.json() : null,
          ]);

          // Update state with fetched data
          if (dailyScore) {
            dispatch({ type: "SET_DAILY_SCORE", payload: dailyScore });
          }
          if (weeklyForecast) {
            dispatch({ type: "SET_WEEKLY_FORECAST", payload: weeklyForecast });
            // Extract best days from forecast
            if (weeklyForecast.powerDays) {
              dispatch({
                type: "SET_BEST_DAYS",
                payload: weeklyForecast.powerDays.map((day: { day: string; date: string; energy: string; score: number }) => ({
                  date: day.date,
                  displayDate: day.date,
                  goal: "power" as const,
                  score: day.score,
                  reason: day.energy,
                })),
              });
            }
          }
          if (ritual) {
            dispatch({ type: "SET_TODAY_RITUAL", payload: ritual });
          }
        } catch (fetchError) {
          console.error("Error fetching AI content:", fetchError);
          // AI content failed but dashboard still works - birth data is already set
        }

        dispatch({ type: "SET_LOADING", payload: false });
      } catch (error) {
        console.error("Dashboard init error:", error);
        dispatch({ type: "SET_LOADING", payload: false });
        dispatch({
          type: "SET_ERROR",
          payload: "Something went wrong. Please try again.",
        });
      }
    };

    initDashboard();
  }, [isDevMode, router]);

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

  // Error state - show friendly retry screen
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}>
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">
              Connection Issue
            </h1>
            <p className="text-white/60 mb-6">
              We couldn&apos;t load your dashboard. This is usually temporary.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="gold-button-premium rounded-full px-6 py-3"
              >
                Try Again
              </button>
              <button
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                className="text-white/50 text-sm hover:text-white/70 transition-colors"
              >
                Sign out and try again
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Get sun sign for onboarding personalization
  const sunSign = state.bigThree?.sun?.sign || "Stargazer";

  return (
    <DashboardContext.Provider value={{ state, dispatch }}>
      <OnboardingProvider sunSign={sunSign}>
        {/* Dev mode indicator */}
        {isDevMode && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 text-black text-xs text-center py-1 font-medium">
            🧪 Mock Data Mode — Using hardcoded data (Leo ☀️ / Scorpio 🌙 / Virgo ⬆️)
          </div>
        )}
        {/* Auth bypass indicator (real calculations, test user) */}
        {!isDevMode && BYPASS_AUTH && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-500/90 text-black text-xs text-center py-1 font-medium">
            🔓 Auth Bypass — Using REAL calculations with test user
          </div>
        )}

        {/* Main container with element theming */}
        <div
          data-element={element}
          className="min-h-screen cosmic-bg"
          style={{ paddingTop: (isDevMode || BYPASS_AUTH) ? "24px" : 0 }}
        >
          {/* Star background */}
          <div className="stars-layer" />

          {/* Content */}
          <main
            className={`relative z-10 min-h-screen ${
              variant === "map" ? "" : "pb-28"
            }`}
          >
            {children}
          </main>

          {/* Bottom Navigation */}
          <BottomNav
            autoHide={variant === "map"}
            onInteraction={onMapInteraction}
          />
        </div>
      </OnboardingProvider>
    </DashboardContext.Provider>
  );
}
