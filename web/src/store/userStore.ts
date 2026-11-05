import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MODELS = [
  { id: "openai/gpt-oss-120b",  label: "GPT OSS 120B",  description: "Most capable" },
  { id: "openai/gpt-oss-20b",   label: "GPT OSS 20B",   description: "Faster" },
  { id: "qwen/qwen3.8-27b",     label: "Qwen 3.8 27B",  description: "Balanced" },
  { id: "allam-2-7b",           label: "Allam 2 7B",    description: "Lightweight" },
];

export const DEFAULT_MODEL_ID = "openai/gpt-oss-120b";

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;       // URL or initials
  isGuest: boolean;
}

export interface UserSettings {
  model: string;
  customInstructions: string;
  historyEnabled: boolean;
  theme: "light" | "dark" | "system";
}

interface UserState {
  profile: UserProfile;
  settings: UserSettings;
  setProfile: (p: Partial<UserProfile>) => void;
  setSettings: (s: Partial<UserSettings>) => void;
  signOut: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Samuel Theophilus",
  email: "samuel@example.com",
  isGuest: true,
};

const DEFAULT_SETTINGS: UserSettings = {
  model: DEFAULT_MODEL_ID,
  customInstructions: "",
  historyEnabled: true,
  theme: "system",
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      settings: DEFAULT_SETTINGS,
      setProfile: (p) =>
        set((s) => ({ profile: { ...s.profile, ...p } })),
      setSettings: (s) =>
        set((prev) => ({ settings: { ...prev.settings, ...s } })),
      signOut: () =>
        set({ profile: { ...DEFAULT_PROFILE, isGuest: true } }),
    }),
    {
      name: "nova-user-store",
      version: 1,
    }
  )
);
