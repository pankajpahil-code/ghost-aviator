import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Send, ShieldCheck, Clock, CreditCard } from "lucide-react";
import { LIVE_WHATSAPP } from "@/lib/live-classes";
import { SITE_URL, ORG_ID, PERSON_ID, TELEGRAM_CHANNEL, TELEGRAM_GROUP } from "@/lib/site";
import { LegalPageShell, LegalSection, LEGAL_ACCENT } from "@/app/components/LegalPage";

const UPDATED = "21 October 2026";

const WHATSAPP = `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(
  "Hello Captain, I have a question about Ghost Aviator.",
)}`;

const WHATSAPP_DEMO = `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(
  "Hello Captain, I want to book a free demo for a live class. My subject is ____, my exam is in ____, and my city is ____.",
)}`;

const WHATSAPP_CLASS = `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(
  "Hello Captain, I want to ask about a live class. My subject is ____ and my exam is in ____.",
)}`;

const WHATSAPP_PAYMENT = `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(
  "Hello Captain, I have a payment or refund question. My name is ____, subject ____, payment date ____, amount ____, UTR ____.",
)}`;

export const metadata: Metadata = {
  title: "Contact Ghost Aviator — Official WhatsApp & Telegram",
  description:
    "Contact Ghost Aviator through the official WhatsApp number or Telegram. Book a free live demo, or ask about live classes, payments, refunds or verification. We never ask for OTPs or passwords.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Ghost Aviator — Official WhatsApp & Telegram",
    description:
      "Book a free live demo or ask about live classes, payments, refunds and impersonation reports through the official channels.",
    url: `${SITE_URL}/contact`,
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      "@id": `${SITE_URL}/contact`,
      name: "Contact Ghost Aviator",
      description: metadata.description,
      url: `${SITE_URL}/contact`,
      inLanguage: "en-IN",
      about: { "@id": ORG_ID },
      author: { "@id": PERSON_ID },
      publisher: { "@id": ORG_ID },
      dateModified: "2026-10-21",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/contact#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Contact" },
      ],
    },
  ],
};

function ContactCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-6 mb-4" style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center gap-2 mb-2" style={{ color: LEGAL_ACCENT }}>
        {icon}
        <h2 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>{title}</h2>
      </div>
      <div className="flex flex-col gap-2 text-[15px] leading-relaxed" style={{ color: "#cbd5e1" }}>
        {children}
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <LegalPageShell
      title="Contact Ghost Aviator"
      updated={UPDATED}
      intro={
        <>
          Use the official channels below. We never ask for your OTP, password, remote access or a payment to a
          different account. If someone does, stop and verify them on the{" "}
          <Link href="/official" style={{ color: LEGAL_ACCENT }}>official channels page</Link>.
        </>
      }
      jsonLd={jsonLd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <ContactCard icon={<MessageCircle className="w-5 h-5" />} title="WhatsApp">
          <p className="m-0">The fastest route. The Captain replies personally.</p>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="font-bold no-underline" style={{ color: LEGAL_ACCENT }}>
            Message +91 99902 26607
          </a>
          <p className="text-xs m-0" style={{ color: "#64748b" }}>Official number shown in the site footer and on the live-class page.</p>
        </ContactCard>

        <ContactCard icon={<Send className="w-5 h-5" />} title="Telegram">
          <p className="m-0">Announcements, new material and the student community.</p>
          <a href={TELEGRAM_CHANNEL} target="_blank" rel="noopener noreferrer" className="font-bold no-underline" style={{ color: LEGAL_ACCENT }}>
            Telegram channel
          </a>
          <a href={TELEGRAM_GROUP} target="_blank" rel="noopener noreferrer" className="text-sm no-underline" style={{ color: "#94a3b8" }}>
            Join the student group
          </a>
        </ContactCard>
      </div>

      <LegalSection title="Free demo and live-class questions">
        <p>
          Start with a free live demo. Tell us the subject, your exam month and your city. There is no fee for the
          demo and no obligation to enroll. If you want a seat after the demo, the full fee is paid once by UPI;
          there are no instalments. The current batch status is always shown on the{" "}
          <Link href="/live-classes" style={{ color: LEGAL_ACCENT }}>live-classes page</Link>.
        </p>
        <div className="flex flex-wrap gap-4">
          <a href={WHATSAPP_DEMO} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-bold no-underline" style={{ color: LEGAL_ACCENT }}>
            <MessageCircle className="w-4 h-4" /> Book a free demo
          </a>
          <a href={WHATSAPP_CLASS} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-bold no-underline" style={{ color: "#94a3b8" }}>
            Ask about a live class
          </a>
        </div>
      </LegalSection>

      <LegalSection title="Payments and refunds">
        <p>
          The free demo costs nothing. Do not pay before the demo. If you decide to enroll after it, pay the full
          fee once by UPI. Include your full name, the subject or product, the payment date, the amount, and the UTR
          or transaction ID in your message. Do not send your UPI PIN, card number, CVV or OTP.
        </p>
        <p>
          Read the <Link href="/refund-policy" style={{ color: LEGAL_ACCENT }}>Refund &amp; Cancellation Policy</Link>{" "}
          before you pay. The full amount is paid once; there are no instalments.
        </p>
        <a href={WHATSAPP_PAYMENT} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-bold no-underline" style={{ color: LEGAL_ACCENT }}>
          <CreditCard className="w-4 h-4" /> Ask a payment question
        </a>
      </LegalSection>

      <LegalSection title="Verify or report an impersonator">
        <p>
          Scammers copy the Captain&apos;s photographs and ask students to pay a different UPI ID. Check the{" "}
          <Link href="/official" style={{ color: LEGAL_ACCENT }}>official channels page</Link> before you pay anyone.
          If an account is impersonating Ghost Aviator, send screenshots to the official WhatsApp number and report
          it on the platform where it contacted you.
        </p>
        <div className="flex items-start gap-2 rounded-xl p-4" style={{ background: "rgba(240,145,58,0.08)", border: "1px solid rgba(240,145,58,0.25)" }}>
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#f0913a" }} />
          <p className="text-sm m-0">
            Ghost Aviator will never ask you to keep a payment secret from your family, and never asks for your
            password or OTP.
          </p>
        </div>
      </LegalSection>

      <LegalSection title="Response time">
        <p className="flex items-start gap-2">
          <Clock className="w-5 h-5 shrink-0 mt-0.5" style={{ color: LEGAL_ACCENT }} />
          <span>We aim to reply within 2 working days. The Captain replies personally, so please send one clear message rather than the same message on every channel.</span>
        </p>
      </LegalSection>

      <LegalSection title="Formal notices">
        <p>
          For a formal legal notice, ask on the official WhatsApp number for our postal address. We will provide it
          so the notice can be sent in writing.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
