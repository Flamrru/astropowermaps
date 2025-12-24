"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import GoldButton from "@/components/GoldButton";
import ProgressHeader from "@/components/ProgressHeader";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";
import { Check } from "lucide-react";

export default function Screen09EmailCapture() {
  const { state, dispatch } = useQuiz();
  const [email, setEmail] = useState(state.email);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    if (honeypot) return;

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          quiz: {
            q1: state.answer_q1,
            q2: state.answer_q2,
          },
          utm: state.utm,
          session_id: state.session_id,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit");
      }

      dispatch({ type: "SET_EMAIL", payload: email.trim() });
      dispatch({ type: "NEXT_STEP" });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    dispatch({ type: "SET_STEP", payload: 7 });
  };

  return (
    <div className="flex-1 flex flex-col">
      <ProgressHeader
        currentStep={state.stepIndex}
        showBack={true}
        onBack={handleBack}
      />

      <div className="flex-1 flex flex-col px-6 pt-6 pb-6">
        {/* Main content */}
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="heading-display text-[32px] md:text-[38px] text-white mb-4"
          >
            {COPY.screen9.headline}
          </motion.h2>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-body text-[15px] text-white/70 mb-5"
          >
            {COPY.screen9.subhead}
          </motion.p>

          {/* Benefits */}
          <motion.ul
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-3 mb-6"
          >
            {COPY.screen9.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-[#C9A227] mt-0.5 flex-shrink-0">
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                </span>
                <span className="text-[14px] text-white/75 leading-relaxed">{benefit}</span>
              </li>
            ))}
          </motion.ul>

          {/* Social proof */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-[13px] text-[#C9A227] mb-5"
          >
            {COPY.screen9.socialProof}
          </motion.p>

          {/* Email input */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="relative"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder={COPY.screen9.inputPlaceholder}
              className="input-glass w-full py-4 px-5 rounded-xl text-[15px]"
              disabled={loading}
            />
            {/* Honeypot */}
            <input
              type="text"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="absolute opacity-0 pointer-events-none"
              tabIndex={-1}
              autoComplete="off"
            />
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-[13px] mt-2 px-1"
              >
                {error}
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-md mx-auto w-full pt-6"
        >
          <GoldButton
            onClick={handleSubmit}
            disabled={!email.trim()}
            loading={loading}
          >
            {COPY.screen9.button}
          </GoldButton>
        </motion.div>
      </div>
    </div>
  );
}
