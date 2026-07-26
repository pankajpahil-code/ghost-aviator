import { ALL_QUESTIONS } from "@/lib/questions";

export const metadata = {
  title: "DGCA Question Bank | CPL & ATPL MCQs with Explanations",
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
  
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": first25.map((q) => ({
      "@type": "Question",
      "name": q.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": `${q.opts[q.ans]}${q.exp ? ` - ${q.exp}` : ''}`
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
