"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const WITHOUT_ITEMS = [
  "Picking travel destinations randomly",
  "Starting projects whenever it's \"convenient\"",
  "Making big decisions when you feel pressure",
  "Wondering why some months feel like a grind",
  "Hoping timing works out",
];

const WITH_ITEMS = [
  "Traveling to places that amplify your energy",
  "Launching in months where momentum is on your side",
  "Making decisions when clarity peaks",
  "Resting in low-energy months instead of forcing it",
  "Knowing the timing — not hoping",
];

export default function ComparisonBox() {
  return (
    <section className="py-8 px-5">
      {/* Without */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl p-5 mb-4"
        style={{
          background: "rgba(255, 100, 100, 0.05)",
          border: "1px solid rgba(255, 100, 100, 0.15)",
        }}
      >
        <p className="text-white/70 text-[15px] font-medium mb-4">
          Planning 2026 without your map:
        </p>
        <ul className="space-y-3">
          {WITHOUT_ITEMS.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <X className="w-4 h-4 text-red-400/70 mt-0.5 flex-shrink-0" />
              <span className="text-white/50 text-[14px]">{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* With */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg, rgba(201, 162, 39, 0.08), rgba(201, 162, 39, 0.03))",
          border: "1px solid rgba(201, 162, 39, 0.25)",
        }}
      >
        <p className="text-gold text-[15px] font-medium mb-4">
          Planning 2026 with your map:
        </p>
        <ul className="space-y-3">
          {WITH_ITEMS.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
              <span className="text-white/80 text-[14px]">{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
