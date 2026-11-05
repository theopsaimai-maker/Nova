"use client";

import { useCallback, useRef } from "react";
import { useChatStore } from "@/store/chatStore";
import { useUserStore } from "@/store/userStore";
import type { Message } from "@/lib/types";
import type { UploadedFile } from "@/hooks/useFileUpload";

export function useChat() {
  const {
    createConversation,
    addMessage,
    updateMessage,
    appendToken,
    setIsGenerating,
    activeConversationId,
  } = useChatStore();

  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string, attachments: UploadedFile[] = [], webSearch = false, imageGenerate = false) => {
      // Get or create conversation
      let convId = activeConversationId;
      if (!convId) {
        const conv = createConversation(text);
        convId = conv.id;
      }

      // Build display content for user message
      const attachmentNote = attachments.length > 0
        ? `\n\n📎 *Attached: ${attachments.map(a => a.name).join(", ")}*`
        : "";

      addMessage(convId, {
        conversationId: convId,
        role: "user",
        content: text + attachmentNote,
      });

      const assistantMsg = addMessage(convId, {
        conversationId: convId,
        role: "assistant",
        content: "",
        isStreaming: true,
      });

      setIsGenerating(true);
      abortRef.current = new AbortController();

      try {
        const conv = useChatStore.getState().getActiveConversation();
        const { settings } = useUserStore.getState();
        const messages: Message[] = (conv?.messages ?? []).filter(
          (m) => !(m.id === assistantMsg.id)
        );

        // Serialize attachments (strip large base64 for non-last messages)
        const serializedAttachments = attachments.map(a => ({
          type: a.type,
          name: a.name,
          content: a.content,
          mimeType: a.mimeType,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages,
            model: settings.model,
            customInstructions: settings.customInstructions,
            webSearch,
            imageGenerate,
            attachments: serializedAttachments,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Request failed" }));
          throw new Error(err.error ?? "Request failed");
        }

        if (!res.body) throw new Error("No response body");

        // Parse SSE stream
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;

            try {
              const event = JSON.parse(raw) as { type: string; data: string };

              if (event.type === "token") {
                appendToken(convId!, assistantMsg.id, event.data);
              } else if (event.type === "error") {
                throw new Error(event.data);
              } else if (event.type === "done") {
                break;
              }
            } catch {
              // skip malformed events
            }
          }
        }

        // Mark streaming complete
        updateMessage(convId!, assistantMsg.id, { isStreaming: false });
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          // User stopped generation — just mark done
          updateMessage(convId!, assistantMsg.id, { isStreaming: false });
        } else {
          const msg = err instanceof Error ? err.message : "Something went wrong";
          updateMessage(convId!, assistantMsg.id, {
            content: `⚠️ ${msg}`,
            isStreaming: false,
          });
        }
      } finally {
        setIsGenerating(false);
        abortRef.current = null;
      }
    },
    [
      activeConversationId,
      createConversation,
      addMessage,
      updateMessage,
      appendToken,
      setIsGenerating,
    ]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const regenerate = useCallback(
    async (messageId: string) => {
      const conv = useChatStore.getState().getActiveConversation();
      if (!conv) return;

      const messages = conv.messages ?? [];
      const idx = messages.findIndex((m) => m.id === messageId);
      if (idx === -1) return;

      // Find the preceding user message
      const userMsg = messages.slice(0, idx).reverse().find((m) => m.role === "user");
      if (!userMsg) return;

      // Remove the old assistant message
      useChatStore.getState().updateMessage(conv.id, messageId, {
        content: "",
        isStreaming: true,
      });

      await sendMessage(userMsg.content);
    },
    [sendMessage]
  );

  return { sendMessage, stopGeneration, regenerate };
}
