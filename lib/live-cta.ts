// Live-class CTAs: copy + WhatsApp links. One place for the words, so every
// placement stays short, plain and price-free.
//
// Rules (the Captain's, Oct 2026): English only, no price, fee, seat count,
// batch length or schedule; every CTA ends on "WhatsApp for details" (or the
// link, for the free doubt classes). The number is LIVE_WHATSAPP, the same one
// /live-classes and the footer schema already use. Never hard-code another.

import { LIVE_WHATSAPP } from "@/lib/live-classes";

export type CtaPlacement = "notes_end" | "score" | "questions_end" | "hub_banner" | "live_hero" | "home_banner";

/** wa.me link with the enquiry already written, naming where the student came from. */
export const waEnquiryLink = (message: string): string =>
  `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(message)}`;

/** "Hi Captain, I'm studying Meteorology on Ghost Aviator and want details of live classes." */
export const studyingMessage = (subject: string): string =>
  `Hi Captain, I'm studying ${subject} on Ghost Aviator and want details of live classes.`;

/** For pages with no single subject (hubs, /live-classes). */
export const pageMessage = (where: string): string =>
  `Hi Captain, I'm on the Ghost Aviator ${where} page and want details of live classes.`;

/** The free weekly doubt classes: the student is asking for the joining link. */
export const freeClassMessage = (where: string): string =>
  `Hi Captain, I'm on the Ghost Aviator ${where} page. Please send me the link for the free live doubt classes.`;

export const CTA_COPY = {
  /** End of notes, for a subject the Captain teaches live. */
  notesLive: (subject: string) =>
    `Stuck on ${subject}? I teach this live. Free doubt classes run every week, and full live batches are open.`,
  /** End of notes, for a subject with no live batch: no "I teach this live" claim. */
  notesGeneral: (subject: string) =>
    `Stuck on ${subject}? Free doubt classes run every week, and full live batches are open.`,
  score:
    "Scoring under 70%? That's where most students get stuck before the DGCA paper. Join a live batch.",
  hubBanner: "Free live doubt classes every week, with Capt. Pankaj Pahil.",
  action: "WhatsApp for details",
  actionFreeLink: "WhatsApp for the link",
} as const;

/** ATPL subject ids that share a CPL live batch. */
const ATPL_TO_CPL: Record<string, string> = {
  "atpl-air-regulations": "air-regulations",
  "atpl-meteorology": "meteorology",
  "atpl-navigation": "air-navigation",
  "atpl-radio-aids": "radio-navigation",
  "atpl-radio-telephony": "radio-telephony",
};

/** The CPL subject id whose live batch covers this subject, if any. */
export const liveSubjectId = (subjectId: string): string => ATPL_TO_CPL[subjectId] ?? subjectId;
