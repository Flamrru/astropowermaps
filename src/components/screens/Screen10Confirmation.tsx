"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import { COPY } from "@/content/copy";
import { Check, Share2 } from "lucide-react";

export default function Screen10Confirmation() {
  const handleShare = async () => {
    const shareData = {
      title: "2026 Power Map",
      text: "Discover your 3 power months and destinations for 2026!",
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.origin);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.log("Share failed:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* No header on confirmation */}

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="max-w-md mx-auto w-full text-center">
          {/* Success checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="mb-8"
          >
            <div className="w-20 h-20 mx-auto rounded-full gold-gradient gold-glow flex items-center justify-center">
              <Check className="w-10 h-10 text-[#1a1a2e]" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            {COPY.screen10.headline}
          </motion.h2>

          {/* Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg text-white/75 mb-8"
          >
            {COPY.screen10.text}
          </motion.p>

          {/* Share card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <GlassCard className="py-4 px-6">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-3 w-full text-white/80 hover:text-white transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>{COPY.screen10.shareText}</span>
              </button>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
