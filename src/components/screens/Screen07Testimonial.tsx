"use client";

import { motion } from "framer-motion";
import GoldButton from "@/components/GoldButton";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";

export default function Screen07Testimonial() {
  const { dispatch } = useQuiz();

  const handleNext = () => {
    dispatch({ type: "NEXT_STEP" });
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col px-5 pb-6">
        {/* Main content - true center */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">

          {/* Hero face section with decorative elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative flex justify-center mb-5"
          >
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                filter: 'blur(30px)',
              }}
            >
              <div
                className="w-40 h-40 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(201,162,39,0.4) 0%, rgba(201,162,39,0.1) 60%, transparent 70%)',
                }}
              />
            </div>

            {/* Decorative stars around the face */}
            {[
              { x: -50, y: -25, size: 3, delay: 0.3 },
              { x: 55, y: -20, size: 2.5, delay: 0.4 },
              { x: -60, y: 45, size: 2, delay: 0.5 },
              { x: 60, y: 55, size: 2.5, delay: 0.35 },
              { x: -35, y: -50, size: 2, delay: 0.45 },
              { x: 40, y: -45, size: 1.5, delay: 0.55 },
            ].map((star, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: star.delay }}
                className="absolute"
                style={{
                  left: `calc(50% + ${star.x}px)`,
                  top: `calc(50% + ${star.y}px)`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  background: 'radial-gradient(circle, rgba(232,197,71,0.9) 0%, rgba(201,162,39,0.4) 50%, transparent 70%)',
                  borderRadius: '50%',
                  boxShadow: `0 0 ${star.size * 2}px rgba(232,197,71,0.6)`,
                }}
              />
            ))}

            {/* Face image with gold ring border */}
            <div className="relative">
              {/* Gold ring */}
              <div
                className="absolute -inset-1.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #E8C547 0%, #C9A227 50%, #8B6914 100%)',
                  padding: '3px',
                }}
              >
                <div className="w-full h-full rounded-full bg-[#0a0a1e]" />
              </div>

              {/* Actual face - larger */}
              <img
                src="/testimonial-face.png"
                alt="Sarah M."
                className="relative w-32 h-32 md:w-36 md:h-36 rounded-full object-cover"
                style={{
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(201,162,39,0.15)',
                }}
              />
            </div>
          </motion.div>

          {/* Quote card - darker glass */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl py-6 px-6 relative overflow-hidden w-full"
            style={{
              background: 'rgba(10, 10, 20, 0.45)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderTop: '1px solid rgba(201,162,39,0.3)',
            }}
          >
            {/* Subtle gold gradient at top */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(232,197,71,0.5) 50%, transparent 100%)',
              }}
            />

            {/* Quote mark */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="heading-display text-[40px] text-gold-glow leading-none mb-2"
            >
              &ldquo;
            </motion.div>

            {/* Quote text - larger */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-body text-[17px] md:text-[18px] text-white leading-[1.7] mb-4 italic"
            >
              I booked a trip to <span className="font-bold not-italic">Lisbon</span> during my power month. Within <span className="text-gold-glow font-bold not-italic">2 weeks</span> of being there, I met my now-business partner and closed my first <span className="font-bold not-italic">5-figure client</span>.
            </motion.p>

            {/* Closing quote mark */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="heading-display text-[40px] text-gold-glow leading-none text-right -mb-2"
            >
              &rdquo;
            </motion.div>
          </motion.div>

          {/* Attribution below card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center justify-center gap-3 mt-5"
          >
            <div
              className="w-10 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(201,162,39,0.5) 100%)',
              }}
            />
            <span className="text-body text-[14px] text-white/60 tracking-wide">
              {COPY.screen7.attribution}
            </span>
            <div
              className="w-10 h-px"
              style={{
                background: 'linear-gradient(90deg, rgba(201,162,39,0.5) 0%, transparent 100%)',
              }}
            />
          </motion.div>
        </div>

        {/* CTA - fixed at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="max-w-md mx-auto w-full pt-6"
        >
          <GoldButton onClick={handleNext}>
            {COPY.screen7.button}
          </GoldButton>
        </motion.div>
      </div>
    </div>
  );
}
