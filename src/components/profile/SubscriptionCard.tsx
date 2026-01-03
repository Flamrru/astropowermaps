"use client";

import { motion } from "framer-motion";
import { Sparkles, CreditCard, ExternalLink } from "lucide-react";
import { useProfile } from "./ProfileShell";

/**
 * SubscriptionCard
 *
 * Shows subscription status with a cosmic-themed badge.
 * Links to Stripe customer portal for management.
 */
export default function SubscriptionCard() {
  const { state } = useProfile();
  const { profile, userEmail } = state;

  if (!profile) return null;

  const statusConfig: Record<
    string,
    { label: string; color: string; glow: string; icon: string }
  > = {
    active: {
      label: "Active",
      color: "#4ADE80",
      glow: "rgba(74, 222, 128, 0.3)",
      icon: "✨",
    },
    past_due: {
      label: "Past Due",
      color: "#FBBF24",
      glow: "rgba(251, 191, 36, 0.3)",
      icon: "⚠️",
    },
    canceled: {
      label: "Canceled",
      color: "#F87171",
      glow: "rgba(248, 113, 113, 0.3)",
      icon: "🌑",
    },
    none: {
      label: "Free",
      color: "#94A3B8",
      glow: "rgba(148, 163, 184, 0.2)",
      icon: "🌙",
    },
  };

  const status = statusConfig[profile.subscriptionStatus] || statusConfig.none;

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
          Subscription
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
        {/* Top accent with gradient */}
        <div
          className="h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${status.color}40, transparent)`,
          }}
        />

        <div className="p-5">
          {/* Status row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Status icon with glow */}
              <motion.div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                style={{
                  background: `linear-gradient(135deg, ${status.color}15, ${status.color}08)`,
                  border: `1px solid ${status.color}30`,
                  boxShadow: `0 0 20px ${status.glow}`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 20px ${status.glow}`,
                    `0 0 30px ${status.glow}`,
                    `0 0 20px ${status.glow}`,
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {status.icon}
              </motion.div>

              <div>
                <div className="text-white/40 text-xs uppercase tracking-wider mb-0.5">
                  Status
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: status.color }}
                  >
                    {status.label}
                  </span>
                  {profile.subscriptionStatus === "active" && (
                    <Sparkles size={14} style={{ color: status.color }} />
                  )}
                </div>
              </div>
            </div>

            {/* Stella+ badge for active */}
            {profile.subscriptionStatus === "active" && (
              <div
                className="px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: "linear-gradient(135deg, rgba(201, 162, 39, 0.2), rgba(139, 92, 246, 0.1))",
                  border: "1px solid rgba(201, 162, 39, 0.3)",
                  color: "#E8C547",
                }}
              >
                Stella+
              </div>
            )}
          </div>

          {/* Account email */}
          {userEmail && (
            <div className="flex items-center gap-3 p-3 rounded-xl mb-3"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <CreditCard size={16} className="text-white/30" />
              <div className="flex-1 min-w-0">
                <div className="text-white/30 text-[10px] uppercase tracking-wider">
                  Account
                </div>
                <div className="text-white/70 text-sm truncate">{userEmail}</div>
              </div>
            </div>
          )}
        </div>

        {/* Manage subscription link */}
        {profile.subscriptionStatus !== "none" && (
          <div
            className="px-5 py-3 border-t"
            style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
          >
            <motion.button
              whileHover={{ x: 4 }}
              onClick={() => {
                // TODO: Implement Stripe customer portal redirect
                console.log("Open Stripe customer portal");
              }}
              className="text-xs text-[#E8C547]/70 hover:text-[#E8C547] transition-colors flex items-center gap-1.5"
            >
              <span>Manage subscription</span>
              <ExternalLink size={10} />
            </motion.button>
          </div>
        )}

        {/* Upgrade prompt for free users */}
        {profile.subscriptionStatus === "none" && (
          <div
            className="px-5 py-4 border-t"
            style={{
              borderColor: "rgba(255, 255, 255, 0.06)",
              background: "linear-gradient(180deg, rgba(201, 162, 39, 0.05), transparent)",
            }}
          >
            <motion.a
              href="/reveal"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block w-full py-3 rounded-xl text-center text-sm font-medium transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(201, 162, 39, 0.2), rgba(201, 162, 39, 0.1))",
                border: "1px solid rgba(201, 162, 39, 0.3)",
                color: "#E8C547",
              }}
            >
              Upgrade to Stella+ ✨
            </motion.a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
