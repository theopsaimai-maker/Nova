"use client";

import { useCallback } from "react";
import type { Conversation } from "@/lib/types";

export function useExport() {
  const exportAsMarkdown = useCallback((conv: Conversation) => {
    const lines: string[] = [
      `# ${conv.title}`,
      `> Exported from Nova AI — ${new Date().toLocaleDateString()}`,
      "",
    ];

    for (const msg of conv.messages ?? []) {
      if (msg.role === "user") {
        lines.push(`## You`);
        lines.push(msg.content);
        lines.push("");
      } else if (msg.role === "assistant") {
        lines.push(`## Gemini`);
        lines.push(msg.content);
        lines.push("");
      }
    }

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    downloadBlob(blob, `${sanitizeFilename(conv.title)}.md`);
  }, []);

  const exportAsText = useCallback((conv: Conversation) => {
    const lines: string[] = [
      conv.title,
      `Exported: ${new Date().toLocaleDateString()}`,
      "─".repeat(60),
      "",
    ];

    for (const msg of conv.messages ?? []) {
      if (msg.role === "user") {
        lines.push("You:");
        lines.push(msg.content);
        lines.push("");
      } else if (msg.role === "assistant") {
        lines.push("Gemini:");
        // Strip markdown for plain text
        const plain = msg.content
          .replace(/#{1,6}\s/g, "")
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/`{3}[\s\S]*?`{3}/g, "[code block]")
          .replace(/`([^`]+)`/g, "$1")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
        lines.push(plain);
        lines.push("");
      }
    }

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    downloadBlob(blob, `${sanitizeFilename(conv.title)}.txt`);
  }, []);

  return { exportAsMarkdown, exportAsText };
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\-_\s]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 60)
    || "conversation";
}
