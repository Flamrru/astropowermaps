"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

type PlanId = "trial_3day" | "trial_7day" | "trial_14day";

interface Plan {
  id: PlanId;
  name: string;
  duration: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  highlight?: boolean;
}

const PLANS: Plan[] = [
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

interface PricingSelectorProps {
  selectedPlan: PlanId;
  onSelectPlan: (planId: PlanId) => void;
}

export default function PricingSelector({
  selectedPlan,
  onSelectPlan,
}: PricingSelectorProps) {
  return (
    <div className="w-full">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-6"
      >
        <p className="text-white/50 text-xs uppercase tracking-[0.2em] mb-2">
          Select Your Plan
        </p>
        <h3 className="text-white text-xl font-semibold">Choose your access</h3>
      </motion.div>

      {/* Pricing Cards Container - with subtle background */}
      <div
        className="rounded-3xl p-4 space-y-3"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
        }}
      >
        {PLANS.map((plan, index) => {
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
                // Layered background for depth
                background: isSelected
                  ? "linear-gradient(135deg, rgba(201, 162, 39, 0.2) 0%, rgba(201, 162, 39, 0.1) 50%, rgba(201, 162, 39, 0.15) 100%)"
                  : isHighlight
                  ? "linear-gradient(135deg, rgba(201, 162, 39, 0.12) 0%, rgba(201, 162, 39, 0.06) 50%, rgba(201, 162, 39, 0.08) 100%)"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.03) 100%)",
                // Strong borders for definition
                border: isSelected
                  ? "2px solid rgba(232, 197, 71, 0.6)"
                  : isHighlight
                  ? "2px solid rgba(201, 162, 39, 0.35)"
                  : "2px solid rgba(255, 255, 255, 0.1)",
                // Dramatic shadows for floating effect
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
              {/* Animated shimmer effect for highlighted card */}
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
                  <div className="flex items-center gap-2">
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

      {/* Subscription Note */}
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

export type { PlanId };
