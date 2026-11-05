"use client";

import { useState, useRef, useEffect } from "react";
import { useUserStore, MODELS } from "@/store/userStore";

export function ModelPicker() {
  const { settings, setSettings } = useUserStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = MODELS.find((m) => m.id === settings.model) ?? MODELS[0];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch AI model"
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 12px", borderRadius: 9999,
          border: "1px solid var(--border-strong)",
          background: "var(--bg)", cursor: "pointer",
          fontSize: 12, fontWeight: 500, color: "var(--text-secondary)",
          transition: "background 0.15s", fontFamily: "inherit",
          maxWidth: 180,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
        onMouseLeave={e => (e.currentTarget.style.background = "var(--bg)")}
      >
        {/* Bot icon */}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="8" width="18" height="12" rx="3" stroke="var(--text-muted)" strokeWidth="1.7" />
          <path d="M8 8V6a4 4 0 018 0v2" stroke="var(--text-muted)" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="9" cy="14" r="1.5" fill="var(--text-muted)" />
          <circle cx="15" cy="14" r="1.5" fill="var(--text-muted)" />
        </svg>
        <span className="model-label" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {current.label}
        </span>
        {/* Chevron */}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
          <path d="M6 9l6 6 6-6" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="AI model"
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0,
            minWidth: 240, zIndex: 40,
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            boxShadow: "var(--shadow-md)",
            padding: 6,
            overflow: "hidden",
          }}
        >
          {MODELS.map((m) => {
            const isActive = settings.model === m.id;
            return (
              <button
                key={m.id}
                role="option"
                aria-selected={isActive}
                onClick={() => { setSettings({ model: m.id }); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", padding: "10px 12px", borderRadius: 10,
                  border: "none", background: isActive ? "var(--blue-hover)" : "transparent",
                  cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                  transition: "background 0.12s",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "var(--surface)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <div>
                  <p style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? "var(--blue)" : "var(--text)" }}>
                    {m.label}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                    {m.description}
                  </p>
                </div>
                {isActive && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="var(--blue)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
