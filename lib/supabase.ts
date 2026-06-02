"use client";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

// Supabase powers (a) optional accounts/login and (b) the marketing lead list.
// It activates automatically once these two env vars are set in Vercel:
//   NEXT_PUBLIC_SUPABASE_URL
//   NEXT_PUBLIC_SUPABASE_ANON_KEY
// Until then, everything degrades gracefully (forms show a friendly message,
// the site keeps working).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_ENABLED = Boolean(url && anon);

let client: SupabaseClient | null = null;
export function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_ENABLED) return null;
  if (!client) {
    client = createClient(url as string, anon as string, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return client;
}

// Capture a marketing lead (name + email). Stored in the `leads` table.
export async function captureLead(name: string, email: string, source = "site"): Promise<{ ok: boolean; message: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, message: "Sign-ups are opening soon — please check back." };
  const { error } = await sb.from("leads").insert({ name, email, source });
  if (error) {
    if (error.code === "23505") return { ok: true, message: "You're already on the list — thank you!" };
    return { ok: false, message: "Something went wrong. Please try again." };
  }
  return { ok: true, message: "You're in! We'll keep you posted." };
}

// Current logged-in user (null when signed-out or auth disabled).
export function useUser(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }
    sb.auth.getUser().then(({ data }) => { setUser(data.user ?? null); setLoading(false); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);
  return { user, loading };
}
