"use client";

import { motion } from "framer-motion";
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
        await navigator.clipboard.writeText(window.location.origin);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.log("Share failed:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="max-w-md mx-auto w-full text-center">
          {/* Success checkmark */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
            className="mb-8"
          >
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, #E8C547 0%, #C9A227 50%, #8B6914 100%)',
                boxShadow: '0 0 40px rgba(201, 162, 39, 0.4), 0 0 80px rgba(201, 162, 39, 0.2)'
              }}
            >
              <Check className="w-10 h-10 text-[#1a1400]" strokeWidth={3} />
            </div>
          </motion.div>

          {/* Headline - with checkmark icon, large, bold */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="heading-display text-[32px] md:text-[38px] text-white mb-4 font-bold"
          >
            <span className="text-gold">✓</span> You&apos;re on the list.
          </motion.h2>

          {/* Text - muted */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-body text-[17px] text-muted-custom mb-10 leading-relaxed"
          >
            {COPY.screen10.text}
          </motion.p>

          {/* Share button */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <button
              onClick={handleShare}
              className="glass-card rounded-xl py-4 px-6 flex items-center justify-center gap-3 w-full text-white/70 hover:text-white/90 hover:border-white/20 transition-all"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-[15px]">{COPY.screen10.shareText}</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
