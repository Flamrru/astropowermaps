"use client";

import { ReactNode } from "react";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";

interface SlideUpPanelProps {
  children: ReactNode;
  isVisible: boolean;
  height?: "70%" | "80%" | "90%" | "100%";
  onBack?: () => void;
  showDragHandle?: boolean;
  className?: string;
}

export default function SlideUpPanel({
  children,
  isVisible,
  height = "80%",
  onBack,
  showDragHandle = true,
  className = "",
}: SlideUpPanelProps) {
  const dragControls = useDragControls();

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Navigate back if dragged down significantly
    if (onBack && (info.offset.y > 120 || info.velocity.y > 600)) {
      onBack();
    }
  };

  // Calculate max-height based on height prop
  const maxHeightMap = {
    "70%": "70dvh",
    "80%": "80dvh",
    "90%": "90dvh",
    "100%": "100dvh",
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{
            type: "spring",
            damping: 28,
            stiffness: 300,
            opacity: { duration: 0.2 },
          }}
          drag={onBack ? "y" : false}
          dragControls={dragControls}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.4 }}
          onDragEnd={handleDragEnd}
          className={`absolute inset-x-0 bottom-0 z-20 touch-pan-y ${className}`}
          style={{
            maxHeight: maxHeightMap[height],
            borderRadius: "2rem 2rem 0 0",
            // Premium glassmorphism effect
            background: `
              linear-gradient(180deg,
                rgba(12, 12, 28, 0.97) 0%,
                rgba(8, 8, 20, 0.98) 50%,
                rgba(5, 5, 16, 0.99) 100%
              )
            `,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: `
              0 -4px 60px rgba(0, 0, 0, 0.7),
              0 -1px 0 rgba(201, 162, 39, 0.15),
              0 0 100px rgba(201, 162, 39, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.05)
            `,
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderBottom: "none",
          }}
        >
          {/* Golden accent line at top */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px]"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(232, 197, 71, 0.5), transparent)",
            }}
          />

          {/* Drag Handle */}
          {showDragHandle && (
            <div
              className="flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => onBack && dragControls.start(e)}
            >
              <motion.div
                whileHover={{ width: 56, opacity: 0.8 }}
                whileTap={{ width: 64 }}
                className="w-12 h-1 rounded-full"
                style={{
                  background: "linear-gradient(90deg, rgba(201, 162, 39, 0.3), rgba(232, 197, 71, 0.5), rgba(201, 162, 39, 0.3))",
                }}
              />
            </div>
          )}

          {/* Content Area */}
          <div
            className="overflow-y-auto overscroll-contain px-5 pb-8"
            style={{
              maxHeight: `calc(${maxHeightMap[height]} - 60px)`,
            }}
          >
            {children}
          </div>

          {/* Bottom fade for scroll indication */}
          <div
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(5, 5, 16, 0.95), transparent)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Compact variant for checkout/action panels
export function ActionPanel({
  children,
  isVisible,
  className = "",
}: {
  children: ReactNode;
  isVisible: boolean;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`absolute bottom-0 inset-x-0 z-30 p-5 pb-8 ${className}`}
          style={{
            background: "linear-gradient(to top, rgba(5, 5, 16, 0.98) 60%, transparent)",
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
