"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="px-5 pt-6 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        {/* Main Title - Plain text like old version */}
        <h2 className="text-white text-2xl font-bold mb-2">
          Unlock Your <span className="text-gold-glow">2026</span>
        </h2>

        {/* Positioning Copy Block */}
        <div
          className="rounded-xl p-5 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(232, 197, 71, 0.1), rgba(201, 162, 39, 0.05))",
            border: "1px solid rgba(232, 197, 71, 0.2)",
          }}
        >
          <p className="text-white/80 text-[15px] leading-loose">
            Your <span className="text-gold font-medium">2026 Forecast</span> tells you <strong className="text-white font-bold">WHEN</strong>.
            <br />
            Your <span className="text-gold font-medium">Birth Chart</span> tells you <strong className="text-white font-bold">WHERE</strong>.
            <br />
            Your <span className="text-gold font-medium">Daily Guidance</span> and <span className="text-gold font-medium">Stella</span> tell you <strong className="text-white font-bold">WHAT</strong> — every single day.
          </p>
        </div>

        {/* Tagline below container */}
        <p className="text-white/80 text-[14px] mt-4 italic">
          Together, they show you exactly how to move through your year — day by day.
        </p>
      </motion.div>
    </section>
  );
}
