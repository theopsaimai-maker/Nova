"use client";

import { useState } from "react";

/* ── Shared icon set ─────────────────────────────────────────────────────── */
const ICONS = {
  brain: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M9.5 2C8 2 6.5 3 6.5 4.5C5 4.5 3.5 5.8 3.5 7.5C2 8 1 9.5 1 11C1 13 2.5 14.5 4 15C4 16.5 5 18 7 18.5L7 21H17V18.5C19 18 20 16.5 20 15C21.5 14.5 23 13 23 11C23 9.5 22 8 20.5 7.5C20.5 5.8 19 4.5 17.5 4.5C17.5 3 16 2 14.5 2C14 2 13.5 2.2 13 2.5C12.5 2.2 12 2 11.5 2H9.5Z" stroke="var(--blue)" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M12 7V14M9 9.5C9 9.5 10 10 12 10C14 10 15 9.5 15 9.5" stroke="var(--blue)" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  globe: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#34a853" strokeWidth="1.7"/>
      <path d="M12 3C12 3 9 7 9 12C9 17 12 21 12 21" stroke="#34a853" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 3C12 3 15 7 15 12C15 17 12 21 12 21" stroke="#34a853" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3.5 9H20.5M3.5 15H20.5" stroke="#34a853" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  wifi: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M5 12.55C8.27 9.28 13 8.28 17.5 9.5" stroke="#9c27b0" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M1.42 9C5.5 5 11 3.5 16.5 4.5" stroke="#9c27b0" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M8.53 16.11C10.35 14.29 13 13.7 15.5 14.5" stroke="#9c27b0" strokeWidth="1.7" strokeLinecap="round"/>
      <circle cx="12" cy="20" r="1.5" fill="#9c27b0"/>
    </svg>
  ),
  dna: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M7 3C7 3 7 8 12 12C17 16 17 21 17 21" stroke="#ea4335" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M17 3C17 3 17 8 12 12C7 16 7 21 7 21" stroke="#ea4335" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M8.5 6.5H15.5M8.5 17.5H15.5M7.5 11.5H16.5" stroke="#ea4335" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  rocket: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C12 2 17 5 17 12V16L12 21L7 16V12C7 5 12 2 12 2Z" stroke="#1a73e8" strokeWidth="1.7" strokeLinejoin="round"/>
      <circle cx="12" cy="10" r="2" stroke="#1a73e8" strokeWidth="1.5"/>
      <path d="M7 16L4 19M17 16L20 19" stroke="#1a73e8" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  robot: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="9" width="16" height="11" rx="3" stroke="#7c3aed" strokeWidth="1.7"/>
      <path d="M9 9V7a3 3 0 016 0v2" stroke="#7c3aed" strokeWidth="1.7" strokeLinecap="round"/>
      <circle cx="9" cy="14" r="1.5" fill="#7c3aed"/>
      <circle cx="15" cy="14" r="1.5" fill="#7c3aed"/>
      <path d="M9 18h6" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 6V3M10 3h4" stroke="#7c3aed" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  chart: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M3 17L8 12L12 15L17 9L21 11" stroke="#34a853" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 21H21" stroke="#34a853" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="17" cy="9" r="2" fill="#34a853" fillOpacity="0.3" stroke="#34a853" strokeWidth="1.3"/>
    </svg>
  ),
  palette: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C12.83 22 13.5 21.33 13.5 20.5C13.5 20.11 13.35 19.76 13.11 19.49C12.88 19.23 12.74 18.88 12.74 18.5C12.74 17.67 13.41 17 14.24 17H16C19.31 17 22 14.31 22 11C22 6.04 17.52 2 12 2Z" stroke="#db2777" strokeWidth="1.7" strokeLinejoin="round"/>
      <circle cx="6.5" cy="11.5" r="1.5" fill="#ea4335"/>
      <circle cx="9.5" cy="7.5" r="1.5" fill="#f59e0b"/>
      <circle cx="14.5" cy="7.5" r="1.5" fill="#34a853"/>
      <circle cx="17.5" cy="11.5" r="1.5" fill="#1a73e8"/>
    </svg>
  ),
  microscope: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M6 21H18" stroke="#1a73e8" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M12 21V17" stroke="#1a73e8" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M9 17H15" stroke="#1a73e8" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="#1a73e8" strokeWidth="1.7"/>
      <path d="M7 8H5M7 11H5" stroke="#1a73e8" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  // Video icons
  film: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="14" rx="3" stroke="#ea4335" strokeWidth="1.7"/>
      <path d="M7 5V19M17 5V19" stroke="#ea4335" strokeWidth="1.4"/>
      <path d="M2 9H7M17 9H22M2 15H7M17 15H22" stroke="#ea4335" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  script: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2" width="13" height="18" rx="2" stroke="#1a73e8" strokeWidth="1.7"/>
      <path d="M8 7H13M8 11H13M8 15H11" stroke="#1a73e8" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M17 6H19C20.1 6 21 6.9 21 8V20C21 21.1 20.1 22 19 22H8C6.9 22 6 21.1 6 20V20" stroke="#1a73e8" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  tv: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="4" width="20" height="14" rx="3" stroke="#9c27b0" strokeWidth="1.7"/>
      <path d="M8 22H16M12 18V22" stroke="#9c27b0" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 11L14 9V13L10 11Z" fill="#9c27b0" opacity="0.8"/>
    </svg>
  ),
  clapboard: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="7" width="20" height="14" rx="2" stroke="#7c3aed" strokeWidth="1.7"/>
      <path d="M2 11H22" stroke="#7c3aed" strokeWidth="1.4"/>
      <path d="M6 3L8 7M12 3L14 7M18 3L20 7" stroke="#7c3aed" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  // Music icons
  music: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M9 18V6L21 4V16" stroke="#1a73e8" strokeWidth="1.7" strokeLinecap="round"/>
      <circle cx="6" cy="18" r="3" stroke="#1a73e8" strokeWidth="1.6"/>
      <circle cx="18" cy="16" r="3" stroke="#1a73e8" strokeWidth="1.6"/>
    </svg>
  ),
  piano: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="5" width="20" height="15" rx="2" stroke="#9c27b0" strokeWidth="1.7"/>
      <rect x="5" y="5" width="3" height="9" rx="1" fill="#9c27b0" fillOpacity="0.8"/>
      <rect x="10" y="5" width="3" height="9" rx="1" fill="#9c27b0" fillOpacity="0.8"/>
      <rect x="15" y="5" width="3" height="9" rx="1" fill="#9c27b0" fillOpacity="0.8"/>
    </svg>
  ),
  mic: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="2" width="6" height="12" rx="3" stroke="#ea4335" strokeWidth="1.7"/>
      <path d="M5 11C5 14.87 8.13 18 12 18C15.87 18 19 14.87 19 11" stroke="#ea4335" strokeWidth="1.7" strokeLinecap="round"/>
      <line x1="12" y1="18" x2="12" y2="22" stroke="#ea4335" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="9" y1="22" x2="15" y2="22" stroke="#ea4335" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  drum: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="8" rx="9" ry="4" stroke="#34a853" strokeWidth="1.7"/>
      <path d="M3 8V16C3 18.2 7.03 20 12 20C16.97 20 21 18.2 21 16V8" stroke="#34a853" strokeWidth="1.7"/>
      <path d="M8 5L4 2M16 5L20 2" stroke="#34a853" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  headphones: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M3 18V12a9 9 0 0118 0v6" stroke="#7c3aed" strokeWidth="1.7" strokeLinecap="round"/>
      <rect x="1" y="15" width="4" height="7" rx="2" stroke="#7c3aed" strokeWidth="1.6"/>
      <rect x="19" y="15" width="4" height="7" rx="2" stroke="#7c3aed" strokeWidth="1.6"/>
    </svg>
  ),
  // More icons
  briefcase: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="8" width="20" height="13" rx="3" stroke="#1a73e8" strokeWidth="1.7"/>
      <path d="M16 8V6a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="#1a73e8" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M2 13h20" stroke="#1a73e8" strokeWidth="1.4"/>
    </svg>
  ),
  cooking: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C10 2 8.5 3.5 8.5 5.5H15.5C15.5 3.5 14 2 12 2Z" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M4 10C4 10 4 7 8 7H16C20 7 20 10 20 10V17C20 18.1 19.1 19 18 19H6C4.9 19 4 18.1 4 17V10Z" stroke="#f59e0b" strokeWidth="1.7"/>
      <path d="M4 10H20" stroke="#f59e0b" strokeWidth="1.4"/>
      <path d="M8 22H16M12 19V22" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  fitness: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M2 12H5M19 12H22M5 12V9a1 1 0 012 0v6a1 1 0 002 0V7a1 1 0 012 0v10a1 1 0 002 0V9a1 1 0 012 0v6" stroke="#34a853" strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  ),
  plane: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M21 16L13 8.5L14.5 3.5L12.5 3L9 7.5L4 6.5L2 8.5L7 10.5L4.5 13.5L6.5 14L8 12.5L11 14L8.5 20L10.5 20.5L14 16L17 17.5L16.5 20L18.5 20.5L20 18L22 18.5L21 16Z" stroke="#1a73e8" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  book: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M4 4H12V20H4C3.45 20 3 19.55 3 19V5C3 4.45 3.45 4 4 4Z" stroke="#9c27b0" strokeWidth="1.7" strokeLinejoin="round"/>
      <path d="M12 4H20C20.55 4 21 4.45 21 5V19C21 19.55 20.55 20 20 20H12V4Z" stroke="#9c27b0" strokeWidth="1.7" strokeLinejoin="round"/>
      <path d="M12 4V20" stroke="#9c27b0" strokeWidth="1.5"/>
      <path d="M6 9H10M6 13H10" stroke="#9c27b0" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  calculator: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="3" stroke="#ea4335" strokeWidth="1.7"/>
      <rect x="7" y="5" width="10" height="4" rx="1" stroke="#ea4335" strokeWidth="1.4"/>
      <circle cx="8" cy="14" r="1.2" fill="#ea4335"/>
      <circle cx="12" cy="14" r="1.2" fill="#ea4335"/>
      <circle cx="16" cy="14" r="1.2" fill="#ea4335"/>
      <circle cx="8" cy="18" r="1.2" fill="#ea4335"/>
      <circle cx="12" cy="18" r="1.2" fill="#ea4335"/>
      <circle cx="16" cy="18" r="1.2" fill="#ea4335"/>
    </svg>
  ),
  scale: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 3V21M3 21H21" stroke="#7c3aed" strokeWidth="1.7" strokeLinecap="round"/>
      <path d="M6 9L3 15H9L6 9ZM18 9L15 15H21L18 9Z" stroke="#7c3aed" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M6 9H18" stroke="#7c3aed" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  piggy: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M19 9C19 9 21 9 21 11V13C21 13 21 14 20 14H19C19 14 19 17 16 18V20H14V18H10V20H8V18C5 17 4 14 4 14C3 14 2 13 2 12C2 11 3 10 4 10C4 10 4 7 8 7H14C14 7 16 7 17 8L19 7V9Z" stroke="#f59e0b" strokeWidth="1.6" strokeLinejoin="round"/>
      <circle cx="8.5" cy="11" r="1" fill="#f59e0b"/>
    </svg>
  ),
  lotus: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 21C12 21 5 18 5 12C5 12 8 13 12 11C16 13 19 12 19 12C19 18 12 21 12 21Z" stroke="#34a853" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M12 11C12 11 10 7 7 6C7 6 8 9 12 11Z" stroke="#34a853" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M12 11C12 11 14 7 17 6C17 6 16 9 12 11Z" stroke="#34a853" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M12 11V21" stroke="#34a853" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  // Image gen icons
  sparkles: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" stroke="#db2777" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M19 17L19.8 19.2L22 20L19.8 20.8L19 23L18.2 20.8L16 20L18.2 19.2L19 17Z" stroke="#db2777" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M5 2L5.5 3.5L7 4L5.5 4.5L5 6L4.5 4.5L3 4L4.5 3.5L5 2Z" stroke="#db2777" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  ),
  mountains: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M2 20L9 6L14 14L17 10L22 20H2Z" stroke="#34a853" strokeWidth="1.7" strokeLinejoin="round"/>
      <circle cx="17" cy="6" r="2" stroke="#f59e0b" strokeWidth="1.4"/>
    </svg>
  ),
  ocean: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M2 8C4 8 6 10 8 10C10 10 12 8 14 8C16 8 18 10 20 10C22 10 23 9 23 9" stroke="#1a73e8" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M2 13C4 13 6 15 8 15C10 15 12 13 14 13C16 13 18 15 20 15C22 15 23 14 23 14" stroke="#1a73e8" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M2 18C4 18 6 20 8 20C10 20 12 18 14 18C16 18 18 20 20 20C22 20 23 19 23 19" stroke="#1a73e8" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  dragon: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 4C10 4 8 5.5 8 8C8 10 9 11.5 10 12L7 18H10L11 15H13L14 18H17L14 12C15 11.5 16 10 16 8C16 5.5 14 4 12 4Z" stroke="#9c27b0" strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M8 8C6 7 4 8 4 10C4 12 6 12 8 12" stroke="#9c27b0" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M16 8C18 7 20 8 20 10C20 12 18 12 16 12" stroke="#9c27b0" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  temple: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M2 20H22" stroke="#ea4335" strokeWidth="1.6" strokeLinecap="round"/>
      <rect x="4" y="13" width="16" height="7" stroke="#ea4335" strokeWidth="1.6"/>
      <path d="M2 13H22M6 13V10M12 13V10M18 13V10" stroke="#ea4335" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M1 10H23L12 4L1 10Z" stroke="#ea4335" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  robot2: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="9" width="14" height="11" rx="3" stroke="#7c3aed" strokeWidth="1.7"/>
      <path d="M10 9V7a2 2 0 014 0v2" stroke="#7c3aed" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="9.5" cy="14" r="1.5" fill="#7c3aed"/>
      <circle cx="14.5" cy="14" r="1.5" fill="#7c3aed"/>
      <path d="M9 18h6" stroke="#7c3aed" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  underground: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#1a73e8" strokeWidth="1.7"/>
      <circle cx="12" cy="12" r="4" stroke="#1a73e8" strokeWidth="1.4"/>
      <path d="M12 3V8M12 16V21M3 12H8M16 12H21" stroke="#1a73e8" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
};

