"use client";

import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { CalendarEvent, GoalCategory, BestDay } from "@/lib/dashboard-types";
import type { CalendarTabType } from "./CalendarTabs";
import BottomNav from "@/components/dashboard/BottomNav";
import StellaFloatingButton from "@/components/dashboard/StellaFloatingButton";
import { OnboardingProvider } from "@/components/onboarding";
import { usePageView } from "@/lib/hooks/useTrack";

// ============================================
// Calendar State Types
// ============================================

interface CalendarData {
  month: string;
  monthKey: string;
  events: CalendarEvent[];
  daysInMonth: number;
  firstDayOfWeek: number;
  // Best day picker data
  selectedGoal: GoalCategory | null;
  bestDaysForGoal: BestDay[];
}

interface CalendarState {
  isLoading: boolean;
  error: string | null;
  data: CalendarData | null;
  currentMonthKey: string;
  selectedGoal: GoalCategory | null;
}

interface StellaContext {
  displayMessage: string;
  hiddenContext: string;
}

interface CalendarContextValue {
  state: CalendarState;
  navigateMonth: (direction: "prev" | "next") => void;
  goToToday: () => void;
  setSelectedGoal: (goal: GoalCategory | null) => void;
  bestDaysForGoal: BestDay[];
  openStellaWithContext: (context: StellaContext) => void;
  // Tab state for Stella context awareness
  activeCalendarTab: CalendarTabType;
  setActiveCalendarTab: (tab: CalendarTabType) => void;
}

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function useCalendar() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error("useCalendar must be used within CalendarShell");
  }
  return context;
}

// ============================================
// Loading Animation - Celestial Orrery
// ============================================

// Fixed particle positions to avoid hydration mismatch
const PARTICLES = [
  { id: 0, size: 2.5, x: 15, y: 20, duration: 5, delay: 0 },
  { id: 1, size: 1.5, x: 85, y: 35, duration: 6, delay: 0.5 },
  { id: 2, size: 3, x: 25, y: 70, duration: 4.5, delay: 1 },
  { id: 3, size: 2, x: 70, y: 15, duration: 5.5, delay: 1.5 },
  { id: 4, size: 1.8, x: 45, y: 85, duration: 6.5, delay: 0.3 },
  { id: 5, size: 2.2, x: 90, y: 60, duration: 5, delay: 0.8 },
  { id: 6, size: 1.2, x: 10, y: 50, duration: 7, delay: 1.2 },
  { id: 7, size: 2.8, x: 55, y: 25, duration: 4, delay: 0.6 },
  { id: 8, size: 1.6, x: 35, y: 90, duration: 5.5, delay: 1.8 },
  { id: 9, size: 2.4, x: 75, y: 45, duration: 6, delay: 0.2 },
  { id: 10, size: 1.4, x: 5, y: 80, duration: 5, delay: 1.4 },
  { id: 11, size: 3.2, x: 60, y: 10, duration: 4.5, delay: 0.9 },
];

function CalendarLoader() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background: `
          radial-gradient(ellipse at 50% 40%, rgba(201, 162, 39, 0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 30% 70%, rgba(139, 92, 246, 0.04) 0%, transparent 40%),
          #050510
        `,
      }}
    >
      {/* Floating gold particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              background: "radial-gradient(circle, #E8C547 0%, transparent 70%)",
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main orrery container */}
      <motion.div
        className="relative"
        style={{ width: 140, height: 140 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Outer orbital ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: "1px solid rgba(201, 162, 39, 0.15)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {/* Orbital markers */}
          {[0, 90, 180, 270].map((deg) => (
            <div
              key={deg}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: "rgba(201, 162, 39, 0.4)",
                left: "50%",
                top: "50%",
                transform: `rotate(${deg}deg) translateY(-70px) translateX(-3px)`,
              }}
            />
          ))}
        </motion.div>

        {/* Middle orbital ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 100,
            height: 100,
            left: 20,
            top: 20,
            border: "1px solid rgba(232, 197, 71, 0.2)",
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          {/* Orbital accent */}
          <div
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: "linear-gradient(135deg, #E8C547 0%, #C9A227 100%)",
              boxShadow: "0 0 8px rgba(232, 197, 71, 0.6)",
              left: "50%",
              top: -4,
              transform: "translateX(-4px)",
            }}
          />
        </motion.div>

        {/* Inner orbital ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 60,
            height: 60,
            left: 40,
            top: 40,
            border: "1px dashed rgba(201, 162, 39, 0.25)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Central luminous orb */}
        <div
          className="absolute rounded-full"
          style={{
            width: 32,
            height: 32,
            left: 54,
            top: 54,
            background: "radial-gradient(circle at 30% 30%, #F5E6A3 0%, #E8C547 40%, #C9A227 100%)",
            boxShadow: `
              0 0 20px rgba(232, 197, 71, 0.4),
              0 0 40px rgba(201, 162, 39, 0.2),
              0 0 60px rgba(201, 162, 39, 0.1),
              inset 0 0 10px rgba(255, 255, 255, 0.3)
            `,
          }}
        >
          {/* Inner glow pulse */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 60%)",
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Ethereal outer glow */}
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 180,
            height: 180,
            left: -20,
            top: -20,
            background: "radial-gradient(circle, rgba(201, 162, 39, 0.15) 0%, transparent 70%)",
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Loading text */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <motion.p
          className="text-sm tracking-[0.2em] uppercase"
          style={{
            background: "linear-gradient(90deg, rgba(201, 162, 39, 0.6) 0%, #E8C547 50%, rgba(201, 162, 39, 0.6) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "200% 0%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          Reading the stars
        </motion.p>
      </motion.div>
    </div>
  );
}

