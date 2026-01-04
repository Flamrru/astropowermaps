"use client";

import { motion } from "framer-motion";

interface GaugeData {
  percentage: number;
  description: string;
  subdescription: string;
}

const GAUGE_DATA: GaugeData[] = [
  {
    percentage: 87,
    description: "said their power month \"felt different\"",
    subdescription: "— more clarity, better timing, things clicking",
  },
  {
    percentage: 73,
    description: "visited a power city and noticed",
    subdescription: "a shift in energy or opportunities",
  },
  {
    percentage: 91,
    description: "said they'd plan their year differently",
    subdescription: "now that they have their map",
  },
];

function SemiCircularGauge({ percentage, delay }: { percentage: number; delay: number }) {
  const radius = 40;
  const circumference = Math.PI * radius; // Half circle
  const progress = (percentage / 100) * circumference;

  return (
    <div className="relative w-24 h-14">
      <svg viewBox="0 0 100 55" className="w-full h-full">
        {/* Background arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <motion.path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, delay, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B6914" />
            <stop offset="50%" stopColor="#C9A227" />
            <stop offset="100%" stopColor="#E8C547" />
          </linearGradient>
        </defs>
      </svg>
      {/* Percentage text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.5 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 text-gold text-2xl font-bold"
      >
        {percentage}%
      </motion.div>
    </div>
  );
}

export default function SocialProofGauges() {
  return (
    <section className="py-10 px-5">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center text-white/50 text-sm mb-8"
      >
        People using their Power Map report:
      </motion.p>

      <div className="space-y-8">
        {GAUGE_DATA.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            className="flex flex-col items-center text-center"
          >
            <SemiCircularGauge percentage={item.percentage} delay={index * 0.3} />
            <p className="text-white/80 text-[15px] mt-3 max-w-[280px]">
              {item.description}
            </p>
            <p className="text-white/50 text-[13px] mt-1 max-w-[280px]">
              {item.subdescription}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
