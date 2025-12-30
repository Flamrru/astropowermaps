"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useReveal } from "@/lib/reveal-state";
import { SlideUpPanel } from "@/components/reveal";
import GoldButton from "@/components/GoldButton";

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
            {/* Golden Compass Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16">
                <Image
                  src="/compass-icon.png"
                  alt="Compass"
                  fill
                  className="object-contain"
                  style={{
                    filter: "drop-shadow(0 0 20px rgba(201, 162, 39, 0.5))",
                  }}
                />
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-[24px] font-bold text-white text-center mb-5">
              You already know this feeling.
            </h2>

            {/* Body */}
            <div className="space-y-4 text-white/70 text-[15px] leading-relaxed">
              <p>
                A city where your mind went quiet. A trip where strangers became collaborators. A place you left... <span className="text-white/90">different</span> than when you arrived.
              </p>

              <p>
                You couldn&apos;t explain it. You just <span className="text-white/90">felt</span> it.
              </p>

              <p className="text-gold-glow font-medium">
                That feeling has a map.
              </p>

              <p>
                What you&apos;re looking at right now is why certain places land differently for <span className="text-gold">you</span> than for anyone else.
              </p>
            </div>
          </div>

          {/* Pinned CTA - always visible */}
          <div className="flex-shrink-0 pt-4 pb-2">
            <GoldButton onClick={() => dispatch({ type: "NEXT_STEP" })}>
              Why do some places feel different?
            </GoldButton>
          </div>
        </motion.div>
      </SlideUpPanel>
    </div>
  );
}
