"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { RefreshCw } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/lib/dashboard-types";
import RichMessageRenderer from "./RichMessageRenderer";

interface ChatMessageProps {
  message: ChatMessageType;
  isLast: boolean;
  /** Callback to retry sending a failed message */
  onRetry?: () => void;
}

/**
 * ChatMessage
 *
 * Individual message bubble with different styling for user vs assistant.
 * User messages: right-aligned, gold gradient
 * Assistant messages: left-aligned, glass effect with Stella avatar
 * Failed messages: grayed out with retry button
 */
export default function ChatMessage({ message, isLast, onRetry }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isSending = message.status === "sending";
  const isFailed = message.status === "failed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isSending ? 0.6 : 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar (only for assistant) */}
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0"
          style={{
            border: "1.5px solid rgba(201, 162, 39, 0.4)",
          }}
        >
          <Image
            src="/images/stella.png"
            alt="Stella"
            width={32}
            height={32}
            className="w-full h-full object-cover object-top"
            style={{ transform: "scale(1.2)" }}
          />
        </div>
      )}

      {/* Message bubble + retry container */}
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%]`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser ? "rounded-br-sm" : "rounded-bl-sm"
          } ${isFailed ? "opacity-60" : ""}`}
          style={
            isUser
              ? {
                  background: isFailed
                    ? "linear-gradient(135deg, rgba(150, 120, 30, 0.2) 0%, rgba(150, 120, 30, 0.1) 100%)"
                    : "linear-gradient(135deg, rgba(201, 162, 39, 0.25) 0%, rgba(201, 162, 39, 0.15) 100%)",
                  border: isFailed
                    ? "1px solid rgba(239, 68, 68, 0.4)"
                    : "1px solid rgba(201, 162, 39, 0.3)",
                }
              : {
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }
          }
        >
          <div
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{
              color: isUser
                ? isFailed
                  ? "rgba(200, 160, 60, 0.7)"
                  : "rgba(232, 197, 71, 0.95)"
                : "rgba(255, 255, 255, 0.9)",
            }}
          >
            {isUser ? (
              message.content
            ) : (
              <RichMessageRenderer content={message.content} />
            )}
          </div>
        </div>

        {/* Retry button for failed messages */}
        {isFailed && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 mt-1.5 px-2.5 py-1 text-xs rounded-full transition-all hover:bg-red-500/20"
            style={{
              color: "rgba(239, 68, 68, 0.9)",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
            }}
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
