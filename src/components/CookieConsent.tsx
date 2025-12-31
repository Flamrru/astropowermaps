"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_CONSENT_KEY = "cookie-consent-accepted";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show on all slides until user accepts or declines
    const hasResponded = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasResponded) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-4 left-4 right-4 z-50 flex justify-center"
        >
          {/* Compact single-line banner */}
          <div className="w-full max-w-md bg-black/80 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2.5 flex items-center justify-between gap-3">
            <p className="text-white/70 text-[11px]">
              <Link href="/cookies" className="hover:text-white/90">
                Cookies
              </Link>
              {" "}help us improve.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecline}
                className="text-[11px] text-white/50 hover:text-white/80 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="text-[11px] text-[#E8C547] font-medium hover:text-[#f0d060] transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
