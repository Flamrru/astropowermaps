"use client";

import QuizShell from "@/components/QuizShell";
import { useQuiz } from "@/lib/quiz-state";

// Import all screens
import Screen01Entry from "@/components/screens/Screen01Entry";
import Screen02Insight from "@/components/screens/Screen02Insight";
import Screen03Question from "@/components/screens/Screen03Question";
import Screen04Proof from "@/components/screens/Screen04Proof";
import Screen05Question from "@/components/screens/Screen05Question";
import Screen06Insight from "@/components/screens/Screen06Insight";
import Screen07Testimonial from "@/components/screens/Screen07Testimonial";
// PRD V4: New combined capture flow
import Screen08CombinedCapture from "@/components/screens/Screen08CombinedCapture";
import Screen09RealLoading from "@/components/screens/Screen09RealLoading";
import Screen10AutoConfirmation from "@/components/screens/Screen10AutoConfirmation";

function QuizContent() {
  const { state } = useQuiz();

  const screens: Record<number, React.ComponentType> = {
    1: Screen01Entry,
    2: Screen02Insight,
    3: Screen03Question,
    4: Screen04Proof,
    5: Screen05Question,
    6: Screen06Insight,
    7: Screen07Testimonial,
    // PRD V4: Combined email + birth data capture
    8: Screen08CombinedCapture,
    // PRD V4: Real astro calculation (5-6 sec)
    9: Screen09RealLoading,
    // PRD V4: Auto-advance confirmation (2.5 sec)
    10: Screen10AutoConfirmation,
  };

  const CurrentScreen = screens[state.stepIndex] || Screen01Entry;

  return <CurrentScreen />;
}

export default function Home() {
  return (
    <QuizShell>
      <QuizContent />
    </QuizShell>
  );
}
