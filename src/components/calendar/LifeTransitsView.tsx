"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import TransitCard from "./TransitCard";
import type { LifetimeTransitReport } from "@/lib/astro/lifetime-transits-types";

type ViewFilter = "upcoming" | "completed" | "all";

/**
 * LifeTransitsView
 *
 * Vertical timeline showing lifetime special transits.
 * Fetches data from API and displays Saturn Returns, Jupiter Returns,
 * Chiron Return, and outer planet transits.
 */
export default function LifeTransitsView() {
  const router = useRouter();
  const [report, setReport] = useState<LifetimeTransitReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ViewFilter>("upcoming");

  useEffect(() => {
    loadTransits();
  }, []);

  async function loadTransits() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/content/life-transits");

      if (response.status === 401) {
        router.push("/login?redirect=/calendar");
        return;
      }

      if (response.status === 404) {
        router.push("/setup");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load transits");
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error("Life transits load error:", err);
      setError("Failed to load your cosmic journey. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  // Filter transits based on selected view
  const getFilteredTransits = () => {
    if (!report) return [];

    const today = new Date();
    const allTransits = report.allTransits;

    switch (filter) {
      case "upcoming":
        return allTransits.filter((t) => new Date(t.exactDate) >= today);
      case "completed":
        return allTransits.filter((t) => new Date(t.exactDate) < today);
      case "all":
      default:
        return allTransits;
    }
  };

  const filteredTransits = getFilteredTransits();
  const upcomingCount = report?.allTransits.filter(
    (t) => new Date(t.exactDate) >= new Date()
  ).length ?? 0;
  const completedCount = report?.allTransits.filter(
    (t) => new Date(t.exactDate) < new Date()
  ).length ?? 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles size={32} className="text-[#E8C547]" />
        </motion.div>
        <p className="mt-4 text-white/40 text-sm">
          Calculating your cosmic journey...
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
          onClick={loadTransits}
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

  if (!report) return null;

  return (
    <div className="pb-8">
      {/* Header - just back button since title is in tabs */}
      <div className="flex items-center mb-6">
        <motion.button
          onClick={() => router.push("/home")}
          whileHover={{ x: -2 }}
          className="flex items-center gap-1 text-white/40 hover:text-white/70 transition-colors"
        >
          <ChevronLeft size={18} />
          <span className="text-sm">Back</span>
        </motion.button>
      </div>

      {/* Summary card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4 mb-6"
        style={{
          background: "linear-gradient(135deg, rgba(201, 162, 39, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
          border: "1px solid rgba(201, 162, 39, 0.15)",
        }}
      >
        <div className="text-center">
          <div className="text-3xl mb-1">✦</div>
          <h2 className="text-white/90 font-medium mb-1">Your Cosmic Journey</h2>
          <p className="text-white/50 text-sm">
            {report.allTransits.length} major transits across your lifetime
          </p>
        </div>

        {/* Stats row */}
        <div className="flex justify-center gap-8 mt-4 pt-4 border-t border-white/5">
          <div className="text-center">
            <div className="text-xl font-semibold text-[#E8C547]">
              {report.saturnReturns.length}
            </div>
            <div className="text-xs text-white/40">Saturn Returns</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-white/70">
              {report.jupiterReturns.length}
            </div>
            <div className="text-xs text-white/40">Jupiter Returns</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-white/70">
              {report.outerPlanetTransits.length}
            </div>
            <div className="text-xs text-white/40">Outer Transits</div>
          </div>
        </div>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "upcoming" as ViewFilter, label: "Upcoming", count: upcomingCount },
          { id: "completed" as ViewFilter, label: "Completed", count: completedCount },
          { id: "all" as ViewFilter, label: "All", count: report.allTransits.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className="flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background:
                filter === tab.id
                  ? "rgba(201, 162, 39, 0.15)"
                  : "rgba(255, 255, 255, 0.03)",
              border:
                filter === tab.id
                  ? "1px solid rgba(201, 162, 39, 0.3)"
                  : "1px solid rgba(255, 255, 255, 0.05)",
              color: filter === tab.id ? "#E8C547" : "rgba(255, 255, 255, 0.5)",
            }}
          >
            {tab.label}
            <span
              className="ml-1.5 text-xs"
              style={{
                opacity: filter === tab.id ? 0.8 : 0.5,
              }}
            >
              ({tab.count})
            </span>
          </button>
        ))}
      </div>

      {/* Next major transit highlight (only in upcoming view) */}
      {filter === "upcoming" && report.nextMajorTransit && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <div className="text-xs font-medium text-[#E8C547] uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E8C547] animate-pulse" />
            Next Major Transit
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {filteredTransits.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-white/30 text-sm">
                  {filter === "upcoming"
                    ? "All transits are in the past"
                    : filter === "completed"
                      ? "No completed transits yet"
                      : "No transits found"}
                </div>
              </div>
            ) : (
              filteredTransits.map((transit, index) => (
                <TransitCard
                  key={`${transit.type}-${transit.exactDate}`}
                  transit={transit}
                  isNext={
                    filter === "upcoming" &&
                    report.nextMajorTransit?.exactDate === transit.exactDate
                  }
                  index={index}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-xs text-white/30 mt-8 px-4"
      >
        Transits are calculated based on your birth chart.
        <br />
        Dates may shift slightly due to retrograde motion.
      </motion.p>
    </div>
  );
}
