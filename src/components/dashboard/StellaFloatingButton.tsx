"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useDashboard } from "./DashboardShell";
import { X, MessageCircle } from "lucide-react";

/**
 * StellaFloatingButton
 *
 * Floating chat button that opens a chat modal/drawer for Stella AI.
 * Uses the Stella avatar from the palm-reader branch.
 */
export default function StellaFloatingButton() {
  const { state, dispatch } = useDashboard();
  const [isHovered, setIsHovered] = useState(false);

  const toggleChat = () => {
    dispatch({ type: "TOGGLE_CHAT" });
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={toggleChat}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-[-4px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(201, 162, 39, 0.4) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main button */}
        <div
          className="relative w-16 h-16 rounded-full overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(201, 162, 39, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)",
            border: "2px solid rgba(201, 162, 39, 0.5)",
            boxShadow: `
              0 0 20px rgba(201, 162, 39, 0.3),
              0 4px 20px rgba(0, 0, 0, 0.3),
              inset 0 0 20px rgba(0, 0, 0, 0.2)
            `,
          }}
        >
          {/* Stella avatar */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-14 h-14 rounded-full overflow-hidden">
              <Image
                src="/images/stella.png"
                alt="Stella"
                width={56}
                height={56}
                className="w-full h-full object-cover object-top"
                style={{ transform: "scale(1.3)" }}
                onError={(e) => {
                  // Fallback if image not found
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {/* Fallback icon if no image */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-gold-main/20">
                <MessageCircle size={24} className="text-gold" />
              </div>
            </div>
          </div>

          {/* Rotating ring */}
          <motion.div
            className="absolute inset-[-2px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="rgba(201, 162, 39, 0.3)"
                strokeWidth="0.5"
                strokeDasharray="6 4"
              />
            </svg>
          </motion.div>
        </div>

        {/* Hover label */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{
                  background: "rgba(0, 0, 0, 0.8)",
                  color: "#E8C547",
                  border: "1px solid rgba(201, 162, 39, 0.3)",
                }}
              >
                Chat with Stella
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification dot (for when there's new content) */}
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full"
          style={{
            background: "linear-gradient(135deg, #E8C547 0%, #C9A227 100%)",
            border: "2px solid rgba(5, 5, 16, 0.8)",
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </motion.button>

      {/* Chat Modal Placeholder */}
      <AnimatePresence>
        {state.isChatOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleChat}
            />

            {/* Chat drawer */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] rounded-t-3xl overflow-hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{
                background: "rgba(10, 10, 20, 0.95)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderBottom: "none",
              }}
            >
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className="w-12 h-1 rounded-full bg-white/20" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full overflow-hidden"
                    style={{
                      border: "2px solid rgba(201, 162, 39, 0.5)",
                    }}
                  >
                    <Image
                      src="/images/stella.png"
                      alt="Stella"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover object-top"
                      style={{ transform: "scale(1.2)" }}
                    />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Stella</h3>
                    <p className="text-white/40 text-xs">Your cosmic guide</p>
                  </div>
                </div>
                <button
                  onClick={toggleChat}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-white/60" />
                </button>
              </div>

              {/* Chat content placeholder */}
              <div className="h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{
                      background: "rgba(201, 162, 39, 0.1)",
                      border: "1px solid rgba(201, 162, 39, 0.3)",
                    }}
                  >
                    <MessageCircle size={32} className="text-gold" />
                  </div>
                  <h4 className="text-white font-display text-lg mb-2">
                    Stella Chat Coming Soon
                  </h4>
                  <p className="text-white/50 text-sm max-w-xs mx-auto">
                    Your personal AI astrology guide will be available here.
                    Ask about your chart, transits, and cosmic timing.
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
