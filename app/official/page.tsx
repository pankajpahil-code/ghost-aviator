import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CreditCard,
  ExternalLink,
  Camera,
  Flag,
  Globe,
  Lock,
  MessageCircle,
  Phone,
  Play,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import { LIVE_WHATSAPP } from "@/lib/live-classes";
import {
  INSTAGRAM,
  ORG_ID,
  PERSON_ID,
  SITE_URL,
  TELEGRAM_CHANNEL,
  TELEGRAM_GROUP,
  WHATSAPP_GROUP,
  YOUTUBE_BRAND,
} from "@/lib/site";

const ACCENT = "#f0913a";
const CARD = "rgba(17,24,32,0.95)";
const HAIRLINE = "1px solid rgba(240,145,58,0.18)";

/**
 * The monthly code the Captain shows in live classes and on the official
 * YouTube channel. Change it on the first day of each month. A stale code is
 * worse than no code: it teaches students to trust the wrong thing.
 */
const VERIFICATION_CODE = "GA-OCT-2026";
const LAST_VERIFIED = "21 October 2026";

const OFFICIAL_WA = `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(
  "Hello Captain, I am checking whether this is the official Ghost Aviator account. Please confirm.",
)}`;

const REPORT_WA = `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(
  "Hello Captain, I want to report an account that may be impersonating Ghost Aviator. I have screenshots.",
)}`;

export const metadata: Metadata = {
  title: "Official Ghost Aviator Channels & Payment Verification",
  description:
    "The only official Ghost Aviator website, channels and payment route. Verify before you pay. We never sell recordings, never ask for your OTP, and never guarantee a pass, licence or job.",
  keywords: [
    "Ghost Aviator official website",
    "Ghost Aviator scam",
    "Ghost Aviator fake account",
    "DGCA coaching scam",
    "verify pilot coaching payment",
  ],
  alternates: { canonical: "/official" },
  openGraph: {
    title: "Official Ghost Aviator Channels — Verify Before You Pay",
    description:
      "The single source of truth for Ghost Aviator's official website, social channels, verification code and payment route.",
    url: `${SITE_URL}/official`,
    type: "website",
  },
};

const CHANNELS = [
  {
    icon: Globe,
    label: "Official website",
    value: "ghostaviator.com",
    href: SITE_URL,
    note: "The only domain we control. www redirects here.",
  },
  {
    icon: Play,
    label: "YouTube",
    value: "@Capt.GhostAviator",
    href: YOUTUBE_BRAND,
    note: "The brand channel. The Captain shows the monthly code here.",
  },
  {
    icon: Camera,
    label: "Instagram",
    value: "@capt.ghostaviator",
    href: INSTAGRAM,
    note: "The profile whose bio links back to ghostaviator.com.",
  },
  {
    icon: Send,
    label: "Telegram channel",
    value: "@ghostaviator",
    href: TELEGRAM_CHANNEL,
    note: "Announcements and new material.",
  },
  {
    icon: Users,
    label: "Telegram community",
    value: "Ghost Aviator student group",
    href: TELEGRAM_GROUP,
    note: "The moderated student community.",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp community",
    value: "D.G.C.A Exams HelpLine",
    href: WHATSAPP_GROUP,
    note: "The student help group.",
  },
  {
    icon: Phone,
    label: "Official WhatsApp / phone",
    value: "+91 99902 26607",
    href: OFFICIAL_WA,
    note: "The number shown in the site footer and on the live-class page.",
  },
] as const;

const NEVER = [
  "Ask for your password, OTP or a remote-access app.",
  "Sell recordings. We do not have recordings for sale.",
  "Guarantee a pass, a licence, a job or a salary.",
  "Take a commission from a flying school to send you there.",
  "Ask you to pay an account that is not published on this site.",
  "Ask you to keep a payment secret from your family.",
] as const;

const REPORT_STEPS = [
  "Stop. Do not pay, and do not send documents or OTPs.",
  "Screenshot the profile, the number, the message and the payment request.",
  "Report the account on the platform where it contacted you.",
  "Report it to cybercrime.gov.in — the Indian government's cybercrime portal.",
  "Send the screenshots to the Captain on the official WhatsApp number above.",
] as const;

const FAQ = [
  {
    q: "What is the official Ghost Aviator website?",
    a: "The only official website is https://ghostaviator.com. The www version redirects to it. We do not use a .in, .co, .net or lookalike domain for payments or classes.",
  },
  {
    q: "Does Ghost Aviator sell recordings?",
    a: "No. Ghost Aviator does not sell recordings of live classes. The live cohorts are live, and students receive written class notes and summaries — not videos. Anyone offering Ghost Aviator recordings is not us.",
  },
  {
    q: "How can I verify someone claiming to be the Captain?",
    a: "Check this page for the current monthly verification code, then ask the person to show it in a live class or on the official YouTube channel. A real account can point to this page. If it cannot, stop and report it.",
  },
  {
    q: "What payment route does Ghost Aviator use?",
    a: "First book a free live demo from https://ghostaviator.com/live-classes. After the demo, if you want to enroll, pay the full fee once by UPI using the QR shown on that page, then confirm on WhatsApp. There are no instalments. We are keeping UPI until the student intake is steady; there is no payment gateway today. We never send a different UPI ID or account number in a direct message.",
  },
] as const;

