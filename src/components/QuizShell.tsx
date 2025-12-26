"use client";

import { useReducer, useEffect, useRef, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QuizContext, quizReducer, initialQuizState } from "@/lib/quiz-state";
import { parseUTMParams } from "@/lib/utm";
import ProgressHeader from "@/components/ProgressHeader";

// Crossfade video loop component for smooth looping (60fps)
function CrossfadeOrbVideo({ isActive }: { isActive: boolean }) {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const [opacityA, setOpacityA] = useState(1);
  const [opacityB, setOpacityB] = useState(0);
  const activeRef = useRef<'A' | 'B'>('A');
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const videoA = videoARef.current;
    const videoB = videoBRef.current;
    if (!videoA || !videoB) return;

    const crossfadeDuration = 1.5; // seconds

    // 60fps animation loop for smooth crossfade
    const animate = () => {
      const currentVideo = activeRef.current === 'A' ? videoA : videoB;
      const nextVideo = activeRef.current === 'A' ? videoB : videoA;

      if (currentVideo.duration) {
        const timeLeft = currentVideo.duration - currentVideo.currentTime;

        // Start crossfade when approaching end
        if (timeLeft <= crossfadeDuration && timeLeft > 0) {
          const progress = 1 - (timeLeft / crossfadeDuration);
          // Smooth easing curve
          const easedProgress = progress * progress * (3 - 2 * progress);

          if (activeRef.current === 'A') {
            setOpacityA(1 - easedProgress);
            setOpacityB(easedProgress);
          } else {
            setOpacityB(1 - easedProgress);
            setOpacityA(easedProgress);
          }

          // Start next video if not already playing
          if (nextVideo.paused) {
            nextVideo.currentTime = 0;
            nextVideo.play();
          }
        }

        // Switch active video when current one ends
        if (timeLeft <= 0.05) {
          activeRef.current = activeRef.current === 'A' ? 'B' : 'A';
          setOpacityA(activeRef.current === 'A' ? 1 : 0);
          setOpacityB(activeRef.current === 'B' ? 1 : 0);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start video A and animation loop
    videoA.play();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <div className="absolute inset-0">
      <video
        ref={videoARef}
        src="/orb-question-bg.mp4?v=3"
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{
          opacity: opacityA,
          transform: 'scale(0.9)'
        }}
      />
      <video
        ref={videoBRef}
        src="/orb-question-bg.mp4?v=3"
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{
          opacity: opacityB,
          transform: 'scale(0.9)'
        }}
      />
    </div>
  );
}

interface QuizShellProps {
  children: ReactNode;
}

export default function QuizShell({ children }: QuizShellProps) {
  const [state, dispatch] = useReducer(quizReducer, initialQuizState);
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mount to prevent hydration flash
  useEffect(() => {
    setMounted(true);
  }, []);

  // Capture UTM parameters on mount
  useEffect(() => {
    const utm = parseUTMParams();
    if (Object.keys(utm).length > 0) {
      dispatch({ type: "SET_UTM", payload: utm });
    }
  }, []);

  // Background logic: step 1 = entry orb, step 2 = globe, step 3 = question orb, rest = nebula
  const useEntryBg = state.stepIndex === 1;
  const useGlobeBg = state.stepIndex === 2;
  const useQuestionOrbBg = state.stepIndex === 3;
  const useNebulaBg = state.stepIndex > 3;

  // Back button handler - special case for step 9 (skip loading screen)
  const handleBack = () => {
    if (state.stepIndex === 9) {
      dispatch({ type: "SET_STEP", payload: 7 });
    } else {
      dispatch({ type: "PREV_STEP" });
    }
  };

  // Show back button on all screens except step 1
  const showBack = state.stepIndex > 1;

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      <div
        className="min-h-screen min-h-dvh flex flex-col relative overflow-hidden bg-[#050510]"
        style={{
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.15s ease-out',
        }}
      >
        {/* Background layer with crossfade transitions - edge to edge */}
        <div
          className="fixed z-0"
          style={{
            top: '-50px',
            left: '-50px',
            right: '-50px',
            bottom: '-50px',
            width: 'calc(100% + 100px)',
            height: 'calc(100% + 100px)',
          }}
        >
          {/* Entry background (step 1) - original orb video */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: useEntryBg ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <video
              src="/question-bg.mp4?v=3"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </motion.div>

          {/* Globe background (step 2) - rotating globe video */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: useGlobeBg ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <video
              src="/globe-bg.mp4?v=8"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </motion.div>

          {/* Question orb background (step 3) - crossfade loop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: useQuestionOrbBg ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <CrossfadeOrbVideo isActive={useQuestionOrbBg} />
          </motion.div>

          {/* Nebula background (all other steps) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: useNebulaBg ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <video
              src="/nebula-bg.mp4?v=1"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </motion.div>

          {/* Light overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050510]/55 via-[#050510]/5 to-[#050510]/30" />
        </div>

        {/* Main content area */}
        <main className="flex-1 flex flex-col relative z-10 safe-area-padding">
          {/* Persistent progress header - stays visible during transitions */}
          <ProgressHeader
            currentStep={state.stepIndex}
            showBack={showBack}
            onBack={handleBack}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={state.stepIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </QuizContext.Provider>
  );
}
