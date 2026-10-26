import type { Metadata } from "next";
import MistakesClient from "./MistakesClient";

export const metadata: Metadata = {
  title: "Mistakes Bank — Ghost Aviator",
  description:
    "Review the DGCA mock-test questions you answered wrong or skipped, with the correct answer and explanation. The Mistakes Bank stays in your browser.",
  robots: { index: false, follow: false },
};

export default function MistakesPage() {
  return <MistakesClient />;
}
