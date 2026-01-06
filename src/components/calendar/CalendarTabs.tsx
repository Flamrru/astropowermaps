"use client";

import { motion } from "framer-motion";
import { Calendar, Sparkles, Star } from "lucide-react";

export type CalendarTabType = "month" | "2026" | "transits";

interface CalendarTabsProps {
  activeTab: CalendarTabType;
  onTabChange: (tab: CalendarTabType) => void;
}

/**
 * CalendarTabs
 *
 * Elegant tab switcher between monthly calendar, 2026 report, and life transits.
 * Tab order: Month (short-term) -> 2026 (year) -> Life (lifetime)
 * Features a sliding gold indicator and subtle glass morphism.
 */
export default function CalendarTabs({
  activeTab,
  onTabChange,
}: CalendarTabsProps) {
  const tabs: { id: CalendarTabType; label: string; icon: typeof Calendar }[] = [
    { id: "month", label: "Month", icon: Calendar },
    { id: "2026", label: "Year", icon: Sparkles },
    { id: "transits", label: "Destiny", icon: Star },
  ];

  // Calculate indicator position based on active tab index
  const getIndicatorPosition = () => {
    const index = tabs.findIndex((t) => t.id === activeTab);
    const tabWidth = 100 / 3; // 33.33% each
    return `calc(${index * tabWidth}% + 4px)`;
  };

  return (
    <div
      className="relative flex p-1 rounded-2xl mx-auto"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        maxWidth: "400px",
      }}
    >
      {/* Sliding indicator */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-xl"
        style={{
          background: "linear-gradient(135deg, rgba(201, 162, 39, 0.25) 0%, rgba(232, 197, 71, 0.15) 100%)",
          border: "1px solid rgba(201, 162, 39, 0.3)",
          boxShadow: "0 0 20px rgba(201, 162, 39, 0.15)",
        }}
        initial={false}
        animate={{
          left: getIndicatorPosition(),
          width: "calc(33.33% - 6px)",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      />

      {/* Tab buttons */}
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="relative flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl z-10 transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            <Icon
              size={16}
              className="transition-colors duration-200"
              style={{
                color: isActive ? "#E8C547" : "rgba(255, 255, 255, 0.4)",
              }}
            />
            <span
              className="text-sm font-medium transition-colors duration-200"
              style={{
                color: isActive ? "#E8C547" : "rgba(255, 255, 255, 0.5)",
              }}
            >
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
