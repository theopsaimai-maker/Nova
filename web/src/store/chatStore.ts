import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Conversation, Message } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { generateTitle, DEFAULT_MODEL } from "@/lib/utils";

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  sidebarOpen: boolean;
  searchQuery: string;
  isGenerating: boolean;

  setActiveConversation: (id: string | null) => void;
  createConversation: (firstMessage?: string) => Conversation;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  pinConversation: (id: string, pinned: boolean) => void;
  addMessage: (conversationId: string, message: Omit<Message, "id" | "createdAt">) => Message;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  appendToken: (conversationId: string, messageId: string, token: string) => void;
  setMessageFeedback: (conversationId: string, messageId: string, feedback: "up" | "down" | null) => void;
  getActiveConversation: () => Conversation | null;
  getActiveMessages: () => Message[];
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (q: string) => void;
  setIsGenerating: (v: boolean) => void;
  filteredConversations: () => Conversation[];
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      sidebarOpen: true,
      searchQuery: "",
      isGenerating: false,

      setActiveConversation: (id) => set({ activeConversationId: id }),

      createConversation: (firstMessage) => {
        const conv: Conversation = {
          id: uuidv4(),
          title: firstMessage ? generateTitle(firstMessage) : "New conversation",
          pinned: false,
          model: DEFAULT_MODEL,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages: [],
        };
        set((state) => ({
          conversations: [conv, ...state.conversations],
          activeConversationId: conv.id,
        }));
        return conv;
      },

      deleteConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          activeConversationId:
            state.activeConversationId === id ? null : state.activeConversationId,
        })),

      renameConversation: (id, title) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title } : c
          ),
        })),

      pinConversation: (id, pinned) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, pinned } : c
          ),
        })),

      addMessage: (conversationId, messageData) => {
        const message: Message = {
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          ...messageData,
        };
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...(c.messages ?? []), message],
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }));
        return message;
      },

      updateMessage: (conversationId, messageId, updates) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: (c.messages ?? []).map((m) =>
                    m.id === messageId ? { ...m, ...updates } : m
                  ),
                }
              : c
          ),
        })),

      appendToken: (conversationId, messageId, token) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: (c.messages ?? []).map((m) =>
                    m.id === messageId ? { ...m, content: m.content + token } : m
                  ),
                }
              : c
          ),
        })),

      setMessageFeedback: (conversationId, messageId, feedback) =>
        get().updateMessage(conversationId, messageId, { feedback }),

      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find((c) => c.id === activeConversationId) ?? null;
      },

      getActiveMessages: () => {
        const conv = get().getActiveConversation();
        return conv?.messages ?? [];
      },

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setIsGenerating: (v) => set({ isGenerating: v }),

      filteredConversations: () => {
        const { conversations, searchQuery } = get();
        const pinned = conversations.filter((c) => c.pinned);
        const unpinned = conversations.filter((c) => !c.pinned);
        const all = [...pinned, ...unpinned];
        if (!searchQuery.trim()) return all;
        const q = searchQuery.toLowerCase();
        return all.filter((c) => c.title.toLowerCase().includes(q));
      },
    }),
    {
      name: "nova-chat-store",
      version: 3,
      skipHydration: true,
      // always reset old data on version bump
      migrate: () => ({
        conversations: [],
        activeConversationId: null,
        sidebarOpen: true,
        searchQuery: "",
        isGenerating: false,
      }),
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
