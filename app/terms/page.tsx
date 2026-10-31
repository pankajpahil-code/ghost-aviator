import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, ORG_ID, PERSON_ID } from "@/lib/site";
import { LegalPageShell, LegalSection, LEGAL_ACCENT } from "@/app/components/LegalPage";

// Restored 2026-10-31 from feat/ai-first-trust-pages (Google still lists /terms).
// The price, fee, payment, refund and seat-count clauses were removed on the way
// in; the commercial terms of a live class live on its own page.
const UPDATED = "31 October 2026";

const DESCRIPTION =
  "The plain-language terms for using Ghost Aviator's free DGCA study material, live classes, Gini study assistant and books.";

export const metadata: Metadata = {
  title: "Terms of Service — Ghost Aviator",
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service — Ghost Aviator",
    description: DESCRIPTION,
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
      description: DESCRIPTION,
      url: `${SITE_URL}/terms`,
      inLanguage: "en-IN",
      author: { "@id": PERSON_ID },
      publisher: { "@id": ORG_ID },
      dateModified: "2026-10-31",
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
          These Terms explain the rules for using Ghost Aviator. They are written in plain English, and they do not
          replace your rights under Indian consumer law.
        </>
      }
      jsonLd={jsonLd}
    >
      <LegalSection title="1. Who we are">
        <p>
          Ghost Aviator is an independent DGCA CPL and ATPL study platform operated in India by
          <strong> Capt. Pankaj Pahil</strong>. In these Terms, &ldquo;Ghost Aviator&rdquo;, &ldquo;we&rdquo;,
          &ldquo;us&rdquo; and &ldquo;our&rdquo; mean that service. &ldquo;You&rdquo; means the person using the
          website or attending a class.
        </p>
      </LegalSection>

      <LegalSection title="2. What we provide">
        <p>
          Ghost Aviator provides free chapter notes, a verified question bank, mock tests, study tools and reference
          material. Optional live online ground classes are offered separately, and a free live demo is available
          first. Books are offered only where the relevant page says they are available.
        </p>
        <p>
          The schedule and inclusions of a live class are those described on its page and confirmed to you before
          you join. If that page and these Terms conflict on a specific service, the page wins.
        </p>
      </LegalSection>

      <LegalSection title="3. Free material and no guarantee">
        <p>
          Free material is for your personal study. It is not a DGCA publication and is not a substitute for the
          current DGCA regulations, CARs, or the instructions of your flying school. Aviation rules, procedures and
          question patterns change. Always check the current official source before you rely on an answer for an
          exam, a flight or a licence application.
        </p>
        <p>
          We do not guarantee that you will pass an exam, obtain a licence, get a job or earn a particular salary.
          We teach and provide study material; the result depends on your work, your exam and the DGCA.
        </p>
      </LegalSection>

      <LegalSection title="4. Live classes">
        <p>
          Before you join, you may attend a free live demo with the Captain. The demo is live, not recorded, and
          creates no obligation to enroll.
        </p>
        <p>
          Classes are taught live on Google Meet or another platform we name. <strong>There are no recordings.</strong>{" "}
          We provide written class notes and summaries. You may not record, stream, share or resell a class or its
          materials.
        </p>
        <p>
          If you miss a session, you receive the written summary and may bring your questions to the next
          doubt-clearing slot.
        </p>
        <p>
          Behave respectfully. We may remove a student who harasses others, shares access, records the class or
          repeatedly disrupts teaching.
        </p>
      </LegalSection>

      <LegalSection title="5. Gini, the AI study assistant">
        <p>
          Gini is an AI-assisted study tool. It answers from stored material and cites the chapter where it can, but
          AI can make mistakes. Verify important answers against the source chapter, the current DGCA publication or
          your instructor. Gini is not a substitute for the Captain, a flight instructor or an official DGCA document.
        </p>
      </LegalSection>

      <LegalSection title="6. Your conduct and intellectual property">
        <p>
          The notes, questions, explanations, books, designs and marks on this site are owned by Ghost Aviator or
          used with permission. You may use them for your own study. You may not scrape, copy, republish, sell,
          upload to another site, or use them to train another commercial product.
        </p>
        <p>
          Material may carry a watermark or footer. Do not remove it. Class access is for one student and may not be
          shared.
        </p>
      </LegalSection>

      <LegalSection title="7. Third-party services">
        <p>
          We use third-party services such as Google Meet, YouTube, messaging apps, email and hosting providers. Those
          services have their own terms and privacy policies. We are not responsible for their outages, decisions or
          acts, though we will try to help you resolve a problem that affects your class.
        </p>
      </LegalSection>

      <LegalSection title="8. Liability">
        <p>
          To the extent permitted by law, Ghost Aviator is not liable for indirect or consequential loss, loss of
          opportunity, or an exam result.
        </p>
        <p>
          Nothing in these Terms limits liability that cannot be limited under Indian law, including your rights under
          the Consumer Protection Act, 2019.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes and ending access">
        <p>
          We may update these Terms; the date at the top changes when we do. If you breach these Terms, we may suspend
          access.
        </p>
      </LegalSection>

      <LegalSection title="10. Governing law and contact">
        <p>
          These Terms are governed by the laws of India. Disputes are subject to the courts having jurisdiction over
          Ghost Aviator&apos;s place of business in India.
        </p>
        <p>
          Questions about these Terms: use the <Link href="/contact" style={{ color: LEGAL_ACCENT }}>Contact page</Link>.
          Our privacy practices are explained in the <Link href="/privacy" style={{ color: LEGAL_ACCENT }}>Privacy Policy</Link>.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
