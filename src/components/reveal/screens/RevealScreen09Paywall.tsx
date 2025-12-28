"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import GoldButton from "@/components/GoldButton";
import { Lock, Check, Shield, Zap, Calendar, MapPin } from "lucide-react";
import StripeCheckout from "@/components/reveal/StripeCheckout";
import { calculateAllPowerPlaces, LifeCategory } from "@/lib/astro/power-places";

// Month names for display
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Type for simplified place display
type SimplifiedPlace = {
  cityName: string;
  cityCountry: string;
  categoryLabel: string;
};

export default function RevealScreen09Paywall() {
  const { state, dispatch } = useReveal();
  const [showCheckout, setShowCheckout] = useState(false);

  // Get forecast data for blurred preview
  const forecast = state.forecastData;
  const powerMonths = forecast?.powerMonths || [3, 7, 10];

  // Calculate power places from lines (same as AstroMap does)
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

  // Show Stripe checkout when user clicks the button
  const handleShowCheckout = () => {
    setShowCheckout(true);
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-y-auto">
      {/* Map visible at 20% in background via RevealShell */}

      <div className="flex-1 flex flex-col px-5 py-4 pb-6">
        {/* Blurred Report Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 mb-4"
          style={{
            background: "rgba(10, 10, 25, 0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-[17px]">Your 2026 Power Report</h3>
            <Lock className="w-4 h-4 text-white/40" />
          </div>

          {/* Power Months - Blurred */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gold" />
              <span className="text-white/80 text-sm font-medium">Your 3 Power Months</span>
            </div>
            <div className="space-y-2">
              {powerMonths.map((month, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: "rgba(255, 255, 255, 0.05)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gold font-bold">#{i + 1}</span>
                    <span className="text-white/90 blur-[6px] select-none">{MONTH_NAMES[month - 1]} 2026</span>
                  </div>
                  <span className="text-white/50 text-sm blur-[4px] select-none">Peak energy</span>
                </div>
              ))}
            </div>
          </div>

          {/* Power Cities - Blurred */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-gold" />
              <span className="text-white/80 text-sm font-medium">Your 3 Power Cities</span>
            </div>
            <div className="space-y-2">
              {(topPlaces.length > 0 ? topPlaces : [
                { cityName: "Barcelona", cityCountry: "Spain", categoryLabel: "Love" },
                { cityName: "Tokyo", cityCountry: "Japan", categoryLabel: "Career" },
                { cityName: "Miami", cityCountry: "USA", categoryLabel: "Growth" }
              ]).map(
                (place, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: "rgba(255, 255, 255, 0.05)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gold font-bold">#{i + 1}</span>
                      <span className="text-white/90 blur-[6px] select-none">{place.cityName}</span>
                    </div>
                    <span className="text-white/50 text-sm blur-[4px] select-none">Career</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Months to Avoid - Blurred */}
          <div
            className="p-3 rounded-lg"
            style={{ background: "rgba(255, 100, 100, 0.1)", border: "1px solid rgba(255, 100, 100, 0.2)" }}
          >
            <span className="text-white/60 text-sm">Months to avoid major decisions:</span>
            <span className="text-white/90 ml-2 blur-[6px] select-none">Feb, Jun, Nov</span>
          </div>
        </motion.div>

        {/* Checkout Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5"
          style={{
            background: "linear-gradient(135deg, rgba(201, 162, 39, 0.15), rgba(201, 162, 39, 0.08))",
            border: "1px solid rgba(201, 162, 39, 0.3)",
            boxShadow: "0 0 50px rgba(201, 162, 39, 0.1)",
          }}
        >
          <h3 className="text-white font-bold text-xl text-center mb-2">
            Unlock Your 2026 Map
          </h3>

          {/* Price */}
          <div className="text-center mb-4">
            <span className="text-gold text-4xl font-bold">$27</span>
            <span className="text-white/50 text-sm ml-2">one-time</span>
          </div>

          {/* What's included */}
          <div className="space-y-2 mb-6">
            {[
              "Your 3 power months — when to move, launch, decide",
              "Your 3 power cities — where to travel for breakthroughs",
              "Months to avoid — when to rest, not force",
              "Month-by-month energy forecast",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </div>

          {/* Purchase Button or Checkout Form */}
          {!showCheckout ? (
            <>
              <GoldButton onClick={handleShowCheckout}>
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Unlock My 2026 Map
                </span>
              </GoldButton>

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-4 mt-4 text-white/40 text-xs">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Secure payment</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Instant access</span>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-2">
              <StripeCheckout />
            </div>
          )}
        </motion.div>

        {/* Urgency note */}
        <p className="text-center text-white/40 text-xs mt-4">
          2026 is just around the corner — your first power window might be January
        </p>
      </div>
    </div>
  );
}
