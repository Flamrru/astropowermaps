"use client";

import { motion } from "framer-motion";
import { useDashboard } from "./DashboardShell";

/**
 * BigThreeHeader
 *
 * Displays the user's Sun, Moon, and Rising signs with a personalized welcome.
 * This is their cosmic identity card - the first thing they see on the dashboard.
 */
export default function BigThreeHeader() {
  const { state } = useDashboard();
  const { bigThree, subscriber } = state;

  if (!bigThree || !subscriber) return null;

  const placements = [
    {
      type: "Sun",
      icon: "☀️",
      sign: bigThree.sun.sign,
      symbol: bigThree.sun.symbol,
      element: bigThree.sun.element,
    },
    {
      type: "Moon",
      icon: "🌙",
      sign: bigThree.moon.sign,
      symbol: bigThree.moon.symbol,
      element: bigThree.moon.element,
    },
    {
      type: "Rising",
      icon: "⬆️",
      sign: bigThree.rising.sign,
      symbol: bigThree.rising.symbol,
      element: bigThree.rising.element,
    },
  ];

  return (
    <motion.header
      className="px-4 pt-6 pb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glass card container */}
      <motion.div
        className="relative overflow-hidden rounded-2xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: `
            0 0 40px var(--element-glow, rgba(201, 162, 39, 0.15)),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
        }}
      >
        {/* Subtle element-colored top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg,
              transparent 0%,
              var(--element-primary, #C9A227) 30%,
              var(--element-primary, #C9A227) 70%,
              transparent 100%
            )`,
            opacity: 0.7,
          }}
        />

        {/* Background shimmer effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(
              120deg,
              transparent 30%,
              rgba(255, 255, 255, 0.03) 50%,
              transparent 70%
            )`,
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["200% 0%", "-200% 0%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <div className="relative p-5">
          {/* Big Three Display */}
          <div className="flex items-center justify-center gap-3 mb-4">
            {placements.map((placement, index) => (
              <motion.div
                key={placement.type}
                className="flex items-center gap-1.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + index * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {/* Icon with glow */}
                <span
                  className="text-base"
                  style={{
                    filter: `drop-shadow(0 0 6px var(--element-glow, rgba(201, 162, 39, 0.5)))`,
                  }}
                >
                  {placement.icon}
                </span>

                {/* Sign name */}
                <span
                  className="text-sm font-medium tracking-wide"
                  style={{
                    color: "var(--element-primary, #E8C547)",
                    textShadow: "0 0 20px var(--element-glow, rgba(201, 162, 39, 0.4))",
                  }}
                >
                  {placement.sign}
                </span>

                {/* Separator dot (except last) */}
                {index < placements.length - 1 && (
                  <span className="text-white/20 ml-1.5">·</span>
                )}
              </motion.div>
            ))}
          </div>

          {/* Welcome message */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h1
              className="text-xl font-display font-semibold tracking-tight"
              style={{
                background: "linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Welcome back, {subscriber.displayName}
              <motion.span
                className="inline-block ml-1.5"
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
              >
                ✨
              </motion.span>
            </h1>
          </motion.div>
        </div>

        {/* Bottom decorative element - subtle constellation dots */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-6 opacity-20">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-0.5 h-0.5 rounded-full bg-white"
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.header>
  );
}
