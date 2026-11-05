"use client";

import { useCallback, useState } from "react";

export interface UploadedFile {
  id: string;
  name: string;
  type: "image" | "text";
  mimeType: string;
  size: number;
  // For images: base64 data URL
  // For text files: extracted text content
  content: string;
  preview?: string; // thumbnail data URL for images
}

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4 MB
const MAX_FILE_SIZE  = 10 * 1024 * 1024; // 10 MB

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const TEXT_TYPES  = [
  "text/plain", "text/csv", "text/markdown",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function readAsDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function readAsText(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsText(file);
  });
}

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File): Promise<UploadedFile | null> => {
    setError(null);
    setUploading(true);

    try {
      const isImage = IMAGE_TYPES.includes(file.type);
      const isText  = TEXT_TYPES.includes(file.type) || file.name.endsWith(".txt") || file.name.endsWith(".csv") || file.name.endsWith(".md");

      if (!isImage && !isText) {
        setError(`Unsupported file type: ${file.type || file.name}`);
        return null;
      }

      if (isImage && file.size > MAX_IMAGE_SIZE) {
        setError("Image too large. Max 4 MB.");
        return null;
      }

      if (isText && file.size > MAX_FILE_SIZE) {
        setError("File too large. Max 10 MB.");
        return null;
      }

      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      if (isImage) {
        const dataUrl = await readAsDataURL(file);
        return {
          id, name: file.name, type: "image",
          mimeType: file.type, size: file.size,
          content: dataUrl, preview: dataUrl,
        };
      }

      // Text / PDF / DOCX — read as text (PDF/DOCX will be partially readable)
      let text = "";
      if (file.type === "text/plain" || file.type === "text/csv" || file.name.endsWith(".txt") || file.name.endsWith(".csv") || file.name.endsWith(".md")) {
        text = await readAsText(file);
      } else {
        // For PDF/DOCX: read as text (basic extraction, works for text-heavy docs)
        text = await readAsText(file);
        if (!text.trim()) {
          text = `[File: ${file.name} — binary content, ${(file.size / 1024).toFixed(1)} KB. I cannot extract text from this file format in the browser. Please paste the text content directly.]`;
        }
      }

      // Truncate very long files
      const maxChars = 40000;
      if (text.length > maxChars) {
        text = text.slice(0, maxChars) + `\n\n[... truncated at ${maxChars} characters ...]`;
      }

      return {
        id, name: file.name, type: "text",
        mimeType: file.type, size: file.size,
        content: text,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read file");
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return { processFile, uploading, error, setError };
}
