"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-gold/70" />
          <p className="text-white/80 text-[14px] font-semibold">
            Built on real astronomy. Not horoscope fluff.
          </p>
        </div>
        <p className="text-white/50 text-[13px] leading-relaxed mb-3">
          Your map is calculated using VSOP87 — the same planetary position
          algorithm used by NASA and the French Bureau des Longitudes. 40 lines.
          338 cities. Every day of 2026 pre-computed to 0.1° precision.
        </p>
        <p className="text-white/40 text-[12px] italic">
          This isn&apos;t your sun sign. This is your actual birth sky — mapped
          to Earth.
        </p>
      </motion.div>
    </section>
  );
}
