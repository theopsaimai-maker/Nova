"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatView } from "@/components/chat/ChatView";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import { SettingsModal } from "@/components/SettingsModal";
import { ModelPicker } from "@/components/ModelPicker";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import { useSupabaseSync } from "@/hooks/useSupabaseSync";

export default function Home() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

function AppShell() {
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("home");

  const { status: syncStatus } = useSupabaseSync();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("nova-chat-store");
      if (raw) {
        const parsed = JSON.parse(raw);
        if ((parsed.version ?? 0) < 3) localStorage.removeItem("nova-chat-store");
      }
    } catch {
      localStorage.removeItem("nova-chat-store");
    }
    useChatStore.persist.rehydrate();
    useUserStore.persist.rehydrate?.();
    if (window.innerWidth < 768) setSidebarOpen(false);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div style={{ display: "flex", height: "100dvh", width: "100vw", overflow: "hidden", background: "var(--bg)" }}>
        <div style={{ width: 300, minWidth: 300, background: "var(--sidebar-bg)" }} />
        <div style={{ flex: 1, background: "var(--bg)" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100dvh", width: "100vw", overflow: "hidden", background: "var(--bg)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative z-30 md:z-auto h-full transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ width: 300, minWidth: 300, flexShrink: 0 }}
      >
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          onSettingsOpen={() => setSettingsOpen(true)}
          activeNav={activeNav}
          onNavChange={(nav) => {
            setActiveNav(nav);
            if (window.innerWidth < 768) setSidebarOpen(false);
          }}
        />
      </div>

      {/* Main */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, overflow: "hidden", background: "var(--bg)" }}>
        <TopBar
          onMenuClick={() => setSidebarOpen((v) => !v)}
          onSettingsOpen={() => setSettingsOpen(true)}
          syncStatus={syncStatus}
        />
        <ChatView activeNav={activeNav} onNavChange={setActiveNav} />
      </div>

      {/* Settings modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

function TopBar({ onMenuClick, onSettingsOpen, syncStatus }: {
  onMenuClick: () => void;
  onSettingsOpen: () => void;
  syncStatus: "idle" | "syncing" | "synced" | "error" | "offline";
}) {
  const { theme, setTheme } = useTheme();
  const { profile } = useUserStore();

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const themeIcon = theme === "dark"
    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round"/></svg>
    : theme === "light"
    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="5" stroke="var(--text-secondary)" strokeWidth="1.8"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round"/></svg>
    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="var(--text-secondary)" strokeWidth="1.8"/><path d="M8 21h8M12 17v4" stroke="var(--text-secondary)" strokeWidth="1.8" strokeLinecap="round"/></svg>;

  const initial = (profile.avatar ?? profile.name.charAt(0)).toUpperCase();

  // Sync status dot
  const syncDot = {
    idle:    { color: "transparent", title: "" },
    syncing: { color: "#f59e0b",     title: "Syncing…" },
    synced:  { color: "#34a853",     title: "Saved to cloud" },
    error:   { color: "#ea4335",     title: "Sync error" },
    offline: { color: "#9aa0a6",     title: "Offline — changes saved locally" },
  }[syncStatus];

  return (
    <header style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 16px", flexShrink: 0,
      borderBottom: "1px solid var(--border)", background: "var(--bg)",
      gap: 8,
    }}>
      {/* Left: mobile hamburger */}
      <IconBtn onClick={onMenuClick} label="Open menu" className="md:hidden">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="var(--text-secondary)" strokeWidth="1.9" strokeLinecap="round"/>
        </svg>
      </IconBtn>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
        {/* Model picker */}
        <ModelPicker />

        {/* Theme toggle */}
        <IconBtn onClick={cycleTheme} label={`Theme: ${theme}`}>
          {themeIcon}
        </IconBtn>

        {/* Settings */}
        <IconBtn onClick={onSettingsOpen} label="Settings">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="var(--text-secondary)" strokeWidth="1.8"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="var(--text-secondary)" strokeWidth="1.8"/>
          </svg>
        </IconBtn>

        {/* Upgrade */}
        <button
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 9999,
            border: "1px solid var(--border-strong)",
            background: "var(--bg)", cursor: "pointer",
            fontSize: 13, fontWeight: 500, color: "var(--blue)",
            transition: "background 0.15s", fontFamily: "inherit",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "var(--blue-hover)")}
          onMouseLeave={e => (e.currentTarget.style.background = "var(--bg)")}
          className="hidden sm:flex"
        >
          <svg width="13" height="13" viewBox="0 0 28 28" fill="none">
            <defs><linearGradient id="upStar" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4285f4"/><stop offset="100%" stopColor="#9c27b0"/></linearGradient></defs>
            <path d="M14 2C14 2 15.5 9 19 13C23 17 26 14 26 14C26 14 23 11 19 15C15.5 19 14 26 14 26C14 26 12.5 19 9 15C5 11 2 14 2 14C2 14 5 17 9 13C12.5 9 14 2 14 2Z" fill="url(#upStar)"/>
          </svg>
          Upgrade
        </button>

        {/* Avatar — clicking opens settings Account tab */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={onSettingsOpen}
            aria-label="Account settings"
            style={{
              width: 34, height: 34, borderRadius: 9999, border: "none",
              background: "#1a73e8", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 600, userSelect: "none" }}>
              {initial}
            </span>
          </button>
          {/* Sync status dot */}
          {syncDot.color !== "transparent" && (
            <div
              title={syncDot.title}
              aria-label={syncDot.title}
              style={{
                position: "absolute", bottom: 0, right: 0,
                width: 10, height: 10, borderRadius: 9999,
                background: syncDot.color,
                border: "2px solid var(--bg)",
                animation: syncStatus === "syncing" ? "syncPulse 1.2s ease-in-out infinite" : "none",
              }}
            />
          )}
          <style>{`@keyframes syncPulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
        </div>
      </div>
    </header>
  );
}

function IconBtn({ children, onClick, label, className }: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={className}
      style={{
        width: 36, height: 36, borderRadius: 9999, border: "none",
        background: "transparent", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </button>
  );
}
