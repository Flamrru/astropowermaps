"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

// App preview screenshots
const PREVIEW_SCREENS = [
  {
    id: "home",
    title: "Daily Power Score",
    image: "/previews/preview-home.png",
  },
  {
    id: "map",
    title: "Astrocartography Map",
    image: "/previews/preview-map.png",
  },
  {
    id: "places",
    title: "Power Places",
    image: "/previews/preview-places.png",
  },
  {
    id: "calendar",
    title: "Cosmic Calendar",
    image: "/previews/preview-calendar.png",
  },
  {
    id: "stella",
    title: "Stella AI Guide",
    image: "/previews/preview-stella.png",
  },
  {
    id: "year",
    title: "2026 Forecast",
    image: "/previews/preview-year.png",
  },
];

export default function ProductPreviewCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance to trigger navigation (in px)
  const minSwipeDistance = 50;

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % PREVIEW_SCREENS.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + PREVIEW_SCREENS.length) % PREVIEW_SCREENS.length);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > minSwipeDistance;
    if (isSwipe) {
      if (distance > 0) {
        next(); // Swipe left → go to next
      } else {
        prev(); // Swipe right → go to previous
      }
    }
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
      <div
        className="relative h-[350px] flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
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
                    opacity: isCenter ? 1 : 0.4,
                    scale: isCenter ? 1 : 0.8,
                    x: isLeft ? -110 : isCenter ? 0 : 110,
                    zIndex: isCenter ? 10 : 5,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.8
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute"
                  onClick={() => !isCenter && (isLeft ? prev() : next())}
                >
                  {/* Preview Card */}
                  <div
                    className="rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300"
                    style={{
                      width: isCenter ? "180px" : "135px",
                      height: isCenter ? "320px" : "240px",
                      boxShadow: isCenter
                        ? "0 0 25px rgba(232, 197, 71, 0.25), 0 0 50px rgba(232, 197, 71, 0.1)"
                        : "0 0 15px rgba(232, 197, 71, 0.08)",
                    }}
                  >
                    <Image
                      src={screen.image}
                      alt={screen.title}
                      width={180}
                      height={320}
                      className="w-full h-full"
                      style={{ objectFit: "cover" }}
                    />
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
