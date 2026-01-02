import { Suspense } from "react";
import { Metadata } from "next";
import DashboardShell from "@/components/dashboard/DashboardShell";
import BigThreeHeader from "@/components/dashboard/BigThreeHeader";
import PowerScoreCard from "@/components/dashboard/cards/PowerScoreCard";
import WeeklyForecastCard from "@/components/dashboard/cards/WeeklyForecastCard";
import BestDaysCard from "@/components/dashboard/cards/BestDaysCard";
import RitualCard from "@/components/dashboard/cards/RitualCard";
import StellaFloatingButton from "@/components/dashboard/StellaFloatingButton";

export const metadata: Metadata = {
  title: "Stella+ Dashboard | AstroPowerMaps",
  description: "Your personalized cosmic guidance dashboard with daily insights, forecasts, and AI-powered astrology guidance.",
};

/**
 * Loading fallback for dashboard
 */
function DashboardLoading() {
  return (
    <div className="min-h-screen cosmic-bg flex items-center justify-center">
      <div className="stars-layer" />
      <div className="relative z-10 text-center">
        <div className="w-12 h-12 border-2 border-gold-main border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60">Loading your cosmic dashboard...</p>
      </div>
    </div>
  );
}

/**
 * Dashboard Page
 *
 * Main Stella+ subscriber dashboard with:
 * - Big Three zodiac header (Sun, Moon, Rising)
 * - Daily Power Score
 * - Weekly Forecast
 * - Best Days picker
 * - Today's Ritual/Journal prompt
 * - Stella floating chat button
 *
 * Dev Mode: Access with ?dev=true to see mock data
 * Example: /dashboard?dev=true
 */
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardShell>
        {/* Zodiac identity header */}
        <BigThreeHeader />

        {/* Card-based feed */}
        <div className="space-y-4 mt-2">
          {/* Today's energy - most prominent */}
          <PowerScoreCard />

          {/* Weekly overview */}
          <WeeklyForecastCard />

          {/* Quick access to upcoming power days */}
          <BestDaysCard />

          {/* Daily spiritual practice */}
          <RitualCard />
        </div>

        {/* Floating Stella chat button */}
        <StellaFloatingButton />
      </DashboardShell>
    </Suspense>
  );
}
