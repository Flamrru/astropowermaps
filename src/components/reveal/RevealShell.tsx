"use client";

import { useReducer, useEffect, useState, useCallback, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RevealContext,
  revealReducer,
  initialRevealState,
  getMapOpacity,
} from "@/lib/reveal-state";
import AstroMap from "@/components/astro-map/AstroMap";
import { saveAstroData } from "@/lib/astro-storage";

// Dev mode birth data (Flamur's data for testing)
const DEV_BIRTH_DATA = {
  date: "1988-05-05",
  time: "17:00",
  timeUnknown: false,
  location: {
    name: "Bratislava, Slovakia",
    lat: 48.1486,
    lng: 17.1077,
    timezone: "Europe/Bratislava",
  },
};

// Reveal flow events for analytics
const REVEAL_EVENTS: Record<number, string> = {
  1: "reveal_birth_data",
  2: "reveal_generating",
  3: "reveal_map_shown",
  4: "reveal_recognition",      // Screen A: Recognition
  5: "reveal_legitimacy",       // Screen B: Legitimacy + Lines
  6: "reveal_social_proof",     // Screen C: Tribe + Gap
  7: "reveal_timing",           // Screen D: Timing
  8: "reveal_pivot",            // Screen E: Pivot
  9: "reveal_urgency",          // Screen F: Urgency
  10: "reveal_2026_gen",
  11: "reveal_paywall",
  12: "reveal_purchase",
};

// Track funnel event
async function trackRevealEvent(
  sessionId: string,
  eventName: string,
  stepNumber: number
) {
  if (!sessionId) return;
  try {
    await fetch("/api/funnel-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        event_name: eventName,
        step_number: stepNumber + 10, // Offset to distinguish from quiz steps
      }),
    });
  } catch (error) {
    console.error("Failed to track reveal event:", error);
  }
}

