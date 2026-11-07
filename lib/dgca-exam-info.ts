/**
 * DGCA flight-crew examination facts: the 2026 calendar, the session now open,
 * the fees and the eligibility to register. Rendered on /dgca-exam-dates and
 * /dgca-cpl-eligibility-and-fees.
 *
 * EVERY VALUE HERE IS A PUBLIC CLAIM (Iron Rule 1). Each one was read from the
 * official document named in SOURCES on CHECKED_ON. When DGCA publishes a new
 * notice or the 2027 calendar: download it from pariksha.dgca.gov.in, read it,
 * change the values, and move CHECKED_ON. Never update a date from memory or a
 * forum post. A page that is wrong about a deadline is worse than no page.
 */

/** The day these values were last compared with the documents in SOURCES. */
export const CHECKED_ON = "2026-11-07";

/** url "" = the document is on dgca.gov.in but has no stable deep link to give. */
export type Source = { id: string; title: string; issued: string; url: string };

export const SOURCES = {
  calendar2026: {
    id: "calendar2026",
    title: "DGCA Programme of Examinations – 2026 (Exam Calendar 2026)",
    issued: "9 February 2026",
    url: "https://pariksha.dgca.gov.in/PDFViewer.jsp?pdf=027F234C1243D44B5BF5C787082CDCC8",
  },
  notice20260922: {
    id: "notice20260922",
    title: "Public Notice: OLODE Sessions 07 and 08 of 2026 and Regular Session 04 of 2026 (e-file DGCA-19033/1/2022-CEO-DGCA)",
    issued: "22 September 2026",
    url: "https://pariksha.dgca.gov.in/PDFViewer.jsp?pdf=AFBC422CE9F696D2370202C2D1AE7BCB",
  },
  fcManual: {
    id: "fcManual",
    title: "Pariksha Flight Crew User Manual, Issue IV, Revision 0 (Chapter 7, Examination)",
    issued: "September 2026",
    url: "https://pariksha.dgca.gov.in/PDFViewer.jsp?pdf=95FB462516F636EF3FF3BAE7AA4DB33C",
  },
  fcFaq: {
    id: "fcFaq",
    title: "Pariksha Flight Crew Computer Number FAQ",
    issued: "June 2025",
    url: "https://pariksha.dgca.gov.in/PDFViewer.jsp?pdf=01BA8FB2105DBF5FA48E2F8D89E1E054",
  },
  aircraftRules: {
    id: "aircraftRules",
    title: "Aircraft Rules, 1937, Schedule II, Section J (Commercial Pilot's Licence – Aeroplanes)",
    issued: "as amended",
    url: "",
  },
  car7b4: {
    id: "car7b4",
    title: "DGCA CAR Section 7, Series B, Part IV: Syllabus for Examination for Issue of CPL and Instrument Rating – Aeroplanes, Issue III",
    issued: "16 June 2011",
    url: "",
  },
} satisfies Record<string, Source>;

export const PARIKSHA_URL = "https://pariksha.dgca.gov.in";

// ─── 2026 calendar ──────────────────────────────────────────────────────────

export type SessionKind = "Regular" | "OLOD" | "FIR/AFIR" | "FATA";

export type CalendarRow = {
  sno: number;
  name: string;
  kind: SessionKind;
  /** As printed in the calendar. */
  dates: string;
  /** ISO start/end, for ordering and for "done / coming" against CHECKED_ON. */
  start?: string;
  end?: string;
};

/**
 * Transcribed from the calendar's English page, row by row, and checked against
 * the rendered image. The calendar prints rows 10 and 16 out of date order; they
 * are kept in DGCA's order here and the page sorts by date.
 */