/* ── Card component ──────────────────────────────────────────────────────── */
function Card({
  icon, title, description, onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "flex-start", gap: 14,
        padding: "16px", borderRadius: 16, border: "none",
        background: "var(--surface)", cursor: "pointer", textAlign: "left",
        transition: "background 0.15s", fontFamily: "inherit", width: "100%",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
      onMouseLeave={e => (e.currentTarget.style.background = "var(--surface)")}
    >
      <div style={{ flexShrink: 0, marginTop: 1 }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", lineHeight: 1.4 }}>{title}</p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.4,
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        } as React.CSSProperties}>{description}</p>
      </div>
    </button>
  );
}

/* ── Explore ──────────────────────────────────────────────────────────────── */
const EXPLORE_ITEMS = [
  { icon: ICONS.brain,       title: "Explain quantum computing",      prompt: "Explain quantum computing in simple terms with examples." },
  { icon: ICONS.globe,       title: "World history timeline",         prompt: "Give me a brief timeline of the most important events in world history." },
  { icon: ICONS.wifi,        title: "How does the internet work?",    prompt: "Explain how the internet works, from typing a URL to seeing a webpage." },
  { icon: ICONS.dna,         title: "CRISPR gene editing explained",  prompt: "What is CRISPR and how does gene editing work? Explain simply." },
  { icon: ICONS.rocket,      title: "Future of space exploration",    prompt: "What does the future of space exploration look like in the next 50 years?" },
  { icon: ICONS.robot,       title: "How AI models are trained",      prompt: "How are large language models like me trained? Explain the process." },
  { icon: ICONS.chart,       title: "Basics of investing",            prompt: "Explain the basics of investing for a complete beginner." },
  { icon: ICONS.palette,     title: "History of art movements",       prompt: "Walk me through the major art movements in history and what defined each one." },
  { icon: ICONS.microscope,  title: "How vaccines work",              prompt: "How do vaccines work to protect against disease? Explain the science." },
];

