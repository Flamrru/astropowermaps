"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import { SlideUpPanel } from "@/components/reveal";
import GoldButton from "@/components/GoldButton";
import { Globe, Sparkles } from "lucide-react";

export default function RevealScreen04Onboard1() {
  const { dispatch } = useReveal();

  // Highlight key planetary lines on the map
  useEffect(() => {
    dispatch({
      type: "SET_MAP_HIGHLIGHT",
      payload: {
        kind: "planetLine",
        ids: ["sun", "moon", "venus"], // Show the major benefics
        pulse: true,
      },
    });

    // Clear highlight when leaving this screen
    return () => {
      dispatch({ type: "SET_MAP_HIGHLIGHT", payload: null });
    };
  }, [dispatch]);

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Map visible in background via RevealShell */}

      <SlideUpPanel isVisible={true} height="80%">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="pb-20"
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(232, 197, 71, 0.2), rgba(201, 162, 39, 0.1))",
                border: "1px solid rgba(232, 197, 71, 0.3)",
                boxShadow: "0 0 30px rgba(201, 162, 39, 0.15)",
              }}
            >
              <Globe className="w-7 h-7 text-gold" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-[24px] font-bold text-white text-center mb-4">
            What Is <span className="text-gold">Astrocartography</span>?
          </h2>

          {/* Content */}
          <div className="space-y-4 text-white/70 text-[15px] leading-relaxed">
            <p>
              Astrocartography maps the exact positions of planets at your birth moment onto Earth&apos;s geography.
            </p>

            <p>
              Each line on your map represents where a specific planet was <span className="text-white/90">rising, setting, or at its peak</span> at the moment you were born.
            </p>

            <div
              className="p-4 rounded-xl my-6"
              style={{
                background: "linear-gradient(135deg, rgba(201, 162, 39, 0.1), rgba(201, 162, 39, 0.05))",
                border: "1px solid rgba(201, 162, 39, 0.2)",
              }}
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                <p className="text-white/80 text-[14px]">
                  These aren&apos;t random lines — they&apos;re calculated using VSOP87 astronomical algorithms, the same data used by observatories worldwide.
                </p>
              </div>
            </div>

            <p>
              Certain places on Earth <span className="text-gold">resonate with your specific birth energy</span>. When you travel to these locations, you may notice life flows differently.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-8">
            <GoldButton onClick={() => dispatch({ type: "NEXT_STEP" })}>
              Understand My Lines
            </GoldButton>
          </div>
        </motion.div>
      </SlideUpPanel>
    </div>
  );
}
