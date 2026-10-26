"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ghost, ArrowRight, CheckCircle } from "lucide-react";
import { getSupabase, SUPABASE_ENABLED, captureLead, authErrorMessage, authRedirect } from "@/lib/supabase";
import EmailCapture from "@/app/components/EmailCapture";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    if (password.length < 6) { setState("error"); setMsg("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setState("error"); setMsg("The two passwords do not match."); return; }
    setState("loading");
    setMsg("");
    setResendMsg("");

    const { data, error } = await sb.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name: name.trim() },
        emailRedirectTo: authRedirect("/login"),
      },
    });
    if (error) {
      setState("error");
      setMsg(authErrorMessage(error.message));
      return;
    }

    // Marketing is a separate, optional choice. It is never inferred from the
    // fact that someone needed an account to sync their progress.
    if (marketing) {
      await captureLead(name.trim(), email.trim().toLowerCase(), "signup-opt-in").catch(() => {});
    }

    // With email confirmation switched on, Supabase returns a user but no
    // session. With it switched off, the student is already signed in.
    if (data.session) {
      router.push("/dashboard");
      return;
    }

    // Supabase deliberately returns an empty identities array for an existing
    // address when enumeration protection is on. Do not tell that person a new
    // account was created.
    const alreadyRegistered = Array.isArray(data.user?.identities) && data.user.identities.length === 0;
    setState("done");
    setMsg(
      alreadyRegistered
        ? "If this email is already registered, log in or use Forgot password. If it is new, check your inbox to confirm it."
        : "Account created! Check your email to confirm, then log in.",
    );
  }

  async function resendConfirmation() {
    const sb = getSupabase();
    if (!sb) return;
    if (!email.trim()) { setResendMsg("Enter your email address first."); return; }
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
              <div className="mt-5">
                <button type="button" onClick={resendConfirmation} disabled={resending}
                        className="text-xs font-bold underline cursor-pointer bg-transparent border-0 disabled:opacity-60"
                        style={{ color: "#94a3b8" }}>
                  {resending ? "Sending..." : "Resend confirmation email"}
                </button>
                {resendMsg && <p role="status" className="text-xs mt-2" style={{ color: resendMsg.toLowerCase().includes("sent") ? "#bbf7d0" : "#fecaca" }}>{resendMsg}</p>}
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" aria-label="Full name" autoComplete="name" required
                     className="px-4 py-3 rounded-xl text-sm outline-none" style={inp} />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" aria-label="Email address" autoComplete="email" type="email" required
                     className="px-4 py-3 rounded-xl text-sm outline-none" style={inp} />
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6 characters)" aria-label="Password, minimum 6 characters" autoComplete="new-password" type="password" minLength={6} required
                     className="px-4 py-3 rounded-xl text-sm outline-none" style={inp} />
              <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" aria-label="Confirm password" autoComplete="new-password" type="password" minLength={6} required
                     className="px-4 py-3 rounded-xl text-sm outline-none" style={inp} />

              <label className="flex items-start gap-2 text-xs leading-relaxed cursor-pointer" style={{ color: "#94a3b8" }}>
                <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)}
                       className="mt-0.5 shrink-0" style={{ accentColor: "#f3c889" }} />
                <span>Email me new chapters and DGCA exam updates. Optional — you can unsubscribe anytime.</span>
              </label>

              {state === "error" && <p role="alert" className="text-xs" style={{ color: "#ef4444" }}>{msg}</p>}
              <button type="submit" disabled={state === "loading"}
                      className="py-3 rounded-xl text-sm font-black disabled:opacity-60"
                      style={{ background: "linear-gradient(135deg,#c25a1e,#c25a1e)", color: "#fff" }}>
                {state === "loading" ? "Creating..." : "Create Free Account"}
              </button>
              <p className="text-xs text-center" style={{ color: "#64748b" }}>
                Already have an account? <Link href="/login" className="no-underline" style={{ color: "#f3c889" }}>Log in</Link>
              </p>
              <p className="text-[11px] text-center leading-relaxed" style={{ color: "#475569" }}>
                By creating an account you agree to our{" "}
                <Link href="/terms" className="no-underline" style={{ color: "#94a3b8" }}>Terms</Link>
                {" and "}
                <Link href="/privacy" className="no-underline" style={{ color: "#94a3b8" }}>Privacy Policy</Link>.
                We store your name, email and synced study progress to run your account.
              </p>
            </form>
          )
        ) : (
          // Accounts not configured on this deployment → collect interest for launch + updates.
          <>
            <EmailCapture heading="Be first to get an account" sub="Accounts and cross-device progress are not switched on for this copy of the site. Drop your details and we'll notify you." source="signup" />
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
