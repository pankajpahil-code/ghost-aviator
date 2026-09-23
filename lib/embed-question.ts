/**
 * The embeddable "DGCA Question of the Day" - one question a day from the Meteorology bank, the
 * only bank /how-answers-are-verified publishes as FULLY VERIFIED (lib/verification-status.ts).
 *
 * Nothing is composed: question, options, answer and explanation are the bank's own text.
 * The same filters the sales bot's quiz uses: a real explanation, no chart or coded report the
 * reader cannot see, two to four options, no forbidden source name (Iron Rule 2).
 *
 * Everyone who loads the widget on a given India-date sees the same question, so a flight school
 * that embeds it gets a fresh question every day with no work.
 */
import { MET_VERIFIED } from "./generated/met-verified";
import forbidden from "../tools/forbidden-source-names.json";

const CHART = /figure|chart|diagram|table|shown|below|above|attached|annex|metar|taf|given/i;
const NAMES = new RegExp(
  forbidden.names.map((n: string) => n.split(/\s+/).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[\\s.\\-]*")).join("|"),
  "i",
);

export type EmbedQuestion = { q: string; opts: string[]; ans: number; exp: string; chapterId: string; topic: string };

export const EMBEDDABLE: EmbedQuestion[] = MET_VERIFIED.filter(
  (x) =>
    (x.exp || "").length >= 25 &&
    !CHART.test(x.q) &&
    x.opts.length >= 2 &&
    x.opts.length <= 4 &&
    x.ans >= 0 &&
    x.ans < x.opts.length &&
    !/^\s*correct answer:?\s*[a-d]\.?\s*$/i.test(x.exp) &&
    !NAMES.test([x.q, ...x.opts, x.exp].join(" ")),
).map((x) => ({ q: x.q, opts: x.opts, ans: x.ans, exp: x.exp, chapterId: x.chapterId || "", topic: x.subtopic || "" }));

/** Today's question in India (UTC+5:30), stable for the whole day. */
export function questionOfTheDay(now = new Date()): EmbedQuestion {
  const ist = new Date(now.getTime() + 330 * 60 * 1000);
  const day = Math.floor(ist.getTime() / 86_400_000);
  // A fixed odd multiplier walks the whole bank before repeating (bank size is not a multiple of 7919).
  return EMBEDDABLE[(day * 7919) % EMBEDDABLE.length];
}
