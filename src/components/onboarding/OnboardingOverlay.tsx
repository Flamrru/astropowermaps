"use client";

import { motion } from "framer-motion";
import { Sparkles, Map, Calendar, Star } from "lucide-react";
import type { OnboardingStep } from "./OnboardingProvider";

// ============================================
// Step Content Configuration
// ============================================

interface StepContent {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  description: string;
  buttonText: string;
  spotlight?: "none" | "map-full" | "map-panel" | "calendar-tabs" | "report";
}

function getStepContent(step: OnboardingStep, sunSign: string): StepContent {
  const steps: Record<OnboardingStep, StepContent> = {
    1: {
      icon: <Sparkles className="w-8 h-8" />,
      title: `Welcome, ${sunSign}`,
      subtitle: "The stars have been waiting for you",
      description:
        "Your cosmic dashboard is ready. Let me show you around your new home among the stars.",
      buttonText: "Show me my map",
      spotlight: "none",
    },
    2: {
      icon: <Map className="w-8 h-8" />,
      title: "Your Planetary Lines",
      description:
        "These colored lines represent planetary energy paths flowing across the Earth. Each one shapes how you experience different places — for career, creativity, relationships, and transformation.",
      buttonText: "Got it",
      spotlight: "map-full",
    },
    3: {
      icon: <Star className="w-8 h-8" />,
      title: "Discover Power Places",
      description:
        "Tap any city marker to see what cosmic energies it activates for you. The Power Places panel shows your strongest destinations — sorted by what matters most to you.",
      buttonText: "Show me more",
      spotlight: "map-panel",
    },
    4: {
      icon: <Calendar className="w-8 h-8" />,
      title: "We know why you're here",
      subtitle: "You didn't just want a map",
      description:
        "You wanted to know what 2026 holds for you. Your personal cosmic forecast is ready and waiting.",
      buttonText: "Reveal my year",
      spotlight: "calendar-tabs",
    },
    5: {
      icon: <Sparkles className="w-8 h-8" />,
      title: "You're all set",
      subtitle: "The cosmos awaits",
      description:
        "Stella is always here when you need guidance — just tap the sparkle button. Now go explore your year ahead.",
      buttonText: "Start exploring",
      spotlight: "none",
    },
  };

  return steps[step];
}

// ============================================
// Floating Particles Component
// ============================================

function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2,
    duration: 4 + Math.random() * 4,
    delay: Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: "radial-gradient(circle, rgba(232, 197, 71, 0.8) 0%, transparent 70%)",
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// Step Indicator Component
// ============================================

function StepIndicator({ currentStep }: { currentStep: OnboardingStep }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <motion.div
          key={step}
          className="relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: step * 0.05 }}
        >
          <div
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              step === currentStep
                ? "bg-gold-main scale-150"
                : step < currentStep
                ? "bg-gold-main/60"
                : "bg-white/20"
            }`}
          />
          {step === currentStep && (
            <motion.div
              className="absolute inset-0 rounded-full bg-gold-main/40"
              animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// Main Overlay Component
// ============================================

interface OnboardingOverlayProps {
  step: OnboardingStep;
  sunSign: string;
  onNext: () => void;
  onComplete: () => void;
}

export default function OnboardingOverlay({
  step,
  sunSign,
  onNext,
  onComplete,
}: OnboardingOverlayProps) {
  const content = getStepContent(step, sunSign);
  const isLastStep = step === 5;

  const handleAction = () => {
    if (isLastStep) {
      onComplete();
    } else {
      onNext();
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Dark overlay with subtle gradient */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 30%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(201, 162, 39, 0.05) 0%, transparent 40%),
            rgba(5, 5, 16, 0.92)
          `,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />

      {/* Floating cosmic particles */}
      <FloatingParticles />

      {/* Content Card */}
      <motion.div
        className="relative z-10 w-full max-w-sm mx-6"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        key={step}
      >
        {/* Outer glow */}
        <div
          className="absolute -inset-4 rounded-3xl opacity-30 blur-xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(232, 197, 71, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)",
          }}
        />

        {/* Glass card */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: "rgba(15, 15, 35, 0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: `
              0 0 0 1px rgba(232, 197, 71, 0.1),
              0 25px 50px -12px rgba(0, 0, 0, 0.6),
              inset 0 1px 0 rgba(255, 255, 255, 0.05)
            `,
          }}
        >
          {/* Top accent line */}
          <div
            className="h-0.5"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(232, 197, 71, 0.5), transparent)",
            }}
          />

          <div className="p-8 pt-6">
            {/* Step indicator */}
            <StepIndicator currentStep={step} />

            {/* Icon */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(232, 197, 71, 0.15) 0%, rgba(201, 162, 39, 0.05) 100%)",
                  border: "1px solid rgba(232, 197, 71, 0.3)",
                  boxShadow: "0 0 30px rgba(232, 197, 71, 0.2)",
                  color: "#E8C547",
                }}
              >
                {content.icon}
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-center mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <span
                className="text-2xl font-semibold tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #FFFFFF 0%, #E8C547 50%, #FFFFFF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundSize: "200% 100%",
                }}
              >
                {content.title}
              </span>
            </motion.h2>

            {/* Subtitle */}
            {content.subtitle && (
              <motion.p
                className="text-center text-white/50 text-sm mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {content.subtitle}
              </motion.p>
            )}

            {/* Description */}
            <motion.p
              className="text-center text-white/70 text-base leading-relaxed mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              {content.description}
            </motion.p>

            {/* Action Button */}
            <motion.button
              onClick={handleAction}
              className="w-full py-4 rounded-xl font-semibold text-base relative overflow-hidden group"
              style={{
                background: "linear-gradient(135deg, #E8C547 0%, #C9A227 100%)",
                color: "#1a1400",
                boxShadow: "0 4px 20px rgba(232, 197, 71, 0.3)",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, boxShadow: "0 6px 30px rgba(232, 197, 71, 0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
                }}
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {content.buttonText}
                {!isLastStep && (
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                )}
                {isLastStep && <Sparkles className="w-4 h-4" />}
              </span>
            </motion.button>
          </div>

          {/* Bottom accent */}
          <div
            className="h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(232, 197, 71, 0.2), transparent)",
            }}
          />
        </div>

        {/* Decorative corner elements */}
        <div
          className="absolute -top-2 -left-2 w-4 h-4 opacity-40"
          style={{
            borderLeft: "1px solid rgba(232, 197, 71, 0.5)",
            borderTop: "1px solid rgba(232, 197, 71, 0.5)",
          }}
        />
        <div
          className="absolute -top-2 -right-2 w-4 h-4 opacity-40"
          style={{
            borderRight: "1px solid rgba(232, 197, 71, 0.5)",
            borderTop: "1px solid rgba(232, 197, 71, 0.5)",
          }}
        />
        <div
          className="absolute -bottom-2 -left-2 w-4 h-4 opacity-40"
          style={{
            borderLeft: "1px solid rgba(232, 197, 71, 0.5)",
            borderBottom: "1px solid rgba(232, 197, 71, 0.5)",
          }}
        />
        <div
          className="absolute -bottom-2 -right-2 w-4 h-4 opacity-40"
          style={{
            borderRight: "1px solid rgba(232, 197, 71, 0.5)",
            borderBottom: "1px solid rgba(232, 197, 71, 0.5)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
