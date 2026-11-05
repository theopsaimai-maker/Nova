"use client";

import { useEffect, useRef, useState } from "react";
import { MessageItem } from "./MessageItem";
import type { Message } from "@/lib/types";

interface Props {
  messages: Message[];
  isGenerating: boolean;
  onFeedback: (id: string, feedback: "up" | "down" | null) => void;
  onRegenerate: (id: string) => void;
  onFollowUp: (text: string) => void;
}

export function MessageList({ messages, isGenerating, onFeedback, onRegenerate, onFollowUp }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showJump, setShowJump] = useState(false);
  const isNearBottom = useRef(true);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottom.current = dist < 120;
    setShowJump(dist > 200);
  };

  useEffect(() => {
    if (isNearBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    isNearBottom.current = true;
  }, [messages.length]);

  return (
    <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{ height: "100%", overflowY: "auto" }}
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {/* Responsive padding: 16px mobile, 40px desktop */}
        <div
          className="message-list-inner"
          style={{
            margin: "0 auto",
            maxWidth: 780,
            padding: "clamp(16px, 4vw, 32px) clamp(12px, 3vw, 24px)",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          {messages.map((msg, i) => (
            <MessageItem
              key={msg.id}
              message={msg}
              isLast={i === messages.length - 1}
              isGenerating={isGenerating}
              onFeedback={onFeedback}
              onRegenerate={onRegenerate}
              onFollowUp={onFollowUp}
            />
          ))}
          <div style={{ height: 8 }} />
          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </div>

      {/* Jump to bottom */}
      {showJump && (
        <button
          onClick={() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); setShowJump(false); }}
          aria-label="Jump to latest"
          style={{
            position: "absolute", bottom: 16,
            left: "50%", transform: "translateX(-50%)",
            zIndex: 10, display: "flex", alignItems: "center", gap: 6,
            padding: "7px 16px", borderRadius: 9999, border: "none",
            background: "var(--text)", color: "var(--bg)",
            fontSize: 12, fontWeight: 500, cursor: "pointer",
            boxShadow: "var(--shadow-md)", transition: "opacity 0.15s",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12l7 7 7-7" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Jump to latest
        </button>
      )}
    </div>
  );
}
