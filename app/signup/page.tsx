import Link from "next/link";
import type { Metadata } from "next";
import { Ghost, Send, CheckCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Get Started Free — Ghost Aviator",
  description: "Free DGCA CPL/ATPL exam prep — start studying immediately, no signup required.",
};

export default function SignupPage() {
  return (
    <div style={{ background: "#06040e" }} className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full rounded-3xl p-10 text-center"
           style={{ background: "rgba(15,8,30,0.95)", border: "1px solid rgba(180,100,255,0.3)" }}>
        <Ghost className="w-12 h-12 mx-auto mb-4" style={{ color: "#c080ff" }} />
        <h1 className="text-3xl font-black text-white mb-3">It&apos;s Already Free</h1>
        <p className="text-base mb-8" style={{ color: "#94a3b8" }}>
          Ghost Aviator is fully free for Indian aviation students — no signup or payment required to start studying.
          Open any chapter, take a quiz, or attempt the mock test directly.
        </p>

        <div className="rounded-2xl p-5 mb-8 text-left"
             style={{ background: "rgba(180,100,255,0.08)", border: "1px solid rgba(180,100,255,0.25)" }}>
          <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#c080ff", letterSpacing: "0.18em" }}>
            FREE COUPON
          </div>
          <div className="text-2xl font-black mb-1" style={{ color: "#c080ff" }}>FREEPILOT</div>
          <p className="text-xs" style={{ color: "#64748b" }}>
            Reserved for rural and underprivileged students when accounts launch.
          </p>
        </div>

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

        <div className="flex items-center justify-center gap-2 text-xs mb-6" style={{ color: "#64748b" }}>
          <CheckCircle className="w-3.5 h-3.5" style={{ color: "#22c55e" }} />
          <span>Accounts &amp; progress sync coming soon</span>
        </div>

        <a href="https://t.me/+tgLMJithc1gzOWJl" target="_blank" rel="noreferrer"
           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium no-underline"
           style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.2)" }}>
          <Send className="w-4 h-4" /> Join Telegram for updates
        </a>
      </div>
    </div>
  );
}
