"use client";
import { useState } from "react";
import Link from "next/link";
import { Ghost, ArrowLeft, CheckCircle, Send } from "lucide-react";
import { getSupabase, SUPABASE_ENABLED, authErrorMessage, authRedirect } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setState("error");
      setMsg("Enter a valid email address.");
      return;
    }
    setState("loading");
    setMsg("");
    const { error } = await sb.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: authRedirect("/reset-password"),
    });
    if (error) {
      setState("error");
      setMsg(authErrorMessage(error.message));
      return;
    }
    // Same answer whether or not the address has an account. Saying "no such
    // user" here would turn this form into an account-enumeration oracle.
    setState("done");
    setMsg("If an account exists for that email, a reset link is on its way. Check your inbox and spam folder.");
  }

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-3xl p-10"
           style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(240,145,58,0.3)" }}>
        <div className="text-center">
          <Ghost className="w-12 h-12 mx-auto mb-4" style={{ color: "#f0913a" }} />
          <h1 className="text-3xl font-black text-white mb-2">Reset Your Password</h1>
          <p className="text-sm mb-7" style={{ color: "#94a3b8" }}>
            Enter the email you use for Ghost Aviator and we&rsquo;ll send a reset link.
          </p>
        </div>

        {!SUPABASE_ENABLED ? (
          <div className="text-center">
            <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
              Password reset is not configured for this copy of the site. Accounts are not switched on here.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold no-underline" style={{ color: "#f0913a" }}>
              <ArrowLeft className="w-4 h-4" /> Back to Log In
            </Link>
          </div>
        ) : state === "done" ? (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: "#22c55e" }} />
            <p role="status" className="text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>{msg}</p>
            <div className="flex flex-col gap-3 mt-6">
              <Link href="/login" className="inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black no-underline"
                    style={{ background: "linear-gradient(135deg,#f0913a,#0099cc)", color: "#000" }}>
                Back to Log In
              </Link>
              <button type="button" onClick={() => { setState("idle"); setMsg(""); }}
                      className="text-xs font-bold underline cursor-pointer bg-transparent border-0"
                      style={{ color: "#94a3b8" }}>
                Use a different email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" required
                   autoComplete="email" aria-label="Email address" className="px-4 py-3 rounded-xl text-sm" style={inp} />
            {state === "error" && <p role="alert" className="text-xs" style={{ color: "#ef4444" }}>{msg}</p>}
            <button type="submit" disabled={state === "loading"}
                    className="inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#f0913a,#0099cc)", color: "#000" }}>
              <Send className="w-4 h-4" /> {state === "loading" ? "Sending..." : "Send Reset Link"}
            </button>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 text-xs font-bold no-underline mt-1" style={{ color: "#94a3b8" }}>
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
            </Link>
            <p className="text-[11px] text-center leading-relaxed mt-1" style={{ color: "#475569" }}>
              The reset link is sent by our authentication provider, Supabase. It is a service email, not marketing.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { background: "rgba(10,15,20,0.8)", border: "1px solid rgba(240,145,58,0.3)", color: "#fff" };
