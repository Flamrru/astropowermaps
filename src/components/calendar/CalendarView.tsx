"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCalendar } from "./CalendarShell";
import CalendarDay from "./CalendarDay";
import DayDetailModal from "./DayDetailModal";
import GoalPicker, { GOAL_CONFIG } from "./GoalPicker";
import BestDaysPanel from "./BestDaysPanel";
import CalendarTabs, { type CalendarTabType } from "./CalendarTabs";
import LifeTransitsView from "./LifeTransitsView";
import Report2026View from "./Report2026View";
import type { CalendarEvent } from "@/lib/dashboard-types";

/**
 * CalendarView
 *
 * Monthly calendar grid with cosmic styling.
 * Shows power days, moon phases, and rest days.
 * Includes tabs to switch between monthly view and life transits.
 */
export default function CalendarView() {
  const router = useRouter();
  const { state, navigateMonth, goToToday, setSelectedGoal, bestDaysForGoal, openStellaWithContext, activeCalendarTab, setActiveCalendarTab } = useCalendar();
  const { data, isLoading, selectedGoal } = state;

  // Use tab state from context (lifted for Stella awareness)
  const activeTab = activeCalendarTab;
  const setActiveTab = setActiveCalendarTab;
  const [selectedDay, setSelectedDay] = useState<{
    date: string;
    dayNumber: number;
  } | null>(null);

  // Create a set of best day dates for quick lookup
  const bestDayDates = useMemo(() => {
    return new Set(bestDaysForGoal.map((d) => d.date));
  }, [bestDaysForGoal]);

  // If 2026 Report tab is active, render that view
  if (activeTab === "2026") {
    return (
      <div className="px-4 pt-6">
        {/* Tab switcher at top */}
        <div className="mb-4">
          <CalendarTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <Report2026View />
      </div>
    );
  }

  // If Life Transits tab is active, render that view
  if (activeTab === "transits") {
    return (
      <div className="px-4 pt-6">
        {/* Tab switcher at top */}
        <div className="mb-4">
          <CalendarTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <LifeTransitsView />
      </div>
    );
  }

  if (!data) return null;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const [currentYear, currentMonth] = data.monthKey.split("-").map(Number);
  const isCurrentMonth =
    today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth;

  // Build calendar grid
  const days: Array<{
    dayNumber: number;
    date: string;
    events: CalendarEvent[];
    isToday: boolean;
    isCurrentMonth: boolean;
  }> = [];

  // Pad with empty days at start (adjust for Monday start)
  const adjustedFirstDay = data.firstDayOfWeek === 0 ? 6 : data.firstDayOfWeek - 1;
  for (let i = 0; i < adjustedFirstDay; i++) {
    const prevMonthDay = new Date(currentYear, currentMonth - 1, -adjustedFirstDay + i + 1);
    days.push({
      dayNumber: prevMonthDay.getDate(),
      date: prevMonthDay.toISOString().split("T")[0],
      events: [],
      isToday: false,
      isCurrentMonth: false,
    });
  }

  // Add days of the month
  for (let i = 1; i <= data.daysInMonth; i++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const dayEvents = data.events.filter((e) => e.date === dateStr);

    days.push({
      dayNumber: i,
      date: dateStr,
      events: dayEvents,
      isToday: dateStr === todayStr,
      isCurrentMonth: true,
    });
  }

  // Pad with empty days at end
  const remainingDays = 42 - days.length; // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const nextMonthDay = new Date(currentYear, currentMonth, i);
    days.push({
      dayNumber: nextMonthDay.getDate(),
      date: nextMonthDay.toISOString().split("T")[0],
      events: [],
      isToday: false,
      isCurrentMonth: false,
    });
  }

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <>
      <div className="px-4 pt-6">
        {/* Tab switcher - at the very top */}
        <div className="mb-4">
          <CalendarTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-4">
          {/* Back button */}
          <motion.button
            onClick={() => router.push("/home")}
            whileHover={{ x: -2 }}
            className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors"
          >
            <ChevronLeft size={18} />
            <span className="text-sm">Back</span>
          </motion.button>

          {/* Month title + Navigation */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigateMonth("prev")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              disabled={isLoading}
            >
              <ChevronLeft size={16} className="text-white/60" />
            </motion.button>

            <motion.h1
              key={data.month}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-medium min-w-[140px] text-center"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.7) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {data.month}
            </motion.h1>

            <motion.button
              onClick={() => navigateMonth("next")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
              disabled={isLoading}
            >
              <ChevronRight size={16} className="text-white/60" />
            </motion.button>
          </div>

          {/* Today button (only when not current month) */}
          {!isCurrentMonth ? (
            <motion.button
              onClick={goToToday}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 rounded-full text-xs"
              style={{
                background: "rgba(201, 162, 39, 0.2)",
                border: "1px solid rgba(201, 162, 39, 0.3)",
                color: "#E8C547",
              }}
            >
              Today
            </motion.button>
          ) : (
            <div className="w-12" />
          )}
        </div>

        {/* Goal Picker - separate row */}
        <div className="flex justify-center mb-4">
          <GoalPicker
            selectedGoal={selectedGoal}
            onSelectGoal={setSelectedGoal}
            disabled={isLoading}
          />
        </div>

        {/* Calendar card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          {/* Week day headers */}
          <div className="grid grid-cols-7 border-b border-white/5">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-medium text-white/40 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => (
              <CalendarDay
                key={`${index}-${day.date}`}
                dayNumber={day.dayNumber}
                date={day.date}
                events={day.events}
                isToday={day.isToday}
                isCurrentMonth={day.isCurrentMonth}
                onClick={() => {
                  if (day.isCurrentMonth) {
                    setSelectedDay({
                      date: day.date,
                      dayNumber: day.dayNumber,
                    });
                  }
                }}
                index={index}
                isBestForGoal={bestDayDates.has(day.date)}
                goalCategory={selectedGoal}
              />
            ))}
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-4 mt-6 flex-wrap"
        >
          {[
            { color: "#4ADE80", label: "Power Day" },
            { color: "#E8C547", label: "Full Moon" },
            { color: "#94A3B8", label: "New Moon" },
            { color: "#F87171", label: "Rest Day" },
            // Add selected goal to legend if active
            ...(selectedGoal
              ? [
                  {
                    color: GOAL_CONFIG[selectedGoal].color,
                    label: `Best for ${GOAL_CONFIG[selectedGoal].label.split(" ")[0]}`,
                  },
                ]
              : []),
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: item.color }}
              />
              <span className="text-xs text-white/40">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Best Days Panel - shows when goal is selected */}
        <AnimatePresence>
          {selectedGoal && bestDaysForGoal.length > 0 && (
            <BestDaysPanel
              bestDays={bestDaysForGoal}
              goal={selectedGoal}
              onDayClick={(date) => {
                const dayData = days.find((d) => d.date === date);
                if (dayData) {
                  setSelectedDay({
                    date: dayData.date,
                    dayNumber: dayData.dayNumber,
                  });
                }
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Day detail modal */}
      <AnimatePresence>
        {selectedDay && (
          <DayDetailModal
            date={selectedDay.date}
            dayNumber={selectedDay.dayNumber}
            onClose={() => setSelectedDay(null)}
            onAskStella={openStellaWithContext}
          />
        )}
      </AnimatePresence>
    </>
  );
}
