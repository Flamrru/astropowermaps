"use client";

import { motion } from "framer-motion";

interface CredibilityBarProps {
  publications: readonly string[];
}

export default function CredibilityBar({ publications }: CredibilityBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-xl py-3 px-4"
    >
      <p className="text-white/50 text-xs text-center mb-2">As seen in</p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {publications.map((pub, index) => (
          <span
            key={index}
            className="text-white/70 text-xs font-medium tracking-wide"
          >
            {pub}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
