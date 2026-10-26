"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, BookOpen, CheckCircle, XCircle, ChevronDown, Shuffle, RotateCcw, Clock, ArrowRight, Bookmark } from "lucide-react";
import { ALL_QUESTIONS } from "@/lib/questions";
import { isRealExplanation } from "@/lib/explanation";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";
import { CHAPTER_LABELS } from "@/lib/chapter-labels";
import { useQuestionFlags } from "@/lib/question-flags";
import Link from "next/link";
import { QB_LANDINGS } from "@/lib/landing-pages";

const ALL_SUBJECTS = [...CPL_SUBJECTS, ...ATPL_SUBJECTS];

const SUBJECT_INDEX: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const s of ALL_SUBJECTS) map[s.id] = s.name;
  return map;
})();

// Counts are built from the actual bank, so a chapter is offered only when it
// has questions. This matters because ATPL pages share the CPL chapter ids for
// Meteorology, Navigation and Air Regulations.
const CHAPTER_COUNTS: Record<string, Record<string, number>> = (() => {
  const map: Record<string, Record<string, number>> = {};
  for (const q of ALL_QUESTIONS) {
    for (const sid of new Set(q.subjectIds)) {
      const perSubject = (map[sid] ??= {});
      const chapterId = q.chapterId ?? "__none__";
      perSubject[chapterId] = (perSubject[chapterId] ?? 0) + 1;
    }
  }
  return map;
})();

function displaySubjects(ids: string[]): string {
  const names = ids.map(id => SUBJECT_INDEX[id] ?? id);
  // Collapse duplicates so "Air Regulations" doesn't appear twice for shared questions
  return Array.from(new Set(names)).join(" · ");
}

// Built from the subject lists and the bank itself (Iron Rule 5), never typed by
// hand: the hand-written list had no Instrumentation or Radio Navigation (719
// questions between them) and offered "Performance" with 2 questions. A subject
// is offered only when its bank is big enough to be worth filtering to.
const MIN_FILTER_QUESTIONS = 10;
const SUBJECT_FILTERS: { value: string; label: string }[] = (() => {
  const counts: Record<string, number> = {};
  for (const q of ALL_QUESTIONS) {
    for (const id of new Set(q.subjectIds)) counts[id] = (counts[id] ?? 0) + 1;
  }
  const subjects = [
    ...CPL_SUBJECTS.map(s => ({ s, track: "CPL" })),
    ...ATPL_SUBJECTS.map(s => ({ s, track: "ATPL" })),
  ];
  return [
    { value: "all", label: "All Subjects" },
    ...subjects
      .filter(({ s }) => (counts[s.id] ?? 0) >= MIN_FILTER_QUESTIONS)
      .map(({ s, track }) => ({ value: s.id, label: `${s.name} · ${track}` })),
  ];
})();

const PAGE_SIZE = 25;

