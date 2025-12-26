"use client";

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
          <div className="relative flex justify-center mb-5">
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
              { x: -50, y: -25, size: 3 },
              { x: 55, y: -20, size: 2.5 },
              { x: -60, y: 45, size: 2 },
              { x: 60, y: 55, size: 2.5 },
              { x: -35, y: -50, size: 2 },
              { x: 40, y: -45, size: 1.5 },
            ].map((star, i) => (
              <div
                key={i}
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
          </div>

          {/* Quote card - darker glass */}
          <div
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
            <div className="heading-display text-[40px] text-gold-glow leading-none mb-2">
              &ldquo;
            </div>

            {/* Quote text - larger */}
            <p className="text-body text-[17px] md:text-[18px] text-white leading-[1.7] mb-4 italic">
              I booked a trip to <span className="font-bold not-italic">Lisbon</span> during my power month. Within <span className="text-gold-glow font-bold not-italic">2 weeks</span> of being there, I met my now-business partner and closed my first <span className="font-bold not-italic">5-figure client</span>.
            </p>

            {/* Closing quote mark */}
            <div className="heading-display text-[40px] text-gold-glow leading-none text-right -mb-2">
              &rdquo;
            </div>
          </div>

          {/* Attribution below card */}
          <div className="flex items-center justify-center gap-3 mt-5">
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
          </div>
        </div>

        {/* CTA - fixed at bottom */}
        <div className="max-w-md mx-auto w-full pt-6 mb-6">
          <GoldButton onClick={handleNext}>
            {COPY.screen7.button}
          </GoldButton>
        </div>
      </div>
    </div>
  );
}
