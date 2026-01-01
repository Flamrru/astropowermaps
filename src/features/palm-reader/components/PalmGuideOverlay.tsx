"use client";

import { motion } from "framer-motion";

interface PalmGuideOverlayProps {
  isReady?: boolean;
}

export default function PalmGuideOverlay({ isReady = false }: PalmGuideOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Simple elegant frame guide */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Outer darkened area */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 55% 45% at 50% 45%, transparent 0%, rgba(5,5,16,0.7) 100%)",
          }}
        />

        {/* Clean rectangular frame */}
        <motion.div
          className="relative w-[75%] max-w-[280px] aspect-[3/4] rounded-3xl"
          style={{
            border: `2px ${isReady ? 'solid' : 'dashed'} ${isReady ? '#6EE7B7' : 'rgba(201,162,39,0.6)'}`,
            boxShadow: isReady
              ? '0 0 30px rgba(110,231,183,0.3), inset 0 0 30px rgba(110,231,183,0.1)'
              : '0 0 30px rgba(201,162,39,0.2), inset 0 0 30px rgba(201,162,39,0.05)',
          }}
          animate={!isReady ? {
            borderColor: ['rgba(201,162,39,0.4)', 'rgba(201,162,39,0.8)', 'rgba(201,162,39,0.4)'],
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {/* Corner accents */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 133">
            <g
              stroke={isReady ? '#6EE7B7' : '#C9A227'}
              strokeWidth="2"
              fill="none"
              opacity={0.8}
            >
              {/* Top left */}
              <path d="M 5 20 L 5 5 L 20 5" />
              {/* Top right */}
              <path d="M 95 20 L 95 5 L 80 5" />
              {/* Bottom left */}
              <path d="M 5 113 L 5 128 L 20 128" />
              {/* Bottom right */}
              <path d="M 95 113 L 95 128 L 80 128" />
            </g>
          </svg>

          {/* Center crosshair */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 40 40" className="opacity-30">
              <circle
                cx="20"
                cy="20"
                r="15"
                fill="none"
                stroke={isReady ? '#6EE7B7' : '#C9A227'}
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <line x1="20" y1="5" x2="20" y2="12" stroke={isReady ? '#6EE7B7' : '#C9A227'} strokeWidth="1" />
              <line x1="20" y1="28" x2="20" y2="35" stroke={isReady ? '#6EE7B7' : '#C9A227'} strokeWidth="1" />
              <line x1="5" y1="20" x2="12" y2="20" stroke={isReady ? '#6EE7B7' : '#C9A227'} strokeWidth="1" />
              <line x1="28" y1="20" x2="35" y2="20" stroke={isReady ? '#6EE7B7' : '#C9A227'} strokeWidth="1" />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Top instruction text */}
      <motion.div
        className="absolute top-6 left-0 right-0 text-center px-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p
          className="text-sm font-medium tracking-wide"
          style={{
            color: isReady ? "#6EE7B7" : "rgba(255,255,255,0.9)",
            textShadow: "0 2px 10px rgba(0,0,0,0.8)",
          }}
        >
          {isReady ? "Perfect! Hold steady..." : "Place your palm inside the frame"}
        </p>
      </motion.div>

      {/* Simple tips - moved up */}
      <motion.div
        className="absolute bottom-4 left-0 right-0 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex justify-center gap-4 text-[11px] text-white/60">
          <span>Palm facing camera</span>
          <span>•</span>
          <span>Good lighting</span>
          <span>•</span>
          <span>Hold steady</span>
        </div>
      </motion.div>
    </div>
  );
}
