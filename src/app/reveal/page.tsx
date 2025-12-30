"use client";

import { Suspense } from "react";
import { RevealShell, useReveal } from "@/components/reveal";

// PRD V4: Import reveal screens (renumbered - starts at Map Reveal)
import RevealScreen01MapReveal from "@/components/reveal/screens/RevealScreen01MapReveal";
import RevealScreen02OnboardA from "@/components/reveal/screens/RevealScreen02OnboardA";
import RevealScreen03OnboardB from "@/components/reveal/screens/RevealScreen03OnboardB";
import RevealScreen04OnboardC from "@/components/reveal/screens/RevealScreen04OnboardC";
import RevealScreen05OnboardD from "@/components/reveal/screens/RevealScreen05OnboardD";
import RevealScreen06OnboardE from "@/components/reveal/screens/RevealScreen06OnboardE";
import RevealScreen07OnboardF from "@/components/reveal/screens/RevealScreen07OnboardF";
import RevealScreen08Generation2 from "@/components/reveal/screens/RevealScreen08Generation2";
import RevealScreen09Paywall from "@/components/reveal/screens/RevealScreen09Paywall";
import RevealScreen10Confirmation from "@/components/reveal/screens/RevealScreen10Confirmation";

function RevealScreens() {
  const { state } = useReveal();

  // PRD V4: Render screen based on current step (1-10, starting at Map Reveal)
  const renderScreen = () => {
    switch (state.stepIndex) {
      case 1:
        return <RevealScreen01MapReveal />;
      case 2:
        return <RevealScreen02OnboardA />; // Screen A: Recognition
      case 3:
        return <RevealScreen03OnboardB />; // Screen B: Legitimacy + Lines
      case 4:
        return <RevealScreen04OnboardC />; // Screen C: Tribe + Gap
      case 5:
        return <RevealScreen05OnboardD />; // Screen D: Timing
      case 6:
        return <RevealScreen06OnboardE />; // Screen E: Pivot
      case 7:
        return <RevealScreen07OnboardF />; // Screen F: Urgency
      case 8:
        return <RevealScreen08Generation2 />;
      case 9:
        return <RevealScreen09Paywall />;
      case 10:
        return <RevealScreen10Confirmation />;
      default:
        // Default to Map Reveal (step 1)
        return <RevealScreen01MapReveal />;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {renderScreen()}
    </div>
  );
}

// Main page with Suspense for useSearchParams
export default function RevealPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050510] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      }
    >
      <RevealShell>
        <RevealScreens />
      </RevealShell>
    </Suspense>
  );
}
