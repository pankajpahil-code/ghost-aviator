// Server-side accessors for the DGCA previous-paper questions (lib/generated/previous-questions.ts).
// SERVER ONLY: the data is several hundred KB of text. Pages import this module and hand each
// client component only the questions it renders; never import it from a "use client" file.
import { PQ_DATA } from "./generated/previous-questions";
import type { PQQuestion, PQSubject } from "./previous-questions-types";

export type { PQQuestion, PQSubject };

export const PQ_BASE = "/dgca-exam-questions";

/** Subjects cleared for the site. An unpublished subject has no route, no link and no sitemap entry. */
export function publishedPQSubjects(): PQSubject[] {
  return PQ_DATA.filter(s => s.published);
}

export function getPQSubject(slug: string): PQSubject | undefined {
  return publishedPQSubjects().find(s => s.slug === slug);
}

export function getPQSubjectFor(subjectId: string): PQSubject | undefined {
  return publishedPQSubjects().find(s => s.subjectId === subjectId);
}

export function topicSlug(topic: string): string {
  return topic.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export type PQTopic = { slug: string; name: string; count: number; appearances: number; share: number; repeated: number };

/** Topics in order of how often DGCA asked them (sum of sittings across the topic's questions). */
export function pqTopics(s: PQSubject): PQTopic[] {
  const by = new Map<string, PQTopic>();
  let total = 0;
  for (const q of s.questions) {
    const t = by.get(q.topic) ?? { slug: topicSlug(q.topic), name: q.topic, count: 0, appearances: 0, share: 0, repeated: 0 };
    t.count += 1;
    t.appearances += q.times;
    if (q.times >= 3) t.repeated += 1;
    total += q.times;
    by.set(q.topic, t);
  }
  const list = [...by.values()];
  for (const t of list) t.share = total ? t.appearances / total : 0;
  return list.sort((a, b) => b.appearances - a.appearances || b.count - a.count || a.name.localeCompare(b.name));
}

const byRepeat = (a: PQQuestion, b: PQQuestion) => b.times - a.times || a.id.localeCompare(b.id);

export function pqTopicQuestions(s: PQSubject, slug: string): { topic: PQTopic; questions: PQQuestion[] } | undefined {
  const topic = pqTopics(s).find(t => t.slug === slug);
  if (!topic) return undefined;
  return { topic, questions: s.questions.filter(q => q.topic === topic.name).sort(byRepeat) };
}

export function pqMostRepeated(s: PQSubject, n: number): PQQuestion[] {
  return s.questions.filter(q => q.times >= 2).sort(byRepeat).slice(0, n);
}

export function pqTotals(s: PQSubject) {
  return {
    questions: s.questions.length,
    appearances: s.questions.reduce((n, q) => n + q.times, 0),
    repeated: s.questions.filter(q => q.times >= 3).length,
    sittings: s.sittings.length,
  };
}

/** Every published route, for the sitemap. */
export function pqRoutes(): string[] {
  const out: string[] = [];
  const subs = publishedPQSubjects();
  if (subs.length) out.push(PQ_BASE);
  for (const s of subs) {
    out.push(`${PQ_BASE}/${s.slug}`);
    for (const t of pqTopics(s)) out.push(`${PQ_BASE}/${s.slug}/${t.slug}`);
  }
  return out;
}
