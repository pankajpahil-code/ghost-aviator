"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  ChevronDown,
  RotateCcw,
  Target,
  Trash2,
  XCircle,
} from "lucide-react";
import { ATPL_SUBJECTS, CPL_SUBJECTS } from "@/lib/subjects";
import { isRealExplanation } from "@/lib/explanation";
import {
  clearMistakes,
  MAX_MISTAKES,
  removeMistake,
  useMistakes,
  type MistakeEntry,
} from "@/lib/mistakes";

type SubjectMeta = {
  track: "cpl" | "atpl";
  name: string;
  chapters: Set<string>;
};

const SUBJECT_META: Record<string, SubjectMeta> = (() => {
  const map: Record<string, SubjectMeta> = {};
  for (const subject of CPL_SUBJECTS) {
    map[subject.id] = {
      track: "cpl",
      name: subject.name,
      chapters: new Set(subject.chapters.map((chapter) => chapter.id)),
    };
  }
  for (const subject of ATPL_SUBJECTS) {
    map[subject.id] = {
      track: "atpl",
      name: subject.name,
      chapters: new Set(subject.chapters.map((chapter) => chapter.id)),
    };
  }
  return map;
})();

function letter(index: number): string {
  return String.fromCharCode(65 + index);
}

function fmtDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function isAirRegsBankId(id: string | undefined): boolean {
  return !!id && (/^ar-\d+$/.test(id) || id === "sar");
}

function practiceLink(entry: MistakeEntry): { href: string; label: string } {
  const meta = SUBJECT_META[entry.subjectId];
  if (!meta) return { href: "/question-bank", label: "Open question bank" };

  const isAirRegs =
    entry.subjectId === "air-regulations" || entry.subjectId === "atpl-air-regulations";
  // Air Regulations bank ids can share the spelling of a different site
  // chapter. Only link to a chapter when the id is a real site chapter for this
  // subject; otherwise the subject page is the honest destination.
  if (
    entry.chapterId &&
    !(isAirRegs && isAirRegsBankId(entry.chapterId)) &&
    meta.chapters.has(entry.chapterId)
  ) {
    return {
      href: `/${meta.track}/${entry.subjectId}/${entry.chapterId}/questions`,
      label: "Practice this chapter",
    };
  }
  return { href: `/${meta.track}/${entry.subjectId}`, label: "Open this subject" };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card p-3 sm:p-4 text-center">
      <div className="text-xl sm:text-2xl font-bold" style={{ color: "#f0913a" }}>
        {value}
      </div>
      <div className="text-[11px] sm:text-xs" style={{ color: "#64748b" }}>
        {label}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="glass-card p-8 sm:p-10 text-center">
      <div className="text-5xl mb-4">🎯</div>
      <h2 className="text-2xl font-extrabold text-white mb-2">No mistakes saved yet</h2>
      <p className="max-w-lg mx-auto mb-8" style={{ color: "#94a3b8" }}>
        Sit a mock test. Any question you get wrong or skip is added here automatically, with the
        correct answer and explanation.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/free-dgca-mock-test"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold no-underline"
          style={{ background: "linear-gradient(135deg,#f0913a,#0099cc)", color: "#000" }}
        >
          Take a mock test <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/question-bank"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold no-underline"
          style={{
            border: "1px solid rgba(240,145,58,0.3)",
            color: "#f0913a",
            background: "rgba(240,145,58,0.06)",
          }}
        >
          <BookOpen className="w-4 h-4" /> Browse question bank
        </Link>
      </div>
    </div>
  );
}

