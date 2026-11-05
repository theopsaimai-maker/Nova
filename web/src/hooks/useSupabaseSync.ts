"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import {
  fetchConversations,
  saveConversation,
  deleteConversation,
  updateConversationMeta,
  saveMessage,
  updateMessageFeedback,
  fetchMemories,
  saveMemory,
  deleteMemory,
  clearMemories,
  upsertUser,
} from "@/lib/db";
import { useChatStore } from "@/store/chatStore";
import { useMemoryStore } from "@/store/memoryStore";
import { useUserStore } from "@/store/userStore";

export type SyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";

/**
 * Handles all Supabase <-> localStorage sync.
 *
 * Strategy:
 * 1. On mount: sign in anonymously (guest) or detect existing session.
 * 2. Pull remote data into the local Zustand stores.
 * 3. Subscribe to store changes and push them to Supabase in real-time.
 */
export function useSupabaseSync() {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [userId, setUserId] = useState<string | null>(null);
  const syncedRef = useRef(false);

  // ── Step 1: Resolve current Supabase session ────────────────────────────────
  useEffect(() => {
    const sb = getSupabase();

    const bootstrap = async () => {
      setStatus("syncing");

      try {
        // Check for existing session (Google OAuth set by NextAuth)
        const { data: { session } } = await sb.auth.getSession();

        if (session?.user) {
          setUserId(session.user.id);
          await upsertUser({
            id:        session.user.id,
            email:     session.user.email ?? undefined,
            name:      session.user.user_metadata?.full_name ?? session.user.user_metadata?.name,
            avatar_url:session.user.user_metadata?.avatar_url,
            is_guest:  false,
          });
          // Update local profile store with real data
          useUserStore.getState().setProfile({
            name:    session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? "User",
            email:   session.user.email ?? "",
            avatar:  (session.user.user_metadata?.full_name ?? "U").charAt(0).toUpperCase(),
            isGuest: false,
          });
        } else {
          // Sign in anonymously so guest users still get a Supabase ID
          const { data, error } = await sb.auth.signInAnonymously();
          if (error) throw error;
          if (data.user) {
            setUserId(data.user.id);
            await upsertUser({ id: data.user.id, is_guest: true });
          }
        }
      } catch (err) {
        console.warn("[sync] bootstrap failed:", err);
        setStatus("offline");
        return;
      }
    };

    bootstrap();

    // Listen for auth state changes (e.g. Google sign-in from another tab)
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      if (session?.user && session.user.id !== userId) {
        setUserId(session.user.id);
        syncedRef.current = false; // re-sync on new user
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step 2: Pull remote data once we have a userId ──────────────────────────
  useEffect(() => {
    if (!userId || syncedRef.current) return;

    const pull = async () => {
      setStatus("syncing");
      try {
        // Pull conversations + messages
        const remoteConvs = await fetchConversations(userId);
        if (remoteConvs.length > 0) {
          // Merge: remote wins over local for existing IDs
          const local = useChatStore.getState().conversations;
          const localIds = new Set(local.map((c) => c.id));
          const merged = [
            ...remoteConvs,
            ...local.filter((c) => !localIds.has(c.id)), // local-only convs
          ];
          useChatStore.setState({ conversations: merged });
        }

        // Pull memories
        const remoteMems = await fetchMemories(userId);
        if (remoteMems.length > 0) {
          useMemoryStore.setState({ facts: remoteMems });
        }

        syncedRef.current = true;
        setStatus("synced");
      } catch (err) {
        console.warn("[sync] pull failed:", err);
        setStatus("error");
      }
    };

    pull();
  }, [userId]);

  // ── Step 3: Push local changes to Supabase ──────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    // Subscribe to chat store changes
    const unsubChat = useChatStore.subscribe((state, prev) => {
      if (!userId || !syncedRef.current) return;

      // Detect new / updated conversations
      for (const conv of state.conversations) {
        const prevConv = prev.conversations.find((c) => c.id === conv.id);

        if (!prevConv) {
          // Brand new conversation
          saveConversation(userId, conv);
          // Save its messages
          for (const msg of conv.messages ?? []) {
            saveMessage(msg);
          }
          continue;
        }

        // Title / pinned / model changed
        if (
          prevConv.title   !== conv.title   ||
          prevConv.pinned  !== conv.pinned  ||
          prevConv.model   !== conv.model
        ) {
          updateConversationMeta(conv.id, {
            title:  conv.title,
            pinned: conv.pinned,
            model:  conv.model,
          });
        }

        // New messages added
        const prevMsgIds = new Set((prevConv.messages ?? []).map((m) => m.id));
        for (const msg of conv.messages ?? []) {
          if (!prevMsgIds.has(msg.id) && !msg.isStreaming) {
            saveMessage(msg);
          }
          // Feedback changed
          const prevMsg = (prevConv.messages ?? []).find((m) => m.id === msg.id);
          if (prevMsg && prevMsg.feedback !== msg.feedback) {
            updateMessageFeedback(msg.id, msg.feedback ?? null);
          }
        }
      }

      // Detect deleted conversations
      const stateIds = new Set(state.conversations.map((c) => c.id));
      for (const prev_conv of prev.conversations) {
        if (!stateIds.has(prev_conv.id)) {
          deleteConversation(prev_conv.id);
        }
      }
    });

    // Subscribe to memory store changes
    const unsubMemory = useMemoryStore.subscribe((state, prev) => {
      if (!userId || !syncedRef.current) return;

      // New facts
      const prevIds = new Set(prev.facts.map((f) => f.id));
      for (const fact of state.facts) {
        if (!prevIds.has(fact.id)) saveMemory(userId, fact);
      }

      // Deleted facts
      const stateIds = new Set(state.facts.map((f) => f.id));
      for (const prevFact of prev.facts) {
        if (!stateIds.has(prevFact.id)) deleteMemory(prevFact.id);
      }

      // Clear all
      if (state.facts.length === 0 && prev.facts.length > 0) {
        clearMemories(userId);
      }
    });

    return () => {
      unsubChat();
      unsubMemory();
    };
  }, [userId]);

  return { status, userId };
}
