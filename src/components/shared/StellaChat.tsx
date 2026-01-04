"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

/**
 * StellaChat - Simplified chat component
 * Uses absolute positioning to guarantee input visibility
 */
export default function StellaChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState(50);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Load history on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetch("/api/stella/history")
        .then(res => res.json())
        .then(data => {
          if (data.messages) setMessages(data.messages);
          if (typeof data.remaining === "number") setRemaining(data.remaining);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/stella/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });
      const data = await res.json();

      if (data.message) {
        setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: data.message }]);
      }
      if (typeof data.remaining === "number") setRemaining(data.remaining);
    } catch {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  const quickReplies = [
    { label: "Love", prompt: "What does my chart say about love?" },
    { label: "Career", prompt: "What career insights can you give me?" },
    { label: "Today", prompt: "What should I focus on today?" },
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-5 z-50 w-16 h-16 rounded-full"
        style={{
          background: "linear-gradient(135deg, rgba(201, 162, 39, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)",
          border: "2px solid rgba(201, 162, 39, 0.5)",
          boxShadow: "0 0 20px rgba(201, 162, 39, 0.3)",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Image src="/images/stella.png" alt="Stella" width={48} height={48} className="w-12 h-12 mx-auto rounded-full object-cover" style={{ transform: "scale(1.2)" }} />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Chat Window - SIMPLE STRUCTURE */}
            <motion.div
              className="fixed z-50 rounded-2xl"
              style={{
                bottom: "90px",
                left: "8px",
                right: "8px",
                height: "65vh",
                background: "rgba(10, 10, 20, 0.98)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
            >
              {/* Header - Fixed at top */}
              <div className="absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 border-b border-white/10" style={{ background: "rgba(10, 10, 20, 0.98)" }}>
                <div className="flex items-center gap-3">
                  <Image src="/images/stella.png" alt="Stella" width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h3 className="text-white font-medium">Stella</h3>
                    <p className="text-white/40 text-xs">Your cosmic guide</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-white/10">
                  <X size={20} className="text-white/60" />
                </button>
              </div>

              {/* Messages - Scrollable middle section */}
              <div
                className="absolute left-0 right-0 overflow-y-auto px-4 py-4 space-y-4"
                style={{ top: "64px", bottom: "180px" }}
              >
                {messages.length === 0 && !isLoading && (
                  <div className="text-center pt-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "rgba(201, 162, 39, 0.1)", border: "1px solid rgba(201, 162, 39, 0.3)" }}>
                      <span className="text-2xl">✨</span>
                    </div>
                    <h4 className="text-white font-medium mb-1">Chat with Stella</h4>
                    <p className="text-white/50 text-sm">Ask about your chart, love, career, or anything cosmic.</p>
                  </div>
                )}

                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-[85%] px-4 py-3 rounded-2xl text-sm"
                      style={{
                        background: msg.role === "user" ? "rgba(201, 162, 39, 0.2)" : "rgba(255,255,255,0.05)",
                        color: msg.role === "user" ? "#E8C547" : "rgba(255,255,255,0.9)",
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <Loader2 size={16} className="animate-spin text-white/50" />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Section - FIXED at bottom with absolute positioning */}
              <div
                className="absolute left-0 right-0 bottom-0 px-4 pb-4"
                style={{ background: "rgba(10, 10, 20, 0.98)" }}
              >
                {/* Quick Replies */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                  {quickReplies.map(qr => (
                    <button
                      key={qr.label}
                      onClick={() => { setInput(qr.prompt); }}
                      className="flex-shrink-0 px-4 py-2 rounded-full text-sm"
                      style={{
                        background: "rgba(201, 162, 39, 0.1)",
                        border: "1px solid rgba(201, 162, 39, 0.3)",
                        color: "#E8C547",
                      }}
                    >
                      {qr.label}
                    </button>
                  ))}
                </div>

                {/* Remaining */}
                <p className="text-white/30 text-xs text-center mb-2">{remaining} messages left today</p>

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    placeholder="Ask Stella anything..."
                    className="flex-1 px-4 py-3 rounded-full text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-yellow-500/50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{
                      background: input.trim() ? "linear-gradient(135deg, #C9A227, #E8C547)" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    <Send size={18} className={input.trim() ? "text-black" : "text-white/30"} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
