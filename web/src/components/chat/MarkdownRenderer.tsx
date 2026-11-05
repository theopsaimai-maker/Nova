"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState, useEffect, useRef } from "react";
import { CodeRunner } from "./CodeRunner";

/* ── Code block with copy + run ──────────────────────────────────────────── */
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)", margin: "12px 0" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 16px", background: "#1e1e2e",
        fontSize: 12, color: "#a6adc8",
      }}>
        <span style={{ fontFamily: "monospace" }}>{language || "code"}</span>
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "transparent", border: "none", cursor: "pointer",
            color: copied ? "#a6e3a1" : "#a6adc8", fontSize: 12,
            transition: "color 0.15s", fontFamily: "inherit",
          }}
        >
          {copied
            ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#a6e3a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="#a6adc8" strokeWidth="1.7"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="#a6adc8" strokeWidth="1.7"/></svg>
          }
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Syntax highlighted code */}
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: 0, padding: "1rem", fontSize: "0.855rem", lineHeight: 1.6 }}
        showLineNumbers={code.split("\n").length > 4}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>

      {/* Run button (JS/TS only) */}
      <CodeRunner code={code} language={language} />
    </div>
  );
}

/* ── Typing animation ────────────────────────────────────────────────────── */
function StreamingText({ content }: { content: string }) {
  const [displayed, setDisplayed] = useState("");
  const prevRef = useRef("");

  useEffect(() => {
    const prev = prevRef.current;
    if (content.startsWith(prev) && content.length > prev.length) {
      const newChunk = content.slice(prev.length);
      prevRef.current = content;
      let i = 0;
      const tick = () => {
        if (i < newChunk.length) {
          setDisplayed((d) => d + newChunk[i]);
          i++;
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    } else {
      prevRef.current = content;
      setDisplayed(content);
    }
  }, [content]);

  return <>{displayed}</>;
}

/* ── Main renderer ───────────────────────────────────────────────────────── */
interface Props {
  content: string;
  isStreaming?: boolean;
}

export function MarkdownRenderer({ content, isStreaming }: Props) {
  return (
    <div
      className={`prose${isStreaming ? " typing-cursor" : ""}`}
      style={{ maxWidth: "none", color: "var(--text)", fontSize: 15, lineHeight: 1.7 }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const codeStr = String(children).replace(/\n$/, "");
            if (!inline && match) {
              return <CodeBlock language={match[1]} code={codeStr} />;
            }
            return (
              <code style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 4, padding: "0.1em 0.4em",
                fontFamily: '"Roboto Mono", monospace', fontSize: "0.875em",
                color: "var(--text)",
              }} {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) { return <>{children}</>; },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer"
                style={{ color: "var(--blue)", textDecoration: "underline", textUnderlineOffset: 2 }}>
                {children}
              </a>
            );
          },
          p({ children }) {
            if (isStreaming && typeof children === "string") {
              return <p><StreamingText content={children} /></p>;
            }
            return <p>{children}</p>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
