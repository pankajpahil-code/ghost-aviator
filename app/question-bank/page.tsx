"use client";
import { useMemo, useState } from "react";
import { Search, BookOpen, CheckCircle, XCircle, ChevronDown } from "lucide-react";
import { ALL_QUESTIONS } from "@/lib/questions";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";

const SUBJECT_INDEX: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const s of [...CPL_SUBJECTS, ...ATPL_SUBJECTS]) map[s.id] = s.name;
  return map;
})();

function displaySubjects(ids: string[]): string {
  const names = ids.map(id => SUBJECT_INDEX[id] ?? id);
  // Collapse duplicates so "Air Regulations" doesn't appear twice for shared questions
  return Array.from(new Set(names)).join(" · ");
}

const SUBJECT_FILTERS = [
  { value: "all",                  label: "All Subjects" },
  { value: "air-regulations",      label: "Air Regulations (CPL)" },
  { value: "atpl-air-regulations", label: "Air Regulations (ATPL)" },
  { value: "air-navigation",       label: "Air Navigation (CPL)" },
  { value: "atpl-navigation",      label: "Air Navigation (ATPL)" },
  { value: "meteorology",          label: "Meteorology (CPL)" },
  { value: "atpl-meteorology",     label: "Meteorology (ATPL)" },
  { value: "technical-general",    label: "Technical General" },
  { value: "technical-specific",   label: "Technical Specific" },
  { value: "technical-performance",label: "Performance" },
  { value: "radio-telephony",      label: "Radio Telephony" },
];

const PAGE_SIZE = 25;

export default function QuestionBankPage() {
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [shown, setShown]       = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return ALL_QUESTIONS.filter(q => {
      if (filter !== "all" && !q.subjectIds.includes(filter)) return false;
      if (!term) return true;
      return q.q.toLowerCase().includes(term)
        || q.opts.some(o => o.toLowerCase().includes(term));
    });
  }, [search, filter]);

  const visible = filtered.slice(0, shown);

  function toggle(idx: number) {
    setRevealed(p => ({ ...p, [idx]: !p[idx] }));
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

        {/* Filters */}
        <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#475569" }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setShown(PAGE_SIZE); setRevealed({}); }}
                   placeholder="Search questions or options..."
                   className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
                   style={{ background: "rgba(10,15,20,0.8)", border: "1px solid rgba(240,145,58,0.2)", color: "#fff" }} />
          </div>
          <div className="relative">
            <select value={filter} onChange={e => { setFilter(e.target.value); setShown(PAGE_SIZE); setRevealed({}); }}
                    className="appearance-none pl-4 pr-9 py-2 rounded-lg text-sm outline-none"
                    style={{ background: "rgba(10,15,20,0.8)", border: "1px solid rgba(240,145,58,0.2)", color: "#fff", cursor: "pointer" }}>
              {SUBJECT_FILTERS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#475569" }} />
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm" style={{ color: "#64748b" }}>
            Showing <strong style={{ color: "#94a3b8" }}>{Math.min(shown, filtered.length).toLocaleString()}</strong>
            {" "}of <strong style={{ color: "#94a3b8" }}>{filtered.length.toLocaleString()}</strong> questions
          </span>
          {Object.keys(revealed).length > 0 && (
            <button onClick={() => setRevealed({})}
                    className="text-xs" style={{ color: "#f0913a" }}>
              Hide all answers
            </button>
          )}
        </div>

        {/* Question list */}
        <div className="flex flex-col gap-4">
          {filtered.length === 0 && (
            <div className="text-center py-16" style={{ color: "#475569" }}>
              No questions found. Try a different subject or search term.
            </div>
          )}
          {visible.map((q, i) => {
            const key  = i;
            const open = !!revealed[key];
            return (
              <div key={key} className="glass-card overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: "rgba(240,145,58,0.15)", color: "#f0913a" }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs mb-2 px-2 py-0.5 rounded-full inline-block max-w-full"
                           style={{ background: "rgba(240,145,58,0.08)", color: "#f0913a", border: "1px solid rgba(240,145,58,0.15)" }}>
                        {displaySubjects(q.subjectIds)}
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

                      {open && q.exp && (
                        <div className="mt-4 p-4 rounded-xl text-sm"
                             style={{ background: "rgba(240,145,58,0.05)", border: "1px solid rgba(240,145,58,0.15)", color: "#94a3b8" }}>
                          💡 <strong style={{ color: "#f0913a" }}>Explanation:</strong> {q.exp}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button onClick={() => toggle(key)}
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
            <button onClick={() => setShown(s => s + PAGE_SIZE)}
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
