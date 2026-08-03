"use client";
import { useState } from "react";
import Link from "next/link";
import { Ghost, ArrowRight, CheckCircle } from "lucide-react";
import { getSupabase, SUPABASE_ENABLED, captureLead } from "@/lib/supabase";
import EmailCapture from "@/app/components/EmailCapture";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    if (password.length < 6) { setState("error"); setMsg("Password must be at least 6 characters."); return; }
    setState("loading");
    const { error } = await sb.auth.signUp({ email: email.trim().toLowerCase(), password, options: { data: { name: name.trim() } } });
    await captureLead(name.trim(), email.trim().toLowerCase(), "signup");
    if (error) { setState("error"); setMsg(error.message); return; }
    setState("done");
    setMsg("Account created! Check your email to confirm, then log in.");
  }

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full rounded-3xl p-10"
           style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(243,200,137,0.3)" }}>
        <div className="text-center">
          <Ghost className="w-12 h-12 mx-auto mb-4" style={{ color: "#f3c889" }} />
          <h1 className="text-3xl font-black text-white mb-2">Create Your Free Account</h1>
          <p className="text-sm mb-7" style={{ color: "#94a3b8" }}>
            100% free for Indian aviation students. Save your progress across devices.
          </p>
        </div>

        {SUPABASE_ENABLED ? (
          state === "done" ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: "#22c55e" }} />
              <p className="text-sm" style={{ color: "#94a3b8" }}>{msg}</p>
              <Link href="/login" className="inline-block mt-5 text-sm font-bold no-underline" style={{ color: "#f3c889" }}>Go to Log In →</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required
                     className="px-4 py-3 rounded-xl text-sm outline-none" style={inp} />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" required
                     className="px-4 py-3 rounded-xl text-sm outline-none" style={inp} />
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6 characters)" type="password" required
                     className="px-4 py-3 rounded-xl text-sm outline-none" style={inp} />
              {state === "error" && <p className="text-xs" style={{ color: "#ef4444" }}>{msg}</p>}
              <button type="submit" disabled={state === "loading"}
                      className="py-3 rounded-xl text-sm font-black disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg,#c25a1e,#c25a1e)", color: "#fff" }}>
                {state === "loading" ? "Creating..." : "Create Free Account"}
              </button>
              <p className="text-xs text-center" style={{ color: "#64748b" }}>
                Already have an account? <Link href="/login" className="no-underline" style={{ color: "#f3c889" }}>Log in</Link>
              </p>
            </form>
          )
        ) : (
          // Accounts not switched on yet → collect interest for launch + marketing.
          <>
            <EmailCapture heading="Be first to get an account" sub="Accounts & cross-device progress launch soon. Drop your details and we'll notify you." source="signup" />
            <div className="flex flex-col gap-3 mt-6">
              <Link href="/cpl" className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold no-underline"
                    style={{ background: "linear-gradient(135deg,#c25a1e,#c25a1e)", color: "#fff" }}>
                Start CPL Prep (free, no login) <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/atpl" className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold no-underline"
                    style={{ border: "1px solid rgba(240,145,58,0.4)", color: "#f0913a", background: "rgba(240,145,58,0.06)" }}>
                Start ATPL Prep <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { background: "rgba(10,15,20,0.8)", border: "1px solid rgba(243,200,137,0.3)", color: "#fff" };
