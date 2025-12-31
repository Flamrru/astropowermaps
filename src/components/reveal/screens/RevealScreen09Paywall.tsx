"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Shield, Zap, Check } from "lucide-react";
import { useReveal } from "@/lib/reveal-state";
import StripeCheckout from "@/components/reveal/StripeCheckout";
import BlurredReportPreview from "../paywall/BlurredReportPreview";
import SocialProofGauges from "../paywall/SocialProofGauges";
import FeaturedInLogos from "../paywall/FeaturedInLogos";
import ComparisonBox from "../paywall/ComparisonBox";
import FAQAccordion from "../paywall/FAQAccordion";
import TestimonialCards from "../paywall/TestimonialCards";
import { calculateDaysUntil2026 } from "@/lib/astro/paywall-derivations";

// Section 1: 2026 Forecast features
const FORECAST_FEATURES = [
  { text: "Your 3 Power Months", sub: "Know exactly when to launch, decide, and move" },
  { text: "Your 3 Power Cities", sub: "Where to travel for breakthroughs and clarity" },
  { text: "Best Month for Money Moves", sub: "Time your financial decisions with precision" },
  { text: "Best Month for Love", sub: "When connection comes easier" },
  { text: "Best Month for Major Decisions", sub: "When your clarity peaks" },
  { text: "Months to Avoid", sub: "Stop wasting energy fighting the current" },
  { text: "All 12 Months Ranked", sub: "See your entire year at a glance" },
  { text: "2026 Calendar Overview", sub: "Color-coded month-by-month energy map" },
];

// Section 2: Birth Chart features
const BIRTH_CHART_FEATURES = [
  { text: "All 40 Planetary Lines", sub: "Your complete cosmic blueprint" },
  { text: "338 Cities Matched", sub: "Power places around the world" },
  { text: "Interactive World Map", sub: "Explore your lines visually" },
  { text: "4 Life Categories", sub: "Love, Career, Growth, Home" },
  { text: "Line-by-Line Interpretations", sub: "What each line means for you" },
  { text: "Locations That Drain You", sub: "Know where NOT to go" },
  { text: "Yours Forever", sub: "Access anytime, no expiration" },
];

