"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";

export default function SignInPage() {
  const router = useRouter();
  const { setProfile } = useUserStore();
  const [loading, setLoading] = useState<"google" | "guest" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"main" | "guest-form">("main");

  const handleGoogle = async () => {
    setLoading("google");
    try {
      // Dynamically import signIn to avoid SSR issues
      const { signIn } = await import("next-auth/react");
      await signIn("google", { callbackUrl: "/" });
    } catch {
      setLoading(null);
    }
  };

  const handleGuestSubmit = () => {
    if (!name.trim()) return;
    setLoading("guest");
    setProfile({
      name: name.trim(),
      email: email.trim() || "guest@nova.ai",
      isGuest: true,
      avatar: name.trim().charAt(0).toUpperCase(),
    });
    router.push("/");
  };

  const handleQuickGuest = () => {
    setLoading("guest");
    setProfile({
      name: "Samuel Theophilus",
      email: "samuel@example.com",
      isGuest: true,
      avatar: "S",
    });
    router.push("/");
  };

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg)",
      fontFamily: '"Google Sans", "Roboto", system-ui, sans-serif',
      padding: 16,
    }}>
      <div style={{
        width: "100%", maxWidth: 420,
        background: "var(--bg)",
        borderRadius: 24,
        border: "1px solid var(--border)",
        padding: "40px 36px 32px",
        boxShadow: "var(--shadow-md)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <svg width="40" height="40" viewBox="0 0 56 56" fill="none">
            <defs>
              <linearGradient id="signStar" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e91e63" />
                <stop offset="45%" stopColor="#9c27b0" />
                <stop offset="100%" stopColor="#4285f4" />
              </linearGradient>
            </defs>
            <path d="M28 4C28 4 31 22 38 29C45 36 52 28 52 28C52 28 45 20 38 27C31 34 28 52 28 52C28 52 25 34 18 27C11 20 4 28 4 28C4 28 11 36 18 29C25 22 28 4 28 4Z" fill="url(#signStar)" />
          </svg>
          <span style={{
            fontSize: 32, fontWeight: 400, letterSpacing: "-0.5px",
            background: "linear-gradient(90deg, #1a73e8 0%, #7c3aed 40%, #db2777 80%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Gemini
          </span>
        </div>

        {step === "main" ? (
          <>
            <h1 style={{ fontSize: 24, fontWeight: 500, color: "var(--text)", marginBottom: 8, textAlign: "center" }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 32, textAlign: "center" }}>
              Sign in to save your conversations and settings
            </p>

            {/* Google sign-in */}
            <button
              onClick={handleGoogle}
              disabled={loading !== null}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                gap: 10, padding: "12px 20px", borderRadius: 9999,
                border: "1px solid var(--border-strong)",
                background: "var(--bg)", cursor: loading ? "not-allowed" : "pointer",
                fontSize: 15, fontWeight: 500, color: "var(--text)",
                transition: "background 0.15s", marginBottom: 12, fontFamily: "inherit",
                opacity: loading === "google" ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "var(--surface)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--bg)"; }}
            >
              {/* Google G */}
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading === "google" ? "Signing in…" : "Continue with Google"}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            </div>

            {/* Custom guest */}
            <button
              onClick={() => setStep("guest-form")}
              disabled={loading !== null}
              style={{
                width: "100%", padding: "12px 20px", borderRadius: 9999,
                border: "1px solid var(--border)",
                background: "transparent", cursor: loading ? "not-allowed" : "pointer",
                fontSize: 15, fontWeight: 400, color: "var(--text-secondary)",
                transition: "background 0.15s", marginBottom: 8, fontFamily: "inherit",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "var(--surface)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            >
              Continue as guest
            </button>

            {/* Quick continue */}
            <button
              onClick={handleQuickGuest}
              disabled={loading !== null}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, color: "var(--text-muted)", fontFamily: "inherit",
                textDecoration: "underline", textUnderlineOffset: 2,
                opacity: loading ? 0.5 : 1,
              }}
            >
              Quick start — skip sign in
            </button>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text)", marginBottom: 6, textAlign: "center" }}>
              Set up your profile
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 28, textAlign: "center" }}>
              How should Gemini address you?
            </p>

            {/* Name input */}
            <div style={{ width: "100%", marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleGuestSubmit()}
                placeholder="e.g. Samuel"
                autoFocus
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 12,
                  border: "1px solid var(--border-strong)",
                  background: "var(--surface)", color: "var(--text)",
                  fontSize: 15, outline: "none", fontFamily: "inherit",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--blue)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
              />
            </div>

            {/* Email input (optional) */}
            <div style={{ width: "100%", marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>
                Email <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>(optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleGuestSubmit()}
                placeholder="you@example.com"
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 12,
                  border: "1px solid var(--border-strong)",
                  background: "var(--surface)", color: "var(--text)",
                  fontSize: 15, outline: "none", fontFamily: "inherit",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--blue)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border-strong)")}
              />
            </div>

            <button
              onClick={handleGuestSubmit}
              disabled={!name.trim() || loading !== null}
              style={{
                width: "100%", padding: "12px 20px", borderRadius: 9999,
                border: "none",
                background: name.trim() ? "var(--blue)" : "var(--border)",
                color: name.trim() ? "#fff" : "var(--text-muted)",
                cursor: name.trim() && !loading ? "pointer" : "not-allowed",
                fontSize: 15, fontWeight: 500, fontFamily: "inherit",
                transition: "background 0.15s", marginBottom: 12,
              }}
            >
              {loading === "guest" ? "Starting…" : "Get started"}
            </button>

            <button
              onClick={() => setStep("main")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, color: "var(--text-muted)", fontFamily: "inherit",
              }}
            >
              ← Back
            </button>
          </>
        )}

        <p style={{ fontSize: 11, color: "var(--text-placeholder)", marginTop: 24, textAlign: "center", lineHeight: 1.6 }}>
          By continuing you agree to our Terms of Service and Privacy Policy.
          <br />Gemini can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
