"use client";

import { motion } from "framer-motion";
import { Lock, Shield, Zap, CreditCard } from "lucide-react";

interface CTABlockProps {
  onCtaClick: () => void;
  showTrustLine?: boolean;
  showGuarantee?: boolean;
  disabled?: boolean;
}

export default function CTABlock({
  onCtaClick,
  showTrustLine = true,
  showGuarantee = false,
  disabled = false,
}: CTABlockProps) {
  return (
    <div className="w-full">
      {/* CTA Button */}
      <motion.button
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={onCtaClick}
        disabled={disabled}
        className="w-full py-4 rounded-full text-[16px] font-semibold flex items-center justify-center gap-2 transition-all"
        style={{
          background: disabled
            ? "linear-gradient(180deg, #3a3a4a 0%, #2a2a3a 100%)"
            : "linear-gradient(180deg, #E8C547 0%, #C9A227 50%, #8B6914 100%)",
          color: disabled ? "rgba(255, 255, 255, 0.3)" : "#000",
          boxShadow: disabled
            ? "none"
            : "0 0 30px rgba(201, 162, 39, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <Lock className="w-5 h-5" />
        Get Access Now
      </motion.button>

      {/* Trust Line */}
      {showTrustLine && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-4 mt-4 text-white/40 text-[12px]"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Secure payment
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Instant access
          </span>
          <span className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            Cancel anytime
          </span>
        </motion.div>
      )}

      {/* Guarantee Block */}
      {showGuarantee && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 pt-6 border-t border-white/10"
        >
          <div className="text-center">
            <p className="text-white text-[18px] font-semibold mb-2">
              14-day money-back guarantee
            </p>
            <p className="text-white/70 text-[14px]">
              If the map doesn&apos;t resonate, email us for a full refund.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
