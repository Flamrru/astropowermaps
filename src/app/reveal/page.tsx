"use client";

import { Suspense } from "react";
import { RevealShell, useReveal } from "@/components/reveal";

// Import all reveal screens
import RevealScreen01BirthData from "@/components/reveal/screens/RevealScreen01BirthData";
import RevealScreen02Generation from "@/components/reveal/screens/RevealScreen02Generation";
import RevealScreen03MapReveal from "@/components/reveal/screens/RevealScreen03MapReveal";
import RevealScreen04OnboardA from "@/components/reveal/screens/RevealScreen04OnboardA";
import RevealScreen05OnboardB from "@/components/reveal/screens/RevealScreen05OnboardB";
import RevealScreen06OnboardC from "@/components/reveal/screens/RevealScreen06OnboardC";
import RevealScreen07OnboardD from "@/components/reveal/screens/RevealScreen07OnboardD";
import RevealScreen08OnboardE from "@/components/reveal/screens/RevealScreen08OnboardE";
import RevealScreen09OnboardF from "@/components/reveal/screens/RevealScreen09OnboardF";
import RevealScreen10Generation2 from "@/components/reveal/screens/RevealScreen10Generation2";
import RevealScreen11Paywall from "@/components/reveal/screens/RevealScreen11Paywall";
import RevealScreen12Confirmation from "@/components/reveal/screens/RevealScreen12Confirmation";

function RevealScreens() {
  const { state } = useReveal();

  // Render screen based on current step (1-12)
  const renderScreen = () => {
    switch (state.stepIndex) {
      case 1:
        return <RevealScreen01BirthData />;
      case 2:
        return <RevealScreen02Generation />;
      case 3:
        return <RevealScreen03MapReveal />;
      case 4:
        return <RevealScreen04OnboardA />; // Screen A: Recognition
      case 5:
        return <RevealScreen05OnboardB />; // Screen B: Legitimacy + Lines
      case 6:
        return <RevealScreen06OnboardC />; // Screen C: Tribe + Gap
      case 7:
        return <RevealScreen07OnboardD />; // Screen D: Timing
      case 8:
        return <RevealScreen08OnboardE />; // Screen E: Pivot
      case 9:
        return <RevealScreen09OnboardF />; // Screen F: Urgency
      case 10:
        return <RevealScreen10Generation2 />;
      case 11:
        return <RevealScreen11Paywall />;
      case 12:
        return <RevealScreen12Confirmation />;
      default:
        // Step 0 or loading state - show birth data form
        return <RevealScreen01BirthData />;
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
