import type { Metadata } from "next";
import Link from "next/link";
import { LIVE_EMAIL, LIVE_WHATSAPP } from "@/lib/live-classes";

// Every sentence on this page is a claim about what the code does. Checked against the code on 24 Sep 2026:
// accounts (Supabase) are NOT switched on in production; progress lives in localStorage; Gini's route keeps
// the IP only in an in-memory rate limiter; the sales assistant stores chats on the Captain's own computer
// (D:\pk\ghost-sales-desk) and deletes a person on "delete my data" (engine.forget). Change the code, change this.
const UPDATED = "24 September 2026";

export const metadata: Metadata = {
  title: "Privacy Policy — Ghost Aviator",
  description:
    "What Ghost Aviator stores about you, why, and how to have it deleted. Short version: almost nothing on the website, and your conversation with us only if you message or comment first.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

const ACCENT = "#ab794d";
const CARD = "rgba(17,24,32,0.95)";
const HAIRLINE = "1px solid rgba(255,255,255,0.06)";

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="rounded-2xl p-6 mb-5" style={{ background: CARD, border: HAIRLINE }}>
      <h2 className="text-lg font-semibold mb-3" style={{ color: "#f1f5f9" }}>{title}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed" style={{ color: "#cbd5e1" }}>{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  const wa = `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent("Hello Capt. Pahil, please delete my data. My name / chat is:")}`;
  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 pt-24">
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Ghost Aviator</p>
        <h1 className="text-3xl font-bold mb-3" style={{ color: "#f8fafc" }}>Privacy Policy</h1>
        <p className="mb-8 text-sm" style={{ color: "#94a3b8" }}>
          Last updated {UPDATED}. Ghost Aviator is run by Capt. Pankaj Pahil. Questions about this page:{" "}
          <a href={`mailto:${LIVE_EMAIL}`} style={{ color: ACCENT }}>{LIVE_EMAIL}</a>.
        </p>

        <Section title="The short version">
          <p>You can use every chapter, question and tool on this website without an account and without telling us who you are.</p>
          <p>We keep a record of you only if you message us or comment on our videos and posts yourself. We never sell it, and we
            delete it when you ask.</p>
        </Section>

        <Section title="On this website">
          <p><strong>Your study progress</strong> (chapters read, quiz and exam scores) is saved in your own browser on your own
            device. It does not reach us. Clearing your browser data removes it.</p>
          <p><strong>Visit statistics.</strong> We count page visits with Vercel Web Analytics, which uses no third-party cookies and
            collects no personal identifiers. We see totals such as &ldquo;how many people opened this chapter&rdquo;, not who they were.</p>
          <p><strong>Gini, the on-site assistant.</strong> What you type to Gini is sent to our server, and may be sent to
            Google&rsquo;s Gemini service to choose the best stored answer. We do not save it. Your internet address is held
            briefly in memory only to stop one person flooding the service. Please do not type personal details to Gini.</p>
        </Section>

        <Section title="When you message or comment (Telegram, Instagram, Facebook, WhatsApp, YouTube)">
          <p>If you message Ghost Aviator first, or comment on one of our YouTube videos or Instagram posts, we keep: your ID on
            that app, the name the app shows us, the messages or comments you send and our replies, and anything you choose to
            tell us, such as your exam, subjects or exam month.</p>
          <p><strong>Why:</strong> to answer you, to remember where your conversation left off, and to follow up about the
            classes you asked about. Capt. Pahil sees these conversations so he can reply personally.</p>
          <p><strong>Where:</strong> on Capt. Pahil&rsquo;s own computer. It is not sold, rented or shared with anyone else.
            The messaging app you used (Telegram or Meta) also keeps its own copy under its own policy.</p>
          <p><strong>Your choices:</strong> send <strong>stop</strong> and we stop follow-up messages. The daily practice
            question is sent only if you ask for it, and <strong>stop daily</strong> ends it.</p>
          <p>In a group, the assistant answers exam questions asked to the group. It does not keep a record of group members
            who only ask a question there.</p>
        </Section>

        <Section title="Payments">
          <p>You pay for live classes in your own UPI app. We never see your bank, card or UPI PIN details. If you send us a
            payment screenshot, Capt. Pahil uses it only to confirm your seat.</p>
        </Section>

        <Section id="delete-your-data" title="Delete your data">
          <p>Send <strong>delete my data</strong> to our assistant in the same chat you used. It deletes your record, your
            messages and anything waiting to be sent to you, straight away, and confirms in one last message.</p>
          <p>Or ask us by <a href={wa} style={{ color: ACCENT }}>WhatsApp</a> or{" "}
            <a href={`mailto:${LIVE_EMAIL}?subject=${encodeURIComponent("Delete my data")}`} style={{ color: ACCENT }}>email</a>{" "}
            and we will delete it within 30 days.</p>
        </Section>

        <Section title="Students under 18">
          <p>If you are under 18, please involve a parent or guardian before you join a paid class.</p>
        </Section>

        <p className="text-sm mt-8" style={{ color: "#64748b" }}>
          If this page changes, the date at the top changes with it. <Link href="/" style={{ color: ACCENT }}>Back to Ghost Aviator</Link>
        </p>
      </div>
    </div>
  );
}
