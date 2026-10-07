/**
 * schema.org HowTo graphs for the two guides that are genuine step-by-step
 * journeys. Steps are taken from the published guide HTML — not invented —
 * so the markup cannot drift into a claim the page does not make.
 *
 * Only attach a HowTo where the page is already teaching a procedure. A
 * syllabus overview or a cost breakdown is not a HowTo; stuffing one on
 * those pages would be structured-data spam.
 */
import { SITE_URL } from "@/lib/site";

export type HowToStep = {
  name: string;
  text: string;
  url?: string;
};

export type HowToGuide = {
  slug: string;
  name: string;
  description: string;
  steps: HowToStep[];
};

const HOWTOS: HowToGuide[] = [
  {
    slug: "computer-number",
    name: "How to Apply for a DGCA Computer Number",
    description:
      "Generate your eGCA computer number for DGCA CPL exams: board verification, eGCA registration, document upload, and submission tracking.",
    steps: [
      {
        name: "Complete 10+2 board verification",
        text: "Obtain the official board verification certificate (not just the marksheet) for 10+2 with Physics and Mathematics from a recognised board. Missing this letter is the most common reason applications are rejected.",
      },
      {
        name: "Register on the eGCA portal",
        text: "Create an account on the official eGCA portal (egca.dgca.gov.in), preferably with Aadhaar for e-KYC, and enter personal details exactly as they appear on your 10th standard certificate.",
        url: "https://egca.dgca.gov.in",
      },
      {
        name: "Upload the required documents",
        text: "Upload a passport-size photograph (white background), signature in black ink, 10th certificate for date of birth, 10+2 marksheet or passing certificate, and the board verification certificate, within the portal's format and size limits.",
      },
      {
        name: "Submit online and send physical copies",
        text: "Submit the application on eGCA, then send attested physical copies to the CEO (Central Examination Organization) at DGCA, R.K. Puram, New Delhi. Track status on the eGCA portal.",
      },
    ],
  },
  {
    slug: "how-to-become-a-pilot-in-india",
    name: "How to Become a Pilot in India",
    description:
      "The path to a Commercial Pilot Licence in India in the order it actually happens: eligibility, medicals, computer number, DGCA written papers, RTR(A), flying hours, and what comes after the CPL.",
    steps: [
      {
        name: "Confirm eligibility",
        text: "Confirm 10+2 with Physics and Mathematics from a recognised board (or clear Physics and Maths later through an open school such as NIOS) and start the official board verification letter early.",
      },
      {
        name: "Get the medical done early",
        text: "Complete a Class 2 medical with a DGCA-approved examiner before committing major training fees, then plan the Class 1 medical required for the CPL.",
      },
      {
        name: "Obtain your DGCA computer number",
        text: "Apply for a computer number through the eGCA portal after board verification is accepted — you cannot sit a DGCA paper without it.",
        url: `${SITE_URL}/guides/computer-number`,
      },
      {
        name: "Clear the DGCA written exams",
        text: "Prepare for and pass the CPL theory papers (including Air Navigation, Technical General, Aviation Meteorology, Air Regulations and related papers) at the required 70% pass mark per paper.",
        url: `${SITE_URL}/guides/dgca-cpl-exam-pattern`,
      },
      {
        name: "Clear RTR(A)",
        text: "Pass the Radio Telephone Operator (Restricted) examination — written and practical — now conducted by the DGCA.",
        url: `${SITE_URL}/guides/rtr-exam-guide`,
      },
      {
        name: "Build the required flying hours",
        text: "Complete the flying training and hours required for issue of the Commercial Pilot Licence at an approved flying training organisation.",
      },
      {
        name: "After the CPL",
        text: "Plan type rating, airline selection preparation, and — when ready — ATPL theory, which can be attempted before the full ATPL hour requirement for licence issue.",
        url: `${SITE_URL}/atpl`,
      },
    ],
  },
];

export const howToForGuide = (slug: string): HowToGuide | undefined =>
  HOWTOS.find(h => h.slug === slug);

/** schema.org HowTo node for a guide that has a defined procedure. */
export const howToJsonLd = (howto: HowToGuide) => ({
  "@type": "HowTo" as const,
  "@id": `${SITE_URL}/guides/${howto.slug}#howto`,
  name: howto.name,
  description: howto.description,
  inLanguage: "en-IN",
  url: `${SITE_URL}/guides/${howto.slug}`,
  step: howto.steps.map((s, i) => ({
    "@type": "HowToStep" as const,
    position: i + 1,
    name: s.name,
    text: s.text,
    ...(s.url ? { url: s.url } : {}),
  })),
});
