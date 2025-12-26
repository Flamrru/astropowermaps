"use client";

import { motion } from "framer-motion";
import GoldButton from "@/components/GoldButton";
import { COPY } from "@/content/copy";
import { useQuiz } from "@/lib/quiz-state";

export default function Screen04Proof() {
  const { state, dispatch } = useQuiz();

  const handleNext = () => {
    dispatch({ type: "NEXT_STEP" });
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col px-6 pt-6 pb-6">
        {/* Main content */}
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
          {/* Big stat - 73% in gold, very large */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-center"
          >
            <span className="heading-display text-[56px] md:text-[64px] text-gold-glow font-bold">
              {COPY.screen4.stat}
            </span>
            <span className="text-body text-[20px] md:text-[24px] text-white/90 ml-2">
              {COPY.screen4.statText}
            </span>
          </motion.div>

          {/* World Map with Location Pins */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-5 -mx-2 relative rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
            }}
          >
            <img
              src="/world-map.png"
              alt="Global power locations"
              className="w-full h-auto brightness-[1.8] contrast-150 saturate-125"
              style={{
                filter: 'brightness(1.8) contrast(1.5) saturate(1.25) drop-shadow(0 0 20px rgba(201,162,39,0.3))'
              }}
            />

            {/* Location Pins */}
            {[
              { x: 14, y: 27, delay: 0.4, floatDelay: 0, face: '/face-1.png' },      // USA West (California)
              { x: 24, y: 48, delay: 0.5, floatDelay: 0.5, face: '/face-2.png' },    // USA East (New York)
              { x: 47, y: 18, delay: 0.6, floatDelay: 1, face: '/face-3.png' },      // Europe (UK/France)
              { x: 51, y: 45, delay: 0.7, floatDelay: 1.5, face: '/face-4.png' },    // Africa
              { x: 72, y: 15, delay: 0.8, floatDelay: 0.3, face: '/face-5.png' },    // Asia (India)
              { x: 83, y: 48, delay: 0.9, floatDelay: 0.8, face: '/face-6.png' },    // Australia
            ].map((pin, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: pin.delay }}
                className="absolute map-pin"
                style={{
                  left: `${pin.x}%`,
                  top: `${pin.y}%`,
                  animationDelay: `${pin.floatDelay}s`
                }}
              >
                {/* Outer glow */}
                <div
                  className="absolute inset-0 -m-3 rounded-full blur-lg"
                  style={{
                    background: 'radial-gradient(circle, rgba(232,197,71,0.4) 0%, rgba(201,162,39,0.2) 40%, transparent 70%)',
                    animationDelay: `${pin.floatDelay + 0.2}s`
                  }}
                />
                {/* Pin circle - solid golden */}
                <div
                  className="relative w-9 h-9 md:w-11 md:h-11 rounded-full map-pin-glow flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(180deg, #F5D76E 0%, #D4AF37 40%, #B8942D 100%)',
                    boxShadow: '0 0 12px rgba(232,197,71,0.5), 0 0 25px rgba(201,162,39,0.3), inset 0 2px 4px rgba(255,255,255,0.4)',
                    animationDelay: `${pin.floatDelay}s`
                  }}
                >
                  {/* Profile face image */}
                  <div
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-amber-300/50"
                    style={{
                      backgroundImage: `url(${pin.face})`,
                      backgroundSize: '95%',
                      backgroundPosition: 'center 15%',
                    }}
                  />
                </div>
                {/* Pin tail */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full -mt-1"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: '12px solid #C9A227',
                    filter: 'drop-shadow(0 2px 4px rgba(201,162,39,0.6))'
                  }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Paragraph 1: "That wasn't random." - Bold, section header */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35 }}
            className="text-body text-[16px] text-white font-bold leading-relaxed mb-3"
          >
            That wasn&apos;t random.
          </motion.p>

          {/* Paragraph 2: "specific locations" and "appear" bold */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.45 }}
            className="text-body text-[15px] text-white/75 leading-relaxed mb-3"
          >
            Based on your birth chart, there are <span className="font-bold text-white">specific locations</span> on Earth where your energy amplifies. Where the right people and opportunities <span className="font-bold text-white">appear</span>.
          </motion.p>

          {/* Paragraph 3: Muted/italic */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.55 }}
            className="text-body text-[15px] text-muted-custom italic leading-relaxed"
          >
            You don&apos;t need to move there. You just need to visit — at the right time.
          </motion.p>

          {/* Spacer */}
          <div className="flex-1 min-h-4" />
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="max-w-md mx-auto w-full"
        >
          <GoldButton onClick={handleNext}>
            {COPY.screen4.button}
          </GoldButton>
        </motion.div>
      </div>
    </div>
  );
}