export function ExploreView({ onPrompt }: { onPrompt: (p: string) => void }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Explore</h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
        Discover interesting topics to ask Gemini about
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {EXPLORE_ITEMS.map((item) => (
          <Card key={item.title} icon={item.icon} title={item.title} description={item.prompt} onClick={() => onPrompt(item.prompt)} />
        ))}
      </div>
    </div>
  );
}

/* ── Images ───────────────────────────────────────────────────────────────── */
const IMAGE_IDEAS = [
  { icon: ICONS.mountains,   text: "A futuristic city at sunset with flying cars" },
  { icon: ICONS.sparkles,    text: "A cozy library with magical glowing books" },
  { icon: ICONS.rocket,      text: "An astronaut surfing waves on an alien ocean planet" },
  { icon: ICONS.robot2,      text: "A cute robot having a tea party in a garden" },
  { icon: ICONS.mountains,   text: "A mountain landscape at dawn with aurora borealis" },
  { icon: ICONS.ocean,       text: "An underwater world with bioluminescent creatures" },
  { icon: ICONS.dragon,      text: "A steampunk clockwork dragon in a Victorian city" },
  { icon: ICONS.temple,      text: "A peaceful Japanese temple surrounded by cherry blossoms" },
];

export function ImagesView({ onPrompt }: { onPrompt: (p: string) => void }) {
  const [custom, setCustom] = useState("");

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Image Generation</h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>
        Describe an image and Gemini will generate it for you
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
        <input
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && custom.trim()) { onPrompt(`Generate an image of ${custom}`); setCustom(""); } }}
          placeholder="Describe your image…"
          style={{
            flex: 1, minWidth: 200, padding: "10px 16px", borderRadius: 9999,
            border: "1px solid var(--border-strong)", background: "var(--surface)",
            color: "var(--text)", fontSize: 14, outline: "none", fontFamily: "inherit",
          }}
          onFocus={e => (e.currentTarget.style.borderColor = "var(--blue)")}
          onBlur={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
        />
        <button
          onClick={() => { if (custom.trim()) { onPrompt(`Generate an image of ${custom}`); setCustom(""); } }}
          disabled={!custom.trim()}
          style={{
            padding: "10px 20px", borderRadius: 9999, border: "none",
            background: custom.trim() ? "var(--blue)" : "var(--border)",
            color: custom.trim() ? "#fff" : "var(--text-muted)",
            cursor: custom.trim() ? "pointer" : "not-allowed",
            fontSize: 14, fontWeight: 500, fontFamily: "inherit",
          }}
        >
          Generate
        </button>
      </div>

      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ideas</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
        {IMAGE_IDEAS.map((idea) => (
          <button
            key={idea.text}
            onClick={() => onPrompt(`Generate an image of ${idea.text}`)}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px", borderRadius: 14, border: "none",
              background: "var(--surface)", cursor: "pointer", textAlign: "left",
              fontSize: 13, color: "var(--text)", lineHeight: 1.45,
              fontFamily: "inherit", transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--surface)")}
          >
            <div style={{ flexShrink: 0 }}>{idea.icon}</div>
            {idea.text}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Videos ───────────────────────────────────────────────────────────────── */
const VIDEO_ITEMS = [
  { icon: ICONS.film,      title: "Explain a YouTube video",     prompt: "I'll paste a YouTube video transcript. Summarize the key points for me." },
  { icon: ICONS.script,    title: "Script a short video",        prompt: "Write a 60-second video script on a topic of my choice." },
  { icon: ICONS.film,      title: "Best documentaries list",     prompt: "What are the best documentaries to watch across different genres?" },
  { icon: ICONS.clapboard, title: "Analyze a film",              prompt: "Help me analyze and interpret a film's themes, cinematography, and storytelling." },
  { icon: ICONS.tv,        title: "TV show recommendations",     prompt: "Recommend the best TV shows based on my interests. Ask me what I like." },
  { icon: ICONS.script,    title: "Write a scene",               prompt: "Write a dramatic short film scene for me. Ask me the genre and characters." },
];

export function VideosView({ onPrompt }: { onPrompt: (p: string) => void }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Videos</h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
        Get help with video content — scripts, summaries, recommendations
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {VIDEO_ITEMS.map((item) => (
          <Card key={item.title} icon={item.icon} title={item.title} description={item.prompt} onClick={() => onPrompt(item.prompt)} />
        ))}
      </div>
    </div>
  );
}

/* ── Music ────────────────────────────────────────────────────────────────── */
const MUSIC_ITEMS = [
  { icon: ICONS.music,       title: "Write song lyrics",         prompt: "Write original song lyrics for me. Ask me the genre, mood, and theme." },
  { icon: ICONS.piano,       title: "Explain music theory",      prompt: "Explain music theory basics — scales, chords, and rhythm — in simple terms." },
  { icon: ICONS.piano,       title: "Chord progressions",        prompt: "Give me interesting chord progressions for different musical genres." },
  { icon: ICONS.mic,         title: "Artist biography",          prompt: "Tell me about a famous musician's life, career, and musical impact. Ask me who." },
  { icon: ICONS.headphones,  title: "Music recommendations",     prompt: "Recommend music based on my taste. Ask me what genres and artists I like." },
  { icon: ICONS.drum,        title: "Beat & rhythm patterns",    prompt: "Explain drum beat patterns and rhythms for different music genres." },
];

export function MusicView({ onPrompt }: { onPrompt: (p: string) => void }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Music</h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
        Lyrics, theory, recommendations and more
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {MUSIC_ITEMS.map((item) => (
          <Card key={item.title} icon={item.icon} title={item.title} description={item.prompt} onClick={() => onPrompt(item.prompt)} />
        ))}
      </div>
    </div>
  );
}

/* ── More ─────────────────────────────────────────────────────────────────── */
const MORE_ITEMS = [
  { icon: ICONS.briefcase,  title: "Career & Resume",      prompt: "Help me improve my resume and prepare for job interviews." },
  { icon: ICONS.cooking,    title: "Recipes & Cooking",    prompt: "Suggest a recipe based on ingredients I have. Ask me what's in my kitchen." },
  { icon: ICONS.fitness,    title: "Fitness & Health",     prompt: "Create a beginner workout plan for me. Ask about my goals and available equipment." },
  { icon: ICONS.plane,      title: "Travel Planning",      prompt: "Help me plan a trip. Ask me my destination, budget, and interests." },
  { icon: ICONS.book,       title: "Book Recommendations", prompt: "Recommend books based on my reading taste. Ask me what genres I enjoy." },
  { icon: ICONS.calculator, title: "Math & Science",       prompt: "Help me solve a math or science problem. Show your work step by step." },
  { icon: ICONS.scale,      title: "Legal Questions",      prompt: "Help me understand a legal concept or document (not legal advice)." },
  { icon: ICONS.piggy,      title: "Finance & Budgeting",  prompt: "Help me create a personal budget and improve my financial habits." },
  { icon: ICONS.lotus,      title: "Mental Wellness",      prompt: "Share mindfulness techniques and strategies for managing stress." },
];

export function MoreView({ onPrompt }: { onPrompt: (p: string) => void }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>More</h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
        Even more ways Gemini can help you
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {MORE_ITEMS.map((item) => (
          <Card key={item.title} icon={item.icon} title={item.title} description={item.prompt} onClick={() => onPrompt(item.prompt)} />
        ))}
      </div>
    </div>
  );
}
