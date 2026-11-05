"use client";

import { useState } from "react";

interface Props {
  code: string;
  language: string;
}

interface RunResult {
  output: string;
  error: boolean;
}

export function CodeRunner({ code, language }: Props) {
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [open, setOpen] = useState(false);

  // Only JS/TS is runnable in browser
  const canRun = ["javascript", "js", "typescript", "ts"].includes(language.toLowerCase());
  if (!canRun) return null;

  const run = () => {
    setRunning(true);
    setOpen(true);

    // Capture console.log output
    const logs: string[] = [];
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(" "));
    };
    console.error = (...args: unknown[]) => {
      logs.push("Error: " + args.map(String).join(" "));
    };
    console.warn = (...args: unknown[]) => {
      logs.push("Warn: " + args.map(String).join(" "));
    };

    try {
      // Strip TypeScript type annotations for execution
      const jsCode = code
        .replace(/:\s*(string|number|boolean|void|any|unknown|never)(\[\])*/g, "")
        .replace(/interface\s+\w+\s*\{[^}]*\}/g, "")
        .replace(/<[A-Z]\w*>/g, "");

      // eslint-disable-next-line no-new-func
      const fn = new Function(jsCode);
      const returnVal = fn();

      if (returnVal !== undefined && logs.length === 0) {
        logs.push(String(returnVal));
      }

      setResult({
        output: logs.length > 0 ? logs.join("\n") : "(no output)",
        error: false,
      });
    } catch (err) {
      setResult({
        output: err instanceof Error ? err.message : String(err),
        error: true,
      });
    } finally {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      setRunning(false);
    }
  };

  const clear = () => { setResult(null); setOpen(false); };

  return (
    <div style={{ marginTop: -1 }}>
      {/* Run bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 14px",
        background: "#1e1e2e",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}>
        <button
          onClick={run}
          disabled={running}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 6, border: "none",
            background: "#34a853", color: "#fff",
            cursor: running ? "not-allowed" : "pointer",
            fontSize: 12, fontWeight: 600, fontFamily: "inherit",
            opacity: running ? 0.7 : 1, transition: "opacity 0.15s",
          }}
        >
          {running ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
              </svg>
              Running…
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M5 3l14 9-14 9V3z" fill="white"/>
              </svg>
              Run
            </>
          )}
        </button>

        {result && (
          <button
            onClick={clear}
            style={{
              padding: "4px 10px", borderRadius: 6, border: "none",
              background: "rgba(255,255,255,0.1)", color: "#a6adc8",
              cursor: "pointer", fontSize: 12, fontFamily: "inherit",
            }}
          >
            Clear
          </button>
        )}

        <span style={{ fontSize: 11, color: "#6c7086", marginLeft: "auto" }}>
          Browser JS sandbox
        </span>
      </div>

      {/* Output panel */}
      {open && result && (
        <div style={{
          background: result.error ? "#2d1b1b" : "#1a1b2e",
          borderTop: `1px solid ${result.error ? "#ea4335" : "rgba(255,255,255,0.07)"}`,
          padding: "10px 16px",
          fontFamily: '"Roboto Mono", monospace',
          fontSize: 13,
          lineHeight: 1.6,
        }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
            color: result.error ? "#f28b82" : "#a6e3a1",
            marginBottom: 6, textTransform: "uppercase",
          }}>
            {result.error ? "⚠ Error" : "✓ Output"}
          </div>
          <pre style={{
            margin: 0,
            color: result.error ? "#f28b82" : "#cdd6f4",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
            {result.output}
          </pre>
        </div>
      )}
    </div>
  );
}
