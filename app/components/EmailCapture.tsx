"use client";
import { useEffect, useRef, useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { captureLead } from "@/lib/supabase";

type Props = { compact?: boolean; heading?: string; sub?: string; source?: string };

export default function EmailCapture({ compact = false, heading, sub, source = "site" }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  // The error text lives in a live region that is ALWAYS mounted, and is emptied
  // and refilled on every failed attempt. A screen reader announces a change, so
  // the same message twice in a row (the same bad email submitted again) would
  // otherwise be silent the second time.
  const [errText, setErrText] = useState("");
  const errTimer = useRef<number | null>(null);
  useEffect(() => () => { if (errTimer.current !== null) window.clearTimeout(errTimer.current); }, []);
  function clearErr() {
    if (errTimer.current !== null) { window.clearTimeout(errTimer.current); errTimer.current = null; }
    setErrText("");
  }
  function showErr(m: string) {
    clearErr();
    errTimer.current = window.setTimeout(() => { errTimer.current = null; setErrText(m); }, 60);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    clearErr();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) { setState("error"); setMsg("Enter a valid email."); showErr("Enter a valid email."); return; }
    setState("loading");
    const r = await captureLead(name.trim(), email.trim().toLowerCase(), source);
    setState(r.ok ? "done" : "error");
    setMsg(r.message);
    if (!r.ok) showErr(r.message);
  }

  if (state === "done") {
    return (
      <div role="status" className="flex items-center gap-2 text-sm font-bold" style={{ color: "#22c55e" }}>
        <CheckCircle className="w-5 h-5" aria-hidden="true" /> {msg}
      </div>
    );
  }

  return (
    <div className={compact ? "" : "rounded-2xl p-6"}
         style={compact ? {} : { background: "rgba(17,24,32,0.95)", border: "1px solid rgba(171,121,77,0.3)" }}>
      {heading && <h3 className="text-lg font-black text-white mb-1">{heading}</h3>}
      {sub && <p className="text-sm mb-4" style={{ color: "#64748b" }}>{sub}</p>}
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
               aria-label="Your name" className="flex-1 px-4 py-2.5 rounded-lg text-sm"
               style={{ background: "rgba(10,15,20,0.8)", border: "1px solid rgba(171,121,77,0.3)", color: "#fff" }} />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" required
               aria-label="Email address" className="flex-1 px-4 py-2.5 rounded-lg text-sm"
               style={{ background: "rgba(10,15,20,0.8)", border: "1px solid rgba(171,121,77,0.3)", color: "#fff" }} />
        <button type="submit" disabled={state === "loading"}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-black no-underline disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#c25a1e,#c25a1e)", color: "#fff" }}>
          <Send className="w-4 h-4" /> {state === "loading" ? "..." : "Notify Me"}
        </button>
      </form>
      <p role="alert" aria-atomic="true" className={errText ? "text-xs mt-2" : "text-xs"} style={{ color: "#ef4444" }}>{errText}</p>
      <p className="text-xs mt-2" style={{ color: "#475569" }}>Free updates &amp; new chapters. No spam, unsubscribe anytime.</p>
    </div>
  );
}
