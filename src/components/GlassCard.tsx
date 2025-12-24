"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  animate = true,
}: GlassCardProps) {
  const Wrapper = animate ? motion.div : "div";
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
      }
    : {};

  return (
    <Wrapper
      {...animationProps}
      className={`glass-card rounded-2xl p-6 ${className}`}
    >
      {children}
    </Wrapper>
  );
}
