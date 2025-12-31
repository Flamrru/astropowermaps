"use client";

import { useReducer, useEffect, useState, useCallback, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RevealContext,
  revealReducer,
  initialRevealState,
  getMapOpacity,
  YearForecast as RevealYearForecast,
} from "@/lib/reveal-state";
import AstroMap from "@/components/astro-map/AstroMap";
import { saveAstroData } from "@/lib/astro-storage";
import { trackMetaEvent } from "@/components/MetaPixel";
import { calculatePowerMonths } from "@/lib/astro/power-months";
import { calculateNatalPositions } from "@/lib/astro/calculations";
import { YearForecast as TransitYearForecast } from "@/lib/astro/transit-types";

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

/**
 * Convert full transit YearForecast to simplified reveal-state YearForecast
 */
function convertToRevealForecast(transit: TransitYearForecast): RevealYearForecast {
  const monthsMap = new Map<number, { love: number; career: number; growth: number; home: number }>();

  for (const monthScore of transit.months) {
    const m = monthScore.month;
    if (!monthsMap.has(m)) {
      monthsMap.set(m, { love: 0, career: 0, growth: 0, home: 0 });
    }
    const scores = monthsMap.get(m)!;
    scores[monthScore.category] = monthScore.score;
  }

  const months = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    const scores = monthsMap.get(m) || { love: 50, career: 50, growth: 50, home: 50 };
    const overall = Math.round((scores.love + scores.career + scores.growth + scores.home) / 4);
    return {
      month: m,
      scores,
      overall,
      isPowerMonth: transit.overallPowerMonths.includes(m),
    };
  });

  const sortedByScore = [...months].sort((a, b) => a.overall - b.overall);
  const avoidMonths = sortedByScore.slice(0, 3).map(m => m.month);

  return {
    year: transit.year,
    months,
    powerMonths: transit.overallPowerMonths.slice(0, 3),
    avoidMonths,
  };
}

