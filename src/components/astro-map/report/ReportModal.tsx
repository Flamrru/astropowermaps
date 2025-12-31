"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { PlanetaryLine } from "@/lib/astro/types";
import { YearForecast } from "@/lib/astro/transit-types";
import Report2026Panel from "./Report2026Panel";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  forecast: YearForecast;
  lines: PlanetaryLine[];
  onFlyToCity: (lat: number, lng: number, cityName: string) => void;
}

export default function ReportModal({
  isOpen,
  onClose,
  forecast,
  lines,
  onFlyToCity,
}: ReportModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle fly to city and close modal
  const handleFlyToCity = useCallback(
    (lat: number, lng: number, cityName: string) => {
      onFlyToCity(lat, lng, cityName);
      onClose();
    },
    [onFlyToCity, onClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:max-h-[85vh] z-50 flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #0a0a1e 0%, #050510 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: `
                0 25px 50px -12px rgba(0, 0, 0, 0.8),
                0 0 0 1px rgba(255, 255, 255, 0.05),
                0 0 100px rgba(155, 126, 217, 0.15)
              `,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="relative px-5 py-4 flex items-center justify-between flex-shrink-0"
              style={{
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              {/* Gradient accent */}
              <div
                className="absolute top-0 left-0 right-0 h-[1px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 10%, rgba(155, 126, 217, 0.5) 50%, transparent 90%)",
                }}
              />

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(155, 126, 217, 0.25) 0%, rgba(155, 126, 217, 0.1) 100%)",
                    boxShadow: "0 0 20px rgba(155, 126, 217, 0.2)",
                  }}
                >
                  <Sparkles size={20} style={{ color: "#9B7ED9" }} />
                </div>
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: "rgba(255, 255, 255, 0.95)" }}
                  >
                    Your 2026 Report
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: "rgba(255, 255, 255, 0.45)" }}
                  >
                    Personal forecast & insights
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "rgba(255, 255, 255, 0.5)",
                }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <Report2026Panel
                forecast={forecast}
                lines={lines}
                onFlyToCity={handleFlyToCity}
              />
            </div>

            {/* Custom scrollbar styles */}
            <style jsx global>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.02);
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.2);
              }
            `}</style>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
