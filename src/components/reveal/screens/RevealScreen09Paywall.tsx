"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import StripeCheckout from "@/components/reveal/StripeCheckout";
import { type PlanId } from "@/lib/subscription-plans";
import { type PaywallVariant } from "../paywall/PricingSelector";

// Existing components (kept)
import BlurredReportPreview from "../paywall/BlurredReportPreview";
import SocialProofGauges from "../paywall/SocialProofGauges";
import ComparisonBox from "../paywall/ComparisonBox";
import FAQAccordion from "../paywall/FAQAccordion";
import TestimonialCards from "../paywall/TestimonialCards";

// V2.5 components
import HeroSection from "../paywall/HeroSection";
import PricingSelector from "../paywall/PricingSelector";
import FeatureSection from "../paywall/FeatureSection";
import CTABlock from "../paywall/CTABlock";
import HowItWorksCollapsible from "../paywall/HowItWorksCollapsible";
import UrgencySection from "../paywall/UrgencySection";
import CredibilityBlock from "../paywall/CredibilityBlock";
import FeaturedInLogos from "../paywall/FeaturedInLogos";

// Cosmic stardust background particles - matching HeroSection style
function CosmicStardust() {
  // Sparse particles with brighter, more magical feel
  const particles = [
    // Gold particles
    { x: 8, y: 5, size: 1.5, color: "rgba(232, 197, 71, 0.5)", glow: "rgba(232, 197, 71, 0.7)", duration: 4 },
    { x: 85, y: 12, size: 1, color: "rgba(232, 197, 71, 0.45)", glow: "rgba(232, 197, 71, 0.65)", duration: 5 },
    { x: 45, y: 25, size: 1, color: "rgba(232, 197, 71, 0.5)", glow: "rgba(232, 197, 71, 0.7)", duration: 3.5 },
    { x: 92, y: 38, size: 1.5, color: "rgba(232, 197, 71, 0.45)", glow: "rgba(232, 197, 71, 0.65)", duration: 4.5 },
    { x: 15, y: 55, size: 1, color: "rgba(232, 197, 71, 0.5)", glow: "rgba(232, 197, 71, 0.7)", duration: 5 },
    { x: 78, y: 68, size: 1, color: "rgba(232, 197, 71, 0.45)", glow: "rgba(232, 197, 71, 0.65)", duration: 4 },
    { x: 35, y: 82, size: 1.5, color: "rgba(232, 197, 71, 0.5)", glow: "rgba(232, 197, 71, 0.7)", duration: 3.5 },
    // Blue particles
    { x: 22, y: 15, size: 1, color: "rgba(147, 197, 253, 0.45)", glow: "rgba(147, 197, 253, 0.7)", duration: 5 },
    { x: 68, y: 22, size: 1, color: "rgba(147, 197, 253, 0.5)", glow: "rgba(147, 197, 253, 0.75)", duration: 4 },
    { x: 5, y: 42, size: 1.5, color: "rgba(147, 197, 253, 0.45)", glow: "rgba(147, 197, 253, 0.7)", duration: 4.5 },
    { x: 55, y: 48, size: 1, color: "rgba(147, 197, 253, 0.5)", glow: "rgba(147, 197, 253, 0.75)", duration: 3.5 },
    { x: 88, y: 62, size: 1, color: "rgba(147, 197, 253, 0.45)", glow: "rgba(147, 197, 253, 0.7)", duration: 5 },
    { x: 28, y: 75, size: 1.5, color: "rgba(147, 197, 253, 0.5)", glow: "rgba(147, 197, 253, 0.75)", duration: 4 },
    { x: 72, y: 88, size: 1, color: "rgba(147, 197, 253, 0.45)", glow: "rgba(147, 197, 253, 0.7)", duration: 4.5 },
    // Purple particles
    { x: 42, y: 8, size: 1, color: "rgba(196, 181, 253, 0.45)", glow: "rgba(196, 181, 253, 0.7)", duration: 4 },
    { x: 12, y: 28, size: 1.5, color: "rgba(196, 181, 253, 0.5)", glow: "rgba(196, 181, 253, 0.75)", duration: 5 },
    { x: 75, y: 35, size: 1, color: "rgba(196, 181, 253, 0.45)", glow: "rgba(196, 181, 253, 0.7)", duration: 3.5 },
    { x: 38, y: 58, size: 1, color: "rgba(196, 181, 253, 0.5)", glow: "rgba(196, 181, 253, 0.75)", duration: 4.5 },
    { x: 95, y: 72, size: 1.5, color: "rgba(196, 181, 253, 0.45)", glow: "rgba(196, 181, 253, 0.7)", duration: 4 },
    { x: 58, y: 92, size: 1, color: "rgba(196, 181, 253, 0.5)", glow: "rgba(196, 181, 253, 0.75)", duration: 5 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: particle.color,
            boxShadow: `0 0 6px ${particle.glow}`,
          }}
          animate={{
            y: [0, -15, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.25,
          }}
        />
      ))}
    </div>
  );
}

