import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, ORG_ID, PERSON_ID } from "@/lib/site";
import { LegalPageShell, LegalSection, LEGAL_ACCENT } from "@/app/components/LegalPage";

const UPDATED = "21 October 2026";

export const metadata: Metadata = {
  title: "Terms of Service — Ghost Aviator",
  description:
    "The plain-language terms for using Ghost Aviator's free DGCA study material, paid live classes, AI Self-Study waitlist and books.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service — Ghost Aviator",
    description:
      "Rules for using Ghost Aviator's free study material, live classes, AI Self-Study waitlist and books.",
    url: `${SITE_URL}/terms`,
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/terms`,
      name: "Terms of Service — Ghost Aviator",
      description: metadata.description,
      url: `${SITE_URL}/terms`,
      inLanguage: "en-IN",
      author: { "@id": PERSON_ID },
      publisher: { "@id": ORG_ID },
      dateModified: "2026-10-21",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/terms#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Terms of Service" },
      ],
    },
  ],
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      updated={UPDATED}
      intro={
        <>
          These Terms explain the rules for using Ghost Aviator. They are written in plain English, and they do
          not replace your rights under Indian consumer law. If you do not agree with them, please do not use the
          paid services.
        </>
      }
      jsonLd={jsonLd}
    >
      <LegalSection title="1. Who we are">
        <p>
          Ghost Aviator is an independent DGCA CPL and ATPL study platform operated in India by
          <strong> Capt. Pankaj Pahil</strong>. In these Terms, &ldquo;Ghost Aviator&rdquo;, &ldquo;we&rdquo;,
          &ldquo;us&rdquo; and &ldquo;our&rdquo; mean that service. &ldquo;You&rdquo; means the person using the
          website or buying a class.
        </p>
      </LegalSection>

      <LegalSection title="2. What we provide">
        <p>
          Ghost Aviator provides free chapter notes, a verified question bank, mock tests, study tools and
          reference material. Paid live online classes are offered separately in small batches. AI Self-Study is
          currently a waitlist and does not take payment. Books and PDFs are offered only where the relevant page
          says they are available.
        </p>
        <p>
          The price, schedule and inclusions shown on the relevant page at the time of purchase form part of these
          Terms. If a page and these Terms conflict on a specific paid service, the page description for that
          service wins.
        </p>
      </LegalSection>

      <LegalSection title="3. Free material and no guarantee">
        <p>
          Free material is for your personal study. It is not a DGCA publication and is not a substitute for the
          current DGCA regulations, CARs, or the instructions of your flying school. Aviation rules, procedures
          and question patterns change. Always check the current official source before you rely on an answer for
          an exam, a flight or a licence application.
        </p>
        <p>
          We do not guarantee that you will pass an exam, obtain a licence, get a job or earn a particular salary.
          We teach and provide study material; the result depends on your work, your exam and the DGCA.
        </p>
      </LegalSection>

      <LegalSection title="4. Live classes">
        <p>
          A live-class seat is confirmed only when the full one-time payment has been received and we have
          acknowledged it. The batch size is capped on the live-class page. The schedule is shared before the
          first session.
        </p>
        <p>
          Classes are taught live on Google Meet or another platform we name. <strong>There are no recordings.</strong>{" "}
          We provide written class notes and summaries. You may not record, stream, share or resell a class or its
          materials.
        </p>
        <p>
          Attend live. If you miss a session, you receive the written summary and may bring your questions to the
          next doubt-clearing slot. Missed sessions are not refundable. The refund rules are set out in our{" "}
          <Link href="/refund-policy" style={{ color: LEGAL_ACCENT }}>Refund &amp; Cancellation Policy</Link>.
        </p>
        <p>
          Behave respectfully. We may remove a student who harasses others, shares paid access, records the class
          or repeatedly disrupts teaching. Removal for misconduct does not create a refund right, subject to
          applicable law.
        </p>
      </LegalSection>

      <LegalSection title="5. Payments">
        <p>
          Pay only through the payment route published on{" "}
          <Link href="/live-classes" style={{ color: LEGAL_ACCENT }}>ghostaviator.com/live-classes</Link>.
          We do not accept payment to a different UPI ID, bank account, personal handle or DM. The full amount is
          paid once; we do not offer instalments. A payment is not a confirmed seat until we acknowledge it.
        </p>
        <p>
          If you pay twice, pay the wrong amount, or are debited without a confirmed seat, contact us with the
          payment reference. We will refund the duplicate or excess amount to the original payment method.
        </p>
      </LegalSection>

      <LegalSection title="6. AI Self-Study and Gini">
        <p>
          Gini is an AI-assisted study tool. It answers from stored material and cites the chapter where it can,
          but AI can make mistakes. Verify important answers against the source chapter, the current DGCA
          publication or your instructor. Gini is not a substitute for the Captain, a flight instructor or an
          official DGCA document.
        </p>
        <p>
          AI Self-Study is currently a founding waitlist. No payment is taken for it. When it opens, separate
          prices, inclusions and terms will apply and will be published before you pay.
        </p>
      </LegalSection>

      <LegalSection title="7. Your conduct and intellectual property">
        <p>
          The notes, questions, explanations, books, PDFs, designs and marks on this site are owned by Ghost
          Aviator or used with permission. You may use them for your own study. You may not scrape, copy,
          republish, sell, upload to another site, or use them to train another commercial product.
        </p>
        <p>
          Free PDFs may carry a watermark or footer. Do not remove it. Paid access is for one student and may not
          be shared.
        </p>
      </LegalSection>

      <LegalSection title="8. Third-party services">
        <p>
          We use third-party services such as Google Meet, payment providers, messaging apps, email and hosting
          providers. Those services have their own terms and privacy policies. We are not responsible for their
          outages, decisions or acts, though we will try to help you resolve a problem that affects a class you
          paid for.
        </p>
      </LegalSection>

      <LegalSection title="9. Liability">
        <p>
          To the extent permitted by law, Ghost Aviator is not liable for indirect or consequential loss, loss of
          opportunity, or an exam result. Our total liability for a paid service is limited to the amount you paid
          for that service.
        </p>
        <p>
          Nothing in these Terms limits liability that cannot be limited under Indian law, including your rights
          under the Consumer Protection Act, 2019.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes and ending access">
        <p>
          We may update these Terms; the date at the top changes when we do. If you breach these Terms, we may
          suspend access. If we discontinue a paid service before it starts, we will refund the amount paid for
          that service.
        </p>
      </LegalSection>

      <LegalSection title="11. Governing law and contact">
        <p>
          These Terms are governed by the laws of India. Disputes are subject to the courts having jurisdiction
          over Ghost Aviator&apos;s place of business in India.
        </p>
        <p>
          Questions about these Terms: use the{" "}
          <Link href="/contact" style={{ color: LEGAL_ACCENT }}>Contact page</Link>. For payment or refund
          questions, include your name, subject, payment date, amount and UTR or payment reference.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
