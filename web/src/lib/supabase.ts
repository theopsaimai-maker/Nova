import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// ── Browser client (singleton) ────────────────────────────────────────────────
let _browser: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!url || !anon) throw new Error("Supabase env vars not set");
  if (typeof window === "undefined") {
    return createClient(url, anon);
  }
  if (!_browser) _browser = createClient(url, anon);
  return _browser;
}

// ── Server/admin client (service role) ───────────────────────────────────────
// Only used in API routes — never exposed to the browser.
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ── Type helpers ──────────────────────────────────────────────────────────────
export type SupabaseClient = ReturnType<typeof getSupabase>;
