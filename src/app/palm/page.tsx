"use client";

import { Suspense } from "react";
import PalmReaderShell from "@/features/palm-reader/components/PalmReaderShell";
import { usePalm } from "@/features/palm-reader/lib/palm-state";

// Import all screen components
import Screen01Welcome from "@/features/palm-reader/screens/Screen01Welcome";
import Screen02Capture from "@/features/palm-reader/screens/Screen02Capture";
import Screen03Analyzing from "@/features/palm-reader/screens/Screen03Analyzing";
import Screen04Results from "@/features/palm-reader/screens/Screen04Results";
import Screen05Chat from "@/features/palm-reader/screens/Screen05Chat";

// Screen router
function PalmScreenRouter() {
  const { state } = usePalm();

  switch (state.step) {
    case 1:
      return <Screen01Welcome />;
    case 2:
      return <Screen02Capture />;
    case 3:
      return <Screen03Analyzing />;
    case 4:
      return <Screen04Results />;
    case 5:
      return <Screen05Chat />;
    default:
      return <Screen01Welcome />;
  }
}

// Main page component
function PalmReaderPage() {
  return (
    <PalmReaderShell>
      <PalmScreenRouter />
    </PalmReaderShell>
  );
}

// Export with Suspense for client-side rendering
export default function PalmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cosmic-black flex items-center justify-center">
          <div className="text-white/60">Loading...</div>
        </div>
      }
    >
      <PalmReaderPage />
    </Suspense>
  );
}
