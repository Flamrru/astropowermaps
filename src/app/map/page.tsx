"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BirthDataForm from "@/components/astro-map/BirthDataForm";
import AstroMap from "@/components/astro-map/AstroMap";
import { BirthData, AstrocartographyResult } from "@/lib/astro/types";
import { loadAstroData, clearAstroData } from "@/lib/astro-storage";

type ViewState = "form" | "loading" | "map";

export default function AstrocartographyPage() {
  const [viewState, setViewState] = useState<ViewState>("form");
  const [mapData, setMapData] = useState<AstrocartographyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for saved data on mount (from reveal flow)
  useEffect(() => {
    const savedData = loadAstroData();
    if (savedData) {
      setMapData(savedData);
      setViewState("map");
    }
  }, []);

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
