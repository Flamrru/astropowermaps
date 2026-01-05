"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Feature {
  text: string;
  sub: string;
}

interface FeatureGroup {
  id: string;
  emoji: string;
  title: string;
  badge: string;
  badgeVariant: "primary" | "secondary" | "bonus";
  features: Feature[];
}

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: "2026_forecast",
    emoji: "📅",
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
    emoji: "🗺️",
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
      {
        text: "Line-by-Line Interpretations",
        sub: "What each line means for you",
      },
      {
        text: "Locations That Drain You",
        sub: "Know where NOT to go",
      },
    ],
  },
  {
    id: "daily_guidance",
    emoji: "✨",
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
        text: "Personalized Journal Prompts",
        sub: "Daily reflection inspired by your chart placements",
      },
      {
        text: "Moon Phase + Transit Tracking",
        sub: "See what's shifting in real time",
      },
    ],
  },
  {
    id: "stella",
    emoji: "🤖",
    title: "Stella — Your Personal Astrology Assistant",
    badge: "ALSO INCLUDED",
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

export default function FeatureSection() {
  return (
    <section className="px-5 py-6">
      {/* Section Header */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center text-white text-xl font-bold mb-6"
      >
        What You&apos;re Unlocking
      </motion.h2>

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
            {/* Badge */}
            <div
              className="absolute -top-2 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
              style={getBadgeStyle(group.badgeVariant)}
            >
              {group.badge}
            </div>

            {/* Section Title */}
            <p className="text-gold text-xs uppercase tracking-wider mb-4 font-medium flex items-center gap-2">
              <span>{group.emoji}</span>
              {group.title}
            </p>

            {/* Features List */}
            <ul className="space-y-2.5">
              {group.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-3">
                  <Check
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      group.badgeVariant === "bonus"
                        ? "text-white/50"
                        : "text-gold"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-[14px] font-medium ${
                        group.badgeVariant === "bonus"
                          ? "text-white/70"
                          : "text-white/80"
                      }`}
                    >
                      {feature.text}
                    </p>
                    <p
                      className={`text-[12px] ${
                        group.badgeVariant === "bonus"
                          ? "text-white/40"
                          : "text-white/50"
                      }`}
                    >
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
