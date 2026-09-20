import { ALL_QUESTIONS } from "@/lib/questions";
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
  // Generate FAQPage schema for the first 25 questions
  const first25 = ALL_QUESTIONS.slice(0, 25);
  
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/question-bank#faq`,
        mainEntity: first25.map((q) => ({
          "@type": "Question",
          name: q.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${q.opts[q.ans]}${q.exp ? ` - ${q.exp}` : ''}`
          }
        }))
      },
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
