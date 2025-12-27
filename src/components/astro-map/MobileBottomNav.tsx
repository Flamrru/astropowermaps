"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Layers } from "lucide-react";

export type MobileTab = "forecast" | "places" | "lines";

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  hasForecast?: boolean;
}

const TABS: { id: MobileTab; label: string; icon: typeof Calendar }[] = [
  { id: "forecast", label: "2026", icon: Calendar },
  { id: "places", label: "Places", icon: MapPin },
  { id: "lines", label: "Lines", icon: Layers },
];

export default function MobileBottomNav({
  activeTab,
  onTabChange,
  hasForecast = true,
}: MobileBottomNavProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 25 }}
      className="fixed inset-x-0 bottom-0 z-30 md:hidden"
    >
      {/* Background with blur */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(5, 5, 16, 0.85) 0%, rgba(5, 5, 16, 0.98) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      />

      {/* Safe area padding for devices with home indicator */}
      <div className="relative px-4 pt-2 pb-6">
        <div className="flex items-center justify-around">
          {TABS.map((tab) => {
            // Don't show forecast tab if no forecast data
            if (tab.id === "forecast" && !hasForecast) {
              return null;
            }

            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                whileTap={{ scale: 0.95 }}
                className="relative flex flex-col items-center gap-1 px-6 py-2"
              >
                {/* Active background glow */}
                {isActive && (
                  <motion.div
                    layoutId="mobileNavActiveTab"
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: "linear-gradient(135deg, rgba(201, 162, 39, 0.15) 0%, rgba(201, 162, 39, 0.05) 100%)",
                      border: "1px solid rgba(201, 162, 39, 0.3)",
                      boxShadow: "0 0 30px rgba(201, 162, 39, 0.2)",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}

                {/* Icon with glow when active */}
                <motion.div
                  animate={isActive ? {
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  <Icon
                    size={22}
                    className="transition-colors duration-200"
                    style={{
                      color: isActive ? "#E8C547" : "rgba(255, 255, 255, 0.4)",
                    }}
                  />
                  {/* Icon glow */}
                  {isActive && (
                    <motion.div
                      animate={{ opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 blur-md"
                      style={{
                        background: "radial-gradient(circle, rgba(232, 197, 71, 0.6) 0%, transparent 70%)",
                      }}
                    />
                  )}
                </motion.div>

                {/* Label */}
                <span
                  className="relative z-10 text-xs font-medium transition-colors duration-200"
                  style={{
                    color: isActive ? "#E8C547" : "rgba(255, 255, 255, 0.4)",
                  }}
                >
                  {tab.label}
                </span>

                {/* Active dot indicator */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                    style={{
                      background: "#E8C547",
                      boxShadow: "0 0 8px rgba(232, 197, 71, 0.8)",
                    }}
                  />
                )}

                {/* New indicator for forecast (optional) */}
                {tab.id === "forecast" && !isActive && hasForecast && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-1 right-3 w-2 h-2 rounded-full"
                    style={{
                      background: "linear-gradient(135deg, #E8C547 0%, #C9A227 100%)",
                      boxShadow: "0 0 8px rgba(232, 197, 71, 0.6)",
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Gradient fade at top */}
      <div
        className="absolute -top-6 inset-x-0 h-6 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(5, 5, 16, 0.5) 100%)",
        }}
      />
    </motion.div>
  );
}
