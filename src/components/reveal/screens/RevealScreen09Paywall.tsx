"use client";

import { useState } from "react";
import { useReveal } from "@/lib/reveal-state";
import StripeCheckout from "@/components/reveal/StripeCheckout";

// Existing components (kept)
import BlurredReportPreview from "../paywall/BlurredReportPreview";
import SocialProofGauges from "../paywall/SocialProofGauges";
import ComparisonBox from "../paywall/ComparisonBox";
import FAQAccordion from "../paywall/FAQAccordion";
import TestimonialCards from "../paywall/TestimonialCards";

// New V2 components
import HeroSection from "../paywall/HeroSection";
import PricingSelector, { PlanId } from "../paywall/PricingSelector";
import FeatureSection from "../paywall/FeatureSection";
import CTABlock from "../paywall/CTABlock";
import HowItWorksCollapsible from "../paywall/HowItWorksCollapsible";
import UrgencySection from "../paywall/UrgencySection";

export default function RevealScreen09Paywall() {
  const { state } = useReveal();
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("trial_7day");

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
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* ========== SECTION 1: Blurred Report Preview (teaser) ========== */}
      <BlurredReportPreview forecastData={state.forecastData} />

      {/* ========== SECTION 2: Hero + Credibility ========== */}
      <HeroSection />

      {/* ========== SECTION 3: Pricing Selector ========== */}
      <section id="pricing-section" className="px-5 pb-6">
        <PricingSelector
          selectedPlan={selectedPlan}
          onSelectPlan={setSelectedPlan}
        />
      </section>

      {/* ========== SECTION 4: CTA #1 (below pricing) → Opens Checkout ========== */}
      <section id="checkout-section" className="px-5 pb-8">
        {!showCheckout ? (
          <CTABlock onCtaClick={handleCheckoutClick} showTrustLine={true} />
        ) : (
          <div
            id="stripe-checkout"
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(10, 10, 30, 0.8)" }}
          >
            <StripeCheckout />
          </div>
        )}
      </section>

      {/* ========== SECTION 5: Feature Lists ========== */}
      <FeatureSection />

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
