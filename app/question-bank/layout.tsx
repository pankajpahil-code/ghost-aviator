import IndexBreadcrumb from "./IndexBreadcrumb";
import { DEFAULT_OG_IMAGES } from "@/lib/og";

export const metadata = {
  title: "Free DGCA Question Bank — CPL & ATPL MCQs with Explanations",
  description: "Free DGCA question bank for CPL and ATPL: chapter-wise MCQs with explanations for Meteorology, Air Regulations, Navigation and the other CPL subjects.",
  openGraph: {
    title: "DGCA Question Bank | Ghost Aviator",
    description: "Chapter-wise DGCA CPL and ATPL MCQs with explanations. Free, no sign-up.",
    url: "./",
    images: DEFAULT_OG_IMAGES,
  },
  alternates: { canonical: "/question-bank" },
};

export default function QuestionBankLayout({ children }: { children: React.ReactNode }) {
  // No FAQPage node here. It used to publish the correct option and the
  // explanation of the first 25 questions as acceptedAnswer text, but the page
  // only reveals those after a visitor clicks "Show Answer", so a crawler was
  // handed answers no visitor could see. Structured data must match visible
  // content. Do not re-add it unless the answers are rendered in the page.
  return (
    <>
      <IndexBreadcrumb />
      {children}
    </>
  );
}
