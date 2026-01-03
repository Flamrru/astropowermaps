"use client";

import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { CalendarEvent } from "@/lib/dashboard-types";

// ============================================
// Calendar State Types
// ============================================

interface CalendarData {
  month: string;
  monthKey: string;
  events: CalendarEvent[];
  daysInMonth: number;
  firstDayOfWeek: number;
}

interface CalendarState {
  isLoading: boolean;
  error: string | null;
  data: CalendarData | null;
  currentMonthKey: string;
}

interface CalendarContextValue {
  state: CalendarState;
  navigateMonth: (direction: "prev" | "next") => void;
  goToToday: () => void;
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
// Loading Animation
// ============================================

function CalendarLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050510]">
      <motion.div
        className="relative w-16 h-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Moon phases rotating */}
        {["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"].map((moon, i) => (
          <motion.div
            key={i}
            className="absolute text-xl"
            style={{
              left: "50%",
              top: "50%",
            }}
            animate={{
              x: Math.cos((i / 8) * Math.PI * 2 - Math.PI / 2) * 24 - 10,
              y: Math.sin((i / 8) * Math.PI * 2 - Math.PI / 2) * 24 - 10,
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              opacity: {
                duration: 2,
                repeat: Infinity,
                delay: i * 0.25,
              },
            }}
          >
            {moon}
          </motion.div>
        ))}
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
  });

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  useEffect(() => {
    if (!state.isLoading) {
      loadCalendarData(state.currentMonthKey);
    }
  }, [state.currentMonthKey]);

  function getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  async function checkAuthAndLoad() {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      router.push("/login?redirect=/calendar");
      return;
    }

    await loadCalendarData(state.currentMonthKey);
  }

  async function loadCalendarData(monthKey: string) {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/content/calendar?month=${monthKey}`);

      if (!response.ok) {
        throw new Error("Failed to load calendar");
      }

      const data = await response.json();

      setState({
        isLoading: false,
        error: null,
        data,
        currentMonthKey: monthKey,
      });
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

  return (
    <CalendarContext.Provider value={{ state, navigateMonth, goToToday }}>
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
      </div>
    </CalendarContext.Provider>
  );
}
