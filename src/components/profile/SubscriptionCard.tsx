"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ExternalLink } from "lucide-react";
import { useProfile } from "./ProfileShell";

/**
 * SubscriptionCard
 *
 * Simple card showing account email and billing link.
 */
export default function SubscriptionCard() {
  const { state } = useProfile();
  const { profile, userEmail } = state;
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  if (!profile) return null;

  const handleOpenPortal = async () => {
    setIsLoadingPortal(true);
    setPortalError(null);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok && data.url) {
        window.open(data.url, "_blank");
      } else {
        setPortalError(data.error || "Unable to open billing portal");
      }
    } catch (error) {
      setPortalError("Connection error. Please try again.");
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mx-4"
    >
      {/* Section label */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-1 h-4 rounded-full"
          style={{ background: "linear-gradient(180deg, #E8C547 0%, #C9A227 100%)" }}
        />
        <h2 className="text-white/60 text-xs font-medium uppercase tracking-wider">
          Account
        </h2>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Top accent */}
        <div
          className="h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(201, 162, 39, 0.3), transparent)",
          }}
        />

        <div className="p-5">
          {/* Email */}
          {userEmail && (
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(201, 162, 39, 0.1)",
                  border: "1px solid rgba(201, 162, 39, 0.2)",
                }}
              >
                <Mail size={18} className="text-[#E8C547]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white/40 text-xs mb-0.5">Email</div>
                <div className="text-white/90 text-sm truncate">{userEmail}</div>
              </div>
            </div>
          )}
        </div>

        {/* Manage billing link */}
        <div
          className="px-5 py-3 border-t"
          style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
        >
          <motion.button
            whileHover={{ x: 4 }}
            onClick={handleOpenPortal}
            disabled={isLoadingPortal}
            className="text-xs text-[#E8C547]/70 hover:text-[#E8C547] transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoadingPortal ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block w-3 h-3 border border-[#E8C547]/30 border-t-[#E8C547] rounded-full"
                />
                <span>Opening...</span>
              </>
            ) : (
              <>
                <span>Manage billing</span>
                <ExternalLink size={10} />
              </>
            )}
          </motion.button>

          {/* Error message */}
          {portalError && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 px-3 py-2 rounded-lg text-xs text-red-300/80"
              style={{
                background: "rgba(248, 113, 113, 0.1)",
                border: "1px solid rgba(248, 113, 113, 0.2)",
              }}
            >
              {portalError}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
