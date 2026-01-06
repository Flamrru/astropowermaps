"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

// V2 Copy - 6 FAQ items
const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How accurate is this if I don't know my exact birth time?",
    answer:
      "Very. Your power months are based on planetary transits which don't require exact time. City recommendations may shift slightly, but the core insights remain accurate.",
  },
  {
    question: "Is this just generic horoscope stuff?",
    answer:
      "No. We use VSOP87 — the same planetary algorithm NASA uses — to calculate your exact birth sky. Your 40 lines are computed to sub-degree precision. Two people born one day apart have completely different maps. This isn't 'you're a Scorpio, so...' — this is real astronomical math applied to your specific coordinates in space-time.",
  },
  {
    question: "What if I can't travel to my power cities?",
    answer:
      "You don't need to move there. Even virtual connections to those places — collaborating with people from that region, or planning a future trip — can activate the energy. The cities are compass points, not requirements.",
  },
  {
    question: "Do I get instant access?",
    answer:
      "Yes. Immediately after purchase, everything unlocks instantly — your map, your forecast, Stella, daily scores. All of it.",
  },
  {
    question: "What happens after my trial?",
    answer:
      "Your subscription continues at $19.99/month. Cancel anytime with one tap — no calls, no hassle.",
  },
  {
    question: "Does the content update?",
    answer:
      "Yes. Your daily score, journal prompts, and transit tracking update every day. Stella is always available. This isn't a static PDF — it's a living tool.",
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
        className="text-center text-white text-2xl font-bold mb-10"
        style={{
          textShadow: "0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)",
        }}
      >
        Frequently Asked Questions
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
              <HelpCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-white text-[14px] flex-1 leading-relaxed">
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
                    <p className="text-white/80 text-[13px] leading-relaxed">
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
