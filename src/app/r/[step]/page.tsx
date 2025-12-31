"use client";

import { redirect } from "next/navigation";
import { use } from "react";

// Super short dev URLs: /r/3, /r/4, /r/9, etc.
// Redirects to /reveal?d=X with your birth data pre-filled

export default function QuickReveal({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = use(params);
  const stepNum = parseInt(step, 10);

  // Only allow valid step numbers 1-10
  if (isNaN(stepNum) || stepNum < 1 || stepNum > 10) {
    redirect("/reveal");
  }

  redirect(`/reveal?d=${stepNum}`);
}
