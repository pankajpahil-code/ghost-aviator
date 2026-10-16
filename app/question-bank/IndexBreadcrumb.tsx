"use client";
import { usePathname } from "next/navigation";
import { SITE_URL } from "@/lib/site";

// The layout wraps /question-bank AND every /question-bank/[subject] page, and
// each subject page emits its own BreadcrumbList. Render the index breadcrumb
// only on the index route so every URL has exactly one.
export default function IndexBreadcrumb() {
  const pathname = usePathname();
  if (pathname?.replace(/\/+$/, "") !== "/question-bank") return null;
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
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
