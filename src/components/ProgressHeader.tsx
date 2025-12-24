"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { COPY } from "@/content/copy";

interface ProgressHeaderProps {
  currentStep: number;
  totalSteps?: number;
  showBack?: boolean;
  onBack?: () => void;
}

export default function ProgressHeader({
  currentStep,
  totalSteps = 10,
  showBack = true,
  onBack,
}: ProgressHeaderProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <header className="sticky top-0 z-50 bg-[#050510]/90 backdrop-blur-lg border-b border-white/5">
      {/* Navigation row */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Back button */}
        <div className="w-10">
          {showBack && onBack && (
            <motion.button
              type="button"
              onClick={onBack}
              whileTap={{ scale: 0.92 }}
              className="p-2 -ml-2 text-white/50 hover:text-white/80 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Title */}
        <span className="text-[13px] font-medium text-white/70 tracking-wide">
          {COPY.nav.title}
        </span>

        {/* Spacer for alignment */}
        <div className="w-10" />
      </div>

      {/* Progress bar */}
      <div className="h-[2px] bg-white/5">
        <motion.div
          className="h-full progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </header>
  );
}
