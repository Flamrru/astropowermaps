"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Map, Calendar, User } from "lucide-react";

/**
 * BottomNav
 *
 * Celestial-themed bottom navigation for the Stella+ dashboard.
 * Features a floating orb indicator that glides between tabs.
 */

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
  href: string;
  enabled: boolean;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", icon: Home, href: "/dashboard", enabled: true },
  { id: "map", label: "Map", icon: Map, href: "/dashboard/map", enabled: true },
  { id: "calendar", label: "Calendar", icon: Calendar, href: "/dashboard/calendar", enabled: true },
  { id: "profile", label: "Profile", icon: User, href: "/dashboard/profile", enabled: true },
];

interface BottomNavProps {
  /** Enable auto-hide behavior (for map view) */
  autoHide?: boolean;
  /** Callback when user interacts during auto-hide mode */
  onInteraction?: () => void;
}

export default function BottomNav({ autoHide = false, onInteraction }: BottomNavProps) {
  const pathname = usePathname();
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide logic: hide nav when user interacts with map, show after 3 seconds
  const triggerHide = useCallback(() => {
    if (!autoHide) return;

    setIsVisible(false);
    onInteraction?.();

    // Clear any existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // Show nav again after 3 seconds
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 3000);
  }, [autoHide, onInteraction]);

  // Listen for map interactions (touch/mouse events on the map container)
  useEffect(() => {
    if (!autoHide) {
      setIsVisible(true);
      return;
    }

    const handleInteraction = () => triggerHide();

    // Listen for touch and pointer events on the document
    // Map component will be the main interactive area
    const mapContainer = document.querySelector(".mapboxgl-canvas-container");
    if (mapContainer) {
      mapContainer.addEventListener("touchstart", handleInteraction, { passive: true });
      mapContainer.addEventListener("mousedown", handleInteraction);
    }

    return () => {
      if (mapContainer) {
        mapContainer.removeEventListener("touchstart", handleInteraction);
        mapContainer.removeEventListener("mousedown", handleInteraction);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [autoHide, triggerHide]);

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname?.startsWith("/dashboard/map")) return "map";
    if (pathname?.startsWith("/dashboard/calendar")) return "calendar";
    if (pathname?.startsWith("/dashboard/profile")) return "profile";
    return "home";
  };

  const activeTab = getActiveTab();
  const activeIndex = navItems.findIndex((item) => item.id === activeTab);

  const handleDisabledClick = (label: string) => {
    setShowToast(label);
    setTimeout(() => setShowToast(null), 2000);
  };

  return (
    <>
      {/* Toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="fixed bottom-28 left-1/2 z-50"
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 10, x: "-50%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="px-5 py-2.5 rounded-full text-sm font-medium"
              style={{
                background: "rgba(10, 10, 20, 0.95)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "var(--element-primary, #E8C547)",
                boxShadow: `
                  0 4px 20px rgba(0, 0, 0, 0.4),
                  0 0 30px var(--element-glow, rgba(201, 162, 39, 0.2))
                `,
              }}
            >
              <span className="mr-1.5">✨</span>
              {showToast} coming soon
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation bar */}
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            className="fixed bottom-0 left-0 right-0 z-40"
            style={{
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
        {/* Gradient fade above nav */}
        <div
          className="absolute -top-8 left-0 right-0 h-8 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(5, 5, 16, 0.9) 0%, transparent 100%)",
          }}
        />

        {/* Main nav container */}
        <div
          className="relative mx-3 mb-2 rounded-2xl overflow-hidden"
          style={{
            background: "rgba(15, 15, 30, 0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: `
              0 -4px 30px rgba(0, 0, 0, 0.3),
              0 4px 20px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.05)
            `,
          }}
        >
          {/* Subtle star particles in background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-0.5 h-0.5 rounded-full bg-white/30"
                style={{
                  left: `${12 + i * 12}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
                animate={{
                  opacity: [0.2, 0.6, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              />
            ))}
          </div>

          {/* Floating orb indicator */}
          <motion.div
            className="absolute top-2 h-12 pointer-events-none"
            style={{ width: "64px" }}
            initial={false}
            animate={{
              left: `${activeIndex * 25 + 12.5}%`,
              x: "-50%",
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35,
            }}
          >
            {/* Outer glow */}
            <div
              className="absolute rounded-2xl"
              style={{
                background: `radial-gradient(ellipse at center, var(--element-glow, rgba(201, 162, 39, 0.4)) 0%, transparent 70%)`,
                width: "80px",
                height: "48px",
                left: "50%",
                transform: "translateX(-50%)",
                top: "0",
                filter: "blur(8px)",
              }}
            />
            {/* Inner highlight */}
            <div
              className="absolute rounded-xl"
              style={{
                background: `linear-gradient(180deg, var(--element-primary, #E8C547)15 0%, transparent 100%)`,
                width: "48px",
                height: "32px",
                left: "50%",
                transform: "translateX(-50%)",
                top: "4px",
                opacity: 0.5,
              }}
            />
          </motion.div>

          {/* Nav items */}
          <div className="relative flex items-center justify-around py-2 px-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              const content = (
                <motion.div
                  className="flex flex-col items-center justify-center py-2 px-4 rounded-xl relative"
                  whileTap={{ scale: 0.95 }}
                  style={{ minWidth: "64px" }}
                >
                  {/* Icon */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -2 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 2}
                      style={{
                        color: isActive
                          ? "var(--element-primary, #E8C547)"
                          : "rgba(255, 255, 255, 0.5)",
                        filter: isActive
                          ? "drop-shadow(0 0 8px var(--element-glow, rgba(201, 162, 39, 0.6)))"
                          : "none",
                        transition: "color 0.3s ease, filter 0.3s ease",
                      }}
                    />
                  </motion.div>

                  {/* Label */}
                  <motion.span
                    className="text-[10px] font-medium mt-1 tracking-wide"
                    animate={{
                      opacity: isActive ? 1 : 0.5,
                    }}
                    style={{
                      color: isActive
                        ? "var(--element-primary, #E8C547)"
                        : "rgba(255, 255, 255, 0.5)",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {item.label}
                  </motion.span>

                  {/* Active dot indicator */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          background: "var(--element-primary, #E8C547)",
                          boxShadow:
                            "0 0 6px var(--element-glow, rgba(201, 162, 39, 0.8))",
                        }}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              );

              // Enabled items use Link, disabled show toast
              if (item.enabled) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="relative z-10"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleDisabledClick(item.label)}
                  className="relative z-10"
                >
                  {content}
                </button>
              );
            })}
          </div>

          {/* Bottom accent line */}
          <div
            className="absolute bottom-0 left-4 right-4 h-px"
            style={{
              background: `linear-gradient(90deg, transparent 0%, var(--element-primary, #E8C547)30 50%, transparent 100%)`,
            }}
          />
        </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
