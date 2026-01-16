"use client";

import { motion } from "framer-motion";
import type { CalendarEvent, CalendarEventType, GoalCategory } from "@/lib/dashboard-types";
import { useTrack } from "@/lib/hooks/useTrack";

interface CalendarDayProps {
  dayNumber: number;
  date: string;
  events: CalendarEvent[];
  isToday: boolean;
  isCurrentMonth: boolean;
  onClick: () => void;
  index: number;
  isBestForGoal?: boolean;
  goalCategory?: GoalCategory | null;
}

/**
 * Goal colors for the best day highlight
 */
const GOAL_COLORS: Record<GoalCategory, string> = {
  love: "#EC4899",
  career: "#3B82F6",
  creativity: "#F59E0B",
  clarity: "#8B5CF6",
  adventure: "#10B981",
};

/**
 * CalendarDay
 *
 * Individual day cell in the calendar grid.
 * Shows event indicators and highlights today.
 */
export default function CalendarDay({
  dayNumber,
  date,
  events,
  isToday,
  isCurrentMonth,
  onClick,
  index,
  isBestForGoal = false,
  goalCategory = null,
}: CalendarDayProps) {
  const track = useTrack();

  const handleClick = () => {
    // Track day click
    const isPowerDay = events.some((e) => e.type === "power_day");
    track("day_click", {
      date,
      is_power_day: isPowerDay,
      is_best_for_goal: isBestForGoal,
    }, "calendar");
    onClick();
  };

  // Get the goal color if this day is best for a goal
  const goalColor = goalCategory ? GOAL_COLORS[goalCategory] : null;
  // Event type colors
  const eventColors: Record<CalendarEventType, string> = {
    power_day: "#4ADE80",
    rest_day: "#F87171",
    new_moon: "#94A3B8",
    full_moon: "#E8C547",
    mercury_retrograde: "#A78BFA",
    eclipse: "#F472B6",
  };

  // Event type icons
  const eventIcons: Partial<Record<CalendarEventType, string>> = {
    new_moon: "🌑",
    full_moon: "🌕",
  };

  // Get primary event for display
  const primaryEvent = events.find(
    (e) => e.type === "full_moon" || e.type === "new_moon"
  ) || events[0];

  const hasPowerDay = events.some((e) => e.type === "power_day");
  const hasRestDay = events.some((e) => e.type === "rest_day");
  const hasMoonEvent = events.some(
    (e) => e.type === "new_moon" || e.type === "full_moon"
  );

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.01, duration: 0.2 }}
      onClick={handleClick}
      disabled={!isCurrentMonth}
      className={`
        relative aspect-square flex flex-col items-center justify-center
        transition-all duration-200
        ${isCurrentMonth ? "cursor-pointer hover:bg-white/5" : "cursor-default"}
        ${!isCurrentMonth ? "opacity-30" : ""}
      `}
      whileHover={isCurrentMonth ? { scale: 1.05 } : {}}
      whileTap={isCurrentMonth ? { scale: 0.95 } : {}}
    >
      {/* Today highlight ring */}
      {isToday && (
        <motion.div
          className="absolute inset-1 rounded-full"
          style={{
            border: "2px solid rgba(201, 162, 39, 0.6)",
            boxShadow: "0 0 15px rgba(201, 162, 39, 0.3)",
          }}
          animate={{
            boxShadow: [
              "0 0 15px rgba(201, 162, 39, 0.3)",
              "0 0 25px rgba(201, 162, 39, 0.4)",
              "0 0 15px rgba(201, 162, 39, 0.3)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Best for goal highlight ring */}
      {isBestForGoal && goalColor && isCurrentMonth && !isToday && (
        <motion.div
          className="absolute inset-1 rounded-full"
          style={{
            border: `2px solid ${goalColor}80`,
            boxShadow: `0 0 12px ${goalColor}40`,
          }}
          animate={{
            boxShadow: [
              `0 0 12px ${goalColor}40`,
              `0 0 20px ${goalColor}50`,
              `0 0 12px ${goalColor}40`,
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      )}

      {/* Power day background glow */}
      {hasPowerDay && isCurrentMonth && (
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(74, 222, 128, 0.2) 0%, transparent 70%)",
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      {/* Rest day background */}
      {hasRestDay && !hasPowerDay && isCurrentMonth && (
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(248, 113, 113, 0.1) 0%, transparent 70%)",
          }}
        />
      )}

      {/* Moon event icon */}
      {hasMoonEvent && isCurrentMonth && (
        <motion.div
          className="absolute top-1 right-1 text-[10px]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {primaryEvent && eventIcons[primaryEvent.type as CalendarEventType]}
        </motion.div>
      )}

      {/* Day number */}
      <span
        className={`
          text-sm font-medium
          ${isToday ? "text-[#E8C547]" : isCurrentMonth ? "text-white/80" : "text-white/30"}
        `}
      >
        {dayNumber}
      </span>

      {/* Event indicators */}
      {events.length > 0 && isCurrentMonth && (
        <div className="absolute bottom-1 flex gap-0.5">
          {events.slice(0, 3).map((event, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="w-1 h-1 rounded-full"
              style={{
                background: eventColors[event.type as CalendarEventType] || "#E8C547",
              }}
            />
          ))}
        </div>
      )}
    </motion.button>
  );
}
