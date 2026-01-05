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
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(185, 28, 28, 0.04))",
          border: "1px solid rgba(239, 68, 68, 0.2)",
        }}
      >
        <p
          className="text-red-400 text-[17px] font-semibold mb-4"
          style={{
            textShadow: "0 0 10px rgba(239, 68, 68, 0.6), 0 0 20px rgba(239, 68, 68, 0.4), 0 0 30px rgba(239, 68, 68, 0.2)",
          }}
        >
          Planning 2026 Without Your Map:
        </p>
        <ul className="space-y-3">
          {WITHOUT_ITEMS.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-white/70 text-[14px]">{item}</span>
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
          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(22, 163, 74, 0.04))",
          border: "1px solid rgba(34, 197, 94, 0.25)",
        }}
      >
        <p
          className="text-emerald-400 text-[17px] font-semibold mb-4"
          style={{
            textShadow: "0 0 10px rgba(52, 211, 153, 0.6), 0 0 20px rgba(52, 211, 153, 0.4), 0 0 30px rgba(52, 211, 153, 0.2)",
          }}
        >
          Planning 2026 With Your Map:
        </p>
        <ul className="space-y-3">
          {WITH_ITEMS.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-white/80 text-[14px]">{item}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
