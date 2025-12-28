"use client";

import { ReactNode, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { X } from "lucide-react";

interface MobileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: ReactNode;
  accentColor?: string;
  glowColor?: string;
  children: ReactNode;
}

export default function MobileSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  accentColor = "#E8C547",
  glowColor = "rgba(232, 197, 71, 0.25)",
  children,
}: MobileSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragY = useMotionValue(0);

  // Transform drag into backdrop opacity
  const backdropOpacity = useTransform(dragY, [0, 300], [1, 0]);
  const sheetScale = useTransform(dragY, [0, 300], [1, 0.95]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      // Close if dragged down more than 100px or with velocity
      if (info.offset.y > 100 || info.velocity.y > 400) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50"
        >
          {/* Backdrop with blur */}
          <motion.div
            style={{ opacity: backdropOpacity }}
            className="absolute inset-0"
            onClick={onClose}
          >
            <div
              className="absolute inset-0 bg-black/60"
              style={{
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            />
            {/* Subtle vignette effect */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%)",
              }}
            />
          </motion.div>

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 32,
              stiffness: 400,
              mass: 0.8,
            }}
            style={{
              y: dragY,
              scale: sheetScale,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-hidden touch-pan-y"
          >
            {/* Sheet container with layered effects */}
            <div
              className="relative rounded-t-[28px] overflow-hidden"
              style={{
                background: "linear-gradient(180deg, rgba(18, 18, 38, 0.97) 0%, rgba(8, 8, 20, 0.99) 100%)",
                boxShadow: `
                  0 -4px 40px rgba(0, 0, 0, 0.5),
                  0 -1px 0 rgba(255, 255, 255, 0.06),
                  0 0 120px ${glowColor},
                  inset 0 1px 0 rgba(255, 255, 255, 0.05)
                `,
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[1px]"
                style={{
                  background: `linear-gradient(90deg, transparent 10%, ${accentColor}50 50%, transparent 90%)`,
                }}
              />

              {/* Drag Handle area */}
              <div className="relative flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                {/* Handle pill */}
                <motion.div
                  whileHover={{ width: 52 }}
                  className="w-10 h-[5px] rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${accentColor}40, ${accentColor}80, ${accentColor}40)`,
                    boxShadow: `0 0 12px ${glowColor}`,
                  }}
                />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-1 pb-4">
                <div className="flex items-center gap-3.5">
                  {/* Icon container with glow */}
                  <motion.div
                    animate={{
                      boxShadow: [
                        `0 0 20px ${glowColor}`,
                        `0 0 32px ${glowColor}`,
                        `0 0 20px ${glowColor}`,
                      ],
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 100%)`,
                      border: `1px solid ${accentColor}35`,
                    }}
                  >
                    {/* Inner glow */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${accentColor}20 0%, transparent 60%)`,
                      }}
                    />
                    <span style={{ color: accentColor }} className="relative z-10">
                      {icon}
                    </span>
                  </motion.div>

                  <div>
                    <h3
                      className="text-[17px] font-semibold tracking-[-0.02em]"
                      style={{
                        color: "rgba(255, 255, 255, 0.95)",
                        textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      {title}
                    </h3>
                    {subtitle && (
                      <p
                        className="text-[13px] mt-0.5"
                        style={{ color: "rgba(255, 255, 255, 0.4)" }}
                      >
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <X size={18} className="text-white/50" />
                </motion.button>
              </div>

              {/* Divider */}
              <div
                className="h-[1px] mx-5"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accentColor}25, transparent)`,
                }}
              />

              {/* Scrollable content */}
              <div
                className="overflow-y-auto overscroll-contain"
                style={{
                  maxHeight: "calc(85vh - 100px)",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div className="py-4">
                  {children}
                </div>
              </div>

              {/* Bottom safe area gradient */}
              <div
                className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
                style={{
                  background: "linear-gradient(180deg, transparent 0%, rgba(8, 8, 20, 0.9) 100%)",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
