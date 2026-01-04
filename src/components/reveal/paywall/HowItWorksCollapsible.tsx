"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Atom } from "lucide-react";

export default function HowItWorksCollapsible() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="px-5 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Header / Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-3 p-4 text-left"
        >
          <Atom className="w-5 h-5 text-gold/60" />
          <span className="text-white/80 text-[15px] font-medium flex-1">
            How we calculate your map
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-white/40" />
          </motion.div>
        </button>

        {/* Collapsible Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-5 pt-0 space-y-4">
                <p className="text-white/60 text-[13px] leading-relaxed">
                  When you entered your birth data, we didn&apos;t pull a
                  generic chart.
                </p>

                <p className="text-white/50 text-[13px] leading-relaxed">
                  We converted your birth moment to a Julian Day number — the
                  same system astronomers use. Then we calculated exactly where
                  each of the 10 planets was in the sky at that instant using
                  VSOP87 theory (Variational Secular Perturbation — fancy name,
                  NASA-grade accuracy).
                </p>

                <p className="text-white/50 text-[13px] leading-relaxed">
                  From there, we computed 40 lines showing where each planet was
                  rising, setting, at its highest point, and its lowest — and
                  matched them against 338 cities worldwide.
                </p>

                <p className="text-white/50 text-[13px] leading-relaxed">
                  Your power months? We analyzed every single day of 2026,
                  checking when transiting planets form exact angles to your
                  natal positions. Tighter angles = stronger score.
                </p>

                <p className="text-gold/70 text-[14px] font-medium mt-4">
                  Result: A map that&apos;s yours and only yours.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
