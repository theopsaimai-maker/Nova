import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export interface MemoryFact {
  id: string;
  text: string;
  createdAt: string;
  source: "manual" | "auto"; // manual = user added, auto = extracted from AI
}

interface MemoryState {
  facts: MemoryFact[];
  enabled: boolean;
  addFact: (text: string, source?: "manual" | "auto") => void;
  deleteFact: (id: string) => void;
  clearAll: () => void;
  setEnabled: (v: boolean) => void;
}

export const useMemoryStore = create<MemoryState>()(
  persist(
    (set) => ({
      facts: [],
      enabled: true,

      addFact: (text, source = "manual") => {
        const trimmed = text.trim();
        if (!trimmed) return;
        set((s) => ({
          facts: [
            { id: uuidv4(), text: trimmed, createdAt: new Date().toISOString(), source },
            ...s.facts,
          ],
        }));
      },

      deleteFact: (id) =>
        set((s) => ({ facts: s.facts.filter((f) => f.id !== id) })),

      clearAll: () => set({ facts: [] }),

      setEnabled: (v) => set({ enabled: v }),
    }),
    { name: "nova-memory-store", version: 1 }
  )
);

/** Extract short memorable facts from an AI response */
export function extractFacts(text: string): string[] {
  const sentences = text
    .replace(/#{1,6}\s/g, "")   // strip markdown headings
    .replace(/\*\*/g, "")
    .replace(/`[^`]+`/g, "")
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 120);

  // Heuristic: sentences that mention the user or have first-person hints
  const patterns = [
    /\b(you|your|samuel)\b/i,
    /\b(prefer|like|love|hate|always|never|usually)\b/i,
    /\b(live|work|study|based in|from)\b/i,
  ];

  return sentences
    .filter((s) => patterns.some((p) => p.test(s)))
    .slice(0, 2);
}
