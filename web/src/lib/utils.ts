import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Conversation, GroupedConversations } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Returns a human-readable relative time string, e.g. "3 minutes ago" */
export function formatMessageTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr  / 24);

  if (diffSec < 60)  return "just now";
  if (diffMin < 60)  return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHr  < 24)  return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  if (diffDay < 7)   return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  return new Date(dateStr).toLocaleDateString();
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function groupConversationsByDate(conversations: Conversation[]): GroupedConversations {
  const now = new Date();
  const todayStart     = startOfDay(now);
  const yesterdayStart = todayStart - 86_400_000;
  const sevenDaysStart = todayStart - 7 * 86_400_000;

  const today: Conversation[]    = [];
  const yesterday: Conversation[]= [];
  const last7Days: Conversation[]= [];
  const older: Conversation[]    = [];

  for (const conv of conversations) {
    const t = startOfDay(new Date(conv.updatedAt));
    if      (t >= todayStart)     today.push(conv);
    else if (t >= yesterdayStart) yesterday.push(conv);
    else if (t >= sevenDaysStart) last7Days.push(conv);
    else                          older.push(conv);
  }

  const groups: GroupedConversations = [];
  if (today.length)    groups.push({ label: "Today",            items: today });
  if (yesterday.length)groups.push({ label: "Yesterday",        items: yesterday });
  if (last7Days.length)groups.push({ label: "Previous 7 Days",  items: last7Days });
  if (older.length)    groups.push({ label: "Older",            items: older });

  return groups;
}

export function generateTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim();
  if (trimmed.length <= 40) return trimmed;
  return trimmed.slice(0, 40).trimEnd() + "…";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const SUPPORTED_MODELS = [
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", description: "Fast, efficient" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", description: "Most capable" },
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", description: "Balanced" },
];

export const DEFAULT_MODEL = "gemini-2.0-flash";

export const SUGGESTED_PROMPTS = [
  { icon: "✍️", title: "Help me write", prompt: "Help me write a professional email to reschedule a meeting" },
  { icon: "🧠", title: "Explain a concept", prompt: "Explain how neural networks work in simple terms" },
  { icon: "💻", title: "Write some code", prompt: "Write a Python function to parse JSON from a URL" },
  { icon: "🔍", title: "Summarize text", prompt: "Summarize the key points of an article I'll paste" },
];
