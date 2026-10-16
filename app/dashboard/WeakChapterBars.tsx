"use client";
import Link from "next/link";
import { looksLikeAirRegsBankId } from "@/lib/chapter-links";

// Horizontal bar list of weakest chapters — 8px rounded bars, severity colour
// by accuracy band. When a notes route is known the whole row becomes a link
// to the chapter ("revise →" cue; Phase 2), so a weak area is one tap from
// study material instead of a dead label.
//
// The label/href resolvers come from the parent (useStoredChapterResolution in
// lib/chapter-links.ts): Air Regulations attempts store BANK chapter ids, and
// that translation lives beside the question bank, loaded on demand — a static
// import here would put the bank back in the dashboard bundle.
export default function WeakChapterBars({
  items,
  labelFor,
  hrefFor,
}: {
  items: { chapterId: string; accuracy: number; total: number }[];
  labelFor: (chapterId: string) => string | undefined;
  hrefFor: (chapterId: string) => string | undefined;
}) {
  const color = (acc: number) => (acc < 50 ? "#ef4444" : acc < 70 ? "#f59e0b" : "#64748b");
  return (
    <div className="flex flex-col gap-3">
      {items.map(it => {
        const label = labelFor(it.chapterId)
          ?? (looksLikeAirRegsBankId(it.chapterId) ? "Air Regulations" : it.chapterId);
        const href = hrefFor(it.chapterId);
        const body = (
          <>
            <div className="flex items-center justify-between text-xs mb-1">
              <span style={{ color: "#94a3b8" }}>
                {label}
                {href && <span style={{ color: "#f0913a" }}> · revise →</span>}
              </span>
              <span style={{ color: color(it.accuracy) }} className="font-bold">{it.accuracy}%</span>
            </div>
            <div className="w-full rounded-full" style={{ height: 8, background: "rgba(255,255,255,0.06)" }}>
              <div className="rounded-full" style={{ height: 8, width: `${it.accuracy}%`, background: color(it.accuracy) }} />
            </div>
          </>
        );
        return href ? (
          <Link key={it.chapterId} href={href} title={`Open chapter notes: ${label}`}
                className="block no-underline -mx-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
            {body}
          </Link>
        ) : (
          <div key={it.chapterId} className="px-2 py-1 -mx-2 rounded-lg">{body}</div>
        );
      })}
    </div>
  );
}
