"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Map, BarChart3, Stars, LucideIcon } from "lucide-react";

// Placeholder screens - will be replaced with actual screenshots
const PREVIEW_SCREENS: {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  color: string;
}[] = [
  {
    id: "calendar",
    title: "Daily Calendar",
    description: "Your daily power scores at a glance",
    icon: Calendar,
    iconColor: "#E8C547",
    color: "from-gold/20 to-gold/5",
  },
  {
    id: "map",
    title: "Interactive Map",
    description: "Explore your 40 planetary lines",
    icon: Map,
    iconColor: "#60A5FA",
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    id: "forecast",
    title: "2026 Forecast",
    description: "Your year ranked month by month",
    icon: BarChart3,
    iconColor: "#A78BFA",
    color: "from-purple-500/20 to-purple-500/5",
  },
  {
    id: "stella",
    title: "Stella AI",
    description: "Ask anything about your chart",
    icon: Stars,
    iconColor: "#34D399",
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

  // Get indices for 3-card display
  const getVisibleIndices = () => {
    const prevIndex = (currentIndex - 1 + PREVIEW_SCREENS.length) % PREVIEW_SCREENS.length;
    const nextIndex = (currentIndex + 1) % PREVIEW_SCREENS.length;
    return [prevIndex, currentIndex, nextIndex];
  };

  const visibleIndices = getVisibleIndices();

  return (
    <div className="w-full">
      {/* 3D Carousel */}
      <div className="relative h-[280px] flex items-center justify-center">
        {/* Navigation Arrows */}
        <button
          onClick={prev}
          className="absolute left-2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white/70" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white/70" />
        </button>

        {/* Cards container */}
        <div className="relative w-full flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            {visibleIndices.map((screenIndex, position) => {
              const screen = PREVIEW_SCREENS[screenIndex];
              const isCenter = position === 1;
              const isLeft = position === 0;

              return (
                <motion.div
                  key={screen.id}
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                    x: isLeft ? -100 : isCenter ? 0 : 100
                  }}
                  animate={{
                    opacity: isCenter ? 1 : 0.5,
                    scale: isCenter ? 1 : 0.75,
                    x: isLeft ? -90 : isCenter ? 0 : 90,
                    zIndex: isCenter ? 10 : 5,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.8
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute"
                  style={{
                    width: isCenter ? "180px" : "140px",
                  }}
                  onClick={() => !isCenter && (isLeft ? prev() : next())}
                >
                  {/* Preview Card */}
                  <div
                    className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-300`}
                    style={{
                      aspectRatio: "9/16",
                      background: isCenter ? "#0a0a1a" : "rgba(255, 255, 255, 0.03)",
                      border: isCenter
                        ? "2px solid rgba(255, 255, 255, 0.2)"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                      boxShadow: isCenter
                        ? "0 10px 40px rgba(0, 0, 0, 0.4)"
                        : "none",
                    }}
                  >
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-b ${screen.color}`}
                    >
                      {/* Icon */}
                      <screen.icon
                        className={`${isCenter ? "w-12 h-12" : "w-10 h-10"} mb-4`}
                        style={{
                          color: screen.iconColor,
                          filter: `drop-shadow(0 0 12px ${screen.iconColor}80)`,
                        }}
                      />

                      {/* Screen title */}
                      <p className={`text-white font-semibold ${isCenter ? "text-[15px]" : "text-[12px]"} text-center px-3`}>
                        {screen.title}
                      </p>
                      <p className={`text-white/50 ${isCenter ? "text-[11px]" : "text-[9px]"} mt-1 text-center px-3`}>
                        {screen.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
