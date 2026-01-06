"use client";

import { motion } from "framer-motion";

export default function FeaturedInLogos() {
  return (
    <section className="px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="credibility-bar-premium rounded-2xl py-4 px-4"
      >
        <p className="text-white/80 text-[10px] text-center mb-3 uppercase tracking-[0.2em] font-medium">
          As featured in
        </p>
        {/* Top row */}
        <div className="flex items-center justify-center gap-5 mb-2">
          {/* NYTimes - Gothic style */}
          <span
            className="text-white/90 text-[16px] font-serif tracking-tight"
            style={{ fontFamily: "Georgia, Times, serif", fontStyle: "italic" }}
          >
            The New York Times
          </span>
          {/* WIRED - blocky style */}
          <span className="text-white/90 text-[15px] font-bold tracking-widest uppercase">
            WIRED
          </span>
        </div>
        {/* Bottom row */}
        <div className="flex items-center justify-center gap-6">
          {/* Forbes */}
          <span className="text-white/90 text-[16px] font-serif font-bold tracking-tight">
            Forbes
          </span>
          {/* healthline */}
          <span className="text-white/90 text-[15px] font-sans font-medium">
            healthline
          </span>
          {/* girlboss */}
          <span className="text-white/90 text-[15px] font-sans font-bold lowercase">
            girlboss
          </span>
        </div>
      </motion.div>
    </section>
  );
}
