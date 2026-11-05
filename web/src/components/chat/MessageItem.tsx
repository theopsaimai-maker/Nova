"use client";

import { useState, useEffect } from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { SuggestedFollowUps } from "./SuggestedFollowUps";
import { useTextToSpeech } from "@/hooks/useSpeech";
import { useMemoryStore, extractFacts } from "@/store/memoryStore";
import type { Message } from "@/lib/types";

interface Props {
  message: Message;
  onFeedback?: (id: string, feedback: "up" | "down" | null) => void;
  onRegenerate?: (id: string) => void;
  onFollowUp?: (text: string) => void;
  isLast?: boolean;
  isGenerating?: boolean;
}

export function MessageItem({ message, onFeedback, onRegenerate, onFollowUp, isLast, isGenerating }: Props) {
  const [copied, setCopied] = useState(false);
  const { speaking, supported: ttsSupported, speak, stop: stopSpeech } = useTextToSpeech();
  const { addFact, enabled: memoryEnabled } = useMemoryStore();
  const isUser = message.role === "user";

  // Auto-extract facts when a non-streaming assistant message finishes
  useEffect(() => {
    if (!isUser && !message.isStreaming && message.content && memoryEnabled) {
      const facts = extractFacts(message.content);
      facts.forEach(f => addFact(f, "auto"));
    }
  // only run when streaming stops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.isStreaming]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div style={{
          maxWidth: "72%",
          background: "var(--user-bubble)",
          borderRadius: 20,
          padding: "12px 18px",
          fontSize: 15,
          color: "var(--text)",
          lineHeight: 1.55,
          wordBreak: "break-word",
        }}>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <div style={{ width: "100%", maxWidth: "100%" }} className="group">
        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <defs>
              <linearGradient id="miStar" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#4285f4" />
                <stop offset="50%"  stopColor="#9c27b0" />
                <stop offset="100%" stopColor="#e91e63" />
              </linearGradient>
            </defs>
            <path d="M14 2C14 2 15.5 9 19 13C23 17 26 14 26 14C26 14 23 11 19 15C15.5 19 14 26 14 26C14 26 12.5 19 9 15C5 11 2 14 2 14C2 14 5 17 9 13C12.5 9 14 2 14 2Z" fill="url(#miStar)" />
          </svg>
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Gemini</span>
        </div>

        {/* Typing indicator */}
        {message.isStreaming && !message.content ? (
          <div style={{ display: "flex", gap: 5, paddingLeft: 36, paddingTop: 4 }}>
            {[0,1,2].map((i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: 9999,
                background: "var(--text-placeholder)",
                animation: `bounceDot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        ) : (
          <div style={{ paddingLeft: 36 }}>
            <MarkdownRenderer content={message.content} isStreaming={message.isStreaming} />
          </div>
        )}

        {/* Action bar */}
        {!message.isStreaming && message.content && (
          <div
            style={{
              display: "flex", alignItems: "center", gap: 2,
              marginTop: 8, paddingLeft: 36,
              opacity: isLast ? 1 : 0,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => { if (!isLast) e.currentTarget.style.opacity = "0"; }}
          >
            <MsgBtn onClick={handleCopy} label="Copy">
              {copied
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="var(--text-muted)" strokeWidth="1.7"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="var(--text-muted)" strokeWidth="1.7"/></svg>
              }
            </MsgBtn>

            {ttsSupported && (
              <MsgBtn onClick={() => speaking ? stopSpeech() : speak(message.content)} label={speaking ? "Stop" : "Read aloud"} active={speaking}>
                {speaking
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="6" y="4" width="4" height="16" rx="1" fill="var(--blue)"/><rect x="14" y="4" width="4" height="16" rx="1" fill="var(--blue)"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M11 5L6 9H2v6h4l5 4V5z" stroke="var(--text-muted)" strokeWidth="1.7" strokeLinejoin="round"/><path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" stroke="var(--text-muted)" strokeWidth="1.7" strokeLinecap="round"/></svg>
                }
              </MsgBtn>
            )}

            <MsgBtn onClick={() => onFeedback?.(message.id, message.feedback === "up" ? null : "up")} label="Good" active={message.feedback === "up"}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M14 9V5a3 3 0 00-3-3L7 14v7h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" stroke={message.feedback === "up" ? "var(--blue)" : "var(--text-muted)"} strokeWidth="1.7" strokeLinejoin="round"/>
                <path d="M7 14H4a2 2 0 00-2 2v5a2 2 0 002 2h3" stroke={message.feedback === "up" ? "var(--blue)" : "var(--text-muted)"} strokeWidth="1.7"/>
              </svg>
            </MsgBtn>

            <MsgBtn onClick={() => onFeedback?.(message.id, message.feedback === "down" ? null : "down")} label="Bad" active={message.feedback === "down"}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10z" stroke={message.feedback === "down" ? "var(--red)" : "var(--text-muted)"} strokeWidth="1.7" strokeLinejoin="round"/>
                <path d="M17 10h2.67A2.31 2.31 0 0022 8V3a2.31 2.31 0 00-2.33-2H17" stroke={message.feedback === "down" ? "var(--red)" : "var(--text-muted)"} strokeWidth="1.7"/>
              </svg>
            </MsgBtn>

            {isLast && onRegenerate && (
              <MsgBtn onClick={() => onRegenerate(message.id)} label="Regenerate">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M1 4v6h6" stroke="var(--text-muted)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3.51 15a9 9 0 102.13-9.36L1 10" stroke="var(--text-muted)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </MsgBtn>
            )}
          </div>
        )}

        {/* Suggested follow-ups — only on last assistant message */}
        {isLast && !isUser && onFollowUp && (
          <SuggestedFollowUps
            response={message.content}
            onSelect={onFollowUp}
            isGenerating={isGenerating ?? false}
          />
        )}
      </div>
    </div>
  );
}

function MsgBtn({ children, onClick, label, active }: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <button onClick={onClick} aria-label={label} title={label} style={{
      width: 32, height: 32, borderRadius: 9999, border: "none",
      background: active ? "var(--blue-hover)" : "transparent",
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      transition: "background 0.15s",
    }}
    onMouseEnter={e => (e.currentTarget.style.background = active ? "var(--blue-light)" : "var(--surface)")}
    onMouseLeave={e => (e.currentTarget.style.background = active ? "var(--blue-hover)" : "transparent")}
    >
      {children}
    </button>
  );
}
