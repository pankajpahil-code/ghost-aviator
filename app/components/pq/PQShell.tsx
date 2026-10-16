"use client";
import { useState } from "react";

// Year filter + copy protection around server-rendered question cards.
// The cards are rendered on the server (crawlable, no JS needed to read them); this component
// only sets data-year on the list, and a stylesheet emitted by the page hides cards whose
// data-y does not contain that year. Protection mirrors QuestionsPage: no selection, copy, cut,
// context menu or drag, and nothing prints (Iron Rule 3).
export default function PQShell({ years, accent, children }: { years: number[]; accent: string; children: React.ReactNode }) {
  const [year, setYear] = useState<number | null>(null);
  const block = (e: React.SyntheticEvent) => e.preventDefault();
  const chip = (active: boolean) => ({
    background: active ? `${accent}26` : "rgba(255,255,255,0.04)",
    border: `1px solid ${active ? `${accent}80` : "rgba(255,255,255,0.1)"}`,
    color: active ? accent : "#94a3b8",
  });
  return (
    <div>
      {years.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 mb-6" role="group" aria-label="Show questions asked in a year">
          <span className="text-xs font-bold mr-1" style={{ color: "#64748b" }}>Asked in:</span>
          <button type="button" onClick={() => setYear(null)} aria-pressed={year === null}
                  className="text-xs font-bold px-3 py-1.5 rounded-full" style={chip(year === null)}>All years</button>
          {years.map(y => (
            <button key={y} type="button" onClick={() => setYear(y)} aria-pressed={year === y}
                    className="text-xs font-bold px-3 py-1.5 rounded-full" style={chip(year === y)}>{y}</button>
          ))}
        </div>
      )}
      <div className="pq-list flex flex-col gap-4" data-year={year ?? undefined}
           onContextMenu={block} onCopy={block} onCut={block} onDragStart={block}
           style={{ userSelect: "none", WebkitUserSelect: "none" }}>
        {children}
      </div>
      <style>{years.map(y => `.pq-list[data-year="${y}"] .pq-card:not([data-y~="${y}"]){display:none}`).join("") +
        `@media print { .pq-list { display: none !important; } }`}</style>
    </div>
  );
}
