"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useQuiz } from "@/lib/quiz-state";

// Seeded pseudo-random number generator for deterministic particles
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Celebration particles that burst outward
function CelebrationBurst() {
  // Use useMemo with deterministic values to avoid hydration mismatch
  const particles = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    angle: (i * 22.5) * (Math.PI / 180),
    delay: i * 0.02,
    size: i % 3 === 0 ? 3 : 2,
    distance: i % 2 === 0 ? 100 : 70,
    duration: 0.8 + seededRandom(i + 100) * 0.3,
  })), []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1.2, 0.8],
            opacity: [0, 1, 0],
            x: Math.cos(particle.angle) * particle.distance,
            y: Math.sin(particle.angle) * particle.distance,
          }}
          transition={{
            duration: particle.duration,
            delay: 0.2 + particle.delay,
            ease: "easeOut",
          }}
          style={{
            width: particle.size,
            height: particle.size,
            background:
              i % 3 === 0
                ? "radial-gradient(circle, #E8C547 0%, rgba(232, 197, 71, 0) 70%)"
                : "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)",
            borderRadius: "50%",
            boxShadow:
              i % 3 === 0
                ? "0 0 8px rgba(232, 197, 71, 0.8)"
                : "0 0 6px rgba(255,255,255,0.6)",
          }}
        />
      ))}
    </div>
  );
}

// Floating ambient particles
function AmbientParticles() {
  // Use useMemo with deterministic seeded values to avoid hydration mismatch
  const particles = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    left: `${seededRandom(i * 3) * 100}%`,
    top: `${seededRandom(i * 3 + 1) * 100}%`,
    size: 1 + seededRandom(i * 3 + 2) * 2,
    delay: seededRandom(i + 50) * 2,
    duration: 2 + seededRandom(i + 80) * 2,
    repeatDelay: seededRandom(i + 200) * 2,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: [0, 0.5, 0],
            y: [10, -30, -50],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: p.repeatDelay,
          }}
          className="absolute"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background:
              i % 4 === 0
                ? "rgba(232, 197, 71, 0.7)"
                : "rgba(255, 255, 255, 0.5)",
            borderRadius: "50%",
            boxShadow:
              i % 4 === 0
                ? "0 0 4px rgba(232, 197, 71, 0.5)"
                : "0 0 3px rgba(255, 255, 255, 0.3)",
          }}
        />
      ))}
    </div>
  );
}

// Expanding ring animation
function ExpandingRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 100,
            height: 100,
            border: "1px solid rgba(201, 162, 39, 0.4)",
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [0.8, 2.5, 3],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 2,
            delay: 0.3 + i * 0.3,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export default function Screen10AutoConfirmation() {
  const { state } = useQuiz();
  const [showContent, setShowContent] = useState(false);

  // Show content after brief delay for dramatic effect
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-advance to reveal after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Build reveal URL with session ID
      let revealUrl = `/reveal?sid=${state.session_id}`;

      // Preserve paywall variant for A/B test (e.g., ?plan=single)
      const paywallVariant = localStorage.getItem("stella_paywall_variant");
      if (paywallVariant) {
        revealUrl += `&plan=${paywallVariant}`;
      }

      // Preserve price variant for A/B price test (e.g., ?c=x24ts)
      const priceVariant = localStorage.getItem("stella_price_variant");
      if (priceVariant) {
        revealUrl += `&c=${priceVariant}`;
      }

      window.location.href = revealUrl;
    }, 2500);

    return () => clearTimeout(timer);
  }, [state.session_id]);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Background - deep cosmic */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 100% at 50% 50%, rgba(30, 25, 50, 1) 0%, #050510 60%),
            linear-gradient(180deg, #0a0815 0%, #050510 100%)
          `,
        }}
      />

      {/* Ambient particles */}
      <AmbientParticles />

      {/* Subtle gold nebula glow */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 500,
          height: 500,
          left: "calc(50% - 250px)",
          top: "calc(50% - 250px)",
          background: "radial-gradient(ellipse at center, rgba(201, 162, 39, 0.08) 0%, transparent 50%)",
          filter: "blur(50px)",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center relative">
        {showContent && (
          <>
            {/* Expanding rings */}
            <ExpandingRings />

            {/* Celebration burst */}
            <CelebrationBurst />

            {/* Success icon */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                duration: 0.6,
                bounce: 0.4,
              }}
              className="relative"
            >
              {/* Outer glow rings */}
              <div
                className="absolute -inset-4 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(201,162,39,0.3) 0%, transparent 70%)",
                  filter: "blur(10px)",
                }}
              />
              <div
                className="absolute -inset-8 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(201,162,39,0.15) 0%, transparent 70%)",
                  filter: "blur(20px)",
                }}
              />

              {/* Main icon circle */}
              <motion.div
                className="relative w-24 h-24 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #E8C547 0%, #C9A227 50%, #8B6914 100%)",
                  boxShadow: "0 0 40px rgba(201, 162, 39, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)",
                }}
                animate={{
                  boxShadow: [
                    "0 0 40px rgba(201, 162, 39, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)",
                    "0 0 60px rgba(201, 162, 39, 0.7), inset 0 2px 4px rgba(255,255,255,0.3)",
                    "0 0 40px rgba(201, 162, 39, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                >
                  <Check className="w-12 h-12 text-[#1a1400]" strokeWidth={3} />
                </motion.div>
              </motion.div>
            </motion.div>
          </>
        )}
      </div>

      {/* Text */}
      <div className="relative z-10 px-6 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <h2 className="text-[28px] md:text-[34px] font-bold text-white mb-2">
            <span className="text-gold-glow">✓</span> Your map is ready.
          </h2>

          {/* Subtle loading indicator */}
          <motion.div
            className="flex items-center justify-center gap-2 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-gold/60"
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-gold/60"
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-gold/60"
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
