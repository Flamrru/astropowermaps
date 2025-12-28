"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import { SlideUpPanel } from "@/components/reveal";
import GoldButton from "@/components/GoldButton";
import { MapPin, Calendar, Sparkles } from "lucide-react";
import { calculateAllPowerPlaces, LifeCategory } from "@/lib/astro/power-places";

// Type for simplified place display
type SimplifiedPlace = {
  cityName: string;
  cityCountry: string;
  categoryLabel: string;
};

export default function RevealScreen06Onboard3() {
  const { state, dispatch } = useReveal();

  // Calculate power places from lines (same as AstroMap does)
  const powerPlaces = useMemo(() => {
    if (!state.astroData?.lines) return null;
    return calculateAllPowerPlaces(state.astroData.lines);
  }, [state.astroData?.lines]);

  // Get top 3 power places across all categories
  const topPlaces = useMemo((): SimplifiedPlace[] => {
    if (!powerPlaces) return [];
    const categories: LifeCategory[] = ["love", "career", "growth", "home"];
    const allPlaces: SimplifiedPlace[] = categories.flatMap((cat) =>
      powerPlaces[cat].places.map((p) => ({
        cityName: p.city.name,
        cityCountry: p.city.country,
        categoryLabel: powerPlaces[cat].label,
      }))
    );
    return allPlaces.slice(0, 3);
  }, [powerPlaces]);

  // Highlight top power place city on the map
  useEffect(() => {
    if (topPlaces.length > 0) {
      dispatch({
        type: "SET_MAP_HIGHLIGHT",
        payload: {
          kind: "city",
          ids: [topPlaces[0].cityName], // Highlight the #1 power city
          pulse: true,
        },
      });
    }

    // Clear highlight when leaving this screen
    return () => {
      dispatch({ type: "SET_MAP_HIGHLIGHT", payload: null });
    };
  }, [dispatch, topPlaces.length > 0 ? topPlaces[0].cityName : null]);

  return (
    <div className="flex-1 flex flex-col relative">
      <SlideUpPanel isVisible={true} height="80%">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pb-20"
        >
          {/* Title */}
          <h2 className="text-[24px] font-bold text-white text-center mb-2">
            Places & <span className="text-gold">Timing</span>
          </h2>
          <p className="text-white/50 text-center text-sm mb-6">
            Where your lines cross major cities
          </p>

          {/* Power Places Preview */}
          <div
            className="p-4 rounded-xl mb-6"
            style={{
              background: "linear-gradient(135deg, rgba(232, 197, 71, 0.1), rgba(201, 162, 39, 0.05))",
              border: "1px solid rgba(232, 197, 71, 0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm font-medium">Your Power Places</span>
            </div>

            {topPlaces.length > 0 ? (
              <div className="space-y-2">
                {topPlaces.map((place, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-white/80 text-[14px]">
                      {place.cityName}, {place.cityCountry}
                    </span>
                    <span className="text-white/40 text-xs capitalize">{place.categoryLabel}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/50 text-sm">Your power places will be calculated...</p>
            )}
          </div>

          {/* Timing teaser */}
          <div className="space-y-4 text-white/70 text-[15px] leading-relaxed">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white/80 font-medium mb-1">Timing Matters Too</p>
                <p className="text-[14px]">
                  The planets didn&apos;t stop moving after you were born. Some months are better for action, others for rest.
                </p>
              </div>
            </div>

            <div
              className="p-4 rounded-xl"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-gold/70 mt-0.5 flex-shrink-0" />
                <p className="text-white/60 text-[14px] italic">
                  &ldquo;You&apos;ve probably had trips that changed something in you. And trips that were just... nice. The difference might be in your lines — and your timing.&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8">
            <GoldButton onClick={() => dispatch({ type: "NEXT_STEP" })}>
              Continue
            </GoldButton>
          </div>
        </motion.div>
      </SlideUpPanel>
    </div>
  );
}
