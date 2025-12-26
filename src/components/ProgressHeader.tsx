"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

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
  const [enableTransition, setEnableTransition] = useState(false);

  // Enable transitions only after a brief delay to skip initial render jitter
  useEffect(() => {
    const timer = setTimeout(() => setEnableTransition(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Back button row */}
      <div className="flex items-center px-4 py-3">
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
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10 mx-4">
        <div
          className={`h-full progress-bar ${enableTransition ? 'transition-[width] duration-300 ease-out' : ''}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </header>
  );
}
