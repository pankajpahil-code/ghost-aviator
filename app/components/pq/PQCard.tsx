import type { PQQuestion } from "@/lib/previous-questions";

// One recalled question. Server component: the stem, options, answer and explanation are all in
// the HTML. The answer sits in a <details> a student opens; it is reachable by every reader, so it
// is not hidden text.
const LETTERS = "ABCDEF";

function provenance(q: PQQuestion): string {
  if (q.kind === "topic") return "Topic came up in";
  if (q.kind === "rebuilt") return "Asked, wording rebuilt from a partial recall, in";
  return q.times === 1 ? "Asked in" : `Asked in ${q.times} sittings`;
}

export default function PQCard({ q, n, accent }: { q: PQQuestion; n: number; accent: string }) {
  return (
    <article className="pq-card rounded-2xl p-5" data-y={q.years.join(" ")}
             style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        <span className="font-black" style={{ color: accent }}>Q{n}</span>
        <span style={{ color: "#64748b" }}>{provenance(q)}{q.seenIn.length ? ":" : ""}</span>
        {q.seenIn.map(s => (
          <span key={s} className="px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "#cbd5e1" }}>{s}</span>
        ))}
        {q.undated && (
          <span className="px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8" }}>
            also in an undated previous-attempt paper
          </span>
        )}
      </div>
      <h3 className="text-base font-semibold text-white mb-3 leading-relaxed">{q.stem}</h3>
      <ol className="flex flex-col gap-2 mb-3" style={{ listStyle: "none", padding: 0 }}>
        {q.opts.map((o, i) => (
          <li key={i} className="text-sm px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", color: "#cbd5e1" }}>
            <span className="font-bold mr-2" style={{ color: "#64748b" }}>{LETTERS[i]}.</span>{o}
          </li>
        ))}
      </ol>
      <details className="rounded-lg" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
        <summary className="cursor-pointer text-sm font-bold px-3 py-2" style={{ color: "#22c55e" }}>Show answer</summary>
        <div className="px-3 pb-3 text-sm leading-relaxed">
          <p className="font-bold mb-1" style={{ color: "#22c55e" }}>{LETTERS[q.ans]}. {q.opts[q.ans]}</p>
          <p style={{ color: "#94a3b8" }}>{q.exp}</p>
          {q.note && (
            <p className="mt-2 text-xs" style={{ color: "#f0913a" }}>{q.note}</p>
          )}
          {q.optionsWritten && (
            <p className="mt-2 text-xs" style={{ color: "#64748b" }}>
              The question was recalled without its options; these options were written to it.
            </p>
          )}
        </div>
      </details>
    </article>
  );
}
