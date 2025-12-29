"use client";

import { motion } from "framer-motion";
import { useReveal } from "@/lib/reveal-state";
import { SlideUpPanel } from "@/components/reveal";
import GoldButton from "@/components/GoldButton";
import { Compass } from "lucide-react";

export default function RevealScreen04OnboardA() {
  const { dispatch } = useReveal();

  // No map highlight for this screen - text-focused

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Map visible in background via RevealShell */}

      <SlideUpPanel isVisible={true} height="80%">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="h-full flex flex-col"
        >
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, rgba(232, 197, 71, 0.2), rgba(201, 162, 39, 0.1))",
                  border: "1px solid rgba(232, 197, 71, 0.3)",
                  boxShadow: "0 0 30px rgba(201, 162, 39, 0.15)",
                }}
              >
                <Compass className="w-6 h-6 text-gold" />
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-[24px] font-bold text-white text-center mb-5">
              You already know this feeling.
            </h2>

            {/* Body */}
            <div className="space-y-4 text-white/70 text-[15px] leading-relaxed">
              <p>
                A city where your mind went quiet. A trip where strangers became collaborators. A place you left... different than when you arrived.
              </p>

              <p>
                You couldn&apos;t explain it. You just felt it.
              </p>

              <p className="text-gold font-medium">
                That feeling has a map.
              </p>

              <p>
                What you&apos;re looking at right now is why certain places land differently for you than for anyone else.
              </p>
            </div>
          </div>

          {/* Pinned CTA - always visible */}
          <div className="flex-shrink-0 pt-6 pb-2">
            <GoldButton onClick={() => dispatch({ type: "NEXT_STEP" })}>
              Why do some places feel different?
            </GoldButton>
          </div>
        </motion.div>
      </SlideUpPanel>
    </div>
  );
}
