"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GoldButton from "@/components/GoldButton";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";
import { Check, Sparkles, MapPin, Calendar, Moon } from "lucide-react";

// Floating celebration stars
function CelebrationStars() {
  const stars = [
    { left: '10%', top: '15%', size: 2, delay: 0 },
    { left: '85%', top: '20%', size: 2.5, delay: 0.3 },
    { left: '15%', top: '45%', size: 1.5, delay: 0.6 },
    { left: '90%', top: '55%', size: 2, delay: 0.2 },
    { left: '5%', top: '75%', size: 2, delay: 0.5 },
    { left: '92%', top: '80%', size: 1.5, delay: 0.4 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0.4],
            scale: [0, 1, 0.8],
          }}
          transition={{
            duration: 2,
            delay: star.delay,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            background: i % 2 === 0
              ? 'radial-gradient(circle, #E8C547 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)',
            borderRadius: '50%',
            boxShadow: i % 2 === 0
              ? '0 0 6px rgba(232, 197, 71, 0.6)'
              : '0 0 4px rgba(255,255,255,0.4)',
          }}
        />
      ))}
    </div>
  );
}

export default function Screen09EmailCapture() {
  const { state, dispatch } = useQuiz();
  const [email, setEmail] = useState(state.email);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Animated waitlist counter
  const [waitlistCount, setWaitlistCount] = useState(12847);

  useEffect(() => {
    const tick = () => {
      setWaitlistCount(prev => prev + 1);
    };

    const scheduleNext = () => {
      const delay = 3000 + Math.random() * 12000;
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

  const benefits = [
    { icon: Calendar, bold: "3 power months", rest: "when to launch, take risks, make moves" },
    { icon: MapPin, bold: "3 power destinations", rest: "where to travel for breakthroughs" },
    { icon: Moon, bold: "Rest windows", rest: "when to recharge instead of force" },
  ];

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Celebration stars */}
      <CelebrationStars />

      <div className="flex-1 flex flex-col px-5 pb-6">
        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">

          {/* Celebratory header badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-4"
          >
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(232,197,71,0.15) 0%, rgba(201,162,39,0.05) 100%)',
                border: '1px solid rgba(201,162,39,0.3)',
              }}
            >
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-[12px] text-gold uppercase tracking-wider font-medium">
                You&apos;re almost there
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="heading-display text-[26px] md:text-[32px] text-white mb-3 text-center leading-tight"
          >
            Your map exists.{" "}
            <span className="text-gold-glow font-bold">See it first.</span>
          </motion.h2>

          {/* Subhead with countdown */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-center mb-5"
          >
            <p className="text-[14px] text-white/70 leading-relaxed">
              The 2026 Power Map launches in{" "}
              <span className="text-gold-glow font-semibold">48 hours</span>.
              <br />
              Enter your email to unlock:
            </p>
          </motion.div>

          {/* Benefits card - enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl p-5 mb-5 relative overflow-hidden"
            style={{
              background: 'rgba(10, 10, 20, 0.5)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Gold accent line at top */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(232,197,71,0.6) 50%, transparent 100%)',
              }}
            />

            <ul className="space-y-4">
              {benefits.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(232,197,71,0.2) 0%, rgba(201,162,39,0.1) 100%)',
                      border: '1px solid rgba(201,162,39,0.3)',
                    }}
                  >
                    <item.icon className="w-3.5 h-3.5 text-gold" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <span className="text-[14px] text-white font-medium">{item.bold}</span>
                    <span className="text-[14px] text-white/50"> — {item.rest}</span>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Social proof counter - enhanced */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <div className="flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-[#0a0a1e]"
                  style={{
                    background: `linear-gradient(135deg, ${
                      i === 0 ? '#E8C547' : i === 1 ? '#C9A227' : '#8B6914'
                    } 0%, #1a1400 100%)`,
                  }}
                />
              ))}
            </div>
            <p className="text-[13px] text-white/60">
              <span className="text-gold font-semibold tabular-nums">
                {waitlistCount.toLocaleString()}
              </span>{" "}
              people on the waitlist
            </p>
          </motion.div>

          {/* Email input - premium styling */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="relative"
          >
            <div
              className="relative rounded-xl overflow-hidden"
              style={{
                background: 'rgba(10, 10, 20, 0.6)',
                border: isFocused
                  ? '1px solid rgba(201, 162, 39, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: isFocused
                  ? '0 0 20px rgba(201, 162, 39, 0.15), inset 0 0 30px rgba(201, 162, 39, 0.03)'
                  : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={COPY.screen9.inputPlaceholder}
                className="w-full py-4 px-5 bg-transparent text-[15px] text-white placeholder:text-white/35 outline-none"
                disabled={loading}
              />
            </div>

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
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
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
          className="max-w-md mx-auto w-full pt-4 mb-6"
        >
          <GoldButton
            onClick={handleSubmit}
            disabled={!email.trim()}
            loading={loading}
          >
            {COPY.screen9.button}
          </GoldButton>

          {/* Privacy note */}
          <p className="text-[11px] text-white/30 text-center mt-3">
            No spam. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
