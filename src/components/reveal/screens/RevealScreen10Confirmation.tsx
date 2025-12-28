"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import GoldButton from "@/components/GoldButton";
import { Check, Calendar, MapPin, AlertTriangle, Sparkles, Download } from "lucide-react";
import { calculateAllPowerPlaces, LifeCategory } from "@/lib/astro/power-places";

// Month names for display
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Type for simplified place display
type SimplifiedPlace = {
  cityName: string;
  cityCountry: string;
  categoryLabel: string;
};

export default function RevealScreen10Confirmation() {
  const { state } = useReveal();
  const [showContent, setShowContent] = useState(false);
  const [celebrationComplete, setCelebrationComplete] = useState(false);

  // Get forecast and astro data
  const forecast = state.forecastData;
  const powerMonths = forecast?.powerMonths || [3, 7, 10];
  const avoidMonths = forecast?.avoidMonths || [2, 6, 11];

  // Calculate power places from lines
  const topPlaces = useMemo((): SimplifiedPlace[] => {
    if (!state.astroData?.lines) return [];
    const powerPlaces = calculateAllPowerPlaces(state.astroData.lines);
    const categories: LifeCategory[] = ["love", "career", "growth", "home"];
    const allPlaces: SimplifiedPlace[] = categories.flatMap((cat) =>
      powerPlaces[cat].places.map((p) => ({
        cityName: p.city.name,
        cityCountry: p.city.country,
        categoryLabel: powerPlaces[cat].label,
      }))
    );
    return allPlaces.slice(0, 3);
  }, [state.astroData?.lines]);

  // Celebration sequence
  useEffect(() => {
    // Brief celebration, then reveal content
    const timer1 = setTimeout(() => setCelebrationComplete(true), 1500);
    const timer2 = setTimeout(() => setShowContent(true), 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col relative overflow-y-auto">
      {/* Celebration overlay */}
      <AnimatePresence>
        {!celebrationComplete && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              background: "radial-gradient(circle at center, rgba(201, 162, 39, 0.2) 0%, rgba(10, 10, 25, 0.95) 70%)",
            }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 10 }}
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #E8C547, #C9A227)",
                  boxShadow: "0 0 60px rgba(232, 197, 71, 0.5)",
                }}
              >
                <Check className="w-10 h-10 text-black" strokeWidth={3} />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gold text-xl font-bold"
              >
                Your Map is Ready!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showContent ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col px-5 py-4 pb-8"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3"
            style={{
              background: "linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1))",
              border: "1px solid rgba(76, 175, 80, 0.3)",
            }}
          >
            <Sparkles className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Unlocked</span>
          </div>
          <h2 className="text-[24px] font-bold text-white mb-1">
            Your 2026 Power Map
          </h2>
          <p className="text-white/50 text-sm">
            Your personalized cosmic timing guide
          </p>
        </motion.div>

        {/* Power Months - REVEALED */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-5 mb-4"
          style={{
            background: "linear-gradient(135deg, rgba(232, 197, 71, 0.12), rgba(201, 162, 39, 0.06))",
            border: "1px solid rgba(232, 197, 71, 0.25)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gold" />
            <span className="text-gold font-semibold">Your 3 Power Months</span>
          </div>
          <div className="space-y-3">
            {powerMonths.map((month, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: "linear-gradient(135deg, #E8C547, #C9A227)",
                      color: "#1a1a2e",
                    }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-white font-medium">{MONTH_NAMES[month - 1]} 2026</span>
                </div>
                <span className="text-white/60 text-sm">Peak energy window</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Power Cities - REVEALED */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl p-5 mb-4"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-gold" />
            <span className="text-white font-semibold">Your 3 Power Cities</span>
          </div>
          <div className="space-y-3">
            {(topPlaces.length > 0
              ? topPlaces
              : [
                  { cityName: "Barcelona", cityCountry: "Spain", categoryLabel: "Career" },
                  { cityName: "Tokyo", cityCountry: "Japan", categoryLabel: "Growth" },
                  { cityName: "Miami", cityCountry: "USA", categoryLabel: "Love" },
                ]
            ).map((place, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.15 }}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white/80"
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <span className="text-white font-medium">{place.cityName}</span>
                    <span className="text-white/40 text-sm ml-1">{place.cityCountry}</span>
                  </div>
                </div>
                <span className="text-gold/80 text-sm capitalize">{place.categoryLabel}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Months to Avoid - REVEALED */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="rounded-2xl p-4 mb-6"
          style={{
            background: "rgba(255, 100, 100, 0.08)",
            border: "1px solid rgba(255, 100, 100, 0.2)",
          }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400/80 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white/80 font-medium mb-1">Months to avoid major decisions</p>
              <p className="text-white/90">
                {avoidMonths.map(m => MONTH_NAMES[m - 1]).join(", ")} 2026
              </p>
              <p className="text-white/50 text-sm mt-1">
                Good for rest, reflection, and tying up loose ends
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-auto"
        >
          <GoldButton onClick={() => window.location.href = "/map"}>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Explore Your Full Map
            </span>
          </GoldButton>

          <p className="text-center text-white/40 text-xs mt-4">
            Your map is saved to your account. Check your email for a copy.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
