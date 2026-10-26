"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Ghost, ArrowLeft, CheckCircle, AlertCircle, KeyRound } from "lucide-react";
import { getSupabase, SUPABASE_ENABLED, authErrorMessage } from "@/lib/supabase";

type Status = "checking" | "ready" | "saving" | "invalid" | "disabled" | "done";

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<Status>(SUPABASE_ENABLED ? "checking" : "disabled");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [othersSignedOut, setOthersSignedOut] = useState(false);

  useEffect(() => {
    if (!SUPABASE_ENABLED) return;
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    const urlError = hash.get("error_description") || query.get("error_description");
    if (urlError) {
      // Deferred so the effect does not write state synchronously during mount.
      window.setTimeout(() => { setMsg(urlError); setStatus("invalid"); }, 0);
      return;
    }

    const sb = getSupabase();
    if (!sb) {
      window.setTimeout(() => setStatus("disabled"), 0);
      return;
    }

    let active = true;
    let timer: number | null = null;
    const ready = () => {
      if (!active) return;
      if (timer !== null) { window.clearTimeout(timer); timer = null; }
      setStatus("ready");
    };

    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) ready();
    });

    // getSession() waits for the client to read the recovery token from the
    // URL. The small fallback covers a link that is opened without a token:
    // rather than spin forever, say plainly that it is invalid.
    sb.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) { setMsg(error.message); setStatus("invalid"); return; }
      if (data.session) { ready(); return; }
      timer = window.setTimeout(() => { if (active) setStatus(s => s === "checking" ? "invalid" : s); }, 900);
    });

    return () => {
      active = false;
      if (timer !== null) window.clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setMsg("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setMsg("The two passwords do not match."); return; }
    const sb = getSupabase();
    if (!sb) return;
    setStatus("saving");
    setMsg("");
    const { error } = await sb.auth.updateUser({ password });
    if (error) {
      const text = authErrorMessage(error.message);
      if (error.message.toLowerCase().includes("session")) {
        setMsg("Your reset session has expired. Request a new link.");
        setStatus("invalid");
        return;
      }
      setMsg(text);
      setStatus("ready");
      return;
    }

    // The recovery session is still live. Keep this device signed in and
    // revoke every other session for the account. A failure here must not turn
    // a successful password change into a failed one.
    const { error: signOutError } = await sb.auth.signOut({ scope: "others" });
    setOthersSignedOut(!signOutError);
    setStatus("done");
  }

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-3xl p-10"
           style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(240,145,58,0.3)" }}>
        <div className="text-center">
          <Ghost className="w-12 h-12 mx-auto mb-4" style={{ color: "#f0913a" }} />
          <h1 className="text-3xl font-black text-white mb-2">Set a New Password</h1>
          <p className="text-sm mb-7" style={{ color: "#94a3b8" }}>
            Choose a password you don&rsquo;t use anywhere else.
          </p>
        </div>

        {status === "checking" && (
          <p role="status" className="text-sm text-center" style={{ color: "#94a3b8" }}>
            Checking your reset link…
          </p>
        )}

        {status === "disabled" && (
          <div className="text-center">
            <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
              Password reset is not configured for this copy of the site. Accounts are not switched on here.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold no-underline" style={{ color: "#f0913a" }}>
              <ArrowLeft className="w-4 h-4" /> Back to Log In
            </Link>
          </div>
        )}

        {status === "invalid" && (
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3" style={{ color: "#f0913a" }} />
            <p role="alert" className="text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>
              {msg || "This reset link is invalid or has expired."}
            </p>
            <div className="flex flex-col gap-3 mt-6">
              <Link href="/forgot-password" className="inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black no-underline"
                    style={{ background: "linear-gradient(135deg,#f0913a,#0099cc)", color: "#000" }}>
                Request a New Link
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 text-xs font-bold no-underline" style={{ color: "#94a3b8" }}>
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Log In
              </Link>
            </div>
          </div>
        )}

        {(status === "ready" || status === "saving") && (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="New password (min 6 characters)" type="password"
                   autoComplete="new-password" aria-label="New password, minimum 6 characters" minLength={6} required
                   className="px-4 py-3 rounded-xl text-sm" style={inp} />
            <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm new password" type="password"
                   autoComplete="new-password" aria-label="Confirm new password" minLength={6} required
                   className="px-4 py-3 rounded-xl text-sm" style={inp} />
            {msg && <p role="alert" className="text-xs" style={{ color: "#ef4444" }}>{msg}</p>}
            <button type="submit" disabled={status === "saving"}
                    className="inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#f0913a,#0099cc)", color: "#000" }}>
              <KeyRound className="w-4 h-4" /> {status === "saving" ? "Updating..." : "Update Password"}
            </button>
            <p className="text-[11px] text-center leading-relaxed" style={{ color: "#475569" }}>
              Your password is handled by Supabase and is never stored by Ghost Aviator in plain text.
            </p>
          </form>
        )}

        {status === "done" && (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{ color: "#22c55e" }} />
            <p role="status" className="text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>
              Your password has been updated.
              {othersSignedOut ? " Other devices have been signed out." : " You are signed in on this device."}
            </p>
            <div className="flex flex-col gap-3 mt-6">
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black no-underline"
                    style={{ background: "linear-gradient(135deg,#f0913a,#0099cc)", color: "#000" }}>
                Go to Dashboard
              </Link>
              <Link href="/cpl" className="text-xs font-bold underline no-underline" style={{ color: "#94a3b8" }}>
                Continue studying
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { background: "rgba(10,15,20,0.8)", border: "1px solid rgba(240,145,58,0.3)", color: "#fff" };
