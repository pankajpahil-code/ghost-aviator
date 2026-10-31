import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, ExternalLink, Flag, Globe, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { LIVE_WHATSAPP, LIVE_PHONE_DISPLAY } from "@/lib/live-classes";
import { OFFICIAL_CHANNELS, ORG_ID, PERSON_ID, SITE_URL } from "@/lib/site";

// Restored 2026-10-31 from the unmerged feat/ai-first-trust-pages branch, which
// Google still lists. This is the hub every profile's "link in bio" points at
// (/links redirects here). Adapted for current main: every channel comes from
// OFFICIAL_CHANNELS in lib/site.ts, and the price / fee / payment wording and
// the monthly verification code (which goes stale every month) were taken out.

const ACCENT = "#f0913a";
const CARD = "rgba(17,24,32,0.95)";
const HAIRLINE = "1px solid rgba(240,145,58,0.18)";
const LAST_VERIFIED = "31 October 2026";

const OFFICIAL_WA = `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(
  "Hello Captain, I am checking whether this is the official Ghost Aviator account. Please confirm.",
)}`;
const REPORT_WA = `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(
  "Hello Captain, I want to report an account that may be impersonating Ghost Aviator. I have screenshots.",
)}`;

const DESCRIPTION =
  "Every official Ghost Aviator and Capt. Pankaj Pahil account in one place: website, YouTube, Instagram, Telegram, Facebook, Reddit, Quora, Threads and more. If an account is not listed here, it is not us.";

export const metadata: Metadata = {
  title: "Official Ghost Aviator Channels — YouTube, Instagram, Telegram & More",
  description: DESCRIPTION,
  alternates: { canonical: "/official" },
  openGraph: {
    title: "Official Ghost Aviator Channels",
    description: "The single list of Ghost Aviator's official website and social accounts.",
    url: `${SITE_URL}/official`,
    type: "website",
  },
};

const NEVER = [
  "Ask for your password, OTP or a remote-access app.",
  "Sell recordings of live classes.",
  "Guarantee a pass, a licence, a job or a salary.",
  "Take a commission from a flying school to send you there.",
  "Contact you from an account that is not listed on this page.",
  "Ask you to keep anything secret from your family.",
] as const;

const REPORT_STEPS = [
  "Stop. Do not send documents, OTPs or passwords.",
  "Screenshot the profile, the number and the messages.",
  "Report the account on the platform where it contacted you.",
  "Report it to cybercrime.gov.in, the Indian government's cybercrime portal.",
  "Send the screenshots to Capt. Pankaj Pahil on the official WhatsApp number on this page.",
] as const;

const FAQ = [
  {
    q: "What is the official Ghost Aviator website?",
    a: "The only official website is https://ghostaviator.com. The www version redirects to it. We do not use a .in, .co, .net or lookalike domain.",
  },
  {
    q: "Which social accounts are official?",
    a: "Only the accounts listed on https://ghostaviator.com/official. A profile that uses the Captain's photographs but is not on this page is not run by Ghost Aviator.",
  },
  {
    q: "Does Ghost Aviator sell recordings?",
    a: "No. Live classes are live, and students receive written class notes and summaries, not videos. Anyone offering Ghost Aviator recordings is not us.",
  },
  {
    q: "How can I check that someone is really Capt. Pankaj Pahil?",
    a: `Message the official WhatsApp number on this page (${LIVE_PHONE_DISPLAY}). A real Ghost Aviator account can always point you back to this page. If it cannot, stop and report it.`,
  },
] as const;

