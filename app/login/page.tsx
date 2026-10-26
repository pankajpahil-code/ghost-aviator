"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ghost, ArrowRight, Send } from "lucide-react";
import { getSupabase, SUPABASE_ENABLED, authErrorMessage, authRedirect } from "@/lib/supabase";
import EmailCapture from "@/app/components/EmailCapture";

type Notice = { tone: "success" | "info" | "error"; text: string };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const resetNotice = params.get("reset") === "1";

    // A recovery link should always land on /reset-password. If Supabase falls
    // back to the Site URL, the token is still in the hash and the reset page
    // can finish the job. Do this before getSupabase() consumes the token.
    if (hash.get("type") === "recovery") {
      window.location.replace(`/reset-password${window.location.hash}`);
      return;
    }

    const urlError = hash.get("error_description") || params.get("error_description");
    const initialNotice: Notice | null = urlError
      ? { tone: "error", text: urlError }
      : resetNotice
        ? { tone: "success", text: "Password updated. Log in with your new password." }
        : params.get("confirmed") === "1" || hash.get("type") === "signup"
          ? { tone: "success", text: "Email confirmed. Log in to continue." }
          : null;
    // Deferred: the effect is for reading the URL, not for a synchronous state
    // write during mount. The notice still appears before a student can type.
    if (initialNotice) window.setTimeout(() => setNotice(initialNotice), 0);

    const sb = getSupabase();
    if (!sb) return;

    // The client reads any session in the URL hash (email confirmation, magic
    // link) when it is created. If one is already live, skip the form.
    sb.auth.getSession().then(({ data }) => {
      if (data.session && !resetNotice && !urlError) router.replace("/dashboard");
    });
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    setState("loading");
    setMsg("");
    setNeedsConfirm(false);
    const { error } = await sb.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      setState("error");
      setMsg(authErrorMessage(error.message));
      setNeedsConfirm(error.message.toLowerCase().includes("email not confirmed"));
      return;
    }
    router.push("/dashboard");
  }

  async function resendConfirmation() {
    const sb = getSupabase();
    if (!sb) return;
    if (!email.trim()) {
      setResendMsg("Enter your email address first.");
      return;
    }
    setResending(true);
    setResendMsg("");
    const { error } = await sb.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: authRedirect("/login") },
    });
    setResending(false);
    setResendMsg(
      error
        ? authErrorMessage(error.message)
        : "Confirmation email sent. Check your inbox and spam folder.",
    );
  }

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-3xl p-10"
           style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(240,145,58,0.3)" }}>
        <div className="text-center">
          <Ghost className="w-12 h-12 mx-auto mb-4" style={{ color: "#f0913a" }} />
          <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
          <p className="text-sm mb-7" style={{ color: "#94a3b8" }}>Log in to sync your progress.</p>
        </div>

        {SUPABASE_ENABLED ? (
          <form onSubmit={submit} className="flex flex-col gap-3">
            {notice && (
              <div
                role={notice.tone === "error" ? "alert" : "status"}
                className="text-xs rounded-xl px-3 py-2.5 leading-relaxed"
                style={{
                  color: notice.tone === "error" ? "#fecaca" : notice.tone === "success" ? "#bbf7d0" : "#fde68a",
                  background: notice.tone === "error" ? "rgba(239,68,68,0.1)" : notice.tone === "success" ? "rgba(34,197,94,0.1)" : "rgba(243,200,137,0.1)",
                  border: `1px solid ${notice.tone === "error" ? "rgba(239,68,68,0.35)" : notice.tone === "success" ? "rgba(34,197,94,0.35)" : "rgba(243,200,137,0.35)"}`,
                }}
              >
                {notice.text}
              </div>
            )}

            <input value={email} onChange={e => { setEmail(e.target.value); setNeedsConfirm(false); }} placeholder="Email address" type="email" required
                   autoComplete="email" aria-label="Email address" className="px-4 py-3 rounded-xl text-sm" style={inp} />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" required
                   autoComplete="current-password" aria-label="Password" className="px-4 py-3 rounded-xl text-sm" style={inp} />

            <div className="flex justify-end -mt-1">
              <Link href="/forgot-password" className="text-xs no-underline" style={{ color: "#f0913a" }}>
                Forgot password?
              </Link>
            </div>

            {state === "error" && <p role="alert" className="text-xs" style={{ color: "#ef4444" }}>{msg}</p>}

            {needsConfirm && (
              <div className="text-xs rounded-xl px-3 py-2.5" style={{ background: "rgba(243,200,137,0.08)", border: "1px solid rgba(243,200,137,0.25)", color: "#fde68a" }}>
                <button type="button" onClick={resendConfirmation} disabled={resending}
                        className="font-bold underline cursor-pointer bg-transparent border-0 p-0 disabled:opacity-60"
                        style={{ color: "#f3c889" }}>
                  {resending ? "Sending..." : "Resend confirmation email"}
                </button>
                {resendMsg && <p role="status" className="mt-1.5" style={{ color: resendMsg.toLowerCase().includes("sent") ? "#bbf7d0" : "#fecaca" }}>{resendMsg}</p>}
              </div>
            )}

            <button type="submit" disabled={state === "loading"}
                    className="py-3 rounded-xl text-sm font-black disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#f0913a,#0099cc)", color: "#000" }}>
              {state === "loading" ? "Logging in..." : "Log In"}
            </button>
            <p className="text-xs text-center" style={{ color: "#64748b" }}>
              New here? <Link href="/signup" className="no-underline" style={{ color: "#f0913a" }}>Create a free account</Link>
            </p>
            <p className="text-[11px] text-center leading-relaxed" style={{ color: "#475569" }}>
              Your account stores your email and synced study progress.{" "}
              <Link href="/privacy" className="no-underline" style={{ color: "#94a3b8" }}>Privacy Policy</Link>
              {" · "}
              <Link href="/terms" className="no-underline" style={{ color: "#94a3b8" }}>Terms</Link>
            </p>
          </form>
        ) : (
          <>
            <div className="inline-block text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-5 mx-auto"
                 style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316", letterSpacing: "0.18em" }}>
              ACCOUNTS NOT CONFIGURED
            </div>
            <p className="text-sm text-center mb-6" style={{ color: "#94a3b8" }}>
              Accounts are not switched on for this copy of the site. The whole library is open now — no login needed.
            </p>
            <EmailCapture compact source="login" />
            <div className="flex flex-col gap-3 mt-6">
              <Link href="/cpl" className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold no-underline"
                    style={{ background: "linear-gradient(135deg,#c25a1e,#c25a1e)", color: "#fff" }}>
                Start CPL Prep <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="https://t.me/+tgLMJithc1gzOWJl" target="_blank" rel="noreferrer"
                 className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium no-underline"
                 style={{ background: "rgba(240,145,58,0.1)", color: "#f0913a", border: "1px solid rgba(240,145,58,0.2)" }}>
                <Send className="w-4 h-4" /> Get notified on Telegram
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { background: "rgba(10,15,20,0.8)", border: "1px solid rgba(240,145,58,0.3)", color: "#fff" };
