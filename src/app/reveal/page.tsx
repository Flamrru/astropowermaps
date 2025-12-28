"use client";

import { Suspense } from "react";
import { RevealShell, useReveal } from "@/components/reveal";

// Import all reveal screens
import RevealScreen01BirthData from "@/components/reveal/screens/RevealScreen01BirthData";
import RevealScreen02Generation from "@/components/reveal/screens/RevealScreen02Generation";
import RevealScreen03MapReveal from "@/components/reveal/screens/RevealScreen03MapReveal";
import RevealScreen04Onboard1 from "@/components/reveal/screens/RevealScreen04Onboard1";
import RevealScreen05Onboard2 from "@/components/reveal/screens/RevealScreen05Onboard2";
import RevealScreen06Onboard3 from "@/components/reveal/screens/RevealScreen06Onboard3";
import RevealScreen07Pivot from "@/components/reveal/screens/RevealScreen07Pivot";
import RevealScreen08Generation2 from "@/components/reveal/screens/RevealScreen08Generation2";
import RevealScreen09Paywall from "@/components/reveal/screens/RevealScreen09Paywall";
import RevealScreen10Confirmation from "@/components/reveal/screens/RevealScreen10Confirmation";

function RevealScreens() {
  const { state } = useReveal();

  // Render screen based on current step
  const renderScreen = () => {
    switch (state.stepIndex) {
      case 1:
        return <RevealScreen01BirthData />;
      case 2:
        return <RevealScreen02Generation />;
      case 3:
        return <RevealScreen03MapReveal />;
      case 4:
        return <RevealScreen04Onboard1 />;
      case 5:
        return <RevealScreen05Onboard2 />;
      case 6:
        return <RevealScreen06Onboard3 />;
      case 7:
        return <RevealScreen07Pivot />;
      case 8:
        return <RevealScreen08Generation2 />;
      case 9:
        return <RevealScreen09Paywall />;
      case 10:
        return <RevealScreen10Confirmation />;
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