// ============================================
// Calendar Shell Component
// ============================================

interface CalendarShellProps {
  children: ReactNode;
}

export default function CalendarShell({ children }: CalendarShellProps) {
  const router = useRouter();
  const [state, setState] = useState<CalendarState>({
    isLoading: true,
    error: null,
    data: null,
    currentMonthKey: getMonthKey(new Date()),
    selectedGoal: null,
  });

  // Track page view
  usePageView("calendar");

  // Stella chat integration - for "Ask Stella about this day"
  const [stellaContext, setStellaContext] = useState<StellaContext | null>(null);

  // Tab state lifted from CalendarView for Stella context awareness
  const [activeCalendarTab, setActiveCalendarTab] = useState<CalendarTabType>("month");

  // Listen for onboarding tab switch event
  useEffect(() => {
    const handleTabSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<CalendarTabType>;
      if (customEvent.detail) {
        setActiveCalendarTab(customEvent.detail);
      }
    };

    window.addEventListener("stella-switch-tab", handleTabSwitch);
    return () => window.removeEventListener("stella-switch-tab", handleTabSwitch);
  }, []);

  // Callback to open Stella with pre-filled context
  const openStellaWithContext = (context: StellaContext) => {
    setStellaContext(context);
  };

  // Clear context after it's consumed by StellaFloatingButton
  const clearStellaContext = () => {
    setStellaContext(null);
  };

  useEffect(() => {
    loadCalendarData(state.currentMonthKey, state.selectedGoal);
  }, []);

  useEffect(() => {
    if (!state.isLoading && state.data) {
      loadCalendarData(state.currentMonthKey, state.selectedGoal);
    }
  }, [state.currentMonthKey, state.selectedGoal]);

  function getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function setSelectedGoal(goal: GoalCategory | null) {
    setState((prev) => ({ ...prev, selectedGoal: goal }));
  }

  async function loadCalendarData(monthKey: string, goal: GoalCategory | null = null) {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const goalParam = goal ? `&goal=${goal}` : "";
      const response = await fetch(`/api/content/calendar?month=${monthKey}${goalParam}`);

      if (response.status === 401) {
        router.push("/login?redirect=/calendar");
        return;
      }

      if (response.status === 404) {
        router.push("/setup");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load calendar");
      }

      const data = await response.json();

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
        data,
        currentMonthKey: monthKey,
      }));
    } catch (error) {
      console.error("Calendar load error:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to load calendar. Please try again.",
      }));
    }
  }

  function navigateMonth(direction: "prev" | "next") {
    const [year, month] = state.currentMonthKey.split("-").map(Number);
    const newDate = new Date(year, month - 1 + (direction === "next" ? 1 : -1));
    const newMonthKey = getMonthKey(newDate);
    setState((prev) => ({ ...prev, currentMonthKey: newMonthKey }));
  }

  function goToToday() {
    const todayKey = getMonthKey(new Date());
    if (todayKey !== state.currentMonthKey) {
      setState((prev) => ({ ...prev, currentMonthKey: todayKey }));
    }
  }

  if (state.isLoading && !state.data) {
    return <CalendarLoader />;
  }

  if (state.error && !state.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050510] p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-red-400/80 mb-4">{state.error}</div>
          <button
            onClick={() => loadCalendarData(state.currentMonthKey)}
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              background: "rgba(201, 162, 39, 0.2)",
              border: "1px solid rgba(201, 162, 39, 0.3)",
              color: "#E8C547",
            }}
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // Get best days from the current data, or empty array if not available
  const bestDaysForGoal = state.data?.bestDaysForGoal || [];

  return (
    <CalendarContext.Provider value={{ state, navigateMonth, goToToday, setSelectedGoal, bestDaysForGoal, openStellaWithContext, activeCalendarTab, setActiveCalendarTab }}>
      <OnboardingProvider>
        <div
          className="min-h-screen pb-24"
          style={{
            background: `
              radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 20% 80%, rgba(201, 162, 39, 0.05) 0%, transparent 40%),
              #050510
            `,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentMonthKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {children}
            </motion.div>
          </AnimatePresence>

          {/* Stella chat button - with context for "Ask Stella about this day" */}
          <StellaFloatingButton
            externalContext={stellaContext}
            onContextConsumed={clearStellaContext}
            viewHint={
              activeCalendarTab === "transits" ? "life-transits" :
              activeCalendarTab === "2026" ? "2026-report" :
              "calendar"
            }
          />

          {/* Bottom navigation */}
          <BottomNav />
        </div>
      </OnboardingProvider>
    </CalendarContext.Provider>
  );
}
