"use client";

import { motion } from "framer-motion";
import { Check, Calendar, Map, Compass, Stars } from "lucide-react";
import ProductPreviewCarousel from "./ProductPreviewCarousel";
import { LucideIcon } from "lucide-react";

// Import variant type for consistency
import { type PaywallVariant } from "./PricingSelector";

interface Feature {
  text: string;
  sub: string;
}

interface FeatureGroup {
  id: string;
  icon: LucideIcon;
  iconColor: string;
  title: string;
  badge: string;
  badgeVariant: "primary" | "secondary" | "bonus";
  features: Feature[];
}

interface FeatureSectionProps {
  variant?: PaywallVariant;
}

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: "2026_forecast",
    icon: Calendar,
    iconColor: "#E8C547",
    title: "Your 2026 Forecast",
    badge: "YOUR 2026",
    badgeVariant: "primary",
    features: [
      {
        text: "Your 3 Power Months",
        sub: "The months where everything you start gains traction",
      },
      {
        text: "Your 3 Power Cities",
        sub: "Where to travel for clarity, connection, breakthroughs",
      },
      {
        text: "Best Months for Money, Decisions, Love",
        sub: "Know the exact timing before you make the move",
      },
      {
        text: "Months to Avoid",
        sub: "Stop wasting energy fighting the current",
      },
      {
        text: "Full 12-Month Breakdown",
        sub: "Your entire year — ranked and color-coded",
      },
    ],
  },
  {
    id: "birth_chart",
    icon: Map,
    iconColor: "#60A5FA",
    title: "Your Complete Birth Chart",
    badge: "INCLUDED",
    badgeVariant: "secondary",
    features: [
      {
        text: "All 40 Planetary Lines",
        sub: "Calculated using NASA-grade ephemeris data — unique to your exact birth moment",
      },
      {
        text: "338 Cities Matched + Ranked",
        sub: "Find your power places anywhere in the world",
      },
      {
        text: "Interactive World Map",
        sub: "Explore your lines visually",
      },
    ],
  },
  {
    id: "daily_guidance",
    icon: Compass,
    iconColor: "#A78BFA",
    title: "Daily Guidance",
    badge: "ALSO INCLUDED",
    badgeVariant: "secondary",
    features: [
      {
        text: "Daily Power Score",
        sub: "Wake up knowing if today is a push day or pause day",
      },
      {
        text: "Best Day Picker",
        sub: "Filter any week by goal — love, career, creativity, clarity",
      },
      {
        text: "Moon Phase + Transit Tracking",
        sub: "See what's shifting in real time",
      },
    ],
  },
  {
    id: "stella",
    icon: Stars,
    iconColor: "#34D399",
    title: "Stella — Your Personal Astrologist",
    badge: "BONUS",
    badgeVariant: "bonus",
    features: [
      {
        text: "2am decisions, answered",
        sub: "When you're overthinking a decision and need someone to talk to — Stella's there 24/7.",
      },
      {
        text: 'For the "what do I do?" moments',
        sub: "Job offers. Relationship crossroads. Moving cities. Ask your chart, not the internet.",
      },
      {
        text: "For when you can't afford to wait",
        sub: "No booking appointments. No explaining your whole story. No $200/hour. No judgement. Instant.",
      },
    ],
  },
];

// Badge styles based on variant
function getBadgeStyle(variant: FeatureGroup["badgeVariant"]) {
  switch (variant) {
    case "primary":
      return {
        background: "linear-gradient(135deg, #E8C547, #C9A227)",
        color: "#000",
      };
    case "secondary":
      return {
        background: "linear-gradient(135deg, #E8C547, #C9A227)",
        color: "#000",
      };
    case "bonus":
      return {
        background: "linear-gradient(135deg, #E8C547, #C9A227)",
        color: "#000",
      };
    default:
      return {
        background: "linear-gradient(135deg, #E8C547, #C9A227)",
        color: "#000",
      };
  }
}

export default function FeatureSection({ variant = "subscription" }: FeatureSectionProps) {
  const isSinglePayment = variant === "single";

  // Function to get badge text based on variant
  // For single payment variant: "ALSO INCLUDED" and "BONUS" become "BONUS FOR A LIMITED TIME"
  const getBadgeText = (originalBadge: string): string => {
    if (!isSinglePayment) return originalBadge;

    // For single payment variant, change these badges
    if (originalBadge === "ALSO INCLUDED" || originalBadge === "BONUS") {
      return "BONUS FOR A LIMITED TIME";
    }
    return originalBadge;
  };

  return (
    <section className="px-5 py-6">
      {/* Section Header */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center text-white text-2xl font-bold mb-12"
        style={{
          textShadow: "0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)",
        }}
      >
        What You&apos;re Unlocking
      </motion.h2>

      {/* Product Preview Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-16"
      >
        <ProductPreviewCarousel />
      </motion.div>

      {/* What that means for you */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center text-white text-2xl font-bold mb-10"
        style={{
          textShadow: "0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)",
        }}
      >
        What That Means For You
      </motion.h3>

      {/* Feature Groups */}
      <div className="space-y-4">
        {FEATURE_GROUPS.map((group, groupIndex) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: groupIndex * 0.1 }}
            className="rounded-2xl p-5 relative"
            style={{
              background:
                group.badgeVariant === "bonus"
                  ? "linear-gradient(135deg, rgba(100, 100, 150, 0.08), rgba(60, 60, 100, 0.05))"
                  : "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Badge - uses getBadgeText for variant-specific text */}
            <div
              className="absolute -top-2 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap"
              style={getBadgeStyle(group.badgeVariant)}
            >
              {getBadgeText(group.badge)}
            </div>

            {/* Section Title */}
            <div className="flex items-center gap-2 mb-4">
              <group.icon
                className="w-5 h-5"
                style={{
                  color: group.iconColor,
                  filter: `drop-shadow(0 0 8px ${group.iconColor}80)`,
                }}
              />
              <p
                className="text-sm uppercase tracking-wider font-semibold"
                style={{
                  color: group.iconColor,
                  textShadow: `0 0 10px ${group.iconColor}99, 0 0 20px ${group.iconColor}66`,
                }}
              >
                {group.title}
              </p>
            </div>

            {/* Features List */}
            <ul className="space-y-2.5">
              {group.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-3">
                  <Check
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      group.badgeVariant === "bonus"
                        ? "text-white/70"
                        : "text-gold"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-[14px] font-medium ${
                        group.badgeVariant === "bonus"
                          ? "text-white/90"
                          : "text-white"
                      }`}
                    >
                      {feature.text}
                    </p>
                    <p className="text-[12px] text-white/80">
                      {feature.sub}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
