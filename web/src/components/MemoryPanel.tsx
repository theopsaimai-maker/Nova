"use client";

import { useState } from "react";
import { useMemoryStore } from "@/store/memoryStore";

export function MemoryPanel() {
  const { facts, enabled, addFact, deleteFact, clearAll, setEnabled } = useMemoryStore();
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  const handleAdd = () => {
    if (!input.trim()) return;
    addFact(input.trim(), "manual");
    setInput("");
  };

  return (
    <div style={{ borderTop: "1px solid var(--border)", marginTop: 4 }}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", padding: "10px 16px", border: "none",
          background: "transparent", cursor: "pointer", fontFamily: "inherit",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--sidebar-hover)")}
        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        aria-expanded={open}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z" stroke="var(--blue)" strokeWidth="1.7" strokeLinejoin="round"/>
            <path d="M9 21h6" stroke="var(--blue)" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
            Memory
          </span>
          {facts.length > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 600, minWidth: 18, height: 18,
              borderRadius: 9999, background: "var(--blue)", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 5px",
            }}>
              {facts.length}
            </span>
          )}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <path d="M6 9l6 6 6-6" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{ padding: "0 10px 12px" }}>
          {/* Enable toggle */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "6px 6px 10px",
          }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {enabled ? "Memory is on" : "Memory is off"}
            </span>
            <button
              role="switch"
              aria-checked={enabled}
              onClick={() => setEnabled(!enabled)}
              style={{
                width: 36, height: 20, borderRadius: 9999, border: "none",
                background: enabled ? "var(--blue)" : "var(--border-strong)",
                cursor: "pointer", position: "relative", transition: "background 0.2s",
              }}
            >
              <div style={{
                position: "absolute", top: 2,
                left: enabled ? 18 : 2,
                width: 16, height: 16, borderRadius: 9999,
                background: "#fff", transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }} />
            </button>
          </div>

          {/* Add fact input */}
          {enabled && (
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdd()}
                placeholder="Add a memory…"
                style={{
                  flex: 1, padding: "7px 10px", borderRadius: 9999,
                  border: "1px solid var(--border-strong)",
                  background: "var(--surface)", color: "var(--text)",
                  fontSize: 12, outline: "none", fontFamily: "inherit",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--blue)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
              />
              <button
                onClick={handleAdd}
                disabled={!input.trim()}
                aria-label="Save memory"
                style={{
                  width: 30, height: 30, borderRadius: 9999, border: "none",
                  background: input.trim() ? "var(--blue)" : "var(--border)",
                  cursor: input.trim() ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "background 0.15s",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12l7-7 7 7" stroke="var(--bg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}

          {/* Facts list */}
          {facts.length === 0 ? (
            <p style={{ fontSize: 12, color: "var(--text-placeholder)", textAlign: "center", padding: "8px 0" }}>
              No memories yet
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
              {facts.map((f) => (
                <div
                  key={f.id}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                    padding: "8px 10px", borderRadius: 10,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>
                    {f.source === "auto" ? "🤖" : "📌"}
                  </span>
                  <p style={{ flex: 1, fontSize: 12, color: "var(--text)", lineHeight: 1.5, wordBreak: "break-word" }}>
                    {f.text}
                  </p>
                  <button
                    onClick={() => deleteFact(f.id)}
                    aria-label="Delete memory"
                    style={{
                      width: 20, height: 20, borderRadius: 9999, border: "none",
                      background: "transparent", cursor: "pointer", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--text-placeholder)", transition: "color 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-placeholder)")}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Clear all */}
          {facts.length > 1 && (
            <button
              onClick={clearAll}
              style={{
                marginTop: 8, width: "100%", padding: "6px", borderRadius: 9999,
                border: "1px solid var(--border)", background: "transparent",
                color: "var(--text-muted)", cursor: "pointer",
                fontSize: 11, fontFamily: "inherit", transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              Clear all memories
            </button>
          )}
        </div>
      )}
    </div>
  );
}
