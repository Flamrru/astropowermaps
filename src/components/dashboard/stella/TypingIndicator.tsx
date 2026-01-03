"use client";

import { motion } from "framer-motion";
import Image from "next/image";

/**
 * TypingIndicator
 *
 * Shows "Stella is typing..." with animated dots while waiting for response.
 * Matches the assistant message styling.
 */
export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex gap-2 items-start"
    >
      {/* Stella avatar */}
      <div
        className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
        style={{
          border: "1.5px solid rgba(201, 162, 39, 0.4)",
        }}
      >
        <Image
          src="/images/stella.png"
          alt="Stella"
          width={32}
          height={32}
          className="w-full h-full object-cover object-top"
          style={{ transform: "scale(1.2)" }}
        />
      </div>

      {/* Typing bubble */}
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: "rgba(201, 162, 39, 0.6)" }}
              animate={{
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
