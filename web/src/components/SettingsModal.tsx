"use client";

import { useEffect, useRef, useState } from "react";
import { useUserStore, MODELS } from "@/store/userStore";
import { useTheme } from "@/components/ThemeProvider";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: Props) {
  const { settings, setSettings, profile, setProfile, signOut } = useUserStore();
  const { setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"general" | "model" | "instructions" | "account">("general");
  const [instructions, setInstructions] = useState(settings.customInstructions);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync instructions on open
  useEffect(() => {
    if (open) setInstructions(settings.customInstructions);
  }, [open, settings.customInstructions]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const saveInstructions = () => {
    setSettings({ customInstructions: instructions });
  };

  if (!open) return null;

  const TABS = [
    { id: "general",      label: "General",      icon: "⚙️" },
    { id: "model",        label: "AI Model",     icon: "🤖" },
    { id: "instructions", label: "Instructions", icon: "📝" },
    { id: "account",      label: "Account",      icon: "👤" },
  ] as const;

  return (
    /* Backdrop */
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      {/* Modal */}
      <div style={{
        width: "100%", maxWidth: 580, maxHeight: "90dvh",
        background: "var(--bg)",
        borderRadius: 20,
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-md)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        fontFamily: '"Google Sans","Roboto",system-ui,sans-serif',
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--border)",
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)" }}>Settings</h2>
          <button
            onClick={onClose}
            aria-label="Close settings"
            style={{
              width: 32, height: 32, borderRadius: 9999, border: "none",
              background: "transparent", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-muted)", fontSize: 18, transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Sidebar tabs */}
          <div style={{
            width: 160, flexShrink: 0,
            borderRight: "1px solid var(--border)",
            padding: "12px 8px",
            display: "flex", flexDirection: "column", gap: 2,
          }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 10, border: "none",
                  cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
                  color: activeTab === tab.id ? "var(--blue)" : "var(--text-secondary)",
                  background: activeTab === tab.id ? "var(--sidebar-active)" : "transparent",
                  width: "100%", textAlign: "left",
                  transition: "background 0.15s", fontFamily: "inherit",
                }}
                onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = "var(--surface)"; }}
                onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.background = "transparent"; }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

            {/* ── GENERAL ── */}
            {activeTab === "general" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <Section title="Theme">
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["light", "dark", "system"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => { setSettings({ theme: t }); setTheme(t); }}
                        style={{
                          flex: 1, padding: "8px 0", borderRadius: 10,
                          border: `1.5px solid ${settings.theme === t ? "var(--blue)" : "var(--border)"}`,
                          background: settings.theme === t ? "var(--blue-hover)" : "var(--surface)",
                          color: settings.theme === t ? "var(--blue)" : "var(--text-secondary)",
                          cursor: "pointer", fontSize: 13, fontWeight: settings.theme === t ? 600 : 400,
                          fontFamily: "inherit", transition: "all 0.15s", textTransform: "capitalize",
                        }}
                      >
                        {t === "light" ? "☀️ Light" : t === "dark" ? "🌙 Dark" : "🖥 System"}
                      </button>
                    ))}
                  </div>
                </Section>

                <Section title="Chat history">
                  <Toggle
                    label="Save conversation history"
                    description="Store chats in your browser's local storage"
                    checked={settings.historyEnabled}
                    onChange={(v) => setSettings({ historyEnabled: v })}
                  />
                </Section>
              </div>
            )}

            {/* ── MODEL ── */}
            {activeTab === "model" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>
                  Choose the AI model. The selected model applies to all new conversations.
                </p>
                {MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSettings({ model: m.id })}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 16px", borderRadius: 12,
                      background: settings.model === m.id ? "var(--blue-hover)" : "var(--surface)",
                      border: `1.5px solid ${settings.model === m.id ? "var(--blue)" : "transparent"}`,
                      cursor: "pointer", width: "100%",
                      transition: "all 0.15s", fontFamily: "inherit",
                    } as React.CSSProperties}
                    onMouseEnter={e => { if (settings.model !== m.id) e.currentTarget.style.background = "var(--surface-hover)"; }}
                    onMouseLeave={e => { if (settings.model !== m.id) e.currentTarget.style.background = "var(--surface)"; }}
                  >
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: settings.model === m.id ? "var(--blue)" : "var(--text)" }}>
                        {m.label}
                      </p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        {m.description}
                      </p>
                    </div>
                    {settings.model === m.id && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" fill="var(--blue)" />
                        <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ── INSTRUCTIONS ── */}
            {activeTab === "instructions" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 4 }}>
                    Custom instructions
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    Tell Gemini how to respond. This is added as a system prompt to every conversation.
                  </p>
                </div>
                <textarea
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder={'e.g. "Always respond in a concise, professional tone. Format code in TypeScript. I am a senior web developer."'}
                  rows={7}
                  style={{
                    width: "100%", padding: "12px 14px", borderRadius: 12,
                    border: "1.5px solid var(--border-strong)",
                    background: "var(--surface)", color: "var(--text)",
                    fontSize: 14, resize: "vertical", outline: "none",
                    lineHeight: 1.6, fontFamily: "inherit",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "var(--blue)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button
                    onClick={() => setInstructions("")}
                    style={{
                      padding: "8px 18px", borderRadius: 9999,
                      border: "1px solid var(--border)", background: "transparent",
                      color: "var(--text-secondary)", cursor: "pointer",
                      fontSize: 13, fontFamily: "inherit",
                    }}
                  >
                    Clear
                  </button>
                  <button
                    onClick={saveInstructions}
                    style={{
                      padding: "8px 18px", borderRadius: 9999, border: "none",
                      background: "var(--blue)", color: "#fff",
                      cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "inherit",
                    }}
                  >
                    Save
                  </button>
                </div>
                {settings.customInstructions && (
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    ✓ Custom instructions active ({settings.customInstructions.length} chars)
                  </p>
                )}
              </div>
            )}

            {/* ── ACCOUNT ── */}
            {activeTab === "account" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Profile card */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: 16, borderRadius: 14, background: "var(--surface)",
                  border: "1px solid var(--border)",
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 9999,
                    background: "#1a73e8", display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                  }}>
                    <span style={{ color: "#fff", fontSize: 20, fontWeight: 600 }}>
                      {(profile.avatar ?? profile.name.charAt(0)).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{profile.name}</p>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{profile.email}</p>
                    <span style={{
                      display: "inline-block", marginTop: 4, fontSize: 11,
                      padding: "2px 8px", borderRadius: 9999,
                      background: profile.isGuest ? "var(--surface-hover)" : "var(--blue-hover)",
                      color: profile.isGuest ? "var(--text-muted)" : "var(--blue)",
                      fontWeight: 500,
                    }}>
                      {profile.isGuest ? "Guest" : "Google account"}
                    </span>
                  </div>
                </div>

                {profile.isGuest ? (
                  <a
                    href="/sign-in"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      padding: "11px 20px", borderRadius: 9999, textDecoration: "none",
                      background: "var(--blue)", color: "#fff",
                      fontSize: 14, fontWeight: 500, fontFamily: "inherit",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="white"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white"/>
                    </svg>
                    Sign in with Google
                  </a>
                ) : (
                  <button
                    onClick={() => { signOut(); onClose(); }}
                    style={{
                      padding: "11px 20px", borderRadius: 9999,
                      border: "1px solid var(--border)", background: "transparent",
                      color: "var(--text-secondary)", cursor: "pointer",
                      fontSize: 14, fontFamily: "inherit",
                    }}
                  >
                    Sign out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
      <div>
        <p style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{label}</p>
        {description && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 9999, border: "none",
          background: checked ? "var(--blue)" : "var(--border-strong)",
          cursor: "pointer", position: "relative", flexShrink: 0,
          transition: "background 0.2s",
        }}
      >
        <div style={{
          position: "absolute", top: 3,
          left: checked ? 23 : 3,
          width: 18, height: 18, borderRadius: 9999,
          background: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );
}
