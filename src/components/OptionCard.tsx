"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface OptionCardProps {
  text: string;
  selected: boolean;
  onClick: () => void;
  index: number;
  icon?: LucideIcon;
}

export default function OptionCard({
  text,
  selected,
  onClick,
  index,
  icon: Icon,
}: OptionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      whileTap={{ scale: 0.98 }}
      className="w-full py-4 px-5 rounded-xl text-left transition-all duration-250 min-h-[54px] flex items-center gap-4"
      style={{
        background: selected
          ? 'rgba(201, 162, 39, 0.15)'
          : 'rgba(10, 10, 20, 0.45)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: selected
          ? '1px solid rgba(201, 162, 39, 0.5)'
          : '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: selected
          ? '0 0 20px rgba(201, 162, 39, 0.15), inset 0 0 30px rgba(201, 162, 39, 0.05)'
          : 'none',
      }}
    >
      {Icon && (
        <Icon
          className={`w-5 h-5 flex-shrink-0 ${selected ? "text-gold" : "text-white/60"}`}
          strokeWidth={1.5}
        />
      )}
      <span className={`text-[15px] leading-snug ${selected ? "text-white font-medium" : "text-white"}`}>
        {text}
      </span>
    </motion.button>
  );
}
