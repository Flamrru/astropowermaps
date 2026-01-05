"use client";

import { motion } from "framer-motion";
import { Calendar, Map, Sparkles, CheckCircle } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="px-5 pt-6 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        {/* Main Title - Much bigger */}
        <h1 className="text-white text-[32px] leading-tight font-bold mb-4">
          Unlock Your <span className="text-gold-glow">2026</span>
        </h1>

        {/* Positioning Copy Block with icons */}
        <div
          className="rounded-xl p-5"
          style={{
            background: "linear-gradient(135deg, rgba(232, 197, 71, 0.1), rgba(201, 162, 39, 0.05))",
            border: "1px solid rgba(232, 197, 71, 0.2)",
          }}
        >
          <div className="space-y-3">
            {/* WHEN - Calendar */}
            <div className="flex items-center justify-center gap-3">
              <Calendar className="w-5 h-5 text-gold/70 flex-shrink-0" />
              <p className="text-white text-[15px]">
                Your <span className="text-gold font-medium">2026 Forecast</span> tells you <strong className="text-white font-bold">WHEN</strong>.
              </p>
            </div>

            {/* WHERE - Map */}
            <div className="flex items-center justify-center gap-3">
              <Map className="w-5 h-5 text-gold/70 flex-shrink-0" />
              <p className="text-white text-[15px]">
                Your <span className="text-gold font-medium">Birth Chart</span> tells you <strong className="text-white font-bold">WHERE</strong>.
              </p>
            </div>

            {/* WHAT - Sparkles */}
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-5 h-5 text-gold/70 flex-shrink-0" />
              <p className="text-white text-[15px]">
                Your <span className="text-gold font-medium">Daily Guidance</span> tells you <strong className="text-white font-bold">WHAT</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Goal tagline with green check */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <CheckCircle
            className="w-5 h-5 flex-shrink-0"
            style={{
              color: "#22c55e",
              filter: "drop-shadow(0 0 6px rgba(34, 197, 94, 0.5))"
            }}
          />
          <p className="text-white text-[14px]">
            <span className="text-white/80">Goal:</span> you know exactly how to move through your year
          </p>
        </div>
      </motion.div>
    </section>
  );
}
