"use client";

import { motion } from "framer-motion";
import { Telescope } from "lucide-react";

export default function CredibilityBlock() {
  return (
    <section className="px-5 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl p-5"
        style={{
          background:
            "linear-gradient(135deg, rgba(60, 50, 120, 0.12), rgba(40, 35, 80, 0.08))",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Title row: icon + title */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="flex-shrink-0 p-2.5 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(232, 197, 71, 0.15), rgba(201, 162, 39, 0.08))",
            }}
          >
            <Telescope className="w-6 h-6 text-gold" />
          </div>
          <h3 className="text-white text-[16px] font-bold">
            Built on real astronomy. No fluff.
          </h3>
        </div>

        {/* Paragraphs - aligned with icon (full width) */}
        <p className="text-white/90 text-[13px] leading-relaxed mb-2">
          Your map is calculated using VSOP87 — the same planetary position
          algorithm used by NASA and the French Bureau des Longitudes. 40 lines.
          338 cities. Every day of 2026 pre-computed to 0.1° precision.
        </p>
        <p className="text-white/80 text-[12px] italic">
          This isn&apos;t your sun sign. This is your actual birth sky — mapped
          to Earth.
        </p>
      </motion.div>
    </section>
  );
}