export default function MistakesClient() {
  const { mistakes, ready } = useMistakes();
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [chapterFilter, setChapterFilter] = useState("all");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [confirmClear, setConfirmClear] = useState(false);

  const subjectOptions = useMemo(() => {
    const map = new Map<string, { value: string; label: string; count: number }>();
    for (const entry of mistakes) {
      const meta = SUBJECT_META[entry.subjectId];
      const label = meta ? `${meta.name} · ${meta.track.toUpperCase()}` : entry.subjectName;
      const current = map.get(entry.subjectId) ?? {
        value: entry.subjectId,
        label,
        count: 0,
      };
      current.count += 1;
      map.set(entry.subjectId, current);
    }
    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [mistakes]);

  const chapterOptions = useMemo(() => {
    const source =
      subjectFilter === "all"
        ? mistakes
        : mistakes.filter((entry) => entry.subjectId === subjectFilter);
    const map = new Map<string, { value: string; label: string; count: number }>();
    for (const entry of source) {
      const value = entry.chapterId ?? "__none__";
      const label = entry.chapterId ? entry.chapterLabel : "Unclassified";
      const current = map.get(value) ?? { value, label, count: 0 };
      current.count += 1;
      map.set(value, current);
    }
    return [...map.values()].sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true }),
    );
  }, [mistakes, subjectFilter]);

  const filtered = useMemo(() => {
    return mistakes.filter((entry) => {
      if (subjectFilter !== "all" && entry.subjectId !== subjectFilter) return false;
      if (chapterFilter !== "all" && (entry.chapterId ?? "__none__") !== chapterFilter) {
        return false;
      }
      return true;
    });
  }, [mistakes, subjectFilter, chapterFilter]);

  const hasFilters = subjectFilter !== "all" || chapterFilter !== "all";
  const lastMissed = mistakes[0]?.updatedAt;
  const chapterTotal =
    subjectFilter === "all"
      ? mistakes.length
      : chapterOptions.reduce((sum, option) => sum + option.count, 0);

  function changeSubject(value: string) {
    setSubjectFilter(value);
    setChapterFilter("all");
  }

  function resetFilters() {
    setSubjectFilter("all");
    setChapterFilter("all");
  }

  function toggleReveal(key: string) {
    setRevealed((current) => ({ ...current, [key]: !current[key] }));
  }

  function clearAll() {
    clearMistakes();
    setConfirmClear(false);
    setRevealed({});
  }

  return (
    <div className="grid-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{
              background: "rgba(240,145,58,0.1)",
              border: "1px solid rgba(240,145,58,0.3)",
              color: "#f0913a",
            }}
          >
            <Target className="w-4 h-4" /> Local-only review
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Mistakes Bank</h1>
          <p className="max-w-2xl mx-auto" style={{ color: "#94a3b8" }}>
            Every mock-test question you answer wrong or skip is kept here with the correct answer
            and explanation. Review it, practise the chapter, then mark it mastered.
          </p>
          <p className="text-xs mt-3" style={{ color: "#475569" }}>
            Saved in this browser only — no account or server sync.{" "}
            <Link href="/privacy" className="underline" style={{ color: "#64748b" }}>
              How this is stored
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto mb-8">
          <Stat label="Saved" value={ready ? String(mistakes.length) : "—"} />
          <Stat label="Subjects" value={ready ? String(subjectOptions.length) : "—"} />
          <Stat label="Last missed" value={ready && lastMissed ? fmtDate(lastMissed) : "—"} />
        </div>

        {!ready ? (
          <div className="glass-card p-10 text-center text-sm" style={{ color: "#64748b" }}>
            Reading this device…
          </div>
        ) : mistakes.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="glass-card p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                <div className="relative flex-1 min-w-[180px]">
                  <select
                    value={subjectFilter}
                    onChange={(event) => changeSubject(event.target.value)}
                    aria-label="Filter mistakes by subject"
                    className="w-full appearance-none pl-4 pr-9 py-2 rounded-lg text-sm outline-none"
                    style={{
                      background: "rgba(10,15,20,0.8)",
                      border: "1px solid rgba(240,145,58,0.2)",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <option value="all">All subjects ({mistakes.length})</option>
                    {subjectOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.count})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "#475569" }}
                  />
                </div>

                <div className="relative flex-1 min-w-[180px]">
                  <select
                    value={chapterFilter}
                    onChange={(event) => setChapterFilter(event.target.value)}
                    aria-label="Filter mistakes by chapter"
                    disabled={chapterOptions.length === 0}
                    className="w-full appearance-none pl-4 pr-9 py-2 rounded-lg text-sm outline-none disabled:opacity-50"
                    style={{
                      background: "rgba(10,15,20,0.8)",
                      border: "1px solid rgba(240,145,58,0.2)",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <option value="all">All chapters ({chapterTotal})</option>
                    {chapterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.count})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "#475569" }}
                  />
                </div>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold"
                    style={{
                      background: "rgba(148,163,184,0.08)",
                      border: "1px solid rgba(148,163,184,0.2)",
                      color: "#94a3b8",
                    }}
                  >
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#f87171",
                  }}
                >
                  <Trash2 className="w-4 h-4" /> Clear all
                </button>
              </div>

              {confirmClear && (
                <div
                  className="mt-3 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center gap-3"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.3)",
                  }}
                >
                  <div className="flex items-start gap-2 flex-1">
                    <AlertTriangle
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: "#f87171" }}
                    />
                    <p className="text-xs" style={{ color: "#fca5a5" }}>
                      Clear all {mistakes.length} saved mistake{mistakes.length === 1 ? "" : "s"}?
                      This cannot be undone.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={clearAll}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{
                        background: "rgba(239,68,68,0.15)",
                        border: "1px solid rgba(239,68,68,0.4)",
                        color: "#f87171",
                      }}
                    >
                      Yes, clear all
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(148,163,184,0.2)",
                        color: "#94a3b8",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className="text-sm" style={{ color: "#64748b" }}>
                Showing <strong style={{ color: "#94a3b8" }}>{filtered.length}</strong> of{" "}
                <strong style={{ color: "#94a3b8" }}>{mistakes.length}</strong> saved
              </span>
              <span className="text-xs" style={{ color: "#475569" }}>
                Most recently missed first
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-sm mb-4" style={{ color: "#94a3b8" }}>
                  No mistakes match these filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold"
                  style={{
                    background: "rgba(240,145,58,0.1)",
                    border: "1px solid rgba(240,145,58,0.3)",
                    color: "#f0913a",
                  }}
                >
                  <RotateCcw className="w-4 h-4" /> Clear filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map((entry) => {
                  const open = !!revealed[entry.key];
                  const practice = practiceLink(entry);
                  return (
                    <article key={entry.key} className="glass-card overflow-hidden">
                      <div className="p-5 sm:p-6">
                        <div
                          className="flex flex-wrap items-center gap-2 text-[11px] mb-3"
                          style={{ color: "#64748b" }}
                        >
                          <span
                            className="px-2 py-0.5 rounded-full max-w-full break-words"
                            style={{
                              background: "rgba(240,145,58,0.08)",
                              color: "#f0913a",
                              border: "1px solid rgba(240,145,58,0.15)",
                            }}
                          >
                            {entry.subjectName}
                          </span>
                          <span className="min-w-0 break-words">{entry.chapterLabel}</span>
                          {entry.wrongCount > 1 && (
                            <span style={{ color: "#f59e0b" }}>
                              Missed {entry.wrongCount}×
                            </span>
                          )}
                          <span className="ml-auto">{fmtDate(entry.updatedAt)}</span>
                        </div>

                        <p className="text-sm sm:text-base font-medium leading-relaxed mb-4 break-words">
                          {entry.q}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={
                              entry.userAnswer === null
                                ? {
                                    background: "rgba(245,158,11,0.1)",
                                    border: "1px solid rgba(245,158,11,0.3)",
                                    color: "#fbbf24",
                                  }
                                : {
                                    background: "rgba(239,68,68,0.1)",
                                    border: "1px solid rgba(239,68,68,0.3)",
                                    color: "#f87171",
                                  }
                            }
                          >
                            {entry.userAnswer === null ? (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            {entry.userAnswer === null
                              ? "Skipped"
                              : `Your answer: ${letter(entry.userAnswer)}`}
                          </span>
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                            style={{
                              background: "rgba(34,197,94,0.1)",
                              border: "1px solid rgba(34,197,94,0.3)",
                              color: "#4ade80",
                            }}
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Correct: {letter(entry.ans)}
                          </span>
                          <span className="break-words" style={{ color: "#475569" }}>
                            {entry.sourceDetail}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleReveal(entry.key)}
                          aria-expanded={open}
                          className="inline-flex items-center gap-2 text-sm font-bold"
                          style={{ color: "#f0913a" }}
                        >
                          {open ? "Hide answer & explanation" : "Show answer & explanation"}
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
                          />
                        </button>

                        {open && (
                          <div className="mt-4 flex flex-col gap-2">
                            {entry.opts.map((option, index) => {
                              const isCorrect = index === entry.ans;
                              const isUser = index === entry.userAnswer;
                              return (
                                <div
                                  key={index}
                                  className="px-3.5 py-2.5 rounded-lg text-sm break-words"
                                  style={{
                                    background: isCorrect
                                      ? "rgba(34,197,94,0.12)"
                                      : isUser
                                        ? "rgba(239,68,68,0.12)"
                                        : "rgba(10,15,20,0.6)",
                                    border: isCorrect
                                      ? "1px solid #22c55e"
                                      : isUser
                                        ? "1px solid #ef4444"
                                        : "1px solid rgba(240,145,58,0.1)",
                                    color: isCorrect ? "#4ade80" : isUser ? "#f87171" : "#94a3b8",
                                  }}
                                >
                                  <span className="font-bold mr-2">{letter(index)}.</span>
                                  {option}
                                </div>
                              );
                            })}
                            {isRealExplanation(entry.exp) && (
                              <div
                                className="mt-1 p-3.5 rounded-lg text-sm"
                                style={{
                                  background: "rgba(240,145,58,0.05)",
                                  border: "1px solid rgba(240,145,58,0.15)",
                                  color: "#94a3b8",
                                }}
                              >
                                <span className="font-semibold" style={{ color: "#f0913a" }}>
                                  💡 Explanation:{" "}
                                </span>
                                {entry.exp}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div
                        className="flex flex-col sm:flex-row gap-2 px-5 sm:px-6 py-4"
                        style={{
                          borderTop: "1px solid rgba(240,145,58,0.1)",
                          background: "rgba(240,145,58,0.03)",
                        }}
                      >
                        <Link
                          href={practice.href}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold no-underline"
                          style={{
                            border: "1px solid rgba(240,145,58,0.25)",
                            color: "#f0913a",
                            background: "rgba(240,145,58,0.06)",
                          }}
                        >
                          <BookOpen className="w-4 h-4" /> {practice.label}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeMistake(entry.key)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold"
                          style={{
                            border: "1px solid rgba(34,197,94,0.25)",
                            color: "#4ade80",
                            background: "rgba(34,197,94,0.06)",
                          }}
                        >
                          <CheckCircle className="w-4 h-4" /> Mark mastered
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <p className="text-xs text-center mt-8" style={{ color: "#334155" }}>
              The bank keeps the {MAX_MISTAKES} most recently missed questions. Clearing browser data
              also removes it.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