export default function OfficialPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/official`,
        name: "Official Ghost Aviator Channels & Payment Verification",
        description: metadata.description,
        url: `${SITE_URL}/official`,
        inLanguage: "en-IN",
        author: { "@id": PERSON_ID },
        publisher: { "@id": ORG_ID },
        about: { "@id": ORG_ID },
        dateModified: "2026-10-21",
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/official#faq`,
        mainEntity: FAQ.map(f => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/official#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Official channels" },
        ],
      },
    ],
  };

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ borderBottom: `1px solid ${ACCENT}25` }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 80% 55% at 50% 0%, ${ACCENT}20 0%, transparent 68%)` }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 text-center">
          <div
            className="inline-flex items-center justify-center p-3 rounded-full mb-6"
            style={{ background: `${ACCENT}15`, color: ACCENT }}
          >
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black mb-5"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.35)", color: "#22c55e" }}
          >
            <BadgeCheck className="w-3.5 h-3.5" /> LAST VERIFIED {LAST_VERIFIED.toUpperCase()}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
            Official Ghost Aviator channels — <span style={{ color: ACCENT }}>verify before you pay.</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "#94a3b8" }}>
            Scammers copy a teacher&apos;s photographs, make an account with his name, and ask students for money
            on Instagram, WhatsApp or Telegram. This page is the single source of truth. If a channel is not on
            this page, it is not us.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* The one domain */}
        <section className="rounded-3xl p-6 sm:p-8" style={{ background: CARD, border: HAIRLINE }}>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div>
              <div className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: ACCENT }}>
                The only official domain
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">ghostaviator.com</div>
              <p className="text-sm mt-2 max-w-2xl" style={{ color: "#94a3b8" }}>
                One domain. One canonical address. The <strong className="text-white">www</strong> version redirects
                here. We do not use a lookalike domain, a shortened link, or a &quot;backup&quot; site for payments.
              </p>
            </div>
            <a
              href={SITE_URL}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold no-underline"
              style={{ background: ACCENT, color: "#0b1117" }}
            >
              Open the official site <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div
            className="rounded-2xl px-4 py-3 text-sm"
            style={{ background: "rgba(255,40,40,0.08)", border: "1px solid rgba(255,60,60,0.3)", color: "#fca5a5" }}
          >
            <strong className="text-white">Check the address bar.</strong> A page can copy our design. It cannot
            copy the domain. If the address is not exactly <strong className="text-white">ghostaviator.com</strong>,
            close it.
          </div>
        </section>

        {/* Verification code */}
        <section className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
                 style={{ background: "linear-gradient(135deg, rgba(240,145,58,0.12), rgba(17,24,32,0.96))", border: `1px solid ${ACCENT}45` }}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase mb-3" style={{ color: ACCENT }}>
                <Lock className="w-4 h-4" /> This month&apos;s verification code
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
                Ask the Captain to show this code before you trust a payment request.
              </h2>
              <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "#94a3b8" }}>
                The Captain shows this code in live classes and on the official YouTube channel. A real account can
                point you back to this page. A fake account cannot. The code changes every month, so a screenshot
                from last month is not proof.
              </p>
            </div>
            <div className="text-center">
              <div
                className="rounded-2xl px-6 py-5 font-mono text-xl sm:text-2xl font-black tracking-wider"
                style={{ background: "#0b1117", border: `2px solid ${ACCENT}`, color: "#f3c889" }}
              >
                {VERIFICATION_CODE}
              </div>
              <div className="text-xs mt-2" style={{ color: "#64748b" }}>Current code · {LAST_VERIFIED}</div>
            </div>
          </div>
        </section>

        {/* Official channels */}
        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white mb-2">Official channels</h2>
            <p style={{ color: "#94a3b8" }}>
              These are the accounts we control. A profile with the same photograph is not official until it is
              listed here.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CHANNELS.map(channel => {
              const Icon = channel.icon;
              const external = channel.href.startsWith("http");
              return (
                <a
                  key={channel.label}
                  href={channel.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="rounded-2xl p-5 no-underline transition-transform hover:-translate-y-0.5"
                  style={{ background: CARD, border: HAIRLINE }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${ACCENT}15`, color: ACCENT }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#64748b" }}>
                        {channel.label}
                      </div>
                      <div className="font-black text-white truncate">{channel.value}</div>
                      <div className="text-xs mt-1 leading-relaxed" style={{ color: "#64748b" }}>
                        {channel.note}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-auto shrink-0" style={{ color: "#475569" }} />
                  </div>
                </a>
              );
            })}
          </div>
          <p className="text-sm mt-4" style={{ color: "#64748b" }}>
            We currently handle support on WhatsApp and Telegram. We have not published a separate official email
            address. If an email claiming to be Ghost Aviator asks you for money, verify it with us on the official
            WhatsApp number before you reply.
          </p>
        </section>

        {/* Payment safety */}
        <section className="rounded-3xl p-6 sm:p-8" style={{ background: CARD, border: HAIRLINE }}>
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6" style={{ color: ACCENT }} />
            <h2 className="text-2xl font-black text-white">Pay only from this site</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "#94a3b8" }}>
                The live-class page is the only place we publish a payment route. Book a free live demo first.
                After the demo, if you want to enroll, pay the full fee once by UPI using the QR shown on{" "}
                <Link href="/live-classes#pay" style={{ color: ACCENT }}>/live-classes</Link>, then confirm on
                WhatsApp. There are no instalments.
              </p>
              <div
                className="rounded-xl px-4 py-3 mt-3 text-sm"
                style={{ background: "#0b1117", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="font-black text-white">Open the payment page from the address bar</div>
                <div className="mt-1" style={{ color: "#94a3b8" }}>
                  Go to <Link href="/live-classes#pay" style={{ color: ACCENT }}>ghostaviator.com/live-classes</Link>.
                  The payment details shown there are the only ones we publish.
                </div>
              </div>
              <p className="text-xs mt-3" style={{ color: "#64748b" }}>
                We do not repeat the UPI ID on this page. A copied payment detail is exactly what an impersonator
                uses. If the UPI ID you were sent does not match the one on the live-class page, it is not from us.
              </p>
              <p className="text-xs mt-3" style={{ color: "#64748b" }}>
                We are keeping UPI until the student intake is steady. We may add a business checkout with receipts
                later; this page and the live-class page will say when that changes.
              </p>
            </div>
            <div
              className="rounded-2xl p-5"
              style={{ background: "rgba(255,40,40,0.06)", border: "1px solid rgba(255,60,60,0.28)" }}
            >
              <div className="flex items-center gap-2 font-black text-white mb-3">
                <AlertTriangle className="w-5 h-5" style={{ color: "#f87171" }} /> The red flag
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#fca5a5" }}>
                Anyone who messages you first, calls you &quot;beta&quot;, creates urgency, or asks you to pay
                quickly to &quot;hold a seat&quot; is using a sales script, not a classroom. Stop. Open this page.
                Pay only after the free demo, after you have verified the channel and the batch.
              </p>
            </div>
          </div>
        </section>

        {/* Never */}
        <section>
          <h2 className="text-3xl font-black text-white mb-2">We will never</h2>
          <p className="mb-6" style={{ color: "#94a3b8" }}>
            These are absolute. If someone claiming to be Ghost Aviator does any of them, it is not us.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NEVER.map(item => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
                style={{ background: CARD, border: HAIRLINE, color: "#cbd5e1" }}
              >
                <span className="text-lg leading-none" style={{ color: "#f87171" }}>×</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Report */}
        <section className="rounded-3xl p-6 sm:p-8" style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(248,113,113,0.3)" }}>
          <div className="flex items-center gap-3 mb-3">
            <Flag className="w-6 h-6" style={{ color: "#f87171" }} />
            <h2 className="text-2xl font-black text-white">If someone contacts you</h2>
          </div>
          <p className="mb-5 text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Do not argue with the account and do not pay to &quot;prove&quot; it is real. Save the evidence and
            report it. A screenshot is worth more than a deleted chat.
          </p>
          <ol className="space-y-3 mb-6">
            {REPORT_STEPS.map((step, index) => (
              <li key={step} className="flex items-start gap-3 text-sm" style={{ color: "#cbd5e1" }}>
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: "rgba(248,113,113,0.15)", color: "#fca5a5" }}
                >
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3">
            <a
              href={REPORT_WA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black no-underline"
              style={{ background: "#25D366", color: "#07120a" }}
            >
              <MessageCircle className="w-4 h-4" /> Report on official WhatsApp
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold no-underline"
              style={{ border: "1px solid rgba(248,113,113,0.4)", color: "#fca5a5", background: "rgba(248,113,113,0.06)" }}
            >
              cybercrime.gov.in <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-3xl font-black text-white mb-6">Questions students ask before paying</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FAQ.map(item => (
              <div key={item.q} className="rounded-2xl p-5" style={{ background: CARD, border: HAIRLINE }}>
                <h3 className="font-black text-white mb-2">{item.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="rounded-3xl p-8 text-center"
                 style={{ background: `linear-gradient(135deg, ${ACCENT}18, rgba(17,24,32,0.96))`, border: `1px solid ${ACCENT}40` }}>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Verify the channel. Then choose the room.</h2>
          <p className="max-w-2xl mx-auto mb-6 text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Free self-study stays free. The live cohort starts with a free demo; pay the full fee once by UPI only
            if you want to enroll after it. AI Self-Study is the library plus Gini. None of them requires you to
            trust an account that is not on this page.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/live-classes#demo"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black no-underline"
              style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#fff" }}
            >
              Book a free demo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/ai-self-study"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black no-underline"
              style={{ border: `1px solid ${ACCENT}50`, color: "#f3c889", background: `${ACCENT}0d` }}
            >
              AI Self-Study <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
