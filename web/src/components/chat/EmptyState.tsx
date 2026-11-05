"use client";

const CARDS = [
  {
    icon: <svg width="26" height="26" viewBox="0 0 28 28" fill="none"><defs><linearGradient id="c1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4285f4"/><stop offset="100%" stopColor="#9c27b0"/></linearGradient></defs><path d="M14 2C14 2 15.5 9 19 13C23 17 26 14 26 14C26 14 23 11 19 15C15.5 19 14 26 14 26C14 26 12.5 19 9 15C5 11 2 14 2 14C2 14 5 17 9 13C12.5 9 14 2 14 2Z" fill="url(#c1)"/></svg>,
    text: "Create a study plan\nfor my IT course",
  },
  {
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" stroke="#4285f4" strokeWidth="1.8"/><path d="M7 8h10M7 12h7M7 16h5" stroke="#4285f4" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    text: "Write code for a\nweb application",
  },
  {
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="#4285f4" strokeWidth="1.8"/><circle cx="8.5" cy="11" r="1.8" stroke="#4285f4" strokeWidth="1.5"/><path d="M5 19L9 14L13 17L16 13L21 19" stroke="#4285f4" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
    text: "Generate an image\nfor my project",
  },
  {
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#7c3aed" strokeWidth="1.8"/><path d="M12 7v5l3 3" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    text: "Explain a difficult\nconcept in simple terms",
  },
  {
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="2" stroke="#4285f4" strokeWidth="1.8"/><path d="M7 9h10M7 13h6" stroke="#4285f4" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    text: "Help me write a\nprofessional email",
  },
  {
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#4285f4" strokeWidth="1.8"/><path d="M17 17L21 21" stroke="#4285f4" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    text: "Find the latest tech\nnews",
  },
];

interface Props {
  onPrompt: (text: string) => void;
  userName?: string;
}

export function EmptyState({ onPrompt, userName = "Samuel" }: Props) {
  return (
    <div
      className="fade-in"
      style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", overflowY: "auto",
        padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 40px) 20px",
      }}
    >
      {/* Star + Gemini */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <svg width="52" height="52" viewBox="0 0 56 56" fill="none">
          <defs>
            <linearGradient id="esStar" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#e91e63" />
              <stop offset="45%"  stopColor="#9c27b0" />
              <stop offset="100%" stopColor="#4285f4" />
            </linearGradient>
          </defs>
          <path d="M28 4C28 4 31 22 38 29C45 36 52 28 52 28C52 28 45 20 38 27C31 34 28 52 28 52C28 52 25 34 18 27C11 20 4 28 4 28C4 28 11 36 18 29C25 22 28 4 28 4Z" fill="url(#esStar)" />
        </svg>
        <span style={{
          fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 400,
          letterSpacing: "-1px", lineHeight: 1,
          background: "linear-gradient(90deg,#1a73e8 0%,#7c3aed 40%,#db2777 80%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Gemini
        </span>
      </div>

      {/* Greeting */}
      <h1 style={{
        fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 500,
        color: "var(--text)", marginBottom: 8,
        textAlign: "center", lineHeight: 1.15,
      }}>
        Hello,{" "}
        <span className="gradient-name">{userName}</span>
      </h1>
      <p style={{
        fontSize: "clamp(16px, 2.5vw, 22px)", fontWeight: 400,
        color: "var(--text-muted)", marginBottom: 32, textAlign: "center",
      }}>
        How can I help you today?
      </p>

      {/* 3×2 cards — 1 col on mobile, 2 on tablet, 3 on desktop */}
      <div
        className="suggestion-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12, width: "100%", maxWidth: 780,
        }}>
        {CARDS.map((card, i) => (
          <button
            key={i}
            onClick={() => onPrompt(card.text.replace("\n", " "))}
            aria-label={card.text.replace("\n", " ")}
            style={{
              display: "flex", flexDirection: "column",
              justifyContent: "space-between",
              padding: "16px 16px 14px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16, cursor: "pointer", textAlign: "left",
              minHeight: 110, transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "var(--surface-hover)";
              e.currentTarget.style.borderColor = "var(--border-strong)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "var(--surface)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <div style={{ marginBottom: 10 }}>{card.icon}</div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
              <p style={{
                fontSize: 13, fontWeight: 400, color: "var(--text)",
                lineHeight: 1.45, whiteSpace: "pre-line", flex: 1,
              }}>
                {card.text}
              </p>
              <div style={{
                width: 28, height: 28, borderRadius: 9999,
                background: "var(--bg)", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "var(--shadow-sm)",
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
