import Link from "next/link";
import type { Metadata } from "next";
import { Ghost, ArrowRight, Send } from "lucide-react";

export const metadata: Metadata = {
  title: "Log In — Ghost Aviator",
  description: "Sign-in coming soon. Ghost Aviator is fully free — no account needed to start studying.",
};

export default function LoginPage() {
  return (
    <div style={{ background: "#06040e" }} className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-3xl p-10 text-center"
           style={{ background: "rgba(15,8,30,0.95)", border: "1px solid rgba(0,212,255,0.3)" }}>
        <Ghost className="w-12 h-12 mx-auto mb-4" style={{ color: "#00d4ff" }} />
        <div className="inline-block text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-5"
             style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316", letterSpacing: "0.18em" }}>
          COMING SOON
        </div>
        <h1 className="text-3xl font-black text-white mb-3">Accounts Are On the Way</h1>
        <p className="text-base mb-8" style={{ color: "#94a3b8" }}>
          Personalised progress tracking, bookmarks, and saved attempts will launch shortly.
          For now, the entire study library is open — no login required.
        </p>

        <div className="flex flex-col gap-3 mb-6">
          <Link href="/cpl" className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold no-underline"
                style={{ background: "linear-gradient(135deg,#9020ff,#ff2060)", color: "#fff" }}>
            Start CPL Prep <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/atpl" className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold no-underline"
                style={{ border: "1px solid rgba(0,212,255,0.4)", color: "#00d4ff", background: "rgba(0,212,255,0.06)" }}>
            Start ATPL Prep <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <a href="https://t.me/+tgLMJithc1gzOWJl" target="_blank" rel="noreferrer"
           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium no-underline"
           style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.2)" }}>
          <Send className="w-4 h-4" /> Get notified on Telegram
        </a>
      </div>
    </div>
  );
}
