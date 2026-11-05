"use client";

import { useEffect, useCallback, useState } from "react";
import { MessageList } from "./MessageList";
import { EmptyState } from "./EmptyState";
import { Composer } from "./Composer";
import { ExploreView, ImagesView, VideosView, MusicView, MoreView } from "./NavContent";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import { useChat } from "@/hooks/useChat";

interface Props {
  activeNav: string;
  onNavChange: (nav: string) => void;
}

export function ChatView({ activeNav, onNavChange }: Props) {
  const {
    setMessageFeedback,
    isGenerating,
    activeConversationId,
  } = useChatStore();

  const { sendMessage, stopGeneration, regenerate } = useChat();
  const { profile } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const messages = useChatStore((s) => {
    const conv = s.conversations.find((c) => c.id === s.activeConversationId);
    return conv?.messages;
  }) ?? [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        useChatStore.getState().createConversation();
        onNavChange("chat");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNavChange]);

  const handleFeedback = useCallback(
    (messageId: string, feedback: "up" | "down" | null) => {
      if (!activeConversationId) return;
      setMessageFeedback(activeConversationId, messageId, feedback);
    },
    [activeConversationId, setMessageFeedback]
  );

  // Handle prompt from nav content views — start a new chat
  const handleNavPrompt = (prompt: string) => {
    useChatStore.getState().createConversation(prompt);
    onNavChange("chat");
    sendMessage(prompt, [], false, false);
  };

  // Handle image generate from ImagesView
  const handleImagePrompt = (prompt: string) => {
    useChatStore.getState().createConversation(prompt);
    onNavChange("chat");
    sendMessage(prompt, [], false, true);
  };

  const showEmpty = !mounted || messages.length === 0;

  // ── Nav content views ──────────────────────────────────────────────────────
  if (activeNav === "explore") return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ExploreView onPrompt={handleNavPrompt} />
    </div>
  );

  if (activeNav === "images") return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ImagesView onPrompt={handleImagePrompt} />
    </div>
  );

  if (activeNav === "videos") return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <VideosView onPrompt={handleNavPrompt} />
    </div>
  );

  if (activeNav === "music") return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <MusicView onPrompt={handleNavPrompt} />
    </div>
  );

  if (activeNav === "more") return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <MoreView onPrompt={handleNavPrompt} />
    </div>
  );

  // ── Default: chat view ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-hidden flex flex-col">
        {showEmpty ? (
          <EmptyState onPrompt={(p) => sendMessage(p, [], false, false)} userName={profile.name.split(" ")[0]} />
        ) : (
          <MessageList
            messages={messages}
            isGenerating={isGenerating}
            onFeedback={handleFeedback}
            onRegenerate={regenerate}
            onFollowUp={(p) => sendMessage(p, [], false, false)}
          />
        )}
      </div>

      <div className="flex-shrink-0 composer-wrap" style={{ padding: "8px clamp(12px,4vw,32px) 20px" }}>
        <Composer
          onSend={(payload) => sendMessage(payload.text, payload.attachments, payload.webSearch, payload.imageGenerate)}
          onStop={stopGeneration}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
}
