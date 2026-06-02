"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ghost, ArrowRight, Send } from "lucide-react";
import { getSupabase, SUPABASE_ENABLED } from "@/lib/supabase";
import EmailCapture from "@/app/components/EmailCapture";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    setState("loading");
    const { error } = await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) { setState("error"); setMsg(error.message); return; }
    router.push("/cpl");
  }

  return (
    <div style={{ background: "#06040e" }} className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-3xl p-10"
           style={{ background: "rgba(15,8,30,0.95)", border: "1px solid rgba(0,212,255,0.3)" }}>
        <div className="text-center">
          <Ghost className="w-12 h-12 mx-auto mb-4" style={{ color: "#00d4ff" }} />
          <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
          <p className="text-sm mb-7" style={{ color: "#94a3b8" }}>Log in to sync your progress.</p>
        </div>

        {SUPABASE_ENABLED ? (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" required
                   className="px-4 py-3 rounded-xl text-sm outline-none" style={inp} />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" required
                   className="px-4 py-3 rounded-xl text-sm outline-none" style={inp} />
            {state === "error" && <p className="text-xs" style={{ color: "#ef4444" }}>{msg}</p>}
            <button type="submit" disabled={state === "loading"}
                    className="py-3 rounded-xl text-sm font-black disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#000" }}>
              {state === "loading" ? "Logging in..." : "Log In"}
            </button>
            <p className="text-xs text-center" style={{ color: "#64748b" }}>
              New here? <Link href="/signup" className="no-underline" style={{ color: "#00d4ff" }}>Create a free account</Link>
            </p>
          </form>
        ) : (
          <>
            <div className="inline-block text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-5 mx-auto"
                 style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316", letterSpacing: "0.18em" }}>
              COMING SOON
            </div>
            <p className="text-sm text-center mb-6" style={{ color: "#94a3b8" }}>
              Accounts launch soon. The whole library is open now — no login needed.
            </p>
            <EmailCapture compact source="login" />
            <div className="flex flex-col gap-3 mt-6">
              <Link href="/cpl" className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold no-underline"
                    style={{ background: "linear-gradient(135deg,#9020ff,#ff2060)", color: "#fff" }}>
                Start CPL Prep <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="https://t.me/+tgLMJithc1gzOWJl" target="_blank" rel="noreferrer"
                 className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium no-underline"
                 style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.2)" }}>
                <Send className="w-4 h-4" /> Get notified on Telegram
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { background: "rgba(5,5,16,0.8)", border: "1px solid rgba(0,212,255,0.3)", color: "#fff" };