// Fetch lead data from Supabase
async function fetchLead(sessionId: string) {
  try {
    const res = await fetch(`/api/lead?sid=${sessionId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

interface RevealShellProps {
  children: ReactNode;
}

export default function RevealShell({ children }: RevealShellProps) {
  const [state, dispatch] = useReducer(revealReducer, initialRevealState);
  const [mounted, setMounted] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const searchParams = useSearchParams();

  // Hydrate state from URL param or localStorage on mount
  useEffect(() => {
    const hydrateState = async () => {
      const sid = searchParams.get("sid");
      // Dev mode: ?dev=1 OR ?d OR ?d=4 (step number)
      const dParam = searchParams.get("d");
      const devMode = searchParams.get("dev") === "1" || dParam !== null;
      const startStep = parseInt(dParam || searchParams.get("step") || "3", 10);

      // PAYMENT SUCCESS: Redirect from Stripe after successful payment
      const paymentStatus = searchParams.get("payment_status");
      if (paymentStatus === "complete") {
        console.log("✅ Payment completed - redirecting to map");
        // Redirect to map with payment success flag
        window.location.href = "/map?payment=success";
        return;
      }

      // DEV MODE: Skip birth data entry, pre-fill and jump to specified step
      if (devMode) {
        console.log("🔧 Dev mode enabled - using preset birth data");

        // Set birth data
        dispatch({ type: "SET_BIRTH_DATA", payload: DEV_BIRTH_DATA });

        // Call API to get astro data
        try {
          const res = await fetch("/api/astrocartography", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ birthData: DEV_BIRTH_DATA }),
          });

          if (res.ok) {
            const response = await res.json();
            if (response.success && response.data) {
              dispatch({ type: "SET_ASTRO_DATA", payload: response.data });
              saveAstroData(response.data);
              // Jump to specified step (default: 3 = map reveal)
              dispatch({ type: "SET_STEP", payload: startStep });
            }
          }
        } catch (error) {
          console.error("Dev mode API error:", error);
        }

        setIsHydrating(false);
        setMounted(true);
        return;
      }

      if (sid) {
        // Fetch lead from Supabase
        const lead = await fetchLead(sid);
        if (lead?.email) {
          dispatch({
            type: "HYDRATE",
            payload: {
              email: lead.email,
              session_id: sid,
              utm: lead.utm || {},
              quizAnswers: {
                q1: lead.quiz_q1 || null,
                q2: lead.quiz_q2 || [],
              },
            },
          });
        }
      } else {
        // Try localStorage as fallback
        try {
          const stored = localStorage.getItem("astro_quiz_session");
          if (stored) {
            const data = JSON.parse(stored);
            dispatch({
              type: "HYDRATE",
              payload: {
                email: data.email,
                session_id: data.session_id,
                utm: data.utm || {},
                quizAnswers: data.quizAnswers || { q1: null, q2: [] },
              },
            });
            // Clear after reading
            localStorage.removeItem("astro_quiz_session");
          }
        } catch {
          // Ignore localStorage errors
        }
      }

      setIsHydrating(false);
      setMounted(true);
    };

    hydrateState();
  }, [searchParams]);

  // Track step changes
  useEffect(() => {
    if (!mounted || !state.session_id) return;

    const eventName = REVEAL_EVENTS[state.stepIndex];
    if (eventName) {
      trackRevealEvent(state.session_id, eventName, state.stepIndex);
    }
  }, [state.stepIndex, state.session_id, mounted]);

  // Calculate map opacity based on current step
  const mapOpacity = getMapOpacity(state.stepIndex);

  // Back navigation handler
  const handleBack = useCallback(() => {
    if (state.stepIndex > 1) {
      // Skip loading screens when going back
      if (state.stepIndex === 3) {
        dispatch({ type: "SET_STEP", payload: 1 }); // Map reveal → back to birth data (skip loading)
      } else if (state.stepIndex === 4) {
        dispatch({ type: "SET_STEP", payload: 3 }); // Screen A → back to map reveal
      } else if (state.stepIndex === 11) {
        dispatch({ type: "SET_STEP", payload: 9 }); // Paywall → back to Screen F (skip generation)
      } else {
        dispatch({ type: "PREV_STEP" });
      }
    }
  }, [state.stepIndex]);

  // Progress indicator for onboarding (steps 4-9, 6 screens)
  const onboardingProgress = state.stepIndex >= 4 && state.stepIndex <= 9
    ? ((state.stepIndex - 4) / 5) * 100
    : null;

  return (
    <RevealContext.Provider value={{ state, dispatch }}>
      {/* Outer cosmic gradient wrapper */}
      <div
        className="min-h-screen min-h-dvh flex items-center justify-center overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 50%, rgba(201, 162, 39, 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 60% 80% at 30% 20%, rgba(60, 50, 120, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 70% 80%, rgba(80, 60, 140, 0.1) 0%, transparent 50%),
            linear-gradient(180deg, #030308 0%, #050510 30%, #0a0a1e 70%, #050510 100%)
          `,
        }}
      >
        {/* Subtle animated stars layer */}
        <div className="fixed inset-0 pointer-events-none opacity-30 stars-layer" />

        {/* Golden glow behind app container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute w-full max-w-[850px] h-full max-h-[900px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 100% 100% at 50% 50%, rgba(201, 162, 39, 0.05) 0%, transparent 60%)",
            filter: "blur(50px)",
          }}
        />

        {/* Main app container - mobile-first */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted && !isHydrating ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[768px] min-h-screen min-h-dvh flex flex-col relative overflow-hidden"
          style={{
            background: "#050510",
            boxShadow: `
              0 0 80px rgba(201, 162, 39, 0.08),
              0 0 120px rgba(60, 50, 120, 0.06)
            `,
          }}
        >
          {/* ===== LAYER 1: Map Background (persistent, always visible) ===== */}
          <div className="absolute inset-0 z-0">
            {state.astroData ? (
              <AstroMap
                data={state.astroData}
                onReset={() => {}} // Not used in background mode
                mode="background"
                opacity={mapOpacity}
                highlight={state.mapHighlight}
                interactive={state.stepIndex === 3}
                showPanels={false}
                showControls={false}
                showCityMarkers={state.stepIndex === 3 ? true : 1} // All cities during reveal, 1 teaser otherwise
                autoAnimation={state.stepIndex === 3 ? "reveal" : "none"}
                onAnimationComplete={() => {}} // Animation callback - no longer auto-advances, button handles navigation
              />
            ) : (
              /* Fallback cosmic background before data loads */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: mapOpacity }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
                style={{
                  background: `
                    radial-gradient(ellipse 80% 60% at 50% 40%, rgba(60, 50, 120, 0.15) 0%, transparent 60%),
                    radial-gradient(ellipse 60% 40% at 30% 70%, rgba(201, 162, 39, 0.08) 0%, transparent 50%),
                    #050510
                  `,
                }}
              />
            )}
          </div>

          {/* ===== LAYER 2: Content Area ===== */}
          <main className="flex-1 flex flex-col relative z-10 safe-area-padding">
            {/* Header with back button and progress */}
            <header className="flex items-center justify-between px-4 py-4 relative z-20">
              {/* Back button - hidden on step 3 (map reveal) since there's nowhere logical to go back to */}
              <AnimatePresence>
                {state.stepIndex > 1 && state.stepIndex !== 3 && (
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={handleBack}
                    className="p-2 rounded-xl transition-colors hover:bg-white/5 active:bg-white/10"
                    aria-label="Go back"
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white/60"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Onboarding progress indicator */}
              <AnimatePresence>
                {onboardingProgress !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex-1 mx-4 max-w-[200px]"
                  >
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${onboardingProgress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, #C9A227, #E8C547)",
                        }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Spacer to balance back button */}
              <div className="w-10" />
            </header>

            {/* Screen content - keyed for transitions */}
            <div key={state.stepIndex} className="flex-1 flex flex-col">
              {children}
            </div>
          </main>

          {/* ===== LAYER 3: Action Bar (handled by individual screens) ===== */}
          {/* This layer is managed by each screen for flexibility */}
        </motion.div>
      </div>
    </RevealContext.Provider>
  );
}
