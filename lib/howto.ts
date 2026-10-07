/**
 * schema.org HowTo graphs for guides that are genuine step-by-step
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
      "Apply for a DGCA Flight Crew computer number on the PARIKSHA portal: eligibility, DigiLocker documents, NEW-candidate registration, upload, and allotment (including CBSE auto-generation where eligible).",
    steps: [
      {
        name: "Confirm eligibility and DigiLocker documents",
        text: "Confirm 10+2 with Physics and Mathematics from a recognised board. Prefer fetching Class X/XII certificates from DigiLocker into PARIKSHA — DigiLocker-fetched X/XII documents do not require a separate Board Verification Certificate upload (DGCA notice w.e.f. 16-12-2024).",
      },
      {
        name: "Register as a NEW candidate on PARIKSHA",
        text: "Create a NEW Flight Crew candidate registration on the official PARIKSHA portal (pariksha.dgca.gov.in) — not eGCA. Verify mobile and email, and enter personal details exactly as on Class X / DigiLocker data.",
        url: "https://pariksha.dgca.gov.in/",
      },
      {
        name: "Upload the required documents",
        text: "Upload photograph, signature, Class X and Class XII documents (and any category-specific papers) within the format and size limits in the current Flight Crew User Manual on PARIKSHA.",
      },
      {
        name: "Submit and wait for allotment",
        text: "Submit the application on PARIKSHA. Eligible CBSE DigiLocker candidates may receive auto-generated computer numbers (w.e.f. 16-10-2025); others follow CEO scrutiny. Allotment is emailed; login ID is typically the computer number with a P- prefix. Always follow the latest FC User Manual and PARIKSHA notices.",
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
        text: "Confirm 10+2 with Physics and Mathematics from a recognised board (or clear Physics and Maths later through an open school such as NIOS) and start gathering Class X/XII documents early — DigiLocker fetch into PARIKSHA is preferred where available.",
      },
      {
        name: "Get the medical done early",
        text: "Complete a Class 2 medical with a DGCA-approved examiner before committing major training fees, then plan the Class 1 medical required for the CPL.",
      },
      {
        name: "Obtain your DGCA computer number",
        text: "Apply for a computer number through the PARIKSHA portal (pariksha.dgca.gov.in) — not eGCA — after your documents are in order; you cannot sit a DGCA paper without it.",
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
  {
    slug: "rtr-after-dgca-takeover",
    name: "Prepare for RTR(A) After the DGCA Takeover",
    description:
      "Practical steps after DGCA took over the RTR(A) exam from the WPC in November 2025: computer number, current notices, CAR syllabus, and voice practice for the practical.",
    steps: [
      {
        name: "Confirm your DGCA computer number",
        text: "Obtain or confirm your Flight Crew computer number on the PARIKSHA portal before registering for RTR(A) under DGCA — the same number used for other Flight Crew papers.",
        url: `${SITE_URL}/guides/computer-number`,
      },
      {
        name: "Follow current DGCA / PARIKSHA session notices",
        text: "Ignore outdated WPC April/August/November calendars as your primary plan. Use published DGCA, PARIKSHA and (where applicable) eGCA notices for written and practical slots for your session.",
      },
      {
        name: "Study CAR Section 7 Series G Part VI",
        text: "Use the current DGCA CAR syllabus for RTR(A), not legacy WPC WhatsApp PDFs. Theory chapters are mapped in the free RTR(A) book on Ghost Aviator.",
        url: `${SITE_URL}/cpl/radio-telephony`,
      },
      {
        name: "Practise the practical out loud",
        text: "Pass the practical with live radiotelephony practice — read-backs, scenarios and emergencies — until phraseology is automatic. The free RTR(A) radio simulator is built for that.",
        url: `${SITE_URL}/rtr-simulator`,
      },
    ],
  },
  {
    slug: "atpl-theory-before-1500-hours",
    name: "Plan DGCA ATPL Theory Before Licence Hours",
    description:
      "Plan ATPL theory attempts after CPL without waiting for 1,500 hours: confirm eligibility, map weak subjects, practise on the ATPL track, and watch result validity against your hour plan.",
    steps: [
      {
        name: "Confirm ATPL theory eligibility",
        text: "Confirm you hold an Indian CPL (or the documented defence alternate path) and a Flight Crew computer number. You do not need 1,500 hours to sit the papers — re-check CAR Section 7 Series B Part I before applying.",
      },
      {
        name: "Map papers to weak CPL subjects",
        text: "Start with subjects you already cleared at CPL level while knowledge is warm, then schedule the weak ones deliberately rather than waiting for airline hours.",
      },
      {
        name: "Practise on the ATPL track",
        text: "Use chapter notes, questions and mocks on the ATPL preparation track — not unverified PDF dumps — and book sessions you can finish as a cluster.",
        url: `${SITE_URL}/atpl`,
      },
      {
        name: "Align attempts with result validity",
        text: "Track current DGCA validity rules for written results against your hour-building plan so passes are still usable when you apply for licence issue.",
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