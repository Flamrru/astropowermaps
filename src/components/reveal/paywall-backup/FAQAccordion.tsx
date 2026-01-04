"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

// PRD-specified FAQ items - exact copy
const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How accurate is this if I don't know my exact birth time?",
    answer:
      "Very. Your power months are based on planetary transits which don't require exact time. City recommendations may shift slightly, but the core insights remain accurate.",
  },
  {
    question: "Is this just generic horoscope stuff?",
    answer:
      "No. This is calculated using your exact birth data and NASA-grade ephemeris coordinates. Two people born a day apart get completely different maps.",
  },
  {
    question: "What if I can't travel to my power cities?",
    answer:
      "You don't need to move there. Even virtual connections to those places — collaborating with people from that region, or planning a future trip — can activate the energy. The cities are compass points, not requirements.",
  },
  {
    question: "Do I get instant access?",
    answer:
      "Yes. Immediately after purchase, your full report unlocks. No waiting, no email delays.",
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-8 px-5">
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center text-white/70 text-lg font-medium mb-6"
      >
        People often ask
      </motion.h3>

      <div className="space-y-3 max-w-md mx-auto">
        {FAQ_ITEMS.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl overflow-hidden"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-start gap-3 p-4 text-left"
            >
              <span className="text-gold text-lg mt-0.5">❓</span>
              <span className="text-white/80 text-[14px] flex-1 leading-relaxed">
                {item.question}
              </span>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="mt-1"
              >
                <ChevronDown className="w-4 h-4 text-white/40" />
              </motion.div>
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-0 ml-8">
                    <p className="text-white/60 text-[13px] leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
