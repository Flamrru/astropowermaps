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
    <header className="sticky top-0 z-50 bg-[#0a0a1a]/80 backdrop-blur-md">
      {/* Navigation row */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Back button */}
        <div className="w-10">
          {showBack && onBack && (
            <motion.button
              type="button"
              onClick={onBack}
              whileTap={{ scale: 0.95 }}
              className="p-2 -ml-2 text-white/70 hover:text-white transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
          )}
        </div>

        {/* Title */}
        <h1 className="text-sm font-medium text-white/90 tracking-wide">
          {COPY.nav.title}
        </h1>

        {/* Spacer for alignment */}
        <div className="w-10" />
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/10">
        <motion.div
          className="h-full progress-bar"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </header>
  );
}
