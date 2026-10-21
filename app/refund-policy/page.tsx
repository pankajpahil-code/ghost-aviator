import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, ORG_ID, PERSON_ID } from "@/lib/site";
import { LegalPageShell, LegalSection, LEGAL_ACCENT } from "@/app/components/LegalPage";

const UPDATED = "21 October 2026";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — Ghost Aviator",
  description:
    "When Ghost Aviator refunds a live-class payment, how to request a refund, and what happens if a batch is cancelled or rescheduled.",
  alternates: { canonical: "/refund-policy" },
  openGraph: {
    title: "Refund & Cancellation Policy — Ghost Aviator",
    description:
      "Clear refund rules for Ghost Aviator live classes: before the first session, after it starts, and if we cancel.",
    url: `${SITE_URL}/refund-policy`,
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/refund-policy`,
      name: "Refund & Cancellation Policy — Ghost Aviator",
      description: metadata.description,
      url: `${SITE_URL}/refund-policy`,
      inLanguage: "en-IN",
      author: { "@id": PERSON_ID },
      publisher: { "@id": ORG_ID },
      dateModified: "2026-10-21",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/refund-policy#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Refund & Cancellation Policy" },
      ],
    },
  ],
};

export default function RefundPolicyPage() {
  return (
    <LegalPageShell
      title="Refund & Cancellation Policy"
      updated={UPDATED}
      intro={
        <>
          This policy explains when we refund a payment for a live class or another paid service. It is written
          to be clear, not to hide behind fine print. It does not limit your rights under Indian consumer law.
        </>
      }
      jsonLd={jsonLd}
    >
      <LegalSection title="The short version">
        <ul className="list-disc pl-5 flex flex-col gap-2">
          <li><strong>Payment:</strong> the full fee is paid after the free demo.</li>
          <li><strong>The free demo:</strong> no payment, so there is nothing to refund.</li>
          <li><strong>Before the first paid live session:</strong> full refund if you cancel.</li>
          <li><strong>After the first paid live session has started:</strong> no refund.</li>
          <li><strong>If we cancel the batch:</strong> full refund, or a credit if you prefer.</li>
          <li><strong>If we move the dates and you cannot attend:</strong> full refund, or a credit if you prefer.</li>
          <li><strong>If you miss a session:</strong> no refund; you receive the written summary.</li>
          <li><strong>Duplicate or wrong payment:</strong> the duplicate or excess amount is refunded.</li>
        </ul>
      </LegalSection>

      <LegalSection title="1. Live classes">
        <p>
          The free live demo is free. The rules below apply only after you have paid for a seat in a batch.
        </p>
        <p>
          You may cancel a paid live-class seat for a full refund any time before the first paid live session
          begins. Tell us on the official WhatsApp number or Telegram, and include the payment reference.
        </p>
        <p>
          Once the first paid live session has started, the seat is treated as consumed and the fee is
          non-refundable. This is because the batch is capped, the schedule is built around the students in it, and
          your seat can no longer be offered to someone else.
        </p>
        <p>
          If you miss a session, the fee is not refundable. You will receive the written summary and may bring your
          questions to the next doubt-clearing slot.
        </p>
      </LegalSection>

      <LegalSection title="2. If we cancel or reschedule">
        <p>
          If Ghost Aviator cancels a batch before it starts, you may choose a full refund or a credit for a future
          batch. If we move the start date or the schedule and you cannot attend the new dates, you may choose a
          full refund or a credit.
        </p>
        <p>
          If we remove you from a batch for misconduct, the fee is not refundable, subject to applicable law.
        </p>
      </LegalSection>

      <LegalSection title="3. Duplicate or incorrect payments">
        <p>
          If you pay twice, pay the wrong amount, or your bank debits you without a confirmed seat, contact us with
          the UTR or payment reference. We will verify the payment and refund the duplicate or excess amount to the
          original payment method.
        </p>
        <p>
          We do not refund to a different person&apos;s account or a different UPI ID. This protects both you and us
          from payment fraud.
        </p>
      </LegalSection>

      <LegalSection title="4. Digital notes, PDFs and books">
        <p>
          The chapter notes, question bank and most PDFs on this site are free. There is nothing to refund for free
          material.
        </p>
        <p>
          Paid books sold through Amazon follow Amazon&apos;s return and refund policy. If we later sell a paid PDF
          directly, the rules for that product will be shown on its page before you pay. As a general rule, a paid
          PDF is non-refundable after download unless the file is corrupt, incomplete or not the product you
          ordered; in that case we will replace it or refund it.
        </p>
      </LegalSection>

      <LegalSection title="5. How to request a refund">
        <p>
          Use the official{" "}
          <Link href="/contact" style={{ color: LEGAL_ACCENT }}>Contact page</Link> or the official WhatsApp number.
          Include:
        </p>
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>your full name;</li>
          <li>the subject or product you paid for;</li>
          <li>the payment date and amount;</li>
          <li>the UTR, transaction ID or payment screenshot.</li>
        </ul>
        <p>
          We aim to reply within 3 working days. Once a refund is approved, we send it to the original payment
          method within 7–10 working days. Your bank or UPI app may take longer to show the credit; that delay is
          outside our control.
        </p>
      </LegalSection>

      <LegalSection title="6. Chargebacks">
        <p>
          Please contact us before raising a chargeback or payment dispute. Most problems are a duplicate payment
          or a seat that was not confirmed, and we can resolve those faster directly. If a chargeback is raised
          without contacting us, we may suspend access while the dispute is resolved. Fraudulent chargebacks may
          be reported to the payment provider.
        </p>
      </LegalSection>

      <LegalSection title="7. AI Self-Study">
        <p>
          AI Self-Study is currently a waitlist and takes no payment. When it opens, its prices, inclusions and
          refund terms will be published before anyone pays.
        </p>
      </LegalSection>

      <LegalSection title="8. Your statutory rights">
        <p>
          Nothing in this policy limits rights you have under the Consumer Protection Act, 2019 or any other
          applicable Indian law. If a mandatory legal rule gives you a stronger refund right, that rule applies.
        </p>
      </LegalSection>

      <LegalSection title="9. Contact">
        <p>
          For a refund question, use the{" "}
          <Link href="/contact" style={{ color: LEGAL_ACCENT }}>Contact page</Link>. For a formal legal notice, ask
          on the official WhatsApp number for our postal address.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
