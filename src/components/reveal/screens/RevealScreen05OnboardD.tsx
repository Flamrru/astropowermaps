"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useReveal } from "@/lib/reveal-state";
import { SlideUpPanel } from "@/components/reveal";
import GoldButton from "@/components/GoldButton";

export default function RevealScreen07OnboardD() {
  const { dispatch } = useReveal();

  // No map highlight for this screen

  return (
    <div className="flex-1 flex flex-col relative">
      <SlideUpPanel isVisible={true} height="90%">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="h-full flex flex-col"
        >
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto min-h-0 pb-4">
            {/* Golden Calendar Icon */}
            <div className="flex justify-center mb-4">
              <div className="relative w-16 h-16">
                <Image
                  src="/calendar-icon.png"
                  alt="Calendar"
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
              Location is <span className="text-gold-glow">half</span> the equation.
            </h2>

            {/* Body */}
            <div className="space-y-4 text-white/70 text-[15px] leading-relaxed">
              <p>
                The sky didn&apos;t freeze when you were born. Planets kept moving.
              </p>

              <p>
                Right now, they&apos;re forming new angles with your birth chart — and those angles change month to month.
              </p>

              {/* Swimming metaphor - highlighted */}
              <div
                className="p-4 rounded-xl my-4"
                style={{
                  background: "linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.05))",
                  border: "1px solid rgba(76, 175, 80, 0.2)",
                }}
              >
                <p className="text-white/80 text-[14px] leading-relaxed">
                  <span className="text-green-400/90 font-medium">Some months, you&apos;re swimming with the current.</span> Launch something, and it catches. Decide something, and it sticks. The right people appear without effort.
                </p>
              </div>

              <div
                className="p-4 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 100, 100, 0.08), rgba(255, 100, 100, 0.04))",
                  border: "1px solid rgba(255, 100, 100, 0.15)",
                }}
              >
                <p className="text-white/80 text-[14px] leading-relaxed">
                  <span className="text-red-400/80 font-medium">Other months, you&apos;re swimming against it.</span> Same energy, same work — but everything takes twice as long and lands half as well.
                </p>
              </div>

              <p className="text-white/90 font-medium mt-4">
                You have <span className="text-gold-glow">power windows</span>. Stretches where momentum compounds.
              </p>

              <p className="text-white/60 italic">
                Miss them, and you&apos;re not failing — you&apos;re just forcing.
              </p>
            </div>
          </div>

          {/* Pinned CTA */}
          <div className="flex-shrink-0 pt-4 pb-2">
            <GoldButton onClick={() => dispatch({ type: "NEXT_STEP" })}>
              When are my windows?
            </GoldButton>
          </div>
        </motion.div>
      </SlideUpPanel>
    </div>
  );
}
