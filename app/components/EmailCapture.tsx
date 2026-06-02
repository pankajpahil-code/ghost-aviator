"use client";
import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { captureLead } from "@/lib/supabase";

type Props = { compact?: boolean; heading?: string; sub?: string; source?: string };

export default function EmailCapture({ compact = false, heading, sub, source = "site" }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) { setState("error"); setMsg("Enter a valid email."); return; }
    setState("loading");
    const r = await captureLead(name.trim(), email.trim().toLowerCase(), source);
    setState(r.ok ? "done" : "error");
    setMsg(r.message);
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "#22c55e" }}>
        <CheckCircle className="w-5 h-5" /> {msg}
      </div>
    );
  }

  return (
    <div className={compact ? "" : "rounded-2xl p-6"}
         style={compact ? {} : { background: "rgba(15,8,30,0.95)", border: "1px solid rgba(124,58,237,0.3)" }}>
      {heading && <h3 className="text-lg font-black text-white mb-1">{heading}</h3>}
      {sub && <p className="text-sm mb-4" style={{ color: "#64748b" }}>{sub}</p>}
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
               className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none"
               style={{ background: "rgba(5,5,16,0.8)", border: "1px solid rgba(124,58,237,0.3)", color: "#fff" }} />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" required
               className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none"
               style={{ background: "rgba(5,5,16,0.8)", border: "1px solid rgba(124,58,237,0.3)", color: "#fff" }} />
        <button type="submit" disabled={state === "loading"}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-black no-underline disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#9020ff,#ff2060)", color: "#fff" }}>
          <Send className="w-4 h-4" /> {state === "loading" ? "..." : "Notify Me"}
        </button>
      </form>
      {state === "error" && <p className="text-xs mt-2" style={{ color: "#ef4444" }}>{msg}</p>}
      <p className="text-xs mt-2" style={{ color: "#475569" }}>Free updates &amp; new chapters. No spam, unsubscribe anytime.</p>
    </div>
  );
}
