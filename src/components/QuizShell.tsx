"use client";

import { useReducer, useEffect, useRef, useState, ReactNode, startTransition } from "react";
import { motion } from "framer-motion";
import { QuizContext, quizReducer, initialQuizState } from "@/lib/quiz-state";
import { parseUTMParams } from "@/lib/utm";
import ProgressHeader from "@/components/ProgressHeader";
import CookieConsent from "@/components/CookieConsent";

// Funnel events to track
const FUNNEL_EVENTS: Record<number, string> = {
  2: "quiz_start",      // User clicked "See Your Map"
  4: "q1_answered",     // User answered Q1
  6: "q2_answered",     // User answered Q2
  9: "email_screen",    // User reached email capture
  // Lead is tracked separately in Screen09EmailCapture
};

// Track funnel event to our database
async function trackFunnelEvent(sessionId: string, eventName: string, stepNumber: number) {
  try {
    await fetch("/api/funnel-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        event_name: eventName,
        step_number: stepNumber,
      }),
    });
  } catch (error) {
    console.error("Failed to track funnel event:", error);
  }
}

// Crossfade video loop component for smooth looping (60fps)
function CrossfadeOrbVideo({ isActive, autoplayBlocked }: { isActive: boolean; autoplayBlocked: boolean }) {
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

  // Show static image fallback when autoplay is blocked
  if (autoplayBlocked) {
    return (
      <div className="absolute inset-0">
        <img
          src="/orb-question-bg-poster.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ transform: 'scale(0.9)' }}
        />
      </div>
    );
  }

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

  // Refs for background videos to force autoplay on mobile
  const entryVideoRef = useRef<HTMLVideoElement>(null);
  const globeVideoRef = useRef<HTMLVideoElement>(null);
  const nebulaVideoRef = useRef<HTMLVideoElement>(null);

  // Track if autoplay is blocked (Low Power Mode, etc.)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Wait for client-side mount to prevent hydration flash
  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  // Force play videos on mobile (iOS autoplay workaround)
  // Check if videos are actually playing after attempting autoplay
  useEffect(() => {
    if (!mounted) return;

    const checkAutoplay = async () => {
      const video = entryVideoRef.current;
      if (!video) return;

      try {
        // Try to play
        await video.play();

        // Even if promise resolves, check if video is actually playing
        // iOS sometimes resolves the promise but video is still paused
        setTimeout(() => {
          if (video.paused || video.currentTime === 0) {
            setAutoplayBlocked(true);
          }
        }, 100);
      } catch {
        // Autoplay explicitly blocked
        setAutoplayBlocked(true);
      }
    };

    checkAutoplay();

    // Also try to play other videos
    globeVideoRef.current?.play().catch(() => {});
    nebulaVideoRef.current?.play().catch(() => {});
  }, [mounted]);

  // Capture UTM parameters on mount
  useEffect(() => {
    const utm = parseUTMParams();
    if (Object.keys(utm).length > 0) {
      dispatch({ type: "SET_UTM", payload: utm });
    }
  }, []);

  // Capture paywall variant (?plan=single) on mount for A/B test
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planVariant = urlParams.get("plan");
    if (planVariant) {
      localStorage.setItem("stella_paywall_variant", planVariant);
    }
  }, []);

  // Capture price variant (?c=x14ts, ?c=x24ts, or ?c=x29ts) for A/B price testing
  // Valid codes: x14ts ($14.99), x24ts ($24.99), x29ts ($29.99)
  // IMPORTANT: Clear stale variant if no code present (prevents cross-session contamination)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const variantCode = urlParams.get("c");
    if (variantCode && ["x14ts", "x24ts", "x29ts"].includes(variantCode)) {
      localStorage.setItem("stella_price_variant", variantCode);
    } else {
      // Clear any stale variant from previous sessions
      localStorage.removeItem("stella_price_variant");
    }
  }, []);

  // Track funnel events when step changes
  const prevStepRef = useRef(state.stepIndex);
  useEffect(() => {
    // Only track if step actually changed (not on initial mount with step 1)
    if (prevStepRef.current !== state.stepIndex) {
      const eventName = FUNNEL_EVENTS[state.stepIndex];
      if (eventName) {
        trackFunnelEvent(state.session_id, eventName, state.stepIndex);
      }
      prevStepRef.current = state.stepIndex;
    }
  }, [state.stepIndex, state.session_id]);

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
      {/* Outer wrapper - cosmic gradient background for larger screens */}
      <div
        className="min-h-screen min-h-dvh flex items-center justify-center"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 50%, rgba(201, 162, 39, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 80% at 30% 20%, rgba(60, 50, 120, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 70% 80%, rgba(80, 60, 140, 0.12) 0%, transparent 50%),
            linear-gradient(180deg, #030308 0%, #050510 30%, #0a0a1e 70%, #050510 100%)
          `,
        }}
      >
        {/* Subtle stars on outer area */}
        <div className="fixed inset-0 pointer-events-none opacity-40 stars-layer" />

        {/* Glow effect behind app container */}
        <div
          className="absolute w-full max-w-[850px] h-full max-h-[900px] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 100% 100% at 50% 50%, rgba(201, 162, 39, 0.06) 0%, transparent 60%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Inner app container - max width for phone-like experience */}
        <div
          className="w-full max-w-[768px] min-h-screen min-h-dvh flex flex-col relative overflow-hidden bg-[#050510] shadow-2xl"
          style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.15s ease-out',
            boxShadow: '0 0 80px rgba(201, 162, 39, 0.1), 0 0 120px rgba(60, 50, 120, 0.08)',
          }}
        >
          {/* Background layer with crossfade transitions - contained within app */}
          <div
            className="absolute z-0"
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
            {/* Static fallback image when autoplay blocked */}
            {autoplayBlocked && (
              <img
                src="/question-bg-poster.jpg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ transform: 'scale(1.15)' }}
              />
            )}
            <video
              ref={entryVideoRef}
              src="/question-bg.mp4?v=3"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{
                transform: 'scale(1.15)',
                display: autoplayBlocked ? 'none' : 'block',
              }}
            />
          </motion.div>

          {/* Globe background (step 2) - rotating globe video */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: useGlobeBg ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {/* Static fallback image when autoplay blocked */}
            {autoplayBlocked && (
              <img
                src="/globe-bg-poster.jpg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            )}
            <video
              ref={globeVideoRef}
              src="/globe-bg.mp4?v=8"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{ display: autoplayBlocked ? 'none' : 'block' }}
            />
          </motion.div>

          {/* Question orb background (step 3) - crossfade loop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: useQuestionOrbBg ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <CrossfadeOrbVideo isActive={useQuestionOrbBg} autoplayBlocked={autoplayBlocked} />
          </motion.div>

          {/* Nebula background (all other steps) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: useNebulaBg ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {/* Static fallback image when autoplay blocked */}
            {autoplayBlocked && (
              <img
                src="/nebula-bg-poster.jpg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center"
                style={{ transform: 'scale(1.15)' }}
              />
            )}
            <video
              ref={nebulaVideoRef}
              src="/nebula-bg.mp4?v=1"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center"
              style={{
                transform: 'scale(1.15)',
                display: autoplayBlocked ? 'none' : 'block',
              }}
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

            <div key={state.stepIndex} className="flex-1 flex flex-col">
              {children}
            </div>
          </main>

          {/* Cookie consent banner - inside container for proper stacking */}
          <CookieConsent />
        </div>
      </div>
    </QuizContext.Provider>
  );
}
