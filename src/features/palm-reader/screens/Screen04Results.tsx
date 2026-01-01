"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePalm } from "../lib/palm-state";
import ScoreBar from "../components/ScoreBar";
import PalmLineCanvas from "../components/PalmLineCanvas";
import StellaPersona from "../components/StellaPersona";
import type { TraitScore } from "../types";

// Icons for each trait
const TRAIT_ICONS: Record<string, React.ReactNode> = {
  "love-destiny": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8C547" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  "career-path": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9B7ED9" strokeWidth="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  "inner-wisdom": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6EE7B7" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
  "life-force": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="2">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  "heart-connection": (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8A4C9" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

// Insight section icons
const INSIGHT_ICONS: Record<string, React.ReactNode> = {
  love: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  career: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  health: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  spirituality: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" />
    </svg>
  ),
};

interface InsightCardProps {
  title: string;
  content: string;
  icon: React.ReactNode;
  delay: number;
}

function InsightCard({ title, content, icon, delay }: InsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-gold-main">{icon}</span>
          <span className="text-white/80 text-sm font-medium">{title}</span>
        </div>
        <motion.svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-white/40"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4">
              <p className="text-white/60 text-sm leading-relaxed">{content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Screen04Results() {
  const { state, dispatch } = usePalm();
  const [showContent, setShowContent] = useState(false);

  // Get data from state
  const result = state.analysisResult;
  const reading = result?.openaiResult?.reading;
  const lines = result?.geminiResult?.lines || [];
  const palmImage = state.capturedImage;

  // Debug logging
  console.log("📊 Results screen data:", {
    hasPalmImage: !!palmImage,
    palmImageLength: palmImage?.length,
    linesCount: lines.length,
    lines: lines,
    hasResult: !!result,
    hasReading: !!reading,
  });

  // Delay content reveal for dramatic effect
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Default mock data if no result (for preview)
  const traits: TraitScore[] = reading?.traits || [
    { id: "love-destiny", label: "Love Destiny", score: 78, description: "Deep emotional capacity", lineSource: "heart" },
    { id: "career-path", label: "Career Path", score: 85, description: "Strong ambition", lineSource: "fate" },
    { id: "inner-wisdom", label: "Inner Wisdom", score: 72, description: "Natural intuition", lineSource: "head" },
    { id: "life-force", label: "Life Force", score: 90, description: "Abundant energy", lineSource: "life" },
    { id: "heart-connection", label: "Heart Connection", score: 68, description: "Emotional depth", lineSource: "heart" },
  ];

  const insights = reading?.insights || {
    love: "Your heart line reveals a deep capacity for meaningful connection.",
    career: "The fate line suggests purposeful work aligning with your values.",
    health: "Your life line radiates vitality and resilience.",
    spirituality: "A natural connection to something greater guides you.",
  };

  const stellaQuote =
    reading?.stellaQuote ||
    "In your palm, I see not fate carved in stone, but possibilities written in starlight.";

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
      {/* Scrollable content */}
      <div
        className="absolute inset-0 overflow-y-auto px-5 pb-36"
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        {/* Header */}
        <motion.div
          className="text-center py-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-display text-white mb-1">Your Reading</h1>
          <p className="text-white/50 text-sm">Revealed by Stella</p>
        </motion.div>

        {showContent && (
          <>
            {/* Palm image with lines */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {palmImage ? (
                <PalmLineCanvas
                  imageUrl={palmImage}
                  lines={lines}
                  width={260}
                  height={340}
                  animate={true}
                />
              ) : (
                <div
                  className="w-[260px] h-[340px] rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <span className="text-white/30 text-sm">No image</span>
                </div>
              )}
            </motion.div>

            {/* Stella's quote */}
            <div className="mb-6">
              <StellaPersona quote={stellaQuote} delay={0.5} />
            </div>

            {/* Trait scores */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <h2 className="text-sm text-white/50 uppercase tracking-wider mb-4">
                Your Traits
              </h2>
              <div className="space-y-4">
                {traits.map((trait, i) => (
                  <ScoreBar
                    key={trait.id}
                    label={trait.label}
                    score={trait.score}
                    delay={1 + i * 0.15}
                    icon={TRAIT_ICONS[trait.id]}
                  />
                ))}
              </div>
            </motion.div>

            {/* Detailed insights */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <h2 className="text-sm text-white/50 uppercase tracking-wider mb-4">
                Detailed Insights
              </h2>
              <div className="space-y-3">
                <InsightCard
                  title="Love & Relationships"
                  content={insights.love}
                  icon={INSIGHT_ICONS.love}
                  delay={2.1}
                />
                <InsightCard
                  title="Career & Purpose"
                  content={insights.career}
                  icon={INSIGHT_ICONS.career}
                  delay={2.2}
                />
                <InsightCard
                  title="Health & Vitality"
                  content={insights.health}
                  icon={INSIGHT_ICONS.health}
                  delay={2.3}
                />
                <InsightCard
                  title="Spirituality"
                  content={insights.spirituality}
                  icon={INSIGHT_ICONS.spirituality}
                  delay={2.4}
                />
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Fixed bottom CTA */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 p-5 z-50"
        style={{
          background:
            "linear-gradient(to top, rgba(5,5,16,1) 0%, rgba(5,5,16,0.95) 80%, transparent 100%)",
          paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 20px))",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <motion.button
          onClick={() => dispatch({ type: "NEXT_STEP" })}
          className="w-full py-4 rounded-xl font-medium text-cosmic-black relative overflow-hidden"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: "linear-gradient(135deg, #E8C547 0%, #C9A227 100%)",
            boxShadow: "0 0 30px rgba(201,162,39,0.4), 0 10px 40px rgba(0,0,0,0.3)",
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Ask Stella a Question
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}
