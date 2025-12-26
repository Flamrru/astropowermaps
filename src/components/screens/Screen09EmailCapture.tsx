"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GoldButton from "@/components/GoldButton";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";
import { Check } from "lucide-react";

export default function Screen09EmailCapture() {
  const { state, dispatch } = useQuiz();
  const [email, setEmail] = useState(state.email);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Animated waitlist counter
  const [waitlistCount, setWaitlistCount] = useState(12847);

  useEffect(() => {
    // Increment by 1 every 3-6 seconds (random for natural feel)
    const tick = () => {
      setWaitlistCount(prev => prev + 1);
    };

    const scheduleNext = () => {
      const delay = 3000 + Math.random() * 12000; // 3-15 seconds
      return setTimeout(() => {
        tick();
        timerId = scheduleNext();
      }, delay);
    };

    let timerId = scheduleNext();
    return () => clearTimeout(timerId);
  }, []);

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

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col px-6 pt-4 pb-6">
        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {/* Headline - "You just haven't seen it yet." bold */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="heading-display text-[28px] md:text-[34px] text-white mb-4 text-center"
          >
            Your map exists. <span className="font-bold">You just haven&apos;t seen it yet.</span>
          </motion.h2>

          {/* Subhead - "48 hours" in gold */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-body text-[15px] text-white/80 mb-5 text-center"
          >
            In <span className="text-gold-glow font-semibold">48 hours</span>, the 2026 Power Map goes live. Enter your email, and you&apos;ll get:
          </motion.p>

          {/* Benefits card - darker glass */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl py-5 px-5 mb-5"
            style={{
              background: 'rgba(10, 10, 20, 0.5)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <ul className="space-y-4">
              {[
                { bold: "3 power months", rest: "— when to launch, take risks, make moves" },
                { bold: "3 power destinations", rest: "— where to travel for breakthroughs" },
                { bold: "rest windows", rest: "— when to recharge instead of force" },
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span
                    className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #E8C547 0%, #C9A227 100%)',
                      boxShadow: '0 0 8px rgba(201, 162, 39, 0.4)',
                    }}
                  >
                    <Check className="w-3 h-3 text-[#1a1400]" strokeWidth={3} />
                  </span>
                  <span className="text-[14px] text-white/85 leading-relaxed">
                    Your <span className="font-bold text-white">{item.bold}</span> {item.rest}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Social proof - animated counter */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-[13px] text-gold text-center mb-4"
          >
            <span className="tabular-nums">{waitlistCount.toLocaleString()}</span> people already on the waitlist
          </motion.p>

          {/* Email input - darker glass style */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
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
              className="w-full py-4 px-5 rounded-xl text-[15px] text-white placeholder:text-white/40"
              style={{
                background: 'rgba(10, 10, 20, 0.5)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(201, 162, 39, 0.5)';
                e.target.style.boxShadow = '0 0 20px rgba(201, 162, 39, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.target.style.boxShadow = 'none';
              }}
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
          transition={{ duration: 0.5, delay: 0.6 }}
          className="max-w-md mx-auto w-full pt-5"
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
