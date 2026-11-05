"use client";

import { useState, useEffect } from "react";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import { useExport } from "@/hooks/useExport";
import { ChatSearch } from "./ChatSearch";
import { MemoryPanel } from "@/components/MemoryPanel";

const NAV_ITEMS = [
  {
    id: "home", label: "Home",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
          fill={active ? "var(--blue)" : "none"}
          stroke={active ? "var(--blue)" : "var(--text-secondary)"}
          strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "chat", label: "Chat",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="13" rx="2"
          stroke={active ? "var(--blue)" : "var(--text-secondary)"} strokeWidth="1.8" />
        <path d="M7 20L3 17h7"
          stroke={active ? "var(--blue)" : "var(--text-secondary)"} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "explore", label: "Explore",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9"
          stroke={active ? "var(--blue)" : "var(--text-secondary)"} strokeWidth="1.8" />
        <path d="M16 8L13 13L8 16L11 11L16 8Z"
          stroke={active ? "var(--blue)" : "var(--text-secondary)"} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "images", label: "Images",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2"
          stroke={active ? "var(--blue)" : "var(--text-secondary)"} strokeWidth="1.8" />
        <circle cx="8.5" cy="10.5" r="1.5"
          stroke={active ? "var(--blue)" : "var(--text-secondary)"} strokeWidth="1.5" />
        <path d="M5 19L9 14L12 17L15 13L19 19"
          stroke={active ? "var(--blue)" : "var(--text-secondary)"} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "videos", label: "Videos",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="6" width="14" height="12" rx="2"
          stroke={active ? "var(--blue)" : "var(--text-secondary)"} strokeWidth="1.8" />
        <path d="M16 10L22 7V17L16 14V10Z"
          stroke={active ? "var(--blue)" : "var(--text-secondary)"} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "music", label: "Music",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M9 18V6L21 4V16"
          stroke={active ? "var(--blue)" : "var(--text-secondary)"} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="6" cy="18" r="3"
          stroke={active ? "var(--blue)" : "var(--text-secondary)"} strokeWidth="1.8" />
        <circle cx="18" cy="16" r="3"
          stroke={active ? "var(--blue)" : "var(--text-secondary)"} strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: "more", label: "More",
    icon: (_active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="5"  cy="12" r="1.5" fill="var(--text-secondary)" />
        <circle cx="12" cy="12" r="1.5" fill="var(--text-secondary)" />
        <circle cx="19" cy="12" r="1.5" fill="var(--text-secondary)" />
      </svg>
    ),
  },
];

interface Props {
  onClose?: () => void;
  onSettingsOpen?: () => void;
  activeNav: string;
  onNavChange: (id: string) => void;
}

