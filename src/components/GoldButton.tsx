"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GoldButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  className?: string;
}

export default function GoldButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  type = "button",
  className = "",
}: GoldButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      className={`
        w-full py-4 px-8 rounded-full
        text-lg font-semibold
        transition-all duration-300
        ${isDisabled
          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
          : "gold-gradient gold-glow text-[#1a1a2e] hover:brightness-110"
        }
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          />
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
