"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePalm } from "../lib/palm-state";
import StellaPersona from "../components/StellaPersona";
import type { ChatMessage, PalmReading } from "../types";

// Suggested questions
const SUGGESTED_QUESTIONS = [
  "What does my heart line say about love?",
  "Tell me more about my career path",
  "What should I focus on this year?",
  "How can I use my strengths?",
];

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-gold-main/20 border border-gold-main/30"
            : "bg-white/5 border border-white/10"
        }`}
      >
        <p className={`text-sm leading-relaxed ${isUser ? "text-white" : "text-white/80"}`}>
          {message.content}
        </p>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex justify-start"
    >
      <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-gold-main/60"
              animate={{
                y: [0, -5, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Screen05Chat() {
  const { state, dispatch } = usePalm();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get reading context for chat
  const reading: PalmReading | undefined = state.analysisResult?.openaiResult?.reading;

  // Initialize with Stella's greeting
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const greeting: ChatMessage = {
      id: "greeting",
      role: "assistant",
      content: reading?.advice ||
        "I've shared what I see in your palm. What would you like to explore further? I'm here to guide you through the mysteries your lines reveal.",
      timestamp: new Date().toISOString(),
    };
    return [greeting];
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Send message
  const handleSend = async (text?: string) => {
    const message = text || inputValue.trim();
    if (!message || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/palm/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          readingContext: reading || {
            summary: "A palm reading was performed.",
            traits: [],
            insights: { love: "", career: "", health: "", spirituality: "" },
            advice: "",
            stellaQuote: "",
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Error response
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I sense some cosmic interference... Could you ask that again?",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "The stars seem clouded at the moment. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
        <StellaPersona quote="" variant="avatar-only" />
        <div>
          <h2 className="text-white font-medium">Chat with Stella</h2>
          <p className="text-white/50 text-xs">Ask about your reading</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        <AnimatePresence>{isLoading && <TypingIndicator />}</AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions (show only if few messages) */}
      <AnimatePresence>
        {messages.length <= 2 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-2"
          >
            <p className="text-white/40 text-xs mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-xs px-3 py-1.5 rounded-full text-white/70 hover:text-white transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {q}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div
        className="p-4 border-t border-white/10"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Stella anything..."
            className="flex-1 bg-transparent text-white placeholder-white/40 text-sm outline-none"
            disabled={isLoading}
          />
          <motion.button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            className="p-2 rounded-lg disabled:opacity-40 transition-opacity"
            style={{
              background: inputValue.trim()
                ? "linear-gradient(135deg, #E8C547, #C9A227)"
                : "rgba(255,255,255,0.1)",
            }}
            whileHover={{ scale: inputValue.trim() ? 1.05 : 1 }}
            whileTap={{ scale: inputValue.trim() ? 0.95 : 1 }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={inputValue.trim() ? "#050510" : "currentColor"}
              strokeWidth="2"
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </motion.button>
        </div>

        {/* Back to results */}
        <button
          onClick={() => dispatch({ type: "PREV_STEP" })}
          className="w-full mt-3 text-white/40 text-xs hover:text-white/60 transition-colors"
        >
          ← Back to your reading
        </button>
      </div>
    </div>
  );
}