export function Sidebar({ onClose, onSettingsOpen, activeNav, onNavChange }: Props) {
  const {
    filteredConversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
  } = useChatStore();

  const [mounted, setMounted] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const { profile } = useUserStore();
  const { exportAsMarkdown, exportAsText } = useExport();
  const initial = (profile.avatar ?? profile.name.charAt(0)).toUpperCase();

  useEffect(() => { setMounted(true); }, []);

  const recent = mounted ? filteredConversations().slice(0, 10) : [];

  const handleNav = (id: string) => {
    onNavChange(id);
    if (id === "home") setActiveConversation(null);
    else if (id === "chat") createConversation();
    onClose?.();
  };

  const navItemStyle = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "10px 16px",
    borderRadius: 9999,
    border: "none",
    cursor: "pointer",
    fontSize: 15,
    fontWeight: active ? 600 : 400,
    color: active ? "var(--blue)" : "var(--text-secondary)",
    background: active ? "var(--sidebar-active)" : "transparent",
    width: "100%",
    textAlign: "left",
    transition: "background 0.15s, color 0.15s",
    fontFamily: "inherit",
  });

  return (
    <aside
      style={{
        width: 300,
        minWidth: 300,
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "background 0.2s",
      }}
      aria-label="Sidebar"
    >
      {/* ── Logo row ── */}
      <div style={{ padding: "16px 16px 10px", display: "flex", alignItems: "center", gap: 10 }}>
        <button
          aria-label="Close menu"
          onClick={onClose}
          style={{
            width: 40, height: 40, borderRadius: 9999, border: "none",
            background: "transparent", cursor: "pointer", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--sidebar-hover)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18"
              stroke="var(--text-secondary)" strokeWidth="1.9" strokeLinecap="round" />
          </svg>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <GeminiStar />
          <span style={{
            fontSize: 22, fontWeight: 400, letterSpacing: "-0.3px", lineHeight: 1,
            color: "var(--text)",
          }}>
            Gemini
          </span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ padding: "4px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(({ id, label, icon }) => {
          const active = activeNav === id;
          return (
            <button
              key={id}
              onClick={() => handleNav(id)}
              aria-current={active ? "page" : undefined}
              style={navItemStyle(active)}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--sidebar-hover)"; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              {icon(active)}
              {label}
            </button>
          );
        })}
      </nav>

      {/* ── Divider ── */}
      <div style={{ margin: "8px 16px", height: 1, background: "var(--border)" }} />

      {/* ── Search ── */}
      <ChatSearch />

      {/* ── Recent ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
        {recent.length > 0 && (
          <>
            <p style={{
              padding: "4px 16px 6px", fontSize: 12,
              fontWeight: 600, color: "var(--text-muted)",
              textTransform: "uppercase", letterSpacing: "0.05em",
            }}>
              Recent
            </p>
            {recent.map((conv) => {
              const isActive = activeConversationId === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => { setActiveConversation(conv.id); setActiveNav("chat"); onClose?.(); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "9px 16px", borderRadius: 9999, border: "none",
                    cursor: "pointer", fontSize: 14,
                    color: isActive ? "var(--blue)" : "var(--text-secondary)",
                    background: isActive ? "var(--sidebar-active)" : "transparent",
                    width: "100%", textAlign: "left",
                    transition: "background 0.15s", overflow: "hidden",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--sidebar-hover)"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M4 4h16a1 1 0 011 1v10a1 1 0 01-1 1H7l-4 4V5a1 1 0 011-1z"
                      stroke="var(--text-placeholder)" strokeWidth="1.6" strokeLinejoin="round" />
                  </svg>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {conv.title}
                  </span>
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* ── Memory panel ── */}
      <MemoryPanel />

      {/* ── Export current conversation ── */}
      {mounted && activeConversationId && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "8px 10px" }}>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => { const c = useChatStore.getState().getActiveConversation(); if (c) exportAsMarkdown(c); }}
              style={{
                flex: 1, padding: "6px 0", borderRadius: 9999,
                border: "1px solid var(--border)", background: "transparent",
                color: "var(--text-muted)", cursor: "pointer",
                fontSize: 11, fontFamily: "inherit", transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              ⬇ Markdown
            </button>
            <button
              onClick={() => { const c = useChatStore.getState().getActiveConversation(); if (c) exportAsText(c); }}
              style={{
                flex: 1, padding: "6px 0", borderRadius: 9999,
                border: "1px solid var(--border)", background: "transparent",
                color: "var(--text-muted)", cursor: "pointer",
                fontSize: 11, fontFamily: "inherit", transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              ⬇ Text
            </button>
          </div>
        </div>
      )}
      <div style={{ borderTop: "1px solid var(--border)", padding: "10px 8px" }}>
        <button
          onClick={onSettingsOpen}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "8px 12px", borderRadius: 9999, border: "none",
            cursor: "pointer", background: "transparent",
            width: "100%", textAlign: "left",
            transition: "background 0.15s", fontFamily: "inherit",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--sidebar-hover)")}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          aria-label="Account settings"
        >
          <div style={{
            width: 36, height: 36, borderRadius: 9999, background: "#1a73e8",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 500, userSelect: "none" }}>{initial}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile.name}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile.isGuest ? "Guest — tap to sign in" : profile.email}
            </p>
          </div>
          {/* Settings cog */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="3" stroke="var(--text-muted)" strokeWidth="1.7"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="var(--text-muted)" strokeWidth="1.7"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}

function GeminiStar() {
  return (
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="sbStar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#4285f4" />
          <stop offset="45%"  stopColor="#9c27b0" />
          <stop offset="100%" stopColor="#e91e63" />
        </linearGradient>
      </defs>
      <path
        d="M14 2C14 2 15.5 9 19 13C23 17 26 14 26 14C26 14 23 11 19 15C15.5 19 14 26 14 26C14 26 12.5 19 9 15C5 11 2 14 2 14C2 14 5 17 9 13C12.5 9 14 2 14 2Z"
        fill="url(#sbStar)"
      />
    </svg>
  );
}
