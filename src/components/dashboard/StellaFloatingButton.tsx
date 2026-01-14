"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X } from "lucide-react";
import StellaChatDrawer from "./stella/StellaChatDrawer";
import { useTrack } from "@/lib/hooks/useTrack";
import type { AstrocartographyResult } from "@/lib/astro/types";

interface StellaContext {
  displayMessage: string;
  hiddenContext: string;
}

interface StellaFloatingButtonProps {
  /** Pre-filled context from "Ask Stella about this day" */
  externalContext?: StellaContext | null;
  /** Callback when context has been consumed */
  onContextConsumed?: () => void;
  /** Override view context (e.g., "life-transits" when on Life Transits tab) */
  viewHint?: string;
  /** Astrocartography data when on map page */
  mapData?: AstrocartographyResult | null;
  /** Current month being viewed in calendar (e.g., "2026-01") */
  viewingMonth?: string;
}

/**
 * StellaFloatingButton
 *
 * Self-contained floating chat button that works in any page.
 * Opens a full-height drawer with the Stella AI chat interface.
 *
 * Can be triggered externally via externalContext prop (e.g., from Day Detail Modal).
 */
export default function StellaFloatingButton({
  externalContext,
  onContextConsumed,
  viewHint,
  mapData,
  viewingMonth,
}: StellaFloatingButtonProps = {}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const [pendingContext, setPendingContext] = useState<StellaContext | null>(null);
  const track = useTrack();
  const hasTrackedOpen = useRef(false);

  const handleNewChat = async () => {
    // Clear history from database
    try {
      await fetch("/api/stella/history", { method: "DELETE" });
    } catch {
      // Silently fail - UI will still reset
    }
    // Reset UI state
    setChatKey((prev) => prev + 1);
  };

  // Auto-open when external context is provided (e.g., "Ask Stella about this day")
  useEffect(() => {
    if (externalContext) {
      setPendingContext(externalContext);
      setIsChatOpen(true);
      // Track this as a context-triggered open
      track("stella_chat_open", { source: "ask_stella_button", viewHint }, "engagement");
      // Clear the external context so it doesn't re-trigger
      onContextConsumed?.();
    }
  }, [externalContext, onContextConsumed, track, viewHint]);

  // Lock body scroll when chat is open
  useEffect(() => {
    if (isChatOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isChatOpen]);

  const toggleChat = () => {
    setIsChatOpen((prev) => {
      const newState = !prev;
      // Track when chat opens (not closes)
      if (newState && !hasTrackedOpen.current) {
        track("stella_chat_open", { source: "floating_button", viewHint }, "engagement");
      }
      // Reset tracking flag when closed so we track next open
      if (!newState) {
        hasTrackedOpen.current = false;
      }
      return newState;
    });
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={toggleChat}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="fixed bottom-24 right-5 z-50"
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
            <div className="relative w-12 h-12 rounded-full overflow-hidden">
              <Image
                src="/images/stella.png"
                alt="Stella"
                width={48}
                height={48}
                className="w-full h-full object-cover object-top"
                style={{ transform: "scale(1.4)" }}
              />
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

      {/* Chat drawer */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Backdrop - z-50 to appear above BottomNav (z-40) */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleChat}
            />

            {/* Chat drawer - z-[60] to appear above backdrop */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[60] h-[95vh] rounded-t-3xl flex flex-col"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{
                background: "rgba(10, 10, 20, 0.98)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderBottom: "none",
              }}
            >
              {/* Handle */}
              <div className="flex-shrink-0 flex justify-center py-3">
                <div className="w-12 h-1 rounded-full bg-white/20" />
              </div>

              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between px-5 pb-4 border-b border-white/10">
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleNewChat}
                    className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1"
                  >
                    New chat
                  </button>
                  <button
                    onClick={toggleChat}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X size={20} className="text-white/60" />
                  </button>
                </div>
              </div>

              {/* Chat content */}
              <StellaChatDrawer
                isOpen={isChatOpen}
                resetKey={chatKey}
                prefillContext={pendingContext}
                onPrefillConsumed={() => setPendingContext(null)}
                viewHint={viewHint}
                mapData={mapData}
                viewingMonth={viewingMonth}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
