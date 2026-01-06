"use client";

import { useEffect, useState, Suspense, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import DashboardShell, { useDashboard } from "@/components/dashboard/DashboardShell";
import AstroMap from "@/components/astro-map/AstroMap";
import StellaFloatingButton from "@/components/dashboard/StellaFloatingButton";
import type { AstrocartographyResult } from "@/lib/astro/types";

interface StellaContext {
  displayMessage: string;
  hiddenContext: string;
}

interface FlyToTarget {
  lat: number;
  lng: number;
  cityName: string;
}

/**
 * Map Page
 *
 * Full astrocartography map within the Stella+ experience.
 * Features:
 * - Full-screen map with auto-hiding bottom nav
 * - Uses birth data from dashboard context (no form needed)
 * - Stella FAB for asking about locations
 * - Element theming throughout
 * - Line taps open modal with "Ask Stella" integration
 *
 * Dev Mode: Access with ?dev=true to see mock data
 * Example: /map?dev=true
 *
 * Fly to city: /map?flyTo=40.7128,-74.0060,New%20York
 */

function MapContent() {
  const { state } = useDashboard();
  const searchParams = useSearchParams();
  const [mapData, setMapData] = useState<AstrocartographyResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse flyTo query param (format: lat,lng,cityName)
  const flyToTarget = useMemo((): FlyToTarget | undefined => {
    const flyTo = searchParams.get("flyTo");
    if (!flyTo) return undefined;

    const parts = flyTo.split(",");
    if (parts.length < 3) return undefined;

    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    const cityName = decodeURIComponent(parts.slice(2).join(","));

    if (isNaN(lat) || isNaN(lng)) return undefined;

    return { lat, lng, cityName };
  }, [searchParams]);

  // Stella context for "Ask Stella" from line modals
  const [stellaContext, setStellaContext] = useState<StellaContext | null>(null);

  const handleAskStella = useCallback((context: StellaContext) => {
    setStellaContext(context);
  }, []);

  const handleContextConsumed = useCallback(() => {
    setStellaContext(null);
  }, []);

  // Fetch astrocartography data using birth data from context
  useEffect(() => {
    const fetchMapData = async () => {
      if (!state.birthData) {
        setError("Birth data not available");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/astrocartography", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ birthData: state.birthData }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to calculate map");
        }

        setMapData(result.data);
      } catch (err) {
        console.error("Map calculation error:", err);
        setError(err instanceof Error ? err.message : "Failed to load map");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapData();
  }, [state.birthData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center">
        <MapLoader />
      </div>
    );
  }

  // Error state
  if (error || !mapData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Unable to Load Map
          </h2>
          <p className="text-white/60 mb-6">{error || "Please try again"}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-full font-medium"
            style={{
              background: "linear-gradient(135deg, #E8C547 0%, #C9A227 100%)",
              color: "#000",
            }}
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  // Map view
  return (
    <>
      <div className="fixed inset-0">
        <AstroMap
          data={mapData}
          onReset={() => {}} // No reset - user navigates away instead
          mode="full"
          showPanels={true}
          showControls={true}
          showCityMarkers={true}
          onAskStella={handleAskStella}
          flyToOnLoad={flyToTarget}
        />
      </div>

      {/* Stella floating button - positioned above auto-hiding nav */}
      <StellaFloatingButton
        viewHint="power-map"
        externalContext={stellaContext}
        onContextConsumed={handleContextConsumed}
      />
    </>
  );
}

/**
 * Premium loading animation for map
 */
function MapLoader() {
  const messages = [
    "Calculating planetary positions...",
    "Mapping your celestial lines...",
    "Discovering your power places...",
  ];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="text-center px-6">
      {/* Orbital rings animation */}
      <div className="relative w-24 h-24 mx-auto mb-8">
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full"
          style={{
            border: "2px solid rgba(201, 162, 39, 0.3)",
          }}
        />
        {/* Middle ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full"
          style={{
            border: "2px solid rgba(201, 162, 39, 0.5)",
          }}
        />
        {/* Inner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-full"
          style={{
            border: "2px solid rgba(201, 162, 39, 0.7)",
          }}
        />
        {/* Center glow */}
        <div
          className="absolute inset-6 rounded-full"
          style={{
            background: "rgba(201, 162, 39, 0.2)",
            backdropFilter: "blur(4px)",
          }}
        />
        {/* Pulse effect */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full"
          style={{
            background: "rgba(201, 162, 39, 0.1)",
          }}
        />
      </div>

      {/* Loading text */}
      <motion.p
        key={messageIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="text-lg font-medium"
        style={{
          color: "rgba(255, 255, 255, 0.8)",
          textShadow: "0 0 20px rgba(201, 162, 39, 0.3)",
        }}
      >
        {messages[messageIndex]}
      </motion.p>

      <p className="text-white/40 text-sm mt-3">This may take a moment...</p>
    </div>
  );
}

/**
 * Main page wrapper with Suspense and DashboardShell
 */
export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen cosmic-bg flex items-center justify-center">
          <div className="stars-layer" />
          <div className="w-8 h-8 border-2 border-gold-main border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardShell variant="map">
        <MapContent />
      </DashboardShell>
    </Suspense>
  );
}
