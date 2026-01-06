"use client";

import { motion } from "framer-motion";
import { Zap, Sparkles, CheckCircle, Heart } from "lucide-react";

export type DayDetailTabType = "energy" | "cosmos" | "actions" | "soul";

interface DayDetailTabsProps {
  activeTab: DayDetailTabType;
  onTabChange: (tab: DayDetailTabType) => void;
  hasTransits: boolean;
}

/**
 * DayDetailTabs
 *
 * Tab bar for the enhanced day detail modal.
 * Uses sliding gold indicator like CalendarTabs.
 */
export default function DayDetailTabs({
  activeTab,
  onTabChange,
  hasTransits,
}: DayDetailTabsProps) {
  const tabs: { id: DayDetailTabType; label: string; icon: typeof Zap }[] = [
    { id: "energy", label: "Energy", icon: Zap },
    { id: "cosmos", label: "Cosmos", icon: Sparkles },
    { id: "actions", label: "Actions", icon: CheckCircle },
    { id: "soul", label: "Soul", icon: Heart },
  ];

  // If no transits, show simplified tabs
  const visibleTabs = hasTransits ? tabs : [tabs[0]];

  return (
    <div className="relative px-4">
      <div
        className="flex rounded-xl p-1"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex-1 py-2 px-3 text-center transition-colors"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="dayDetailTabIndicator"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: "linear-gradient(135deg, rgba(201, 162, 39, 0.2) 0%, rgba(201, 162, 39, 0.08) 100%)",
                    border: "1px solid rgba(201, 162, 39, 0.3)",
                  }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                />
              )}

              {/* Tab content */}
              <div className="relative z-10 flex items-center justify-center gap-1.5">
                <Icon
                  size={14}
                  className={isActive ? "text-[#E8C547]" : "text-white/40"}
                />
                <span
                  className={`text-xs font-medium ${
                    isActive ? "text-[#E8C547]" : "text-white/50"
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Subtle glow under tabs */}
      <div
        className="absolute inset-x-0 bottom-0 h-8 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(201, 162, 39, 0.03), transparent)",
        }}
      />
    </div>
  );
}
