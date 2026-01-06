"use client";

import { motion } from "framer-motion";

/**
 * Calculate days into 2026 (since we're in 2026)
 */
function calculateDaysInto2026(): number {
  const now = new Date();
  const startOf2026 = new Date(2026, 0, 1);

  // If before 2026, return 0
  if (now < startOf2026) return 0;

  const diffTime = now.getTime() - startOf2026.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export default function UrgencySection() {
  const daysInto2026 = calculateDaysInto2026();

  return (
    <section className="px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        {/* Days Counter - DRAMATIC */}
        <p
          className="text-white text-2xl font-bold mb-4"
          style={{
            textShadow:
              "0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)",
          }}
        >
          You&apos;re{" "}
          <motion.span
            className="text-red-500 text-4xl font-black inline-block"
            style={{
              textShadow:
                "0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.4), 0 0 60px rgba(239, 68, 68, 0.2)",
            }}
            animate={{
              scale: [1, 1.05, 1],
              textShadow: [
                "0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.4)",
                "0 0 20px rgba(239, 68, 68, 1), 0 0 40px rgba(239, 68, 68, 0.8), 0 0 60px rgba(239, 68, 68, 0.6)",
                "0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.4)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {daysInto2026}
          </motion.span>{" "}
          days into 2026.
        </p>

        {/* Hook */}
        <p
          className="text-white text-xl font-semibold mb-4"
          style={{
            textShadow: "0 0 15px rgba(255, 255, 255, 0.4)",
          }}
        >
          Still planning blind?
        </p>

        {/* Message */}
        <p className="text-white text-[15px] leading-relaxed mb-3">
          Your next power month — or your worst month — could be right around
          the corner.
        </p>

        {/* Closing */}
        <p className="text-white/80 text-[14px] italic">
          One of them is coming either way. Might as well know which.
        </p>
      </motion.div>
    </section>
  );
}
