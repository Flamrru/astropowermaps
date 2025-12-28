"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles, Map, MousePointer, Layers, Compass } from "lucide-react";

interface WelcomeTutorialProps {
  onClose: () => void;
  onDontShowAgain: () => void;
}

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  visual?: React.ReactNode;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "Your Astrocartography Map",
    description:
      "This map shows where the planets were rising, setting, and at their highest point at the exact moment you were born. Each line represents a different planetary energy.",
    icon: <Map size={28} />,
    visual: (
      <div className="relative h-32 w-full rounded-xl overflow-hidden bg-[#0a0a1e]">
        {/* Simplified map visualization */}
        <div className="absolute inset-0 opacity-30">
          <svg width="100%" height="100%" viewBox="0 0 200 100">
            {/* Vertical line */}
            <line x1="50" y1="0" x2="50" y2="100" stroke="#E8C547" strokeWidth="2" />
            {/* Curved line */}
            <path d="M 0 80 Q 100 20 200 60" stroke="#E8A4C9" strokeWidth="2" fill="none" />
            {/* Another curved line */}
            <path d="M 0 30 Q 100 90 200 40" stroke="#9B7ED9" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#E8C547] animate-pulse" />
        </div>
      </div>
    ),
  },
  {
    title: "Understanding the Lines",
    description:
      "Each colored line belongs to a planet. The Sun is gold, Moon is silver, Venus is pink, and so on. Where these lines cross the Earth, that planet's energy is strongest for you.",
    icon: <Layers size={28} />,
    visual: (
      <div className="space-y-2.5">
        {[
          { name: "Sun", color: "#E8C547", symbol: "☉", meaning: "Fame & Identity" },
          { name: "Venus", color: "#E8A4C9", symbol: "♀", meaning: "Love & Beauty" },
          { name: "Jupiter", color: "#9B7ED9", symbol: "♃", meaning: "Luck & Growth" },
        ].map((planet) => (
          <div
            key={planet.name}
            className="flex items-center gap-3 p-2 rounded-lg"
            style={{ background: `${planet.color}15` }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{ background: `${planet.color}25`, color: planet.color }}
            >
              {planet.symbol}
            </div>
            <div>
              <span className="text-white text-sm font-medium">{planet.name}</span>
              <span className="text-white/50 text-xs ml-2">{planet.meaning}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Four Types of Lines",
    description:
      "Each planet creates 4 lines. MC (Midheaven) is for career, IC (Foundation) is for home, AC (Rising) is for self-expression, and DC (Setting) is for relationships.",
    icon: <Sparkles size={28} />,
    visual: (
      <div className="grid grid-cols-2 gap-2">
        {[
          { code: "MC", name: "Midheaven", meaning: "Career & Public Life", style: "solid" },
          { code: "IC", name: "Foundation", meaning: "Home & Roots", style: "dashed" },
          { code: "AC", name: "Rising", meaning: "Self-Expression", style: "solid" },
          { code: "DC", name: "Setting", meaning: "Relationships", style: "dashed" },
        ].map((line) => (
          <div
            key={line.code}
            className="p-2.5 rounded-lg text-center"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <div
                className="w-6 h-0.5"
                style={{
                  background: "#C9A227",
                  borderStyle: line.style === "dashed" ? "dashed" : "solid",
                  borderWidth: line.style === "dashed" ? "1px" : "0",
                  borderColor: "#C9A227",
                  height: line.style === "dashed" ? "0" : "2px",
                }}
              />
              <span className="text-[#C9A227] text-xs font-bold">{line.code}</span>
            </div>
            <p className="text-white text-xs font-medium">{line.name}</p>
            <p className="text-white/40 text-[10px]">{line.meaning}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Explore Your Map",
    description:
      "Tap any line to see what it means for you. Use the filters at the top to focus on what matters most: Love, Career, Growth, or Home. Check Power Places to see your best destinations!",
    icon: <MousePointer size={28} />,
    visual: (
      <div className="space-y-3">
        <div className="flex gap-2 justify-center flex-wrap">
          {["💕 Love", "💼 Career", "🌟 Growth", "🏠 Home"].map((filter) => (
            <div
              key={filter}
              className="px-3 py-1.5 rounded-full text-xs"
              style={{
                background: "rgba(201, 162, 39, 0.15)",
                border: "1px solid rgba(201, 162, 39, 0.3)",
                color: "#E8C547",
              }}
            >
              {filter}
            </div>
          ))}
        </div>
        <p className="text-white/40 text-xs text-center">
          Filter by life theme to find your power places
        </p>
      </div>
    ),
  },
];

export default function WelcomeTutorial({
  onClose,
  onDontShowAgain,
}: WelcomeTutorialProps) {
  // Start with "ask first" prompt (step -1), then tutorial steps (0+)
  const [currentStep, setCurrentStep] = useState(-1);
  const [dontShow, setDontShow] = useState(false);

  const isAskingFirst = currentStep === -1;
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;
  const step = isAskingFirst ? null : TUTORIAL_STEPS[currentStep];

  const handleStartTutorial = () => {
    setCurrentStep(0);
  };

  const handleSkip = () => {
    // If on ask-first prompt or any step, close and optionally mark as visited
    if (dontShow) {
      onDontShowAgain();
    } else {
      onDontShowAgain(); // Skip = don't show again
    }
    onClose();
  };

  const handleNext = () => {
    if (isLastStep) {
      if (dontShow) {
        onDontShowAgain();
      }
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // "Ask First" Prompt
  if (isAskingFirst) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          style={{
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={handleSkip}
        />

        {/* Prompt Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", damping: 28, stiffness: 350 }}
          className="relative w-full max-w-sm rounded-3xl overflow-hidden mb-4 sm:mb-0"
          style={{
            background: "linear-gradient(145deg, rgba(18, 18, 42, 0.97) 0%, rgba(10, 10, 28, 0.98) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: `
              0 24px 48px rgba(0, 0, 0, 0.4),
              0 0 80px rgba(232, 197, 71, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.05)
            `,
          }}
        >
          {/* Top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{
              background: "linear-gradient(90deg, transparent 10%, rgba(232, 197, 71, 0.5) 50%, transparent 90%)",
            }}
          />

          <div className="p-6 pt-7">
            {/* Icon with glow */}
            <div className="flex justify-center mb-5">
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 30px rgba(232, 197, 71, 0.2)",
                    "0 0 50px rgba(232, 197, 71, 0.3)",
                    "0 0 30px rgba(232, 197, 71, 0.2)",
                  ],
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(232, 197, 71, 0.15) 0%, rgba(232, 197, 71, 0.05) 100%)",
                  border: "1px solid rgba(232, 197, 71, 0.25)",
                }}
              >
                {/* Inner glow */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, rgba(232, 197, 71, 0.2) 0%, transparent 60%)",
                  }}
                />
                <Compass size={28} className="text-[#E8C547] relative z-10" />
              </motion.div>
            </div>

            {/* Title */}
            <h2
              className="text-[22px] font-semibold text-center mb-2 tracking-[-0.02em]"
              style={{ color: "rgba(255, 255, 255, 0.95)" }}
            >
              First time here?
            </h2>

            {/* Description */}
            <p
              className="text-center text-[15px] leading-relaxed mb-7"
              style={{ color: "rgba(255, 255, 255, 0.5)" }}
            >
              Want a quick tour of your astrocartography map?
              <br />
              <span className="text-white/40">It only takes 30 seconds.</span>
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSkip}
                className="flex-1 py-3.5 rounded-2xl font-medium text-[15px] transition-colors"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "rgba(255, 255, 255, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                Skip
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartTutorial}
                className="flex-1 py-3.5 rounded-2xl font-semibold text-[15px] transition-all"
                style={{
                  background: "linear-gradient(135deg, #D4A82A 0%, #9A7B1C 100%)",
                  color: "white",
                  boxShadow: "0 4px 20px rgba(212, 168, 42, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                }}
              >
                Show me!
              </motion.button>
            </div>
          </div>

          {/* Bottom accent */}
          <div
            className="h-1"
            style={{
              background: "linear-gradient(90deg, transparent 20%, rgba(232, 197, 71, 0.4) 50%, transparent 80%)",
            }}
          />
        </motion.div>
      </motion.div>
    );
  }

  // Full Tutorial Steps
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleSkip}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(10, 10, 30, 0.98) 0%, rgba(5, 5, 16, 0.98) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(201, 162, 39, 0.1)",
        }}
      >
        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
        >
          <X size={20} className="text-white/50" />
        </button>

        {/* Content */}
        <div className="p-6 pt-8">
          {/* Icon */}
          {step && (
            <div className="flex justify-center mb-4">
              <motion.div
                key={currentStep}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15, stiffness: 300 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(201, 162, 39, 0.2) 0%, rgba(232, 197, 71, 0.1) 100%)",
                  border: "1px solid rgba(201, 162, 39, 0.3)",
                  color: "#E8C547",
                }}
              >
                {step.icon}
              </motion.div>
            </div>
          )}

          {/* Title */}
          {step && (
            <AnimatePresence mode="wait">
              <motion.h2
                key={`title-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-white text-xl font-semibold text-center mb-2"
              >
                {step.title}
              </motion.h2>
            </AnimatePresence>
          )}

          {/* Description */}
          {step && (
            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.1 }}
                className="text-white/60 text-sm text-center mb-6 leading-relaxed"
              >
                {step.description}
              </motion.p>
            </AnimatePresence>
          )}

          {/* Visual */}
          {step?.visual && (
            <AnimatePresence mode="wait">
              <motion.div
                key={`visual-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                {step.visual}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {TUTORIAL_STEPS.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className="p-1"
              >
                <motion.div
                  animate={{
                    scale: index === currentStep ? 1.2 : 1,
                    backgroundColor:
                      index === currentStep
                        ? "#C9A227"
                        : "rgba(255, 255, 255, 0.2)",
                  }}
                  className="w-2 h-2 rounded-full"
                />
              </button>
            ))}
          </div>

          {/* Don't Show Again (on last step) */}
          {isLastStep && (
            <label className="flex items-center justify-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShow}
                onChange={(e) => setDontShow(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#C9A227] focus:ring-[#C9A227]/50"
              />
              <span className="text-white/50 text-sm">Don&apos;t show this again</span>
            </label>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex-1 py-3 rounded-xl font-medium text-sm transition-colors"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                <ChevronLeft size={18} className="inline mr-1" />
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl font-medium text-sm transition-all"
              style={{
                background: "linear-gradient(135deg, #C9A227 0%, #8B6914 100%)",
                color: "white",
                boxShadow: "0 4px 15px rgba(201, 162, 39, 0.3)",
              }}
            >
              {isLastStep ? "Start Exploring" : "Next"}
              {!isLastStep && <ChevronRight size={18} className="inline ml-1" />}
            </button>
          </div>
        </div>

        {/* Decorative gradient at bottom */}
        <div
          className="h-1"
          style={{
            background: "linear-gradient(90deg, transparent, #C9A227, transparent)",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
