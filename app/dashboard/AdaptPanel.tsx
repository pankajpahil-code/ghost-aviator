"use client";

// Dashboard — the student's saved ADAPT sittings.
//
// This is the payoff for making an account, and it is the reason the sign-up
// invitation on /adapt-test is not an empty ask: a signed-out student's
// sittings live in one browser and vanish with it, while these persist and
// accumulate into a learning curve.
//
// Reads only. Everything here comes from `adapt_results`, which RLS restricts
// to the caller's own rows — see SECURITY.md §3e.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Gauge, TrendingUp } from "lucide-react";
import { loadResults, seriesFor, type SavedRow } from "@/lib/adapt/results";
import { learningFor, learningNote } from "@/lib/adapt/learning.mjs";
import { reportLine } from "@/lib/adapt/bands.mjs";
import { MODULES } from "@/lib/adapt/session.mjs";

const cyan = "#f0913a";

export default function AdaptPanel({ userId }: { userId: string | null }) {
  const [rows, setRows] = useState<SavedRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let live = true;
    void loadResults(userId).then((r) => {
      if (!live) return;
      setRows(r);
      setLoaded(true);
    });
    return () => { live = false; };
  }, [userId]);

  // Nothing at all is rendered until the fetch resolves, and nothing is
  // rendered for a student who has never sat one — an empty panel promising a
  // learning curve is worse than no panel.
  if (!loaded || rows.length === 0) return null;

  // Modules in registry order rather than in the order rows happened to arrive,
  // so the panel does not reshuffle itself between visits.
  const moduleIds = Object.keys(MODULES).filter((id) => rows.some((r) => r.module_id === id));

  return (
    <section>
      <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2">
        <Gauge className="w-5 h-5" style={{ color: cyan }} /> Airline Screening Practice
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {moduleIds.map((id) => {
          const mine = rows.filter((r) => r.module_id === id);
          const latest = mine[mine.length - 1];

          // The questionnaire has no grade and never gets one — it reports that
          // it was completed and nothing else.
          if (latest.module_kind === "behavioural") {
            return (
              <div key={id} className="glass-card p-5">
                <div className="font-bold text-white mb-1">{MODULES[id].name}</div>
                <div className="text-xs" style={{ color: "#64748b" }}>
                  Completed {mine.filter((r) => r.stanine === null).length} time
                  {mine.length === 1 ? "" : "s"} — not graded, and never will be.
                </div>
              </div>
            );
          }

          // Tracking is split by input device: a phone and a joystick are not
          // the same task, and one curve drawn through both would be measuring
          // the purchase rather than the practice.
          const inputClass = latest.module_kind === "psychomotor" ? latest.input_class : null;
          const scores = seriesFor(mine, id, inputClass);
          const learning = learningFor(scores);
          const line = Number.isInteger(latest.stanine) ? reportLine(latest.stanine as number) : null;
          const note = learningNote(learning);

          return (
            <div key={id} className="glass-card p-5">
              <div className="font-bold text-white mb-1">{MODULES[id].name}</div>
              <div className="text-xs mb-3" style={{ color: "#64748b" }}>
                {mine.length} sitting{mine.length === 1 ? "" : "s"}
                {learning.best != null && ` · best stanine ${learning.best}`}
              </div>

              {line && (
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-black leading-none" style={{ color: line.band.hex }}>
                    {line.stanine}
                  </span>
                  <span className="text-xs" style={{ color: "#94a3b8" }}>
                    latest · sten {line.sten} · {line.band.label}
                  </span>
                </div>
              )}

              <Sparkline scores={scores} />

              {note ? (
                <p className="text-xs mt-3 flex items-start gap-1.5" style={{ color: "#cbd5e1" }}>
                  <TrendingUp className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: cyan }} aria-hidden />
                  <span>{note}</span>
                </p>
              ) : (
                <p className="text-xs mt-3" style={{ color: "#64748b" }}>
                  {learning.sittingsNeeded} more sitting{learning.sittingsNeeded === 1 ? "" : "s"} and this
                  shows your learning curve.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Link
        href="/adapt-test"
        className="inline-block mt-5 text-sm font-bold no-underline"
        style={{ color: cyan }}
      >
        Sit another session →
      </Link>
    </section>
  );
}

/** Stanines over time. Bars rather than a line — nine integers are not a curve. */
function Sparkline({ scores }: { scores: number[] }) {
  if (scores.length === 0) return null;
  return (
    <div className="flex items-end gap-1" style={{ height: 44 }} role="img"
         aria-label={`Stanines across ${scores.length} sittings: ${scores.join(", ")}`}>
      {scores.slice(-16).map((s, i) => (
        <div
          key={i}
          className="flex-1 rounded-t"
          style={{
            height: `${(s / 9) * 100}%`,
            minWidth: 4,
            background: reportLine(s).band.hex,
            opacity: 0.55 + 0.45 * ((i + 1) / Math.min(scores.length, 16)),
          }}
        />
      ))}
    </div>
  );
}