export default function RevealScreen11Paywall() {
  const { state } = useReveal();
  const [showCheckout, setShowCheckout] = useState(false);
  const daysUntil2026 = calculateDaysUntil2026();

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* SECTION A: Blurred Report Preview */}
      <BlurredReportPreview forecastData={state.forecastData} />

      {/* SECTION B: Primary Checkout */}
      <section id="checkout-section" className="px-5 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-white text-2xl font-bold mb-2">
            Unlock Your <span className="text-gold-glow">Complete Map</span>
          </h2>
          <p className="text-white/60 text-[15px] mb-6">
            Your 2026 forecast + your full birth chart — yours forever.
          </p>

          {/* Price display */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-white/40 text-xl line-through">$49</span>
              <span className="text-gold-glow text-4xl font-bold">$19</span>
            </div>
            <p className="text-white/60 text-sm uppercase tracking-wider">One-time payment</p>
            <p className="text-white/40 text-xs mt-1">No subscription. Instant access. Yours forever.</p>
          </div>

          {/* Positioning Copy Block */}
          <div
            className="rounded-xl p-4 mb-6 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(232, 197, 71, 0.1), rgba(201, 162, 39, 0.05))",
              border: "1px solid rgba(232, 197, 71, 0.2)",
            }}
          >
            <p className="text-gold font-semibold text-[15px] mb-2">Two maps. One purchase.</p>
            <p className="text-white/70 text-[13px] leading-relaxed">
              Your <span className="text-gold">2026 Forecast</span> tells you <strong>WHEN</strong>.
              <br />
              Your <span className="text-gold">Birth Chart</span> tells you <strong>WHERE</strong>.
              <br />
              <span className="text-white/50">Together, they show you exactly how to plan your year.</span>
            </p>
          </div>

          {/* SECTION 1: 2026 Forecast */}
          <div
            className="rounded-2xl p-5 mb-4 text-left"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <p className="text-gold text-xs uppercase tracking-wider mb-4 font-medium flex items-center gap-2">
              📅 Your 2026 Forecast
            </p>
            <ul className="space-y-2.5">
              {FORECAST_FEATURES.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white/80 text-[14px] font-medium">{item.text}</p>
                    <p className="text-white/50 text-[12px]">{item.sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* SECTION 2: Birth Chart */}
          <div
            className="rounded-2xl p-5 mb-6 text-left relative"
            style={{
              background: "linear-gradient(135deg, rgba(100, 100, 150, 0.08), rgba(60, 60, 100, 0.05))",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* INCLUDED badge */}
            <div
              className="absolute -top-2 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background: "linear-gradient(135deg, #E8C547, #C9A227)",
                color: "#000",
              }}
            >
              Included
            </div>
            <p className="text-white/70 text-xs uppercase tracking-wider mb-4 font-medium flex items-center gap-2">
              🗺️ Your Complete Birth Chart
            </p>
            <ul className="space-y-2.5">
              {BIRTH_CHART_FEATURES.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-white/50 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white/70 text-[14px] font-medium">{item.text}</p>
                    <p className="text-white/40 text-[12px]">{item.sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button or Stripe Checkout */}
          {!showCheckout ? (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCheckout(true)}
                className="w-full py-4 rounded-full text-[16px] font-semibold flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(180deg, #E8C547 0%, #C9A227 50%, #8B6914 100%)",
                  color: "#000",
                  boxShadow: "0 0 30px rgba(201, 162, 39, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                }}
              >
                <Lock className="w-5 h-5" />
                Unlock Everything — $19
              </motion.button>

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-6 mt-4 text-white/40 text-[13px]">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  Secure payment
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  Instant access
                </span>
              </div>
            </>
          ) : (
            <div id="stripe-checkout" className="rounded-2xl overflow-hidden" style={{ background: "rgba(10, 10, 30, 0.8)" }}>
              <StripeCheckout />
            </div>
          )}
        </motion.div>
      </section>

      {/* SECTION C: Social Proof Stats */}
      <SocialProofGauges />

      {/* SECTION D: As Featured In */}
      <FeaturedInLogos />

      {/* SECTION E: With vs Without */}
      <ComparisonBox />

      {/* SECTION F: FAQ */}
      <FAQAccordion />

      {/* SECTION G: Testimonials */}
      <TestimonialCards />

      {/* SECTION H: Final CTA */}
      <section className="px-5 py-10 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {daysUntil2026 > 0 ? (
            <p className="text-white/60 text-[15px] mb-2">
              2026 is <span className="text-gold font-bold">{daysUntil2026}</span> days away.
            </p>
          ) : (
            <p className="text-white/60 text-[15px] mb-2">
              2026 is <span className="text-gold font-bold">here</span>.
            </p>
          )}
          <p className="text-white/70 text-[16px] mb-6">
            Your first power window could be January.
            <br />
            <span className="italic">Don&apos;t you want to know?</span>
          </p>

          {/* Price repeat */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-3 mb-1">
              <span className="text-white/40 text-lg line-through">$49</span>
              <span className="text-gold text-3xl font-bold">$19</span>
            </div>
            <p className="text-white/50 text-xs uppercase tracking-wider">One-time payment</p>
          </div>

          {/* CTA Button */}
          {!showCheckout && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowCheckout(true);
                // Scroll to checkout section with delay to allow render
                setTimeout(() => {
                  document.getElementById("stripe-checkout")?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 100);
              }}
              className="w-full max-w-sm mx-auto py-4 rounded-full text-[16px] font-semibold flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(180deg, #E8C547 0%, #C9A227 50%, #8B6914 100%)",
                color: "#000",
                boxShadow: "0 0 30px rgba(201, 162, 39, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
              }}
            >
              <Lock className="w-5 h-5" />
              Unlock Everything — $19
            </motion.button>
          )}

          {/* Trust & Guarantee */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-center gap-2 text-white/40 text-[13px] mb-3">
              <Shield className="w-4 h-4" />
              Secure payment · Instant access
            </div>
            <p className="text-white/30 text-[13px] font-medium mb-1">
              30-day money-back guarantee
            </p>
            <p className="text-white/25 text-[12px]">
              If the map doesn&apos;t resonate, email us for a full refund.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Bottom padding for safe area */}
      <div className="h-8" />
    </div>
  );
}