export default function RevealScreen09Paywall() {
  const { state } = useReveal();
  const searchParams = useSearchParams();
  const [showCheckout, setShowCheckout] = useState(false);

  // Determine paywall variant from URL params
  // Only show winback ($9.99) when explicitly requested via ?offer=win
  // Default is always $19.99 (quiz, ads, email without offer param)
  const hasSubscriptionPlan = searchParams.get("plan") === "subscription";
  const isWinback = searchParams.get("offer") === "win";

  const variant: PaywallVariant = isWinback
    ? "winback"
    : hasSubscriptionPlan
      ? "subscription"
      : "single";

  // Default plan depends on variant
  const defaultPlan: PlanId = variant === "winback"
    ? "winback"
    : variant === "single"
      ? "one_time"
      : "trial_7day";
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(defaultPlan);

  // Scroll to pricing section (for CTAs throughout page)
  const scrollToPricing = () => {
    document
      .getElementById("pricing-section")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Open checkout (for CTA below pricing)
  const handleCheckoutClick = () => {
    setShowCheckout(true);
    // Scroll to checkout section with delay to allow render
    setTimeout(() => {
      document
        .getElementById("stripe-checkout")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto relative">
      {/* Cosmic stardust background */}
      <CosmicStardust />

      {/* ========== SECTION 1: Blurred Report Preview (teaser) ========== */}
      <BlurredReportPreview forecastData={state.forecastData} />

      {/* ========== SECTION 2: Hero ========== */}
      <HeroSection />

      {/* ========== SECTION 3: Featured In ========== */}
      <FeaturedInLogos />

      {/* ========== SECTION 4: Pricing Selector ========== */}
      <section id="pricing-section" className="px-5 pb-6">
        <PricingSelector
          selectedPlan={selectedPlan}
          onSelectPlan={setSelectedPlan}
          variant={variant}
          onCheckout={variant === "single" || variant === "winback" ? handleCheckoutClick : undefined}
        />
      </section>

      {/* ========== SECTION 4: CTA #1 (below pricing) → Opens Checkout ========== */}
      <section id="checkout-section" className="px-5 pb-8">
        {!showCheckout ? (
          <CTABlock onCtaClick={handleCheckoutClick} showTrustLine={true} />
        ) : (
          <div id="stripe-checkout" className="relative z-50">
            {/* Change plan button */}
            <button
              onClick={() => setShowCheckout(false)}
              className="flex items-center gap-1.5 text-white/60 hover:text-white/80 text-sm mb-3 transition-colors"
            >
              <span>←</span>
              <span>Change plan</span>
            </button>
            {/* Stripe checkout */}
            <div
              className="rounded-2xl overflow-hidden relative z-50"
              style={{ background: "rgba(10, 10, 30, 0.8)" }}
            >
              <StripeCheckout planId={selectedPlan} />
            </div>
          </div>
        )}
      </section>

      {/* ========== SECTION 5: Credibility Block ========== */}
      <CredibilityBlock />

      {/* ========== SECTION 6: Feature Lists ========== */}
      <FeatureSection variant={variant} />

      {/* ========== SECTION 6: CTA #2 → Scrolls to Pricing ========== */}
      <section className="px-5 pb-8">
        <CTABlock onCtaClick={scrollToPricing} showTrustLine={true} />
      </section>

      {/* ========== SECTION 7: Testimonials ========== */}
      <TestimonialCards />

      {/* ========== SECTION 8: How It Works (Collapsible) ========== */}
      <HowItWorksCollapsible />

      {/* ========== SECTION 9: With vs Without ========== */}
      <ComparisonBox />

      {/* ========== SECTION 9b: CTA after Comparison ========== */}
      <section className="px-5 pb-8">
        <CTABlock onCtaClick={scrollToPricing} showTrustLine={true} />
      </section>

      {/* ========== SECTION 10: Social Proof Gauges ========== */}
      <SocialProofGauges />

      {/* ========== SECTION 11: FAQ ========== */}
      <FAQAccordion />

      {/* ========== SECTION 12: Urgency ========== */}
      <UrgencySection />

      {/* ========== SECTION 14: Final CTA + Guarantee → Scrolls to Pricing ========== */}
      <section className="px-5 pb-10">
        <CTABlock
          onCtaClick={scrollToPricing}
          showTrustLine={true}
          showGuarantee={true}
        />
      </section>

      {/* Bottom padding for safe area */}
      <div className="h-8" />
    </div>
  );
}
