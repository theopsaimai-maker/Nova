"use client";

import { useEffect, useState } from "react";

interface Props {
  response: string;       // last AI message content
  onSelect: (text: string) => void;
  isGenerating: boolean;
}

// Generate follow-up suggestions from the AI response using simple heuristics
function generateSuggestions(text: string): string[] {
  if (!text || text.length < 50) return [];

  const lower = text.toLowerCase();

  const suggestions: string[] = [];

  // Topic-based suggestions
  if (lower.includes("code") || lower.includes("function") || lower.includes("```")) {
    suggestions.push("Can you explain this code step by step?");
    suggestions.push("Show me a more advanced example");
    suggestions.push("What are common mistakes to avoid here?");
  } else if (lower.includes("history") || lower.includes("year") || lower.includes("century")) {
    suggestions.push("Tell me more about this topic");
    suggestions.push("What happened next?");
    suggestions.push("How does this relate to today?");
  } else if (lower.includes("how to") || lower.includes("steps") || lower.includes("first")) {
    suggestions.push("Can you simplify this further?");
    suggestions.push("What are the most common mistakes?");
    suggestions.push("Give me a real-world example");
  } else if (lower.includes("difference") || lower.includes("compare") || lower.includes("versus")) {
    suggestions.push("Which one would you recommend?");
    suggestions.push("Are there other alternatives?");
    suggestions.push("Can you give examples of each?");
  } else {
    // Generic fallbacks
    suggestions.push("Can you elaborate on this?");
    suggestions.push("Give me a practical example");
    suggestions.push("What should I know next?");
  }

  return suggestions.slice(0, 3);
}

export function SuggestedFollowUps({ response, onSelect, isGenerating }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isGenerating || !response) {
      setVisible(false);
      return;
    }
    const s = generateSuggestions(response);
    if (s.length > 0) {
      setSuggestions(s);
      // Small delay so they appear after streaming ends
      const t = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(t);
    }
  }, [response, isGenerating]);

  if (!visible || suggestions.length === 0) return null;

  return (
    <div
      style={{
        paddingLeft: 36,
        marginTop: 12,
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
    >
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => { setVisible(false); onSelect(s); }}
          style={{
            padding: "7px 14px",
            borderRadius: 9999,
            border: "1px solid var(--border-strong)",
            background: "var(--surface)",
            color: "var(--text-secondary)",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s",
            textAlign: "left",
            lineHeight: 1.4,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "var(--blue-hover)";
            e.currentTarget.style.borderColor = "var(--blue)";
            e.currentTarget.style.color = "var(--blue)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "var(--surface)";
            e.currentTarget.style.borderColor = "var(--border-strong)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
