"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BirthDataForm from "@/components/astro-map/BirthDataForm";
import AstroMap from "@/components/astro-map/AstroMap";
import { BirthData, AstrocartographyResult } from "@/lib/astro/types";
import { loadAstroData, clearAstroData, saveAstroData } from "@/lib/astro-storage";

// Dev mode birth data for testing
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

type ViewState = "form" | "loading" | "map" | "needsPayment";

function MapPageContent() {
  const [viewState, setViewState] = useState<ViewState>("form");
  const [mapData, setMapData] = useState<AstrocartographyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Check for saved data, token (sid), or dev mode on mount
  useEffect(() => {
    const initMap = async () => {
      // Dev mode: ?d or ?d=1 skips form with test data
      const dParam = searchParams.get("d");
      const devMode = dParam !== null;

      if (devMode) {
        console.log("🔧 Map dev mode - loading test birth data");
        setViewState("loading");

        try {
          const res = await fetch("/api/astrocartography", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ birthData: DEV_BIRTH_DATA }),
          });

          if (res.ok) {
            const response = await res.json();
            if (response.success && response.data) {
              saveAstroData(response.data);
              setMapData(response.data);
              setViewState("map");
              console.log("🔧 Map dev mode - data loaded");
            }
          }
        } catch (error) {
          console.error("Dev mode API error:", error);
          setViewState("form");
        }
        return;
      }

      // Token mode: ?sid=xxx loads from database (requires payment)
      const sidParam = searchParams.get("sid");
      if (sidParam) {
        console.log("🔑 Loading map from token:", sidParam);
        setSessionId(sidParam);
        setViewState("loading");

        try {
          // Fetch lead data from API (checks has_purchased)
          const leadRes = await fetch(`/api/lead?sid=${sidParam}`);
          const leadData = await leadRes.json();

          if (!leadRes.ok) {
            if (leadData.needsPayment) {
              // User hasn't paid - redirect to reveal flow with their session
              console.log("💳 Payment required, redirecting to paywall");
              setViewState("needsPayment");
              return;
            }
            throw new Error(leadData.error || "Failed to load map");
          }

          // Generate astro map from birth data
          const astroRes = await fetch("/api/astrocartography", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ birthData: leadData.data.birthData }),
          });

          if (astroRes.ok) {
            const astroData = await astroRes.json();
            if (astroData.success && astroData.data) {
              saveAstroData(astroData.data);
              setMapData(astroData.data);
              setViewState("map");
              console.log("✅ Map loaded from token");
            }
          }
        } catch (error) {
          console.error("Token load error:", error);
          setError("Could not load your map. Please try again.");
          setViewState("form");
        }
        return;
      }

      // Normal flow: check for saved data in localStorage
      const savedData = loadAstroData();
      if (savedData) {
        setMapData(savedData);
        setViewState("map");
      }
    };

    initMap();
  }, [searchParams]);

  const handleFormSubmit = async (birthData: BirthData) => {
    setViewState("loading");
    setError(null);

    try {
      const response = await fetch("/api/astrocartography", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthData }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Calculation failed");
      }

      // Save to localStorage so it persists on refresh
      saveAstroData(result.data);
      setMapData(result.data);
      setViewState("map");
    } catch (err) {
      console.error("Astrocartography error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setViewState("form");
    }
  };

  const handleReset = () => {
    clearAstroData(); // Clear localStorage so they can start fresh
    setMapData(null);
    setViewState("form");
  };

  return (
    <div className="min-h-screen min-h-dvh bg-[#050510] relative overflow-hidden">
      {/* Background - Nebula video for form, none for map */}
      <AnimatePresence>
        {viewState !== "map" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: "scale(1.15)" }}
            >
              <source src="/nebula-bg.mp4" type="video/mp4" />
            </video>

            {/* Overlay for readability */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(5,5,16,0.7) 0%, rgba(5,5,16,0.4) 50%, rgba(5,5,16,0.8) 100%)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 min-h-screen min-h-dvh">
        <AnimatePresence mode="wait">
          {/* Form View */}
          {viewState === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen min-h-dvh flex items-center justify-center py-12"
            >
              <div className="w-full">
                <BirthDataForm
                  onSubmit={handleFormSubmit}
                  loading={false}
                />

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md mx-auto mt-4 px-6"
                  >
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Loading View */}
          {viewState === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen min-h-dvh flex flex-col items-center justify-center"
            >
              <LoadingAnimation />
            </motion.div>
          )}

          {/* Map View */}
          {viewState === "map" && mapData && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 w-full h-full"
              style={{ minHeight: '100vh', minWidth: '100vw' }}
            >
              <AstroMap data={mapData} onReset={handleReset} />
            </motion.div>
          )}

          {/* Payment Required View */}
          {viewState === "needsPayment" && (
            <motion.div
              key="needsPayment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen min-h-dvh flex flex-col items-center justify-center px-6"
            >
              <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#C9A227]/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#C9A227]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Unlock Your Map
                </h2>
                <p className="text-white/60 mb-8">
                  Complete your purchase to access your personalized 2026 Power Map forever.
                </p>
                <a
                  href={sessionId ? `/reveal?sid=${sessionId}` : "/reveal"}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium text-black transition-all"
                  style={{
                    background: "linear-gradient(135deg, #E8C547 0%, #C9A227 100%)",
                    boxShadow: "0 4px 20px rgba(201, 162, 39, 0.4)",
                  }}
                >
                  Continue to Payment
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Loading Animation Component
function LoadingAnimation() {
  const messages = [
    "Calculating planetary positions...",
    "Mapping your celestial lines...",
    "Discovering your power places...",
  ];

  const [messageIndex, setMessageIndex] = useState(0);

  // Cycle through messages
  useState(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  });

  return (
    <div className="text-center px-6">
      {/* Spinning Orb */}
      <div className="relative w-24 h-24 mx-auto mb-8">
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-[#C9A227]/30"
        />

        {/* Middle ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-2 border-[#C9A227]/50"
        />

        {/* Inner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-full border-2 border-[#C9A227]/70"
        />

        {/* Center glow */}
        <div className="absolute inset-6 rounded-full bg-[#C9A227]/20 backdrop-blur-sm" />

        {/* Pulse effect */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-[#C9A227]/10"
        />
      </div>

      {/* Loading Text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-white/80 text-lg font-medium"
          style={{
            textShadow: "0 0 20px rgba(201, 162, 39, 0.3)",
          }}
        >
          {messages[messageIndex]}
        </motion.p>
      </AnimatePresence>

      {/* Subtitle */}
      <p className="text-white/40 text-sm mt-3">
        This may take a moment...
      </p>
    </div>
  );
}

// Main page export with Suspense for useSearchParams
export default function AstrocartographyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050510] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#C9A227]/30 border-t-[#C9A227] rounded-full animate-spin" />
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
}
