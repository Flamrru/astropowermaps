"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Placeholder screens - will be replaced with actual screenshots
const PREVIEW_SCREENS = [
  {
    id: "calendar",
    title: "Daily Calendar",
    description: "Your daily power scores at a glance",
    placeholder: "📅",
    color: "from-gold/20 to-gold/5",
  },
  {
    id: "map",
    title: "Interactive Map",
    description: "Explore your 40 planetary lines",
    placeholder: "🗺️",
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    id: "forecast",
    title: "2026 Forecast",
    description: "Your year ranked month by month",
    placeholder: "📊",
    color: "from-purple-500/20 to-purple-500/5",
  },
  {
    id: "stella",
    title: "Stella AI",
    description: "Ask anything about your chart",
    placeholder: "🤖",
    color: "from-emerald-500/20 to-emerald-500/5",
  },
];

export default function ProductPreviewCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % PREVIEW_SCREENS.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + PREVIEW_SCREENS.length) % PREVIEW_SCREENS.length);
  };

  const currentScreen = PREVIEW_SCREENS[currentIndex];

  return (
    <div className="w-full">
      {/* Carousel Container */}
      <div className="relative">
        {/* Main Preview Card */}
        <div
          className="relative rounded-2xl overflow-hidden mx-auto"
          style={{
            aspectRatio: "9/16",
            maxWidth: "220px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b ${currentScreen.color}`}
            >
              {/* Placeholder emoji */}
              <span className="text-6xl mb-4">{currentScreen.placeholder}</span>

              {/* Screen title */}
              <p className="text-white font-semibold text-[15px]">{currentScreen.title}</p>
              <p className="text-white/50 text-[12px] mt-1">{currentScreen.description}</p>
            </motion.div>
          </AnimatePresence>

          {/* Phone frame overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: "inset 0 0 0 3px rgba(255, 255, 255, 0.1)",
              borderRadius: "1rem",
            }}
          />
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white/60" />
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {PREVIEW_SCREENS.map((screen, index) => (
          <button
            key={screen.id}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? "bg-gold w-4"
                : "bg-white/20 hover:bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