// PRD V4: Reveal flow events for analytics (10 steps, starting at map reveal)
const REVEAL_EVENTS: Record<number, string> = {
  1: "reveal_map_shown",        // Map reveal (was step 3)
  2: "reveal_recognition",      // Screen A: Recognition
  3: "reveal_legitimacy",       // Screen B: Legitimacy + Lines
  4: "reveal_social_proof",     // Screen C: Tribe + Gap
  5: "reveal_timing",           // Screen D: Timing
  6: "reveal_pivot",            // Screen E: Pivot
  7: "reveal_urgency",          // Screen F: Urgency
  8: "reveal_2026_gen",         // 2026 forecast generation
  9: "reveal_paywall",          // Paywall
  10: "reveal_purchase",        // Purchase confirmation
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
  const [hasHydrated, setHasHydrated] = useState(false); // Prevent re-hydration
  const searchParams = useSearchParams();

  // Hydrate state from URL param or localStorage on mount (runs only once)
  useEffect(() => {
    // Skip if already hydrated (prevents re-hydration when URL updates)
    if (hasHydrated) return;

    const hydrateState = async () => {
      const sid = searchParams.get("sid");
      // Dev mode: ?dev=1 OR ?d OR ?d=4 (step number)
      const dParam = searchParams.get("d");
      const devMode = searchParams.get("dev") === "1" || dParam !== null;
      // Read step from URL (for refresh recovery)
      // Priority: ?step=X (explicit) > ?d=X (dev mode jump) > default 1
      const urlStep = searchParams.get("step");
      const startStep = urlStep
        ? parseInt(urlStep, 10)
        : (dParam ? parseInt(dParam, 10) : 1);

      // PAYMENT SUCCESS: Handle return from Stripe after successful payment
      const paymentStatus = searchParams.get("payment_status");
      if (paymentStatus === "complete") {
        console.log("✅ Payment completed - recovering session and showing confirmation");

        // Get Stripe's checkout session ID from URL
        const stripeSessionId = searchParams.get("session_id");

        if (!stripeSessionId) {
          console.error("Missing Stripe session_id in return URL");
          window.location.href = "/map?payment=success";
          return;
        }

        try {
          // 1. Look up our app_session_id from Stripe's checkout session
          const lookupRes = await fetch(
            `/api/stripe/lookup-session?checkout_session_id=${stripeSessionId}`
          );
          const lookupData = await lookupRes.json();

          if (!lookupRes.ok || !lookupData.app_session_id) {
            console.error("Failed to look up session:", lookupData.error);
            window.location.href = "/map?payment=success";
            return;
          }

          const { app_session_id, email } = lookupData;
          console.log("✅ Recovered app_session_id:", app_session_id);

          // 2. Track Purchase event (client-side pixel)
          trackMetaEvent("Purchase", {
            value: 19.0,
            currency: "USD",
            content_type: "product",
            content_name: "2026 Astro Power Map",
          });

          // 3. Fetch lead data to get birth data for confirmation screen
          const lead = await fetchLead(app_session_id);

          if (lead?.birthData) {
            // 4. Set birth data
            dispatch({ type: "SET_BIRTH_DATA", payload: lead.birthData });

            // 5. Recalculate astro data from birth data
            const astroRes = await fetch("/api/astrocartography", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ birthData: lead.birthData }),
            });

            if (astroRes.ok) {
              const astroResponse = await astroRes.json();
              if (astroResponse.success && astroResponse.data) {
                dispatch({ type: "SET_ASTRO_DATA", payload: astroResponse.data });
                saveAstroData(astroResponse.data);

                // 6. Calculate forecast data for confirmation screen
                try {
                  const natalPositions = calculateNatalPositions(lead.birthData);
                  const transitForecast = calculatePowerMonths(natalPositions);
                  const revealForecast = convertToRevealForecast(transitForecast);
                  dispatch({ type: "SET_FORECAST_DATA", payload: revealForecast });
                } catch (forecastError) {
                  console.error("Forecast calculation error:", forecastError);
                }
              }
            }
          }

          // 7. Hydrate state with session data
          dispatch({
            type: "HYDRATE",
            payload: {
              email: email || lead?.email || "",
              session_id: app_session_id,
              utm: lead?.utm || {},
              quizAnswers: {
                q1: lead?.quiz_q1 || null,
                q2: lead?.quiz_q2 || [],
              },
            },
          });

          // 8. Mark payment as complete and go to Step 10 (Confirmation)
          dispatch({
            type: "SET_PAYMENT_COMPLETE",
            payload: { orderId: app_session_id },
          });
          dispatch({ type: "SET_STEP", payload: 10 });

          // 9. Update URL for refresh recovery (with our app_session_id, not Stripe's)
          window.history.replaceState(
            {},
            "",
            `/reveal?sid=${app_session_id}&step=10`
          );

          setIsHydrating(false);
          setHasHydrated(true);
          setMounted(true);
          return;
        } catch (error) {
          console.error("Error handling payment completion:", error);
          // Fallback to map page if something goes wrong
          window.location.href = "/map?payment=success";
          return;
        }
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

              // Calculate real forecast data for dev mode (uses same calculations as production)
              try {
                const natalPositions = calculateNatalPositions(DEV_BIRTH_DATA);
                const transitForecast = calculatePowerMonths(natalPositions);
                const revealForecast = convertToRevealForecast(transitForecast);
                dispatch({ type: "SET_FORECAST_DATA", payload: revealForecast });
                console.log("🔧 Dev mode: Real forecast data calculated");
              } catch (forecastError) {
                console.error("Dev mode forecast error:", forecastError);
              }

              // PRD V4: Jump to specified step (default: 1 = map reveal)
              dispatch({ type: "SET_STEP", payload: Math.min(startStep, 10) });
            }
          }
        } catch (error) {
          console.error("Dev mode API error:", error);
        }

        setIsHydrating(false);
        setHasHydrated(true);
        setMounted(true);
        return;
      }

      // PRD V4: Check for pre-calculated astro data from quiz flow
      let astroFromQuiz = null;
      try {
        const storedAstro = localStorage.getItem("astro_quiz_result");
        if (storedAstro) {
          astroFromQuiz = JSON.parse(storedAstro);
          console.log("✅ Loaded pre-calculated astro data from quiz");
          // Don't clear immediately - keep for refresh recovery
          // Will be cleared when user completes payment or leaves flow
        }
      } catch {
        // Ignore localStorage errors
      }

      // Try localStorage first for complete quiz data (includes birth data)
      let sessionData = null;
      try {
        const stored = localStorage.getItem("astro_quiz_session");
        if (stored) {
          sessionData = JSON.parse(stored);
          // Don't clear immediately - keep for refresh recovery
          // Will be cleared when user completes payment or leaves flow
        }
      } catch {
        // Ignore localStorage errors
      }

      // PRD V4: If we have both session data with birth data AND pre-calculated astro data, use HYDRATE_WITH_ASTRO
      if (sessionData?.birthData && astroFromQuiz) {
        console.log("✅ Using HYDRATE_WITH_ASTRO with pre-calculated data");
        dispatch({
          type: "HYDRATE_WITH_ASTRO",
          payload: {
            email: sessionData.email,
            session_id: sessionData.session_id || sid || "",
            utm: sessionData.utm || {},
            quizAnswers: sessionData.quizAnswers || { q1: null, q2: [] },
            birthData: sessionData.birthData,
            astroData: astroFromQuiz,
          },
        });
        // Also save to astro-storage for map page
        saveAstroData(astroFromQuiz);
        // Restore step from URL if provided (for refresh recovery)
        if (urlStep) {
          const step = Math.min(Math.max(parseInt(urlStep, 10), 1), 10);
          console.log(`✅ Restoring step ${step} from URL`);
          dispatch({ type: "SET_STEP", payload: step });
        }
      } else if (sessionData) {
        // Have session data but no astro data - fallback (shouldn't happen in normal flow)
        dispatch({
          type: "HYDRATE",
          payload: {
            email: sessionData.email,
            session_id: sessionData.session_id,
            utm: sessionData.utm || {},
            quizAnswers: sessionData.quizAnswers || { q1: null, q2: [] },
          },
        });
        // If we have astro data but birth data is missing, still set it
        if (astroFromQuiz) {
          dispatch({ type: "SET_ASTRO_DATA", payload: astroFromQuiz });
          saveAstroData(astroFromQuiz);
        }
        // Restore step from URL if provided (for refresh recovery)
        if (urlStep) {
          const step = Math.min(Math.max(parseInt(urlStep, 10), 1), 10);
          console.log(`✅ Restoring step ${step} from URL`);
          dispatch({ type: "SET_STEP", payload: step });
        }
      } else if (sid) {
        // Fallback: Fetch lead from Supabase (for refreshes or older links)
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

          // If lead has birth data, set it and recalculate astro
          if (lead.birthData) {
            console.log("✅ Found birth data from lead, recalculating astro...");
            dispatch({ type: "SET_BIRTH_DATA", payload: lead.birthData });

            // Recalculate astro data from birth data
            try {
              const res = await fetch("/api/astrocartography", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ birthData: lead.birthData }),
              });

              if (res.ok) {
                const response = await res.json();
                if (response.success && response.data) {
                  dispatch({ type: "SET_ASTRO_DATA", payload: response.data });
                  saveAstroData(response.data);
                  console.log("✅ Astro data recalculated from stored birth data");
                }
              }
            } catch (error) {
              console.error("Failed to recalculate astro data:", error);
            }
          }
        }
        // If we have astro data from quiz (shouldn't happen on refresh, but just in case)
        if (astroFromQuiz) {
          dispatch({ type: "SET_ASTRO_DATA", payload: astroFromQuiz });
          saveAstroData(astroFromQuiz);
        }
        // Restore step from URL if provided (for refresh recovery)
        if (urlStep) {
          const step = Math.min(Math.max(parseInt(urlStep, 10), 1), 10);
          console.log(`✅ Restoring step ${step} from URL (from Supabase fallback)`);
          dispatch({ type: "SET_STEP", payload: step });
        }
      }

      setIsHydrating(false);
      setHasHydrated(true); // Mark as hydrated to prevent re-runs
      setMounted(true);
    };

    hydrateState();
  }, [searchParams, hasHydrated]);

  // Track step changes
  useEffect(() => {
    if (!mounted || !state.session_id) return;

    const eventName = REVEAL_EVENTS[state.stepIndex];
    if (eventName) {
      trackRevealEvent(state.session_id, eventName, state.stepIndex);
    }
  }, [state.stepIndex, state.session_id, mounted]);

  // Update URL when step changes (for refresh recovery)
  useEffect(() => {
    if (!mounted) return;

    // Build new URL with current step
    const url = new URL(window.location.href);
    url.searchParams.set("step", state.stepIndex.toString());

    // Use replaceState to avoid adding to browser history on every step
    window.history.replaceState({}, "", url.toString());
  }, [state.stepIndex, mounted]);

  // Calculate map opacity based on current step
  const mapOpacity = getMapOpacity(state.stepIndex);

  // PRD V4: Back navigation handler (10 steps starting at map reveal)
  const handleBack = useCallback(() => {
    if (state.stepIndex > 1) {
      // Skip loading screens when going back
      if (state.stepIndex === 2) {
        dispatch({ type: "SET_STEP", payload: 1 }); // Onboard A → back to map reveal
      } else if (state.stepIndex === 9) {
        dispatch({ type: "SET_STEP", payload: 7 }); // Paywall → back to Onboard F (skip generation)
      } else {
        dispatch({ type: "PREV_STEP" });
      }
    }
  }, [state.stepIndex]);

  // PRD V4: Progress indicator for onboarding (steps 2-7, 6 screens)
  const onboardingProgress = state.stepIndex >= 2 && state.stepIndex <= 7
    ? ((state.stepIndex - 2) / 5) * 100
    : null;

  // Block pull-to-refresh on most steps, but allow scrolling on paywall (step 9)
  // Paywall needs scrolling for the long feature list
  const needsScrolling = state.stepIndex === 9;

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
          // Prevent iOS bounce/rubber-band scrolling (except on paywall which needs scroll)
          ...(!needsScrolling && {
            position: "fixed" as const,
            inset: 0,
            overscrollBehavior: "none",
          }),
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
                interactive={state.stepIndex === 1}
                showPanels={false}
                showControls={false}
                // PRD V4: Step 1 is now map reveal
                showCityMarkers={state.stepIndex === 1 ? true : 1} // All cities during reveal, 1 teaser otherwise
                autoAnimation={state.stepIndex === 1 ? "reveal" : "none"}
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
              {/* Back button - hidden on step 1 (map reveal) since there's nowhere logical to go back to */}
              <AnimatePresence>
                {state.stepIndex > 1 && (
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
