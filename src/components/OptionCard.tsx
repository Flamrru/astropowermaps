"use client";

import { motion } from "framer-motion";

interface OptionCardProps {
  text: string;
  selected: boolean;
  onClick: () => void;
  index: number;
}

export default function OptionCard({
  text,
  selected,
  onClick,
  index,
}: OptionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full py-4 px-5 rounded-2xl text-left
        transition-all duration-300
        min-h-[56px] flex items-center
        ${selected
          ? "glass-card option-selected"
          : "glass-card hover:border-white/20"
        }
      `}
    >
      <span className={`text-base ${selected ? "text-white" : "text-white/90"}`}>
        {text}
      </span>
    </motion.button>
  );
}
