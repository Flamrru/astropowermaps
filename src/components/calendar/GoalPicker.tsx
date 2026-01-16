"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, Heart, Briefcase, Palette, Compass, Sparkles, Circle } from "lucide-react";
import type { GoalCategory } from "@/lib/dashboard-types";
import { useTrack } from "@/lib/hooks/useTrack";

interface GoalPickerProps {
  selectedGoal: GoalCategory | null;
  onSelectGoal: (goal: GoalCategory | null) => void;
  disabled?: boolean;
}

/**
 * Goal configuration with colors, icons, and descriptions
 */
const GOAL_CONFIG: Record<GoalCategory, {
  label: string;
  description: string;
  color: string;
  Icon: typeof Heart;
}> = {
  love: {
    label: "Love & Romance",
    description: "Best days for relationships",
    color: "#EC4899",
    Icon: Heart,
  },
  career: {
    label: "Career & Success",
    description: "Best days for work moves",
    color: "#3B82F6",
    Icon: Briefcase,
  },
  creativity: {
    label: "Creative Flow",
    description: "Best days for expression",
    color: "#F59E0B",
    Icon: Palette,
  },
  clarity: {
    label: "Clarity & Insight",
    description: "Best days for decisions",
    color: "#8B5CF6",
    Icon: Compass,
  },
  adventure: {
    label: "Adventure",
    description: "Best days for new experiences",
    color: "#10B981",
    Icon: Sparkles,
  },
};

const GOAL_ORDER: GoalCategory[] = ["love", "career", "creativity", "clarity", "adventure"];

/**
 * GoalPicker
 *
 * Button that opens a bottom sheet for selecting a goal category.
 * Shows best days for the selected goal on the calendar.
 */
export default function GoalPicker({ selectedGoal, onSelectGoal, disabled = false }: GoalPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const track = useTrack();

  const currentConfig = selectedGoal ? GOAL_CONFIG[selectedGoal] : null;

  const handleSelect = (goal: GoalCategory | null) => {
    // Track goal selection
    track("goal_select", { goal: goal || "all" }, "calendar");
    onSelectGoal(goal);
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={() => !disabled && setIsOpen(true)}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
        style={{
          background: selectedGoal
            ? `${currentConfig?.color}20`
            : "rgba(255, 255, 255, 0.05)",
          border: selectedGoal
            ? `1px solid ${currentConfig?.color}50`
            : "1px solid rgba(255, 255, 255, 0.1)",
          color: selectedGoal ? currentConfig?.color : "rgba(255, 255, 255, 0.6)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {selectedGoal && currentConfig ? (
          <>
            <currentConfig.Icon size={12} />
            <span>{currentConfig.label.split(" ")[0]}</span>
          </>
        ) : (
          <>
            <Circle size={12} />
            <span>Goal</span>
          </>
        )}
        <ChevronDown size={12} />
      </motion.button>

      {/* Bottom Sheet Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{
                background: "rgba(15, 15, 25, 0.98)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderBottom: "none",
              }}
            >
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className="w-12 h-1 rounded-full bg-white/20" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-4">
                <h3 className="text-lg font-medium text-white">What&apos;s your focus?</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={18} className="text-white/60" />
                </button>
              </div>

              {/* Goal Options */}
              <div className="px-5 pb-6 space-y-2">
                {GOAL_ORDER.map((goal, index) => {
                  const config = GOAL_CONFIG[goal];
                  const isSelected = selectedGoal === goal;

                  return (
                    <motion.button
                      key={goal}
                      onClick={() => handleSelect(goal)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all"
                      style={{
                        background: isSelected
                          ? `${config.color}15`
                          : "rgba(255, 255, 255, 0.03)",
                        border: isSelected
                          ? `1px solid ${config.color}40`
                          : "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: `${config.color}20`,
                        }}
                      >
                        <config.Icon size={18} style={{ color: config.color }} />
                      </div>

                      {/* Label & Description */}
                      <div className="flex-1 text-left">
                        <div className="text-white font-medium text-sm">{config.label}</div>
                        <div className="text-white/40 text-xs">{config.description}</div>
                      </div>

                      {/* Selected indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: config.color }}
                        >
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}

                {/* Divider */}
                <div className="border-t border-white/10 my-4" />

                {/* Clear Selection */}
                <motion.button
                  onClick={() => handleSelect(null)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all"
                  style={{
                    background: !selectedGoal
                      ? "rgba(201, 162, 39, 0.1)"
                      : "rgba(255, 255, 255, 0.03)",
                    border: !selectedGoal
                      ? "1px solid rgba(201, 162, 39, 0.3)"
                      : "1px solid rgba(255, 255, 255, 0.05)",
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <Circle size={18} className="text-white/40" />
                  </div>

                  {/* Label */}
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium text-sm">All Days</div>
                    <div className="text-white/40 text-xs">Show standard power days</div>
                  </div>

                  {/* Selected indicator */}
                  {!selectedGoal && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "#C9A227" }}
                    >
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              </div>

              {/* Safe area padding for mobile */}
              <div className="h-8" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Export goal config for use in other components
 */
export { GOAL_CONFIG, GOAL_ORDER };
