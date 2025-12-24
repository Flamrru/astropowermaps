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
import Screen08Loading from "@/components/screens/Screen08Loading";
import Screen09EmailCapture from "@/components/screens/Screen09EmailCapture";
import Screen10Confirmation from "@/components/screens/Screen10Confirmation";

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
    8: Screen08Loading,
    9: Screen09EmailCapture,
    10: Screen10Confirmation,
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