/** Stable shuffle: the order only changes when the student asks for a new one. */
function seededShuffle<T>(items: T[], seed: number): T[] {
  const a = [...items];
  let state = seed >>> 0;
  const rand = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// The site's SearchAction (app/layout.tsx) advertises /question-bank?q={term}, so the
// page has to honour it. useSearchParams makes the tree under its Suspense boundary
// client-rendered, so the same view is also the fallback: the question list stays in
// the prerendered HTML and the URL's search term is applied once the client reads it.
const MAX_QUERY_LENGTH = 200;

export default function QuestionBankPage() {
  return (
    <Suspense fallback={<QuestionBankView initialQuery="" />}>
      <QuestionBankFromUrl />
    </Suspense>
  );
}

function QuestionBankFromUrl() {
  const q = (useSearchParams().get("q") ?? "").slice(0, MAX_QUERY_LENGTH);
  // key: a different ?q= (client navigation) starts the view afresh with that search.
  return <QuestionBankView key={q} initialQuery={q} />;
}

function QuestionBankView({ initialQuery }: { initialQuery: string }) {
  const [search, setSearch]         = useState(initialQuery);
  const [filter, setFilter]         = useState("all");
  const [chapter, setChapter]       = useState("all");
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [revealed, setRevealed]     = useState<Record<string, boolean>>({});
  const [shown, setShown]           = useState(PAGE_SIZE);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const { flags, toggle: toggleFlag, ready: flagsReady } = useQuestionFlags();
  const flaggedCount = Object.keys(flags).length;
  // Derive the active filter so clearing the last flag cannot leave the list
  // stuck on an invisible filter.
  const flaggedFilterActive = flaggedOnly && flaggedCount > 0;

  const chapterOptions = useMemo(() => {
    if (filter === "all") return [];
    const counts = CHAPTER_COUNTS[filter] ?? {};
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .sort(([a], [b]) => {
        if (a === "__none__") return 1;
        if (b === "__none__") return -1;
        return (CHAPTER_LABELS[a] ?? a).localeCompare(CHAPTER_LABELS[b] ?? b, undefined, { numeric: true });
      })
      .map(([id, count]) => ({
        value: id,
        label: `${id === "__none__" ? "Unclassified" : (CHAPTER_LABELS[id] ?? id)} (${count})`,
      }));
  }, [filter]);

  const subjectName = filter === "all" ? null : (SUBJECT_INDEX[filter] ?? filter);
  const subjectTotal = filter === "all"
    ? ALL_QUESTIONS.length
    : Object.values(CHAPTER_COUNTS[filter] ?? {}).reduce((a, b) => a + b, 0);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = ALL_QUESTIONS.filter(q => {
      if (filter !== "all" && !q.subjectIds.includes(filter)) return false;
      if (chapter === "__none__") {
        if (q.chapterId) return false;
      } else if (chapter !== "all" && q.chapterId !== chapter) {
        return false;
      }
      if (flaggedFilterActive && !flags[q.q]) return false;
      if (!term) return true;
      return q.q.toLowerCase().includes(term)
        || (q.subtopic ?? "").toLowerCase().includes(term)
        || q.opts.some(o => o.toLowerCase().includes(term));
    });
    return shuffleSeed > 0 ? seededShuffle(result, shuffleSeed) : result;
  }, [search, filter, chapter, shuffleSeed, flaggedFilterActive, flags]);

  const visible = filtered.slice(0, shown);
  const revealedCount = Object.values(revealed).filter(Boolean).length;
  const hasActiveFilters = search.trim() !== "" || filter !== "all" || chapter !== "all"
    || shuffleSeed > 0 || flaggedFilterActive;

  function resetView() {
    setSearch("");
    setFilter("all");
    setChapter("all");
    setShuffleSeed(0);
    setShown(PAGE_SIZE);
    setRevealed({});
    setFlaggedOnly(false);
  }

  function changeSubject(value: string) {
    setFilter(value);
    setChapter("all");
    setShown(PAGE_SIZE);
    setRevealed({});
  }

  function changeChapter(value: string) {
    setChapter(value);
    setShown(PAGE_SIZE);
    setRevealed({});
  }

  function toggle(key: string) {
    setRevealed(p => ({ ...p, [key]: !p[key] }));
  }

  function toggleSaved(key: string) {
    const wasFlagged = !!flags[key];
    toggleFlag(key);
    if (wasFlagged && flaggedCount === 1) setFlaggedOnly(false);
  }

  function shuffle() {
    setShuffleSeed(s => s + 1);
    setShown(PAGE_SIZE);
    setRevealed({});
  }

  return (
    <div className="grid-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
               style={{ background: "rgba(240,145,58,0.1)", border: "1px solid rgba(240,145,58,0.3)", color: "#f0913a" }}>
            <BookOpen className="w-4 h-4" /> Question Bank
          </div>
          <h1 className="text-4xl font-extrabold mb-4">DGCA <span className="gradient-text">Question Bank</span></h1>
          <p style={{ color: "#94a3b8" }}>
            {ALL_QUESTIONS.length.toLocaleString()} questions with answers and explanations · growing weekly
          </p>
        </div>

        {/* Per-subject landing pages: crawlable links, one per subject bank */}
        <nav aria-label="Question banks by subject" className="mb-8">
          <h2 className="text-sm font-bold mb-3" style={{ color: "#f0913a" }}>Browse by subject</h2>
          <div className="flex flex-wrap gap-2">
            {QB_LANDINGS.map(l => {
              const n = ALL_QUESTIONS.filter(q => q.subjectIds.includes(l.subjectId)).length;
              return (
                <Link key={l.subjectId} href={`/question-bank/${l.subjectId}`}
                      className="text-sm px-3 py-1.5 rounded-full no-underline"
                      style={{ color: "#94a3b8", border: "1px solid rgba(240,145,58,0.25)" }}>
                  {l.label} ({n.toLocaleString("en-IN")})
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Filters */}
        <div className="glass-card p-4 mb-6">
          <div className="flex flex-col gap-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#475569" }} />
              <input value={search} onChange={e => { setSearch(e.target.value); setShown(PAGE_SIZE); setRevealed({}); }}
                     aria-label="Search questions, options or topics"
                     placeholder="Search questions, options or topics..."
                     className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
                     style={{ background: "rgba(10,15,20,0.8)", border: "1px solid rgba(240,145,58,0.2)", color: "#fff" }} />
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <div className="relative flex-1 min-w-[180px]">
                <select value={filter} onChange={e => changeSubject(e.target.value)}
                        aria-label="Filter by subject"
                        className="w-full appearance-none pl-4 pr-9 py-2 rounded-lg text-sm outline-none"
                        style={{ background: "rgba(10,15,20,0.8)", border: "1px solid rgba(240,145,58,0.2)", color: "#fff", cursor: "pointer" }}>
                  {SUBJECT_FILTERS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#475569" }} />
              </div>
              {filter !== "all" && chapterOptions.length > 0 && (
                <div className="relative flex-1 min-w-[180px]">
                  <select value={chapter} onChange={e => changeChapter(e.target.value)}
                          aria-label="Filter by chapter"
                          className="w-full appearance-none pl-4 pr-9 py-2 rounded-lg text-sm outline-none"
                          style={{ background: "rgba(10,15,20,0.8)", border: "1px solid rgba(240,145,58,0.2)", color: "#fff", cursor: "pointer" }}>
                    <option value="all">All chapters ({subjectTotal.toLocaleString("en-IN")})</option>
                    {chapterOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#475569" }} />
                </div>
              )}
              <button type="button" onClick={shuffle}
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold"
                      style={{ background: "rgba(240,145,58,0.1)", border: "1px solid rgba(240,145,58,0.3)", color: "#f0913a" }}>
                <Shuffle className="w-4 h-4" /> Shuffle
              </button>
              {flaggedCount > 0 && (
                <button type="button" onClick={() => { setFlaggedOnly(v => !v); setShown(PAGE_SIZE); setRevealed({}); }}
                        aria-pressed={flaggedFilterActive}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold"
                        style={flaggedFilterActive
                          ? { background: "rgba(240,145,58,0.18)", border: "1px solid rgba(240,145,58,0.5)", color: "#f0913a" }
                          : { background: "transparent", border: "1px solid rgba(240,145,58,0.2)", color: "#94a3b8" }}>
                  <Bookmark className="w-4 h-4" fill={flaggedFilterActive ? "currentColor" : "none"} /> Flagged ({flaggedCount})
                </button>
              )}
              {hasActiveFilters && (
                <button type="button" onClick={resetView}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold"
                        style={{ background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.2)", color: "#94a3b8" }}>
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Timed practice path: a real sitting, not just a scroll */}
        {filter !== "all" && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl p-4"
               style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.25)" }}>
            <div className="flex-1">
              <div className="text-sm font-bold text-white">Ready for a timed sitting?</div>
              <div className="text-xs mt-1" style={{ color: "#64748b" }}>
                A timed mid-subject test drawn from {subjectName} · 45 minutes · review after submission.
              </div>
            </div>
            <Link href={`/mock-test?subject=${filter}&type=mid`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-black no-underline"
                  style={{ background: "rgba(34,197,94,0.14)", border: "1px solid rgba(34,197,94,0.4)", color: "#22c55e" }}>
              <Clock className="w-4 h-4" /> Start timed test <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Result count */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="text-sm" style={{ color: "#64748b" }}>
            Showing <strong style={{ color: "#94a3b8" }}>{Math.min(shown, filtered.length).toLocaleString()}</strong>
            {" "}of <strong style={{ color: "#94a3b8" }}>{filtered.length.toLocaleString()}</strong> questions
          </span>
          <div className="flex items-center gap-3">
            {shuffleSeed > 0 && <span className="text-xs font-bold" style={{ color: "#f0913a" }}>Shuffled</span>}
            {revealedCount > 0 && (
              <button type="button" onClick={() => setRevealed({})}
                      className="text-xs" style={{ color: "#f0913a" }}>
                Hide all answers
              </button>
            )}
          </div>
        </div>

        {/* Question list */}
        <div className="flex flex-col gap-4">
          {filtered.length === 0 && (
            <div className="text-center py-16" style={{ color: "#475569" }}>
              No questions found. Try a different subject, chapter or search term.
            </div>
          )}
          {visible.map((q, i) => {
            const key = q.q;
            const open = !!revealed[key];
            const isFlagged = !!flags[key];
            return (
              <div key={key} className="glass-card overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: "rgba(240,145,58,0.15)", color: "#f0913a" }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full inline-block max-w-full"
                              style={{ background: "rgba(240,145,58,0.08)", color: "#f0913a", border: "1px solid rgba(240,145,58,0.15)" }}>
                          {displaySubjects(q.subjectIds)}
                        </span>
                        {q.chapterId && CHAPTER_LABELS[q.chapterId] && (
                          <span className="text-[11px]" style={{ color: "#64748b" }}>
                            {CHAPTER_LABELS[q.chapterId]}
                          </span>
                        )}
                        <button type="button" onClick={() => toggleSaved(key)}
                                aria-pressed={isFlagged}
                                aria-label={!flagsReady
                                  ? "Loading saved flags"
                                  : isFlagged ? "Remove from flagged questions" : "Flag this question for review"}
                                title={!flagsReady
                                  ? "Loading saved flags"
                                  : isFlagged ? "Remove from flagged questions" : "Flag this question for review"}
                                disabled={!flagsReady}
                                className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 disabled:cursor-wait"
                                style={{
                                  opacity: flagsReady ? 1 : 0.5,
                                  ...(isFlagged
                                    ? { color: "#f0913a", background: "rgba(240,145,58,0.12)", border: "1px solid rgba(240,145,58,0.3)" }
                                    : { color: "#475569", background: "transparent", border: "1px solid rgba(148,163,184,0.15)" }),
                                }}>
                          <Bookmark className="w-4 h-4" fill={isFlagged ? "currentColor" : "none"} />
                        </button>
                      </div>
                      <p className="text-base font-medium mb-4 leading-relaxed">{q.q}</p>

                      <div className="flex flex-col gap-2">
                        {q.opts.map((opt, oi) => (
                          <div key={oi} className="px-4 py-2.5 rounded-lg text-sm flex items-center gap-3"
                               style={{
                                 background: open && oi === q.ans ? "rgba(34,197,94,0.12)" : "rgba(10,15,20,0.6)",
                                 border: open && oi === q.ans ? "1px solid #22c55e" : "1px solid rgba(240,145,58,0.1)",
                                 color: open && oi === q.ans ? "#22c55e" : "#94a3b8",
                               }}>
                            {open && oi === q.ans && <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#22c55e" }} />}
                            <span className="font-semibold mr-1" style={{ color: open && oi === q.ans ? "#22c55e" : "#475569" }}>
                              {String.fromCharCode(65 + oi)}.
                            </span>
                            <span className="break-words">{opt}</span>
                          </div>
                        ))}
                      </div>

                      {open && isRealExplanation(q.exp) && (
                        <div className="mt-4 p-4 rounded-xl text-sm"
                             style={{ background: "rgba(240,145,58,0.05)", border: "1px solid rgba(240,145,58,0.15)", color: "#94a3b8" }}>
                          💡 <strong style={{ color: "#f0913a" }}>Explanation:</strong> {q.exp}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button type="button" onClick={() => toggle(key)}
                        className="w-full py-3 text-sm font-medium flex items-center justify-center gap-2"
                        style={{ borderTop: "1px solid rgba(240,145,58,0.1)", background: "rgba(240,145,58,0.03)", color: open ? "#ef4444" : "#f0913a", cursor: "pointer" }}>
                  {open ? <><XCircle className="w-4 h-4" /> Hide Answer</> : <><CheckCircle className="w-4 h-4" /> Show Answer</>}
                </button>
              </div>
            );
          })}
        </div>

        {/* Load more */}
        {shown < filtered.length && (
          <div className="mt-8 flex justify-center">
            <button type="button" onClick={() => setShown(s => s + PAGE_SIZE)}
                    className="px-6 py-3 rounded-xl text-sm font-bold"
                    style={{ background: "rgba(240,145,58,0.1)", border: "1px solid rgba(240,145,58,0.3)", color: "#f0913a" }}>
              Load {Math.min(PAGE_SIZE, filtered.length - shown)} more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
