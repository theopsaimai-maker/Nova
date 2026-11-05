/**
 * Data access layer — all Supabase reads/writes go through here.
 * Uses the browser client so RLS policies are enforced automatically.
 */
import { getSupabase } from "./supabase";
import type { Conversation, Message } from "./types";
import type { MemoryFact } from "@/store/memoryStore";

// ─── User ─────────────────────────────────────────────────────────────────────

export async function upsertUser(user: {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string;
  is_guest?: boolean;
}) {
  const sb = getSupabase();
  const { error } = await sb.from("users").upsert(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      is_guest: user.is_guest ?? false,
    },
    { onConflict: "id" }
  );
  if (error) console.warn("[db] upsertUser:", error.message);
}

// ─── Conversations ────────────────────────────────────────────────────────────

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("conversations")
    .select("*, messages(*)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) { console.warn("[db] fetchConversations:", error.message); return []; }

  return (data ?? []).map((row) => ({
    id:        row.id,
    title:     row.title,
    model:     row.model,
    pinned:    row.pinned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages:  (row.messages ?? []).map(mapMessage),
  }));
}

export async function saveConversation(
  userId: string,
  conv: Conversation
): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("conversations").upsert(
    {
      id:         conv.id,
      user_id:    userId,
      title:      conv.title,
      model:      conv.model,
      pinned:     conv.pinned,
      updated_at: conv.updatedAt,
      created_at: conv.createdAt,
    },
    { onConflict: "id" }
  );
  if (error) console.warn("[db] saveConversation:", error.message);
}

export async function deleteConversation(convId: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("conversations").delete().eq("id", convId);
  if (error) console.warn("[db] deleteConversation:", error.message);
}

export async function updateConversationMeta(
  convId: string,
  updates: { title?: string; pinned?: boolean; model?: string }
): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from("conversations")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", convId);
  if (error) console.warn("[db] updateConversationMeta:", error.message);
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function saveMessage(msg: Message): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("messages").upsert(
    {
      id:              msg.id,
      conversation_id: msg.conversationId,
      role:            msg.role,
      content:         msg.content,
      feedback:        msg.feedback ?? null,
      created_at:      msg.createdAt,
    },
    { onConflict: "id" }
  );
  if (error) console.warn("[db] saveMessage:", error.message);
}

export async function updateMessageFeedback(
  msgId: string,
  feedback: "up" | "down" | null
): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from("messages")
    .update({ feedback })
    .eq("id", msgId);
  if (error) console.warn("[db] updateMessageFeedback:", error.message);
}

// ─── Memories ─────────────────────────────────────────────────────────────────

export async function fetchMemories(userId: string): Promise<MemoryFact[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("memories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) { console.warn("[db] fetchMemories:", error.message); return []; }

  return (data ?? []).map((row) => ({
    id:        row.id,
    text:      row.text,
    source:    row.source as "manual" | "auto",
    createdAt: row.created_at,
  }));
}

export async function saveMemory(
  userId: string,
  fact: MemoryFact
): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("memories").upsert(
    {
      id:         fact.id,
      user_id:    userId,
      text:       fact.text,
      source:     fact.source,
      created_at: fact.createdAt,
    },
    { onConflict: "id" }
  );
  if (error) console.warn("[db] saveMemory:", error.message);
}

export async function deleteMemory(memId: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("memories").delete().eq("id", memId);
  if (error) console.warn("[db] deleteMemory:", error.message);
}

export async function clearMemories(userId: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("memories").delete().eq("user_id", userId);
  if (error) console.warn("[db] clearMemories:", error.message);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapMessage(row: Record<string, unknown>): Message {
  return {
    id:             row.id as string,
    conversationId: row.conversation_id as string,
    role:           row.role as "user" | "assistant" | "system",
    content:        row.content as string,
    feedback:       (row.feedback as "up" | "down" | null) ?? null,
    createdAt:      row.created_at as string,
  };
}
