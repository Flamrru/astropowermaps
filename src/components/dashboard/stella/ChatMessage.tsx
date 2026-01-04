"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ChatMessage as ChatMessageType } from "@/lib/dashboard-types";
import RichMessageRenderer from "./RichMessageRenderer";

interface ChatMessageProps {
  message: ChatMessageType;
  isLast: boolean;
}

/**
 * ChatMessage
 *
 * Individual message bubble with different styling for user vs assistant.
 * User messages: right-aligned, gold gradient
 * Assistant messages: left-aligned, glass effect with Stella avatar
 */
export default function ChatMessage({ message, isLast }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
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

      {/* Message bubble */}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isUser ? "rounded-br-sm" : "rounded-bl-sm"
        }`}
        style={
          isUser
            ? {
                background:
                  "linear-gradient(135deg, rgba(201, 162, 39, 0.25) 0%, rgba(201, 162, 39, 0.15) 100%)",
                border: "1px solid rgba(201, 162, 39, 0.3)",
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
            color: isUser ? "rgba(232, 197, 71, 0.95)" : "rgba(255, 255, 255, 0.9)",
          }}
        >
          {isUser ? (
            message.content
          ) : (
            <RichMessageRenderer content={message.content} />
          )}
        </div>
      </div>
    </motion.div>
  );
}
