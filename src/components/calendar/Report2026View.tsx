"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, AlertCircle } from "lucide-react";
import { Report2026Panel } from "@/components/astro-map/report";
import type { YearForecast } from "@/lib/astro/transit-types";
import type { PlanetaryLine } from "@/lib/astro/types";

/**
 * Report2026View
 *
 * Calendar tab view showing the 2026 Power Year forecast.
 * Fetches data from API and renders the Report2026Panel.
 * City clicks navigate to the map with flyTo parameter.
 */
export default function Report2026View() {
  const router = useRouter();
  const [forecast, setForecast] = useState<YearForecast | null>(null);
  const [lines, setLines] = useState<PlanetaryLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadForecast();
  }, []);

  async function loadForecast() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/content/year-forecast");

      if (response.status === 401) {
        router.push("/login?redirect=/calendar");
        return;
      }

      if (response.status === 404) {
        router.push("/setup");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load forecast");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to load forecast");
      }

      setForecast(data.forecast);
      setLines(data.lines || []);
    } catch (err) {
      console.error("Year forecast load error:", err);
      setError("Failed to load your 2026 forecast. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Navigate to map and fly to the city
  const handleFlyToCity = useCallback(
    (lat: number, lng: number, cityName: string) => {
      // Encode parameters for URL
      const flyTo = `${lat},${lng},${encodeURIComponent(cityName)}`;
      router.push(`/dashboard/map?flyTo=${flyTo}`);
    },
    [router]
  );

  // Loading state with celestial animation
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        {/* Orbital loading animation */}
        <div className="relative w-16 h-16 mb-6">
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              border: "2px solid rgba(201, 162, 39, 0.3)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-full"
            style={{
              border: "2px solid rgba(201, 162, 39, 0.5)",
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-4 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(201, 162, 39, 0.15)",
            }}
          >
            <Sparkles size={20} className="text-[#E8C547]" />
          </motion.div>
        </div>
        <p className="text-white/40 text-sm">
          Calculating your 2026 power forecast...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <AlertCircle size={32} className="text-red-400/60 mb-4" />
        <p className="text-white/60 text-sm text-center mb-4">{error}</p>
        <button
          onClick={loadForecast}
          className="px-4 py-2 rounded-lg text-sm"
          style={{
            background: "rgba(201, 162, 39, 0.2)",
            border: "1px solid rgba(201, 162, 39, 0.3)",
            color: "#E8C547",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // No data state
  if (!forecast) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <Sparkles size={32} className="text-white/20 mb-4" />
        <p className="text-white/40 text-sm text-center">
          No forecast data available.
        </p>
      </div>
    );
  }

  // Success state - render the report
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-8"
    >
      <Report2026Panel
        forecast={forecast}
        lines={lines}
        onFlyToCity={handleFlyToCity}
      />
    </motion.div>
  );
}