export const CALENDAR_2026: CalendarRow[] = [
  { sno: 1, name: "OLOD Exam Session 1/2026", kind: "OLOD", dates: "21–23 Jan 2026", start: "2026-01-21", end: "2026-01-23" },
  { sno: 2, name: "FIR/AFIR Session 1/2026", kind: "FIR/AFIR", dates: "28–30 Jan 2026", start: "2026-01-28", end: "2026-01-30" },
  { sno: 3, name: "OLOD Exam Session 2/2026", kind: "OLOD", dates: "04–06 Feb 2026", start: "2026-02-04", end: "2026-02-06" },
  { sno: 4, name: "FIR/AFIR Session 2/2026", kind: "FIR/AFIR", dates: "18–20 Feb 2026", start: "2026-02-18", end: "2026-02-20" },
  { sno: 5, name: "Regular Exam 01 of 2026", kind: "Regular", dates: "10–14 Mar 2026", start: "2026-03-10", end: "2026-03-14" },
  { sno: 6, name: "FIR/AFIR Session 3/2026", kind: "FIR/AFIR", dates: "18–20 Mar 2026", start: "2026-03-18", end: "2026-03-20" },
  { sno: 7, name: "OLOD Exam Session 3/2026", kind: "OLOD", dates: "22–24 Apr 2026", start: "2026-04-22", end: "2026-04-24" },
  { sno: 8, name: "FIR/AFIR Session 4/2026", kind: "FIR/AFIR", dates: "27–29 Apr 2026", start: "2026-04-27", end: "2026-04-29" },
  { sno: 9, name: "OLOD Exam Session 4/2026", kind: "OLOD", dates: "20–22 May 2026", start: "2026-05-20", end: "2026-05-22" },
  { sno: 10, name: "FIR/AFIR Session 5/2026", kind: "FIR/AFIR", dates: "13–15 May 2026", start: "2026-05-13", end: "2026-05-15" },
  { sno: 11, name: "Regular Exam 02 of 2026", kind: "Regular", dates: "16–20 Jun 2026", start: "2026-06-16", end: "2026-06-20" },
  { sno: 12, name: "FIR/AFIR Session 6/2026", kind: "FIR/AFIR", dates: "22–24 Jun 2026", start: "2026-06-22", end: "2026-06-24" },
  { sno: 13, name: "OLOD Exam Session 5/2026", kind: "OLOD", dates: "15–17 Jul 2026", start: "2026-07-15", end: "2026-07-17" },
  { sno: 14, name: "FIR/AFIR Session 7/2026", kind: "FIR/AFIR", dates: "20–22 Jul 2026", start: "2026-07-20", end: "2026-07-22" },
  { sno: 15, name: "OLOD Exam Session 6/2026", kind: "OLOD", dates: "19–21 Aug 2026", start: "2026-08-19", end: "2026-08-21" },
  { sno: 16, name: "FIR/AFIR Session 8/2026", kind: "FIR/AFIR", dates: "12–14 Aug 2026", start: "2026-08-12", end: "2026-08-14" },
  { sno: 17, name: "FIR/AFIR Session 9/2026", kind: "FIR/AFIR", dates: "16–18 Sep 2026", start: "2026-09-16", end: "2026-09-18" },
  { sno: 18, name: "Regular Exam 03 of 2026", kind: "Regular", dates: "22–26 Sep 2026", start: "2026-09-22", end: "2026-09-26" },
  { sno: 19, name: "FIR/AFIR Session 10/2026", kind: "FIR/AFIR", dates: "21–23 Oct 2026", start: "2026-10-21", end: "2026-10-23" },
  { sno: 20, name: "OLOD Exam Session 7/2026", kind: "OLOD", dates: "28–30 Oct 2026", start: "2026-10-28", end: "2026-10-30" },
  { sno: 21, name: "OLOD Exam Session 8/2026", kind: "OLOD", dates: "18–20 Nov 2026", start: "2026-11-18", end: "2026-11-20" },
  { sno: 22, name: "FIR/AFIR Session 11/2026", kind: "FIR/AFIR", dates: "25–27 Nov 2026", start: "2026-11-25", end: "2026-11-27" },
  { sno: 23, name: "Regular Exam 04 of 2026", kind: "Regular", dates: "15–19 Dec 2026", start: "2026-12-15", end: "2026-12-19" },
  { sno: 24, name: "FIR/AFIR Session 12/2026", kind: "FIR/AFIR", dates: "21–23 Dec 2026", start: "2026-12-21", end: "2026-12-23" },
  { sno: 25, name: "FATA Exam", kind: "FATA", dates: "Twice a month, once every fortnight" },
];

/** The calendar's own note, verbatim. */
export const CALENDAR_NOTE =
  "The dates mentioned above are tentative and are subject to change in case of any Gazetted holidays festivity etc. and reasons beyond control of this office. Candidates are advised to check their respective Notice board on Pariksha Portal; https://pariksha.dgca.gov.in for the latest information.";

// ─── The sessions in the latest public notice ────────────────────────────────

export type NoticeSession = {
  name: string;
  portalOpens: string;   // ISO
  portalCloses: string;  // ISO; apply by 22:00 that day
  examStart: string;     // ISO, Flight Crew and RTR dates
  examEnd: string;
  tentative: boolean;
};

/** From the public notice of 22 September 2026 (FC and RTR dates). */
export const NOTICE_SESSIONS: NoticeSession[] = [
  { name: "OLODE Session 07 of 2026", portalOpens: "2026-09-23", portalCloses: "2026-10-08", examStart: "2026-10-28", examEnd: "2026-10-30", tentative: false },
  { name: "OLODE Session 08 of 2026", portalOpens: "2026-09-25", portalCloses: "2026-11-02", examStart: "2026-11-18", examEnd: "2026-11-20", tentative: false },
  { name: "Regular Session 04 of 2026", portalOpens: "2026-09-28", portalCloses: "2026-11-15", examStart: "2026-12-15", examEnd: "2026-12-19", tentative: true },
];

export const OLODE_CENTRES = ["New Delhi", "Noida", "Gurugram", "Mumbai", "Chennai", "Kolkata", "Lucknow", "Bhopal", "Hyderabad", "Pune", "Bengaluru"];
export const REGULAR_CENTRES = [...OLODE_CENTRES, "Guwahati", "Bhubaneswar", "Patna", "Ahmedabad", "Chandigarh", "Kochi"];

// ─── Fees (Flight Crew User Manual, Sept 2026, Chapter 7 para 5) ─────────────

export type Fee = { label: string; amount: number; per: string };

export const EXAM_FEES: Fee[] = [
  { label: "Regular session", amount: 2500, per: "per examination paper" },
  { label: "OLODE (online on-demand) session", amount: 5000, per: "per examination paper" },
  { label: "RTR (Restricted) examination, Regular or OLODE", amount: 2000, per: "per examination paper" },
  { label: "ATPL oral examination, 2nd and 3rd attempts", amount: 500, per: "per oral paper" },
  { label: "FIR/AFIR oral examination", amount: 500, per: "per oral paper" },
];

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** "2026-11-15" -> "15 Nov 2026". */
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];
  return `${d} ${mon} ${y}`;
}

/** Where a session stood on CHECKED_ON. Pages state the date they mean. */
export function statusOn(start: string | undefined, end: string | undefined, on = CHECKED_ON): "done" | "now" | "coming" | "" {
  if (!start || !end) return "";
  if (end < on) return "done";
  if (start <= on) return "now";
  return "coming";
}
