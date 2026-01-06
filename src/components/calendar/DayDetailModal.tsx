"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { EnhancedDayData } from "@/lib/dashboard-types";
import DayDetailTabs, { DayDetailTabType } from "./DayDetailTabs";
import EnergyTab from "./tabs/EnergyTab";
import CosmosTab from "./tabs/CosmosTab";
import ActionsTab from "./tabs/ActionsTab";
import SoulTab from "./tabs/SoulTab";

interface StellaContext {
  displayMessage: string;
  hiddenContext: string;
}

interface DayDetailModalProps {
  date: string;
  dayNumber: number;
  onClose: () => void;
  onAskStella?: (context: StellaContext) => void;
}

/**
 * DayDetailModal
 *
 * Enhanced modal showing rich day insights:
 * - Energy tab: Score, moon phase, summary
 * - Cosmos tab: Transit aspects
 * - Actions tab: Best for / avoid
 * - Soul tab: Ritual & journal prompt
 */
export default function DayDetailModal({
  date,
  dayNumber,
  onClose,
  onAskStella,
}: DayDetailModalProps) {
  const [activeTab, setActiveTab] = useState<DayDetailTabType>("energy");
  const [dayData, setDayData] = useState<EnhancedDayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formattedDate = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Fetch enhanced day data
  useEffect(() => {
    async function fetchDayData() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/content/day-detail?date=${date}`);

        if (!response.ok) {
          throw new Error("Failed to load day details");
        }

        const result = await response.json();
        setDayData(result.data);
      } catch (err) {
        console.error("Day detail fetch error:", err);
        setError("Failed to load day insights. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDayData();
  }, [date]);

  // Handle Ask Stella
  const handleAskStella = () => {
    if (!dayData || !onAskStella) return;

    // Build friendly display message (what user sees in chat)
    const displayMessage = `Tell me about ${formattedDate}`;

    // Build hidden context for AI (not shown to user, but helps Stella respond)
    const transitLabels = dayData.transits.slice(0, 3).map((t) => t.label).join(", ");
    const hiddenContext = `Date: ${formattedDate}. Score: ${dayData.score}/100 (${dayData.scoreLabel}). Transits: ${transitLabels}. Moon: ${dayData.moon.phase} in ${dayData.moon.sign}.`;

    onAskStella({ displayMessage, hiddenContext });
  };

  // Check if we have transits to show other tabs
  const hasTransits = dayData?.transits && dayData.transits.length > 0;

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
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-x-4 bottom-4 z-50 max-w-md mx-auto"
      >
        <div
          className="rounded-3xl overflow-hidden flex flex-col"
          style={{
            height: "75vh", // Fixed height - no resizing
            background: "rgba(15, 15, 25, 0.98)",
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
          }}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-white/5 flex-shrink-0">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={16} className="text-white/40" />
            </button>

            {/* Date display */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(201, 162, 39, 0.2), rgba(139, 92, 246, 0.1))",
                  border: "1px solid rgba(201, 162, 39, 0.3)",
                }}
              >
                <span className="text-xl font-medium text-white">{dayNumber}</span>
              </motion.div>

              <div>
                <h3 className="text-white font-medium">{formattedDate}</h3>
                {dayData && (
                  <p className="text-white/40 text-sm mt-0.5">
                    {dayData.transits.length} transit{dayData.transits.length !== 1 ? "s" : ""} active
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs (only show if loaded) */}
          {!isLoading && dayData && (
            <div className="flex-shrink-0 pt-3 pb-1">
              <DayDetailTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                hasTransits={hasTransits || false}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} onRetry={() => window.location.reload()} />
            ) : dayData ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "energy" && (
                    <EnergyTab
                      data={dayData}
                      formattedDate={formattedDate}
                      onAskStella={handleAskStella}
                    />
                  )}
                  {activeTab === "cosmos" && (
                    <CosmosTab transits={dayData.transits} />
                  )}
                  {activeTab === "actions" && (
                    <ActionsTab bestFor={dayData.bestFor} avoid={dayData.avoid} />
                  )}
                  {activeTab === "soul" && (
                    <SoulTab
                      ritual={dayData.ritual}
                      journalPrompt={dayData.journalPrompt}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 pb-6 pt-2 border-t border-white/5">
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

// ============================================
// Loading State
// ============================================

function LoadingState() {
  return (
    <div className="py-12 px-6 flex flex-col items-center">
      {/* Orbiting loader */}
      <motion.div
        className="relative w-16 h-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border"
          style={{ borderColor: "rgba(201, 162, 39, 0.2)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Inner ring */}
        <motion.div
          className="absolute inset-2 rounded-full border"
          style={{ borderColor: "rgba(201, 162, 39, 0.3)" }}
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* Center orb */}
        <motion.div
          className="absolute inset-5 rounded-full"
          style={{
            background: "radial-gradient(circle, #E8C547 0%, #C9A227 100%)",
            boxShadow: "0 0 20px rgba(201, 162, 39, 0.5)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-white/50 text-sm"
      >
        Reading the cosmic energies...
      </motion.p>
    </div>
  );
}

// ============================================
// Error State
// ============================================

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="py-12 px-6 text-center">
      <div className="text-3xl mb-3">🌙</div>
      <p className="text-red-400/80 text-sm mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-lg text-sm transition-colors"
        style={{
          background: "rgba(201, 162, 39, 0.2)",
          border: "1px solid rgba(201, 162, 39, 0.3)",
          color: "#E8C547",
        }}
      >
        Try Again
      </button>
    </div>
  );
}