export default function OfficialPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebPage", "ProfilePage"],
        "@id": `${SITE_URL}/official`,
        name: "Official Ghost Aviator Channels",
        description: DESCRIPTION,
        url: `${SITE_URL}/official`,
        inLanguage: "en-IN",
        mainEntity: { "@id": ORG_ID },
        about: { "@id": ORG_ID },
        author: { "@id": PERSON_ID },
        publisher: { "@id": ORG_ID },
        dateModified: "2026-10-31",
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/official#channels`,
        name: "Official Ghost Aviator channels",
        itemListElement: [SITE_URL, ...OFFICIAL_CHANNELS.map(c => c.href)].map((url, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url,
        })),
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

      <section className="relative overflow-hidden" style={{ borderBottom: `1px solid ${ACCENT}25` }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 80% 55% at 50% 0%, ${ACCENT}20 0%, transparent 68%)` }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full mb-6" style={{ background: `${ACCENT}15`, color: ACCENT }}>
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black mb-5"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.35)", color: "#22c55e" }}
          >
            <BadgeCheck className="w-3.5 h-3.5" /> LAST VERIFIED {LAST_VERIFIED.toUpperCase()}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-5 leading-tight">
            Official Ghost Aviator <span style={{ color: ACCENT }}>channels</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "#94a3b8" }}>
            Every account run by Ghost Aviator and Capt. Pankaj Pahil, in one place. Scammers copy a teacher&apos;s
            photographs and make accounts with his name. If a channel is not on this page, it is not us.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <section className="rounded-3xl p-6 sm:p-8" style={{ background: CARD, border: HAIRLINE }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: ACCENT }}>
                The only official website
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
                <Globe className="w-6 h-6" style={{ color: ACCENT }} /> ghostaviator.com
              </div>
              <p className="text-sm mt-2 max-w-2xl" style={{ color: "#94a3b8" }}>
                One domain. The <strong className="text-white">www</strong> version redirects here. We do not use a
                lookalike domain or a &quot;backup&quot; site. A page can copy our design; it cannot copy the
                address bar.
              </p>
            </div>
            <a
              href={OFFICIAL_WA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold no-underline"
              style={{ background: ACCENT, color: "#0b1117" }}
            >
              <Phone className="w-4 h-4" /> {LIVE_PHONE_DISPLAY}
            </a>
          </div>
          <p className="text-xs mt-4" style={{ color: "#64748b" }}>
            Official phone and WhatsApp of Capt. Pankaj Pahil, the same number as in the site footer.
          </p>
        </section>

        <section>
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white mb-2">Official accounts</h2>
            <p style={{ color: "#94a3b8" }}>
              These are the accounts we control. A profile with the same photograph is not official until it is
              listed here.
            </p>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0 m-0">
            {OFFICIAL_CHANNELS.map(channel => (
              <li key={channel.href}>
                <a
                  href={channel.href}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="block h-full rounded-2xl p-5 no-underline transition-transform hover:-translate-y-0.5"
                  style={{ background: CARD, border: HAIRLINE }}
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-bold uppercase tracking-wider" style={{ color: "#64748b" }}>
                        {channel.label}
                      </div>
                      <div className="font-black text-white truncate">{channel.handle}</div>
                      <div className="text-xs mt-1 leading-relaxed" style={{ color: "#64748b" }}>{channel.note}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-auto shrink-0" style={{ color: "#475569" }} />
                  </div>
                </a>
              </li>
            ))}
          </ul>
          <p className="text-sm mt-4" style={{ color: "#64748b" }}>
            Support is handled on WhatsApp and Telegram. See the <Link href="/contact" style={{ color: ACCENT }}>contact page</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-black text-white mb-2">We will never</h2>
          <p className="mb-6" style={{ color: "#94a3b8" }}>
            If someone claiming to be Ghost Aviator does any of these, it is not us.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NEVER.map(item => (
              <div key={item} className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm" style={{ background: CARD, border: HAIRLINE, color: "#cbd5e1" }}>
                <span className="text-lg leading-none" style={{ color: "#f87171" }}>×</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl p-6 sm:p-8" style={{ background: CARD, border: "1px solid rgba(248,113,113,0.3)" }}>
          <div className="flex items-center gap-3 mb-3">
            <Flag className="w-6 h-6" style={{ color: "#f87171" }} />
            <h2 className="text-2xl font-black text-white">If a fake account contacts you</h2>
          </div>
          <ol className="space-y-3 mb-6">
            {REPORT_STEPS.map((step, index) => (
              <li key={step} className="flex items-start gap-3 text-sm" style={{ color: "#cbd5e1" }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0" style={{ background: "rgba(248,113,113,0.15)", color: "#fca5a5" }}>
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3">
            <a href={REPORT_WA} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black no-underline" style={{ background: "#25D366", color: "#07120a" }}>
              <MessageCircle className="w-4 h-4" /> Report on official WhatsApp
            </a>
            <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold no-underline" style={{ border: "1px solid rgba(248,113,113,0.4)", color: "#fca5a5", background: "rgba(248,113,113,0.06)" }}>
              cybercrime.gov.in <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-black text-white mb-6">Common questions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FAQ.map(item => (
              <div key={item.q} className="rounded-2xl p-5" style={{ background: CARD, border: HAIRLINE }}>
                <h3 className="font-black text-white mb-2">{item.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${ACCENT}18, rgba(17,24,32,0.96))`, border: `1px solid ${ACCENT}40` }}>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Start studying</h2>
          <p className="max-w-2xl mx-auto mb-6 text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Chapter notes, question banks and mock tests are free on ghostaviator.com. Live classes with Capt. Pankaj
            Pahil are optional, and the next batch is forming now.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/cpl" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black no-underline" style={{ background: ACCENT, color: "#0b1117" }}>
              Free CPL notes <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/live-classes" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black no-underline" style={{ border: `1px solid ${ACCENT}50`, color: "#f3c889", background: `${ACCENT}0d` }}>
              Live classes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
