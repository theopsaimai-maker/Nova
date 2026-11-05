"use client";

import { useState, useEffect, useRef } from "react";
import { useChatStore } from "@/store/chatStore";

interface SearchResult {
  conversationId: string;
  conversationTitle: string;
  messageId: string;
  snippet: string;
  role: "user" | "assistant";
}

export function ChatSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { conversations, setActiveConversation } = useChatStore();

  // Search across all conversations + messages
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) {
      setResults([]);
      return;
    }

    const found: SearchResult[] = [];

    for (const conv of conversations) {
      // Match conversation title
      if (conv.title.toLowerCase().includes(q)) {
        found.push({
          conversationId: conv.id,
          conversationTitle: conv.title,
          messageId: "",
          snippet: conv.title,
          role: "user",
        });
      }

      // Match message content
      for (const msg of conv.messages ?? []) {
        if (msg.role !== "user" && msg.role !== "assistant") continue;
        const idx = msg.content.toLowerCase().indexOf(q);
        if (idx === -1) continue;

        // Extract snippet around the match
        const start = Math.max(0, idx - 30);
        const end = Math.min(msg.content.length, idx + q.length + 60);
        const snippet =
          (start > 0 ? "…" : "") +
          msg.content.slice(start, end).replace(/\n/g, " ") +
          (end < msg.content.length ? "…" : "");

        found.push({
          conversationId: conv.id,
          conversationTitle: conv.title,
          messageId: msg.id,
          snippet,
          role: msg.role,
        });
      }

      if (found.length >= 12) break;
    }

    setResults(found.slice(0, 12));
  }, [query, conversations]);

  const handleSelect = (r: SearchResult) => {
    setActiveConversation(r.conversationId);
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setQuery(""); setResults([]); setOpen(false); }
  };

  // Highlight matching text
  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: "var(--blue-hover)", color: "var(--blue)", borderRadius: 2, padding: "0 1px" }}>
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <div style={{ padding: "0 8px 8px", position: "relative" }}>
      {/* Search input */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "7px 12px", borderRadius: 9999,
        border: `1.5px solid ${open ? "var(--blue)" : "var(--border-strong)"}`,
        background: "var(--surface)",
        transition: "border-color 0.15s",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="11" cy="11" r="7" stroke="var(--text-muted)" strokeWidth="1.8"/>
          <path d="M16.5 16.5L21 21" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search conversations…"
          aria-label="Search conversations"
          style={{
            flex: 1, border: "none", background: "transparent",
            outline: "none", fontSize: 13, color: "var(--text)",
            fontFamily: "inherit",
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setOpen(false); inputRef.current?.focus(); }}
            aria-label="Clear search"
            style={{
              width: 16, height: 16, borderRadius: 9999, border: "none",
              background: "var(--text-muted)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, color: "var(--bg)", fontSize: 10, lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {open && query.length >= 2 && (
        <div style={{
          position: "absolute", top: "calc(100% + 2px)", left: 8, right: 8,
          zIndex: 50, background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 12, boxShadow: "var(--shadow-md)",
          maxHeight: 320, overflowY: "auto",
        }}>
          {results.length === 0 ? (
            <p style={{ padding: "16px", fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
              No results for "{query}"
            </p>
          ) : (
            <div style={{ padding: 6 }}>
              <p style={{
                padding: "6px 10px 4px",
                fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              {results.map((r, i) => (
                <button
                  key={`${r.conversationId}-${r.messageId}-${i}`}
                  onClick={() => handleSelect(r)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "flex-start",
                    gap: 3, width: "100%", padding: "9px 12px", borderRadius: 9,
                    border: "none", background: "transparent", cursor: "pointer",
                    textAlign: "left", fontFamily: "inherit", transition: "background 0.12s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Conversation title */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M4 4h16a1 1 0 011 1v10a1 1 0 01-1 1H7l-4 4V5a1 1 0 011-1z"
                        stroke="var(--text-muted)" strokeWidth="1.6" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                      {highlight(r.conversationTitle, query)}
                    </span>
                  </div>
                  {/* Snippet */}
                  {r.messageId && (
                    <p style={{
                      fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4,
                      paddingLeft: 18,
                      overflow: "hidden", textOverflow: "ellipsis",
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    } as React.CSSProperties}>
                      {highlight(r.snippet, query)}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
