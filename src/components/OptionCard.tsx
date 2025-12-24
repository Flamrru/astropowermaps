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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      whileTap={{ scale: 0.98 }}
      className={`
        w-full py-4 px-5 rounded-xl text-left
        transition-all duration-250
        min-h-[54px] flex items-center
        ${selected
          ? "glass-card-selected border border-[rgba(201,162,39,0.5)]"
          : "glass-card"
        }
      `}
    >
      <span className={`text-[15px] leading-snug ${selected ? "text-white" : "text-white/85"}`}>
        {text}
      </span>
    </motion.button>
  );
}
