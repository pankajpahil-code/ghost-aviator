import { SITE_URL } from "@/lib/site";

export const metadata = {
  title: "Free DGCA Question Bank — CPL & ATPL MCQs with Explanations",
  description: "India's most comprehensive DGCA question bank for CPL and ATPL. Thousands of latest chapter-wise MCQs with detailed explanations for Air Regulations, Navigation, and Meteorology.",
  openGraph: {
    title: "DGCA Question Bank | Ghost Aviator",
    description: "Thousands of latest chapter-wise MCQs with detailed explanations for Air Regulations, Navigation, and Meteorology.",
  },
  alternates: { canonical: "/question-bank" },
};

export default function QuestionBankLayout({ children }: { children: React.ReactNode }) {
  // No FAQPage node here. It used to publish the correct option and the
  // explanation of the first 25 questions as acceptedAnswer text, but the page
  // only reveals those after a visitor clicks "Show Answer", so a crawler was
  // handed answers no visitor could see. Structured data must match visible
  // content. Do not re-add it unless the answers are rendered in the page.
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/question-bank#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Question Bank" },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
