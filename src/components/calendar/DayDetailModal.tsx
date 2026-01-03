"use client";

import { motion } from "framer-motion";
import { X, Sparkles, Moon, Battery, AlertCircle } from "lucide-react";
import type { CalendarEvent, CalendarEventType } from "@/lib/dashboard-types";

interface DayDetailModalProps {
  date: string;
  dayNumber: number;
  events: CalendarEvent[];
  onClose: () => void;
}

/**
 * DayDetailModal
 *
 * Shows detailed information about a selected day.
 * Displays all events with their descriptions.
 */
export default function DayDetailModal({
  date,
  dayNumber,
  events,
  onClose,
}: DayDetailModalProps) {
  const formattedDate = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Event type configs
  const eventConfig: Record<
    CalendarEventType,
    { icon: React.ReactNode; color: string; bgColor: string }
  > = {
    power_day: {
      icon: <Sparkles size={18} />,
      color: "#4ADE80",
      bgColor: "rgba(74, 222, 128, 0.15)",
    },
    rest_day: {
      icon: <Battery size={18} />,
      color: "#F87171",
      bgColor: "rgba(248, 113, 113, 0.15)",
    },
    new_moon: {
      icon: <span className="text-lg">🌑</span>,
      color: "#94A3B8",
      bgColor: "rgba(148, 163, 184, 0.15)",
    },
    full_moon: {
      icon: <span className="text-lg">🌕</span>,
      color: "#E8C547",
      bgColor: "rgba(232, 197, 71, 0.15)",
    },
    mercury_retrograde: {
      icon: <AlertCircle size={18} />,
      color: "#A78BFA",
      bgColor: "rgba(167, 139, 250, 0.15)",
    },
    eclipse: {
      icon: <Moon size={18} />,
      color: "#F472B6",
      bgColor: "rgba(244, 114, 182, 0.15)",
    },
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-x-4 bottom-4 z-50 max-w-md mx-auto"
      >
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(20, 20, 35, 0.98)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
          }}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-white/5">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={16} className="text-white/40" />
            </button>

            {/* Date display */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "linear-gradient(135deg, rgba(201, 162, 39, 0.2), rgba(139, 92, 246, 0.1))",
                border: "1px solid rgba(201, 162, 39, 0.3)",
              }}
            >
              <span className="text-2xl font-medium text-white">{dayNumber}</span>
            </motion.div>

            <h3 className="text-white font-medium text-lg">{formattedDate}</h3>
            <p className="text-white/40 text-sm mt-1">
              {events.length > 0
                ? `${events.length} cosmic event${events.length > 1 ? "s" : ""}`
                : "No special events"}
            </p>
          </div>

          {/* Events list */}
          <div className="px-6 py-4 max-h-[40vh] overflow-y-auto">
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.map((event, index) => {
                  const config = eventConfig[event.type as CalendarEventType];
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{
                        background: config?.bgColor || "rgba(255, 255, 255, 0.05)",
                        border: `1px solid ${config?.color}20` || "rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: config?.color || "#E8C547" }}
                      >
                        {config?.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4
                          className="font-medium text-sm"
                          style={{ color: config?.color || "#E8C547" }}
                        >
                          {event.title}
                        </h4>
                        {event.description && (
                          <p className="text-white/50 text-xs mt-1 leading-relaxed">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">🌙</div>
                <p className="text-white/40 text-sm">
                  A quiet day in the cosmos. Perfect for following your own rhythm.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-2">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.7)",
              }}
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
