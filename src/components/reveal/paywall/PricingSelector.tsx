"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, ShieldCheck } from "lucide-react";
import { type PlanId, SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";

// Variant type for A/B testing and winback offers
export type PaywallVariant = "subscription" | "single" | "winback";

interface Plan {
  id: PlanId;
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  highlight?: boolean;
}

// Subscription variant plans (current default) - display configuration
const SUBSCRIPTION_PLANS_DISPLAY: Plan[] = [
  {
    id: "trial_3day",
    name: "3-Day Trial",
    duration: "3-day trial",
    price: 2.99,
  },
  {
    id: "trial_7day",
    name: "7-Day Trial",
    duration: "7-day trial",
    price: 5.99,
    originalPrice: 12.0,
    badge: "Most popular",
    highlight: true,
  },
  {
    id: "trial_14day",
    name: "14-Day Trial",
    duration: "14-day trial",
    price: 9.99,
  },
];

// Single payment variant plan (A/B test variant B)
const SINGLE_PAYMENT_PLAN: Plan = {
  id: "one_time",
  name: "Full Access",
  duration: "one-time payment",
  price: 19.99,
  originalPrice: 49.0,
  badge: "Save 60%",
  highlight: true,
};

// Winback offer plan (email lead re-engagement)
const WINBACK_PLAN: Plan = {
  id: "winback",
  name: "Special Offer",
  duration: "one-time payment",
  price: 9.99,
  originalPrice: 49.0,
  badge: "Save 80%",
  highlight: true,
};

interface PricingSelectorProps {
  selectedPlan: PlanId;
  onSelectPlan: (planId: PlanId) => void;
  variant?: PaywallVariant; // "subscription" (default) or "single"
  onCheckout?: () => void; // For single payment: triggers checkout directly
}

// Get strikethrough price based on plan (keeps savings ~57-59%)
function getStrikethroughPrice(planId: PlanId): { display: string; cents: number } {
  const prices: Record<string, { display: string; cents: number }> = {
    one_time_14: { display: "$35.00", cents: 3500 },   // $14.99 → 57% off
    one_time: { display: "$49.00", cents: 4900 },      // $19.99 → 59% off
    one_time_24: { display: "$59.00", cents: 5900 },   // $24.99 → 58% off
    one_time_29: { display: "$69.00", cents: 6900 },   // $29.99 → 57% off
  };
  return prices[planId] || prices.one_time;
}

// Calculate savings percentage based on price and original
function getSavingsText(priceCents: number, originalCents: number): string {
  const savings = Math.round(((originalCents - priceCents) / originalCents) * 100);
  return `SAVE ${savings}%`;
}

// Premium Single Payment Card Component - Dynamic pricing based on plan
function SinglePaymentCard({
  onSelect,
  onCheckout,
  planId = "one_time",
}: {
  onSelect: () => void;
  onCheckout?: () => void;
  planId?: PlanId;
}) {
  // Get plan data from SUBSCRIPTION_PLANS
  const plan = SUBSCRIPTION_PLANS[planId] || SUBSCRIPTION_PLANS.one_time;
  const priceDisplay = plan.trialPriceDisplay; // e.g., "$19.99", "$24.99", "$29.99"
  const strikethrough = getStrikethroughPrice(planId);
  const savingsText = getSavingsText(plan.trialPriceCents, strikethrough.cents);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => {
        onSelect();
        if (onCheckout) onCheckout();
      }}
      className="w-full relative rounded-3xl overflow-hidden cursor-pointer"
      style={{
        background: "linear-gradient(145deg, rgba(20, 15, 35, 0.95) 0%, rgba(10, 8, 20, 0.98) 100%)",
        border: "2px solid rgba(232, 197, 71, 0.4)",
        boxShadow: `
          0 0 0 1px rgba(232, 197, 71, 0.1),
          0 4px 30px rgba(201, 162, 39, 0.2),
          0 20px 60px rgba(0, 0, 0, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.05)
        `,
      }}
    >
      {/* Animated gradient border effect */}
      <div
        className="absolute inset-0 rounded-3xl opacity-60 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(232, 197, 71, 0.1) 0%, transparent 50%, rgba(232, 197, 71, 0.05) 100%)",
        }}
      />

      {/* Shimmer effect */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(232, 197, 71, 0.15) 50%, transparent 100%)",
          animation: "shimmer 3s ease-in-out infinite",
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-6 py-8">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-6"
        >
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider"
            style={{
              background: "linear-gradient(135deg, #E8C547 0%, #C9A227 50%, #B8960F 100%)",
              color: "#1a1400",
              boxShadow: "0 4px 15px rgba(201, 162, 39, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            <Sparkles className="w-4 h-4" />
            {savingsText}
          </div>
        </motion.div>

        {/* Price Section - The Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex flex-col items-center justify-center"
        >
          {/* Original Price - Crossed Out */}
          <div className="relative mb-2">
            <span
              className="text-4xl font-bold text-white/35"
              style={{
                textDecoration: "line-through",
                textDecorationColor: "rgba(239, 68, 68, 0.8)",
                textDecorationThickness: "3px",
              }}
            >
              {strikethrough.display}
            </span>
          </div>

          {/* New Price - Glowing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
            className="relative"
          >
            {/* Glow effect behind price */}
            <div
              className="absolute inset-0 blur-2xl opacity-50"
              style={{
                background: "radial-gradient(circle, rgba(232, 197, 71, 0.5) 0%, transparent 70%)",
                transform: "scale(2)",
              }}
            />
            <span
              className="relative text-5xl font-bold"
              style={{
                background: "linear-gradient(135deg, #F5E6A3 0%, #E8C547 30%, #C9A227 70%, #E8C547 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 15px rgba(232, 197, 71, 0.4))",
              }}
            >
              {priceDisplay}
            </span>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-3 text-sm font-semibold tracking-widest uppercase"
            style={{
              background: "linear-gradient(90deg, rgba(232, 197, 71, 0.7), rgba(232, 197, 71, 1), rgba(232, 197, 71, 0.7))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            One-Time Payment
          </motion.p>
        </motion.div>

        {/* Bottom Accent Line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #E8C547 50%, transparent 100%)",
            boxShadow: "0 0 20px 2px rgba(232, 197, 71, 0.4)",
          }}
        />
      </div>
    </motion.button>
  );
}

// Winback Payment Card Component ($9.99 with 80% savings)
function WinbackPaymentCard({ onSelect, onCheckout }: { onSelect: () => void; onCheckout?: () => void }) {
  const plan = WINBACK_PLAN;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => {
        onSelect();
        if (onCheckout) onCheckout();
      }}
      className="w-full relative rounded-3xl overflow-hidden cursor-pointer"
      style={{
        background: "linear-gradient(145deg, rgba(20, 15, 35, 0.95) 0%, rgba(10, 8, 20, 0.98) 100%)",
        border: "2px solid rgba(232, 197, 71, 0.4)",
        boxShadow: `
          0 0 0 1px rgba(232, 197, 71, 0.1),
          0 4px 30px rgba(201, 162, 39, 0.2),
          0 20px 60px rgba(0, 0, 0, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.05)
        `,
      }}
    >
      {/* Animated gradient border effect */}
      <div
        className="absolute inset-0 rounded-3xl opacity-60 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(232, 197, 71, 0.1) 0%, transparent 50%, rgba(232, 197, 71, 0.05) 100%)",
        }}
      />

      {/* Shimmer effect */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(232, 197, 71, 0.15) 50%, transparent 100%)",
          animation: "shimmer 3s ease-in-out infinite",
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-6 py-8">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-6"
        >
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider"
            style={{
              background: "linear-gradient(135deg, #E8C547 0%, #C9A227 50%, #B8960F 100%)",
              color: "#1a1400",
              boxShadow: "0 4px 15px rgba(201, 162, 39, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            <Sparkles className="w-4 h-4" />
            SAVE 80%
          </div>
        </motion.div>

        {/* Price Section - The Hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="flex flex-col items-center justify-center"
        >
          {/* Original Price - Crossed Out */}
          <div className="relative mb-2">
            <span
              className="text-4xl font-bold text-white/35"
              style={{
                textDecoration: "line-through",
                textDecorationColor: "rgba(239, 68, 68, 0.8)",
                textDecorationThickness: "3px",
              }}
            >
              $49.00
            </span>
          </div>

          {/* New Price - Glowing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
            className="relative"
          >
            {/* Glow effect behind price */}
            <div
              className="absolute inset-0 blur-2xl opacity-50"
              style={{
                background: "radial-gradient(circle, rgba(232, 197, 71, 0.5) 0%, transparent 70%)",
                transform: "scale(2)",
              }}
            />
            <span
              className="relative text-5xl font-bold"
              style={{
                background: "linear-gradient(135deg, #F5E6A3 0%, #E8C547 30%, #C9A227 70%, #E8C547 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 15px rgba(232, 197, 71, 0.4))",
              }}
            >
              $9.99
            </span>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-3 text-sm font-semibold tracking-widest uppercase"
            style={{
              background: "linear-gradient(90deg, rgba(232, 197, 71, 0.7), rgba(232, 197, 71, 1), rgba(232, 197, 71, 0.7))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            One-Time Payment
          </motion.p>
        </motion.div>

        {/* Bottom Accent Line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #E8C547 50%, transparent 100%)",
            boxShadow: "0 0 20px 2px rgba(232, 197, 71, 0.4)",
          }}
        />
      </div>
    </motion.button>
  );
}

export default function PricingSelector({
  selectedPlan,
  onSelectPlan,
  variant = "subscription",
  onCheckout,
}: PricingSelectorProps) {
  // Determine which plans to show based on variant
  const isWinback = variant === "winback";
  const isSinglePayment = variant === "single";
  const plans = isSinglePayment ? [SINGLE_PAYMENT_PLAN] : SUBSCRIPTION_PLANS_DISPLAY;

  // Auto-select winback plan when in winback variant
  if (isWinback && selectedPlan !== "winback") {
    setTimeout(() => onSelectPlan("winback"), 0);
  }

  // Auto-select single payment plan when in single payment variant
  // Check if selectedPlan is one of the valid one-time plans
  const isValidOneTimePlan = ["one_time", "one_time_14", "one_time_24", "one_time_29"].includes(selectedPlan);
  if (isSinglePayment && !isValidOneTimePlan) {
    setTimeout(() => onSelectPlan("one_time"), 0);
  }

  // Render winback offer card (for email leads)
  if (isWinback) {
    return (
      <div className="w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h3
            className="text-white text-xl font-bold leading-snug"
            style={{
              textShadow: "0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)",
            }}
          >
            Exclusive Offer{" "}
            <span className="text-gold" style={{ textShadow: "0 0 10px rgba(232, 197, 71, 0.5)" }}>
              Just For You
            </span>
          </h3>
        </motion.div>

        {/* Winback Payment Card */}
        <WinbackPaymentCard onSelect={() => onSelectPlan("winback")} onCheckout={onCheckout} />

        {/* Bottom Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-white/80 text-[14px] mt-5 font-medium"
        >
          Instant access. No recurring charges. Yours forever.
        </motion.p>

        {/* CSS for shimmer animation */}
        <style jsx>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
        `}</style>
      </div>
    );
  }

  // Render premium single payment card
  if (isSinglePayment) {
    return (
      <div className="w-full">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h3
            className="text-white text-xl font-bold leading-snug"
            style={{
              textShadow: "0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)",
            }}
          >
            Your{" "}
            <span className="text-gold" style={{ textShadow: "0 0 10px rgba(232, 197, 71, 0.5)" }}>
              2026 Forecast
            </span>{" "}
            +{" "}
            <span style={{ color: "#60A5FA", textShadow: "0 0 10px rgba(96, 165, 250, 0.5)" }}>
              Complete Birth Chart
            </span>
            <br />
            <span className="text-white/90">— Yours Forever.</span>
          </h3>
        </motion.div>

        {/* Premium Single Payment Card - uses selectedPlan for dynamic pricing */}
        <SinglePaymentCard
          onSelect={() => onSelectPlan(selectedPlan)}
          onCheckout={onCheckout}
          planId={selectedPlan}
        />

        {/* Bottom Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-white/80 text-[14px] mt-5 font-medium"
        >
          Instant access. No recurring charges. Yours forever.
        </motion.p>

        {/* CSS for shimmer animation */}
        <style jsx>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(100%);
            }
            100% {
              transform: translateX(-100%);
            }
          }
        `}</style>
      </div>
    );
  }

  // Original subscription variant
  return (
    <div className="w-full">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-6"
      >
        <h3
          className="text-white text-2xl font-bold"
          style={{
            textShadow: "0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)",
          }}
        >
          Choose your access
        </h3>
      </motion.div>

      {/* Pricing Cards Container */}
      <div
        className="rounded-3xl p-4 space-y-3"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
        }}
      >
        {plans.map((plan, index) => {
          const isSelected = selectedPlan === plan.id;
          const isHighlight = plan.highlight;

          return (
            <motion.button
              key={plan.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => onSelectPlan(plan.id)}
              className="w-full relative rounded-2xl overflow-hidden transition-all duration-300 group"
              style={{
                background: isSelected
                  ? "linear-gradient(135deg, rgba(201, 162, 39, 0.2) 0%, rgba(201, 162, 39, 0.1) 50%, rgba(201, 162, 39, 0.15) 100%)"
                  : isHighlight
                  ? "linear-gradient(135deg, rgba(201, 162, 39, 0.12) 0%, rgba(201, 162, 39, 0.06) 50%, rgba(201, 162, 39, 0.08) 100%)"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.03) 100%)",
                border: isSelected
                  ? "2px solid rgba(232, 197, 71, 0.6)"
                  : isHighlight
                  ? "2px solid rgba(201, 162, 39, 0.35)"
                  : "2px solid rgba(255, 255, 255, 0.1)",
                boxShadow: isSelected
                  ? `
                    0 0 0 1px rgba(232, 197, 71, 0.2),
                    0 4px 20px rgba(201, 162, 39, 0.25),
                    0 8px 40px rgba(201, 162, 39, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                  `
                  : isHighlight
                  ? `
                    0 0 0 1px rgba(201, 162, 39, 0.15),
                    0 4px 20px rgba(201, 162, 39, 0.15),
                    0 8px 40px rgba(201, 162, 39, 0.08),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05)
                  `
                  : `
                    0 2px 8px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05)
                  `,
              }}
            >
              {/* Shimmer effect */}
              {isHighlight && (
                <div
                  className="absolute inset-0 opacity-30 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(232, 197, 71, 0.1) 50%, transparent 100%)",
                    animation: "shimmer 3s ease-in-out infinite",
                  }}
                />
              )}

              {/* Badge */}
              {plan.badge && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-0 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-b-lg text-[10px] font-bold uppercase tracking-wider z-10"
                  style={{
                    background:
                      "linear-gradient(135deg, #E8C547 0%, #C9A227 50%, #B8960F 100%)",
                    color: "#1a1400",
                    boxShadow:
                      "0 2px 8px rgba(201, 162, 39, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  {plan.badge}
                </motion.div>
              )}

              {/* Card Content */}
              <div className="flex items-stretch">
                {/* Selection Radio */}
                <div className="flex items-center justify-center pl-4 pr-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      background: isSelected
                        ? "linear-gradient(135deg, #E8C547, #C9A227)"
                        : "rgba(255, 255, 255, 0.1)",
                      border: isSelected
                        ? "none"
                        : "2px solid rgba(255, 255, 255, 0.2)",
                      boxShadow: isSelected
                        ? "0 0 12px rgba(201, 162, 39, 0.5)"
                        : "none",
                    }}
                  >
                    {isSelected && (
                      <Check className="w-3 h-3 text-black" strokeWidth={3} />
                    )}
                  </div>
                </div>

                {/* Left Section - Plan Details */}
                <div
                  className={`flex-1 py-4 pr-4 text-left ${plan.badge ? "pt-9" : ""}`}
                >
                  <p
                    className={`text-[17px] font-semibold mb-0.5 transition-colors ${
                      isSelected ? "text-white" : "text-white/90"
                    }`}
                  >
                    {plan.name}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {plan.originalPrice && (
                      <span className="text-white/40 text-sm line-through decoration-red-400/60">
                        ${plan.originalPrice.toFixed(2)}
                      </span>
                    )}
                    <span
                      className={`text-sm font-medium ${
                        isSelected
                          ? "text-gold"
                          : isHighlight
                          ? "text-gold/80"
                          : "text-white/60"
                      }`}
                    >
                      ${plan.price.toFixed(2)}
                    </span>
                    {plan.originalPrice && (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                        SAVE 50%
                      </span>
                    )}
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{
                        background: "rgba(56, 189, 248, 0.12)",
                        color: "#7dd3fc",
                        border: "1px solid rgba(56, 189, 248, 0.2)",
                      }}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      Risk-Free, Cancel Anytime
                    </span>
                  </div>
                </div>

                {/* Right Section - Price Highlight */}
                <div
                  className={`flex flex-col items-center justify-center px-5 min-w-[110px] ${plan.badge ? "pt-5" : ""}`}
                  style={{
                    background: isSelected
                      ? "linear-gradient(180deg, rgba(232, 197, 71, 0.25) 0%, rgba(201, 162, 39, 0.15) 100%)"
                      : isHighlight
                      ? "linear-gradient(180deg, rgba(201, 162, 39, 0.12) 0%, rgba(201, 162, 39, 0.06) 100%)"
                      : "rgba(255, 255, 255, 0.03)",
                    borderLeft: isSelected
                      ? "1px solid rgba(232, 197, 71, 0.3)"
                      : isHighlight
                      ? "1px solid rgba(201, 162, 39, 0.2)"
                      : "1px solid rgba(255, 255, 255, 0.06)",
                  }}
                >
                  <span
                    className={`text-2xl font-bold transition-all ${
                      isSelected
                        ? "text-gold drop-shadow-[0_0_8px_rgba(201,162,39,0.5)]"
                        : isHighlight
                        ? "text-gold/90"
                        : "text-white/80"
                    }`}
                  >
                    ${plan.price.toFixed(2)}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-medium ${
                      isSelected
                        ? "text-gold/80"
                        : isHighlight
                        ? "text-gold/60"
                        : "text-white/40"
                    }`}
                  >
                    {plan.duration}
                  </span>
                </div>
              </div>

              {/* Bottom glow accent for selected */}
              {isSelected && (
                <motion.div
                  layoutId="selectedAccent"
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, #E8C547 50%, transparent 100%)",
                    boxShadow: "0 0 20px 2px rgba(232, 197, 71, 0.4)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Bottom Note */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="text-center text-white/40 text-[13px] mt-5"
      >
        Then $19.99/month. Cancel anytime.
      </motion.p>

      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
