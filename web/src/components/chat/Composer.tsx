"use client";

import { useRef, useState, useEffect, type KeyboardEvent, type ChangeEvent } from "react";
import { useSpeechToText } from "@/hooks/useSpeech";
import { useFileUpload, type UploadedFile } from "@/hooks/useFileUpload";

export interface ComposerPayload {
  text: string;
  attachments: UploadedFile[];
  webSearch: boolean;
  imageGenerate: boolean;
}

interface Props {
  onSend: (payload: ComposerPayload) => void;
  onStop?: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function Composer({ onSend, onStop, isGenerating, disabled }: Props) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [webSearch, setWebSearch] = useState(false);
  const [imageGenerate, setImageGenerate] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { processFile, uploading, error: fileError, setError: setFileError } = useFileUpload();
  const { listening, supported: micSupported, toggle: toggleMic } = useSpeechToText(
    (transcript) => {
      setValue(transcript);
      setTimeout(() => {
        onSend({ text: transcript, attachments, webSearch, imageGenerate });
        setValue("");
        setAttachments([]);
      }, 400);
    }
  );

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value]);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const handleSend = () => {
    const trimmed = value.trim();
    if ((!trimmed && attachments.length === 0) || isGenerating) return;
    onSend({ text: trimmed || (imageGenerate ? "Generate an image" : "Analyze this"), attachments, webSearch, imageGenerate });
    setValue("");
    setAttachments([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const results = await Promise.all(files.map(processFile));
    const valid = results.filter((f): f is UploadedFile => f !== null);
    setAttachments(prev => [...prev, ...valid].slice(0, 5)); // max 5 files
    e.target.value = "";
  };

  const removeAttachment = (id: string) =>
    setAttachments(prev => prev.filter(f => f.id !== id));

  const canSend = (value.trim().length > 0 || attachments.length > 0) && !isGenerating && !uploading;

  const placeholder = imageGenerate
    ? "Describe the image to generate…"
    : webSearch
    ? "Ask anything — I'll search the web…"
    : listening
    ? "Listening…"
    : "Ask Gemini anything…";

  return (
    <div style={{ width: "100%", maxWidth: 780, margin: "0 auto" }}>

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {attachments.map(f => (
            <div
              key={f.id}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px 4px 6px",
                borderRadius: 9999,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                fontSize: 12, color: "var(--text-secondary)",
                maxWidth: 200,
              }}
            >
              {f.type === "image" && f.preview ? (
                <img src={f.preview} alt={f.name} style={{ width: 24, height: 24, borderRadius: 4, objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 16 }}>{fileIcon(f.mimeType)}</span>
              )}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                {f.name}
              </span>
              <button
                onClick={() => removeAttachment(f.id)}
                aria-label={`Remove ${f.name}`}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 14, lineHeight: 1, padding: 0 }}
              >✕</button>
            </div>
          ))}
        </div>
      )}

      {/* File error */}
      {fileError && (
        <div style={{ fontSize: 12, color: "var(--red)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
          ⚠ {fileError}
          <button onClick={() => setFileError(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)" }}>✕</button>
        </div>
      )}

      {/* Feature toggles */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        <ToggleChip
          active={webSearch}
          onClick={() => { setWebSearch(v => !v); setImageGenerate(false); }}
          label="Web search"
          icon="🔍"
        />
        <ToggleChip
          active={imageGenerate}
          onClick={() => { setImageGenerate(v => !v); setWebSearch(false); }}
          label="Generate image"
          icon="🎨"
        />
      </div>

      {/* Pill input */}
      <div style={{
        display: "flex", alignItems: "flex-end", gap: 4,
        background: "var(--composer-bg)",
        borderRadius: 28,
        padding: "8px 10px 8px 14px",
        border: listening
          ? "1.5px solid var(--blue)"
          : webSearch || imageGenerate
          ? "1.5px solid var(--blue)"
          : "1px solid var(--composer-border)",
        transition: "border-color 0.2s, background 0.2s",
      }}>
        {/* Attach file */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.csv,.md,.docx"
          onChange={handleFileChange}
          style={{ display: "none" }}
          aria-label="Attach files"
        />
        <IconBtn
          aria-label="Attach file"
          disabled={disabled || uploading}
          onClick={() => fileInputRef.current?.click()}
          active={attachments.length > 0}
        >
          {uploading ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round"/>
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21.44 11.05L12.25 20.24C10.9 21.59 9.09 22.35 7.22 22.35C5.35 22.35 3.54 21.59 2.19 20.24C0.84 18.89 0.08 17.08 0.08 15.21C0.08 13.34 0.84 11.53 2.19 10.18L11.38 0.99C12.32 0.05 13.6-.47 14.93-.47C16.26-.47 17.54.05 18.48.99C19.42 1.93 19.94 3.21 19.94 4.54C19.94 5.87 19.42 7.15 18.48 8.09L9.28 17.28C8.81 17.75 8.17 18.01 7.51 18.01C6.85 18.01 6.21 17.75 5.74 17.28C5.27 16.81 5.01 16.17 5.01 15.51C5.01 14.85 5.27 14.21 5.74 13.74L14.27 5.21"
                stroke={attachments.length > 0 ? "var(--blue)" : "var(--text-muted)"}
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </IconBtn>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || listening}
          placeholder={placeholder}
          rows={1}
          aria-label="Message"
          style={{
            flex: 1, resize: "none",
            background: "transparent", border: "none", outline: "none",
            fontSize: 15,
            color: listening ? "var(--blue)" : "var(--text)",
            lineHeight: 1.6, padding: "6px 4px",
            maxHeight: 180, minHeight: 32, fontFamily: "inherit",
          }}
        />

        {/* Mic */}
        <IconBtn
          aria-label={listening ? "Stop listening" : "Voice input"}
          onClick={toggleMic}
          disabled={disabled || !micSupported}
          active={listening}
        >
          {listening ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="11" rx="3" fill="var(--red)" />
              <path d="M5 11C5 14.87 8.13 18 12 18C15.87 18 19 14.87 19 11" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="12" y1="18" x2="12" y2="22" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="9" y1="22" x2="15" y2="22" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="11" rx="3" stroke="var(--text-muted)" strokeWidth="1.8"/>
              <path d="M5 11C5 14.87 8.13 18 12 18C15.87 18 19 14.87 19 11" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="12" y1="18" x2="12" y2="22" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="9" y1="22" x2="15" y2="22" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          )}
        </IconBtn>

        {/* Send / Stop */}
        {isGenerating ? (
          <button onClick={onStop} aria-label="Stop" style={{
            width: 38, height: 38, borderRadius: 9999, border: "none",
            background: "var(--text)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginBottom: 1,
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="1.5" y="1.5" width="10" height="10" rx="2" fill="var(--bg)"/>
            </svg>
          </button>
        ) : (
          <button onClick={handleSend} disabled={!canSend} aria-label="Send" style={{
            width: 38, height: 38, borderRadius: 9999, border: "none",
            background: canSend ? "var(--text)" : "var(--border-strong)",
            cursor: canSend ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginBottom: 1, transition: "background 0.15s",
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <path d="M12 19V5M5 12l7-7 7 7" stroke="var(--bg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Listening bars */}
      {listening && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 8 }}>
          {[0,1,2,3,4].map((i) => (
            <div key={i} style={{
              width: 4, height: 18, borderRadius: 9999, background: "var(--blue)",
              animation: `voiceBar 0.8s ease-in-out ${i*0.12}s infinite alternate`,
            }}/>
          ))}
          <span style={{ fontSize: 12, color: "var(--blue)", marginLeft: 8 }}>Listening…</span>
        </div>
      )}

      {/* Disclaimer */}
      <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-placeholder)", marginTop: 8 }}>
        Gemini can make mistakes, so double-check its responses.{" "}
        <a href="#" style={{ color: "var(--text-placeholder)", textDecoration: "underline" }}>Learn more</a>
      </p>
    </div>
  );
}

/* ── Helpers ── */
function ToggleChip({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "4px 12px", borderRadius: 9999,
        border: `1.5px solid ${active ? "var(--blue)" : "var(--border-strong)"}`,
        background: active ? "var(--blue-hover)" : "transparent",
        color: active ? "var(--blue)" : "var(--text-muted)",
        cursor: "pointer", fontSize: 12, fontWeight: active ? 600 : 400,
        fontFamily: "inherit", transition: "all 0.15s",
      }}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

function IconBtn({ children, onClick, disabled, active, "aria-label": label }: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  "aria-label"?: string;
}) {
  return (
    <button
      onClick={onClick} disabled={disabled} aria-label={label}
      style={{
        width: 38, height: 38, borderRadius: 9999, border: "none",
        background: active ? "var(--blue-hover)" : "transparent",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginBottom: 1, opacity: disabled ? 0.4 : 1,
        transition: "background 0.15s",
      }}
      onMouseEnter={e => { if (!disabled && !active) e.currentTarget.style.background = "var(--surface)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = active ? "var(--blue-hover)" : "transparent"; }}
    >
      {children}
    </button>
  );
}

function fileIcon(mime: string): string {
  if (mime.includes("pdf"))   return "📄";
  if (mime.includes("word"))  return "📝";
  if (mime.includes("csv"))   return "📊";
  if (mime.includes("text"))  return "📃";
  return "📎";
}
