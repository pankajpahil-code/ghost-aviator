import type { DemoQuestion } from "./demo-questions";
import { DEMO_QUESTIONS } from "./demo-questions";
import { NAV_QUESTIONS } from "./nav-questions";
import { OXFORD_NAV_QUESTIONS } from "./oxford-nav-questions";
import { RK_BALI_REGULATIONS_QUESTIONS } from "./rk-bali-regulations-questions";
import { AIR_REGS_CH1_QUESTIONS } from "./air-regs-ch1-questions";
import { SAR_QUESTIONS } from "./sar-questions";

export type { DemoQuestion };

export const ALL_QUESTIONS: DemoQuestion[] = [
  ...DEMO_QUESTIONS,
  ...NAV_QUESTIONS,
  ...OXFORD_NAV_QUESTIONS,
  ...RK_BALI_REGULATIONS_QUESTIONS,
  ...AIR_REGS_CH1_QUESTIONS,
  ...SAR_QUESTIONS,
];

// CPL air-regulations chapters were restructured from 13 → 26 chapters.
// The RK Bali question bank uses the old ar-1…ar-13 IDs. This map routes
// each new chapter to the bank chapter whose questions are most topically aligned.
const CPL_AR_CHAPTER_MAP: Record<string, string> = {
  "ar-1":  "ar-1",   // International Organisations & Conventions → Intl Agreements & ICAO
  "ar-2":  "ar-2",   // Aircraft Nationality & Registration       → Registration & Licensing
  "ar-3":  "ar-3",   // Rules of the Air                         → exact match
  "ar-4":  "ar-6",   // Air Traffic Services                     → old ATS chapter
  "ar-5":  "ar-5",   // Separation Methods & Minima              → Holding/Altimetry/Transponder
  "ar-6":  "ar-5",   // Separation at Aerodromes                 → same pool
  "ar-7":  "ar-4",   // Aerodrome Control Service                → old Air Nav Procedures
  "ar-8":  "ar-5",   // ATS Surveillance (transponder/SSR)       → old ar-5
  "ar-9":  "ar-7",   // Aeronautical Information Services        → old AIS & Aerodromes
  "ar-10": "sar",    // Search and Rescue                        → dedicated SAR questions
  "ar-11": "ar-7",   // Visual Aids for Navigation               → old AIS & Aerodromes
  "ar-12": "ar-4",   // PANS-OPS Aircraft Operations             → old Air Nav Procedures
  "ar-13": "ar-9",   // National Law                             → exact match
  "ar-14": "ar-2",   // Personnel Licensing                      → old Registration & Licensing
  "ar-15": "ar-2",   // Airworthiness of Aircraft                → old Registration & Licensing
  "ar-16": "ar-12",  // Operational Procedures                   → exact match
  "ar-17": "ar-12",  // Special Ops & Hazards                    → old Operational Procedures
  "ar-18": "ar-13",  // Communications                           → old VFR & IFR Comms
  "ar-19": "ar-8",   // Aircraft Accident and Incident           → old SAR/Security/Accident
  "ar-20": "ar-12",  // Facilitation                             → old Operational Procedures
  "ar-21": "ar-8",   // Security                                 → old SAR/Security/Accident
  "ar-22": "ar-10",  // Human Performance & Limitations          → exact match
  "ar-23": "ar-10",  // CRM / TEM / LOFT                        → old Human Performance
  "ar-24": "ar-11",  // Aviation Psychology                      → exact match
  "ar-25": "ar-10",  // Aviation Physiology                      → old Human Performance
  "ar-26": "ar-10",  // Additional Practice: Human Factors       → old Human Performance
};

// ATPL air-regulations chapters (aar-1…aar-8) map to RK Bali bank IDs directly.
const ATPL_AR_CHAPTER_MAP: Record<string, string> = {
  "aar-1": "ar-1",   // ICAO SARPs Advanced       → Intl Agreements & ICAO
  "aar-2": "ar-2",   // AOC                        → Registration & Licensing
  "aar-3": "ar-2",   // ATPL Licensing             → Registration & Licensing
  "aar-4": "ar-8",   // Dangerous Goods            → SAR/Security/Accident
  "aar-5": "ar-6",   // CAT Operations & Minima    → Air Traffic Services
  "aar-6": "ar-12",  // Flight & Duty Time (FTL)   → Operational Procedures
  "aar-7": "ar-8",   // Aircraft Accident Invest.  → SAR/Security/Accident bank
  "aar-8": "ar-8",   // Security & Threats         → SAR/Security/Accident
};

// All questions belonging to a subject (across every chapter). Used to build
// subject-wide mock tests (mid / full / sample).
export function getSubjectQuestionPool(subjectId: string): DemoQuestion[] {
  return ALL_QUESTIONS.filter(q => q.subjectIds.includes(subjectId));
}

export function getQuestionsForChapter(
  subjectId: string,
  chapterId: string,
): DemoQuestion[] {
  // CPL air-regulations: route new chapter IDs to the matching RK Bali bank IDs
  if (subjectId === "air-regulations") {
    const bankId = CPL_AR_CHAPTER_MAP[chapterId] ?? chapterId;
    const qs = ALL_QUESTIONS.filter(
      q => q.chapterId === bankId && q.subjectIds.includes("air-regulations"),
    );
    if (qs.length > 0) return qs;
    return ALL_QUESTIONS.filter(q => q.subjectIds.includes("air-regulations"));
  }

  // ATPL air-regulations: map aar-X to the equivalent bank ar-X chapter
  if (subjectId === "atpl-air-regulations") {
    const bankId = ATPL_AR_CHAPTER_MAP[chapterId];
    if (bankId) {
      const qs = ALL_QUESTIONS.filter(
        q => q.chapterId === bankId && q.subjectIds.includes("air-regulations"),
      );
      if (qs.length > 0) return qs;
    }
    return ALL_QUESTIONS.filter(q => q.subjectIds.includes("atpl-air-regulations"));
  }

  // All other subjects: exact chapter match, then subject-wide fallback
  const byChapter = ALL_QUESTIONS.filter(
    q => q.chapterId === chapterId && q.subjectIds.includes(subjectId),
  );
  if (byChapter.length > 0) return byChapter;
  return ALL_QUESTIONS.filter(q => q.subjectIds.includes(subjectId));
}
