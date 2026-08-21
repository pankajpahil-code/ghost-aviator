/**
 * WHERE THE STUDENT IS STANDING.
 *
 * A receptionist who greets everyone with the same sentence is a doormat with
 * a face. Knowing the room changes what is worth saying: someone on a
 * Meteorology chapter should hear about the Meteorology batch, not a random
 * one; someone on the pricing page has already found what a pitch would tell
 * them; someone on the simulator should be left alone to fly it.
 *
 * Everything here is derived from the URL and from lib/subjects.ts, so it is
 * structure — always true, never a claim. Nothing in this file can be stale in
 * the way a hardcoded list can (Iron Rule 5).
 */

import { CPL_SUBJECTS, ATPL_SUBJECTS, type Subject, type Chapter } from "@/lib/subjects";

export type SiteArea =
  | "home"
  | "subject"        // a subject index, e.g. /cpl/meteorology
  | "chapter"        // a chapter surface: notes, questions, quiz, video
  | "guide"
  | "guides-index"
  | "live-classes"
  | "simulator"
  | "books"
  | "question-bank"
  | "exam"
  | "dashboard"
  | "faq"
  | "about"
  | "verification"
  | "account"        // login / signup — never interrupt these
  | "other";

export type RouteType = "notes" | "questions" | "chapter-quiz" | "video" | "mock-test";

export type GiniContext = {
  pathname: string;
  area: SiteArea;
  track?: "cpl" | "atpl";
  subjectId?: string;
  subjectName?: string;
  chapterId?: string;
  chapterTitle?: string;
  routeType?: RouteType;
  /**
   * True where a pitch would be rude or pointless: the student is mid-task,
   * mid-signup, or already reading the page the pitch would send them to.
   */
  quietZone: boolean;
};

const findSubject = (track: "cpl" | "atpl", id: string): Subject | undefined =>
  (track === "cpl" ? CPL_SUBJECTS : ATPL_SUBJECTS).find(s => s.id === id);

const findChapterIn = (s: Subject | undefined, id: string): Chapter | undefined =>
  s?.chapters.find(c => c.id === id);

/** Areas where Gini says nothing unprompted. He is a guide, not an interruption. */
const QUIET: SiteArea[] = ["account", "exam", "simulator", "live-classes"];

export function readContext(pathname: string | null | undefined): GiniContext {
  const path = (pathname || "/").split("?")[0].replace(/\/+$/, "") || "/";
  const seg = path.split("/").filter(Boolean);

  const base = (area: SiteArea, extra: Partial<GiniContext> = {}): GiniContext => ({
    pathname: path,
    area,
    quietZone: QUIET.includes(area),
    ...extra,
  });

  if (!seg.length) return base("home");

  const [head, ...rest] = seg;

  if (head === "cpl" || head === "atpl") {
    const track = head as "cpl" | "atpl";
    if (!rest.length) return base("subject", { track });

    const subject = findSubject(track, rest[0]);
    const subjectId = subject?.id ?? rest[0];
    const subjectName = subject?.name;

    if (rest.length === 1) return base("subject", { track, subjectId, subjectName });

    const chapter = findChapterIn(subject, rest[1]);
    return base("chapter", {
      track,
      subjectId,
      subjectName,
      chapterId: chapter?.id ?? rest[1],
      chapterTitle: chapter?.title,
      routeType: (rest[2] as RouteType) || undefined,
    });
  }

  switch (head) {
    case "guides":       return base(rest.length ? "guide" : "guides-index");
    case "live-classes": return base("live-classes");
    case "rtr-simulator":return base("simulator");
    case "books":        return base("books");
    case "question-bank":return base("question-bank");
    case "exam":
    case "mock-test":    return base("exam");
    case "dashboard":    return base("dashboard");
    case "faq":          return base("faq");
    case "about":        return base("about");
    case "how-answers-are-verified": return base("verification");
    case "login":
    case "signup":       return base("account");
    default:             return base("other");
  }
}
