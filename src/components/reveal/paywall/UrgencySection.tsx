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
    <section className="px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        {/* Days Counter */}
        <p className="text-white/60 text-[15px] mb-2">
          You&apos;re{" "}
          <span className="text-red-400 font-bold">{daysInto2026}</span> days
          into 2026.
        </p>

        {/* Hook */}
        <p className="text-white/80 text-lg font-semibold mb-4">
          Still planning blind?
        </p>

        {/* Message */}
        <p className="text-white/50 text-[14px] leading-relaxed mb-2">
          Your next power month — or your worst month — could be right around
          the corner.
        </p>

        {/* Closing */}
        <p className="text-white/40 text-[13px] italic">
          One of them is coming either way. Might as well know which.
        </p>
      </motion.div>
    </section>
  );
}
