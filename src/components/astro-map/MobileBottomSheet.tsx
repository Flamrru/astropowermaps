"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence, useDragControls, PanInfo } from "framer-motion";
import { X } from "lucide-react";

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  accentColor?: string;
  glowColor?: string;
}

export default function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  accentColor = "#E8C547",
  glowColor = "rgba(232, 197, 71, 0.4)",
}: MobileBottomSheetProps) {
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    // Close if dragged down more than 100px or with enough velocity
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            className="absolute inset-x-0 bottom-0 rounded-t-[2rem] max-h-[85vh] overflow-hidden touch-pan-y"
            style={{
              background: "linear-gradient(180deg, rgba(15, 15, 35, 0.98) 0%, rgba(5, 5, 16, 0.99) 100%)",
              boxShadow: `0 -8px 50px rgba(0,0,0,0.6), 0 0 100px ${glowColor}`,
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Drag Handle */}
            <div
              className="flex justify-center py-4 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <motion.div
                animate={{ width: isDragging ? 60 : 56 }}
                className="h-1.5 rounded-full transition-all"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)`,
                }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4">
              <div className="flex items-center gap-3">
                {/* Icon with glow */}
                {icon && (
                  <motion.div
                    animate={{
                      boxShadow: [`0 0 20px ${glowColor}`, `0 0 40px ${glowColor}`, `0 0 20px ${glowColor}`],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}15 0%, transparent 100%)`,
                      border: `1px solid ${accentColor}40`,
                    }}
                  >
                    {icon}
                  </motion.div>
                )}
                <div>
                  <h3 className="text-white font-bold text-lg">{title}</h3>
                  {subtitle && (
                    <p className="text-white/40 text-xs">{subtitle}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl hover:bg-white/10 transition-colors"
                style={{ background: "rgba(255, 255, 255, 0.05)" }}
              >
                <X size={18} className="text-white/60" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(85vh-100px)] overscroll-contain pb-8">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Preset configurations for common sheet types
export function ForecastBottomSheet({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="2026 Forecast"
      subtitle="Your power months"
      icon={
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#E8C547"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      }
      accentColor="#E8C547"
      glowColor="rgba(232, 197, 71, 0.3)"
    >
      {children}
    </MobileBottomSheet>
  );
}

export function PlacesBottomSheet({
  isOpen,
  onClose,
  children,
  accentColor = "#E8C547",
  glowColor = "rgba(232, 197, 71, 0.3)",
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  accentColor?: string;
  glowColor?: string;
}) {
  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Power Places"
      subtitle="Your cosmic destinations"
      icon={
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={accentColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      }
      accentColor={accentColor}
      glowColor={glowColor}
    >
      {children}
    </MobileBottomSheet>
  );
}

export function LinesBottomSheet({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Planetary Lines"
      subtitle="Toggle visibility"
      icon={
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#C9A227"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      }
      accentColor="#C9A227"
      glowColor="rgba(201, 162, 39, 0.3)"
    >
      {children}
    </MobileBottomSheet>
  );
}
