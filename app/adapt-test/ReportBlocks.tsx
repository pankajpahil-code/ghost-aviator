"use client";

// ADAPT — the result report, shaped after the one the real screening produces.
//
// Split out of AdaptRunner because the runner's job is working the clock and
// these are presentation only. Everything here is fed already-computed values;
// nothing in this file calculates a score.
//
// ── What the real report looks like, and why it is copied ────────────────
//
// Verified first-party from the publisher's own product pages
// (ADAPT_COMPETITIVE_AUDIT.md §1.3): the psychomotor test reports "a graph with
// normed sten scores and colour bands"; the cognitive test reports "an overall
// score plus scores for each section, all normed and shown within a colour
// banding". So the real candidate sees a 1-10 score, a colour, and a breakdown
// per section — not one number.
//
// Familiarisation with that shape is a real part of what this simulator is for.
// Meeting the report format cold on the day is one more thing to absorb at the
// exact moment there is nothing spare to absorb it with.
//
// The stanine stays as OUR headline (Capt. Pahil's ruling, 2026-08-09); the
// sten and the band sit beside it. The provenance line says plainly that the
// band boundaries are ours, because they are — the publisher does not publish
// theirs and we did not buy the test to observe them.

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { reportLine, colourBandForSten, BAND_PROVENANCE } from "@/lib/adapt/bands.mjs";
import { learningFor, learningNote } from "@/lib/adapt/learning.mjs";
import type { SaveOutcome } from "@/lib/adapt/results";
import SignupPrompt from "./SignupPrompt";

const GREEN = "#22c55e";
const AMBER = "#eab308";
const RED = "#ef4444";
const GREY = "#475569";

/** Shared traffic-light rule, so no two panels disagree about what 60% looks like. */
const heat = (pct: number | null) => (pct == null ? GREY : pct >= 70 ? GREEN : pct >= 45 ? AMBER : RED);

// ── The headline score ─────────────────────────────────────────────────────

export function OverallScore({ stanine, advice }: { stanine: number; advice: string }) {
  const line = reportLine(stanine);
  return (
    <div
      className="mb-8 p-5 rounded-lg"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center gap-5 flex-wrap">
        <div className="text-6xl font-black leading-none" style={{ color: line.band.hex }}>
          {line.stanine}
        </div>
        <div className="flex-1" style={{ minWidth: 200 }}>
          <div className="font-bold text-white">
            Overall stanine {line.stanine} of 9 · sten {line.sten} of 10
          </div>
          <div className="text-sm font-bold mt-0.5" style={{ color: line.band.hex }}>
            {line.band.label}
          </div>
          <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{advice}</p>
        </div>
      </div>
      <StenBar sten={line.sten} />
      <p className="text-[11px] mt-3 leading-relaxed" style={{ color: "#64748b" }}>{BAND_PROVENANCE}</p>
    </div>
  );
}

/** The ten-box scale with the student's box lit — the graph the real report draws. */
export function StenBar({ sten }: { sten: number }) {
  return (
    <div className="flex gap-1 mt-4" role="img" aria-label={`Sten score ${sten} out of 10`}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
        const band = colourBandForSten(n);
        const on = n === sten;
        return (
          <div key={n} className="flex-1 text-center">
            <div
              style={{
                height: 8,
                borderRadius: 3,
                background: on ? band.hex : "rgba(255,255,255,0.10)",
                boxShadow: on ? `0 0 10px ${band.hex}` : undefined,
              }}
            />
            <div
              className="text-[9px] mt-1 tabular-nums"
              style={{ color: on ? band.hex : GREY, fontWeight: on ? 800 : 400 }}
            >
              {n}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Was it saved? ──────────────────────────────────────────────────────────

/**
 * Stated plainly, never implied.
 *
 * A student who believes a result was kept and later finds it gone has been
 * misled by us, not by the network — so a failed save says so out loud, and
 * says the result itself is still correct.
 */
export function SaveNotice({ outcome, signedIn }: { outcome: SaveOutcome | null; signedIn: boolean }) {
  if (!signedIn) return <SignupPrompt where="result" />;

  if (!outcome || outcome.status === "saved") {
    return (
      <div
        className="flex items-start gap-2 text-xs mb-6 p-3 rounded-lg"
        style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#86efac" }}
      >
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
        <span>
          Saved to your account. Your score and the breakdown behind it are kept — never your
          answers, and nothing from the attitudes questionnaire beyond the fact that you finished it.
        </span>
      </div>
    );
  }

  // Saving switched on for accounts before the storage behind it existed, and
  // for a short window it did not. That is our sequencing, not a fault of the
  // student's or of their result, so it is said calmly and without the database
  // error text — which would mean nothing to them and alarm them anyway.
  if (outcome.status === "not-ready" || outcome.status === "unavailable") {
    return (
      <div
        className="flex items-start gap-2 text-xs mb-6 p-3 rounded-lg"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#94a3b8" }}
      >
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
        <span>
          Saving to your account is not switched on quite yet — it is coming shortly. Your result
          below is complete and correct, and it is kept in this browser in the meantime.
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex items-start gap-2 text-xs mb-6 p-3 rounded-lg"
      style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.28)", color: "#fcd34d" }}
    >
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
      <span>
        This sitting could not be saved to your account
        {outcome.status === "failed" ? ` (${outcome.reason})` : ""}. The result below is complete and
        correct — only the saving failed, and it is still in this browser&apos;s own history.
      </span>
    </div>
  );
}

// ── Sub-scores: the part a single number cannot tell you ───────────────────

type Tier = { tier: number; label: string; correct: number; total: number };

/** How a knowledge paper went as the difficulty climbed through the ramp. */
export function TierBreakdown({ tiers, ceiling }: { tiers: Tier[]; ceiling: { label: string } | null }) {
  if (!tiers?.length) return null;
  return (
    <div className="mt-3 mb-2">
      <SectionLabel>as the paper got harder</SectionLabel>
      <div className="flex gap-2 flex-wrap">
        {tiers.map((t) => {
          const pct = Math.round((t.correct / t.total) * 100);
          return (
            <Cell key={t.tier} label={t.label} value={`${t.correct}/${t.total}`} sub={`${pct}%`} colour={heat(pct)} />
          );
        })}
      </div>
      {ceiling && (
        <Note>
          Your ceiling on this paper was <strong className="text-white">{ceiling.label}</strong> — that is
          the level worth practising, not the whole subject.
        </Note>
      )}
    </div>
  );
}

/** How the multitasking run went as the workload climbed. */
export function PhaseBreakdown({
  phases,
  collapsePhase,
}: {
  phases: { key: string; label: string; composite: number | null }[];
  collapsePhase: string | null;
}) {
  if (!phases?.length) return null;
  const scored = phases.map((p) => p.composite).filter((c) => c !== null);
  const allFloor = scored.length > 0 && Math.max(...scored) < 10;
  return (
    <div className="mt-3 mb-2">
      <SectionLabel>as the workload climbed</SectionLabel>
      <div className="flex gap-2 flex-wrap">
        {phases.map((p) => (
          <Cell
            key={p.key}
            label={p.label}
            value={p.composite == null ? "—" : `${Math.round(p.composite)}%`}
            colour={heat(p.composite)}
            outlined={p.key === collapsePhase}
          />
        ))}
      </div>
      <Note>
        {/* Same floor rule as the endurance panel, and found the same way. A
            fifteen-minute run that serviced one stream and abandoned two
            scored 0% in every phase, and this panel congratulated the student
            for holding their standard all the way through. Consistency at zero
            is not an achievement, and praising it teaches the wrong lesson at
            the exact moment the fixation penalty is trying to teach the right
            one. */}
        {allFloor
          ? "Every phase scored at the floor, which happens when one task is serviced and the others are dropped — look at the three stream figures above. The way up is to keep all three ticking at a modest standard, not to be excellent at one."
          : collapsePhase
            ? "You held the standard until the workload rose, then lost ground. That point is your capacity limit — and it moves with practice, which is the whole reason this is worth repeating."
            : "You held your standard all the way through the escalation. That is the result to be chasing here."}
      </Note>
    </div>
  );
}

/** How a five-minute tracking run held up, minute by minute. */
export function EnduranceBreakdown({
  segments,
  endurance,
  fade,
}: {
  segments: { index: number; cancellation: number }[];
  endurance: string | null;
  fade: number | null;
}) {
  if (!segments?.length) return null;

  // A run that never got off the floor must not be congratulated for its
  // steadiness. Verified in a browser: a five-minute run with input that
  // fought the disturbance rather than cancelling it scored 0% in every
  // minute, and the report said "you held the same standard from the first
  // minute to the last" — true, and exactly the wrong thing to tell someone
  // who cancelled nothing. Consistency is only praiseworthy above a floor.
  const best = Math.max(...segments.map((s) => s.cancellation));
  if (best < 10) {
    return (
      <div className="mt-3 mb-2">
        <SectionLabel>minute by minute</SectionLabel>
        <div className="flex gap-2 flex-wrap">
          {segments.map((sg) => (
            <Cell key={sg.index} label={`min ${sg.index + 1}`} value={`${Math.round(sg.cancellation)}%`} colour={RED} narrow />
          ))}
        </div>
        <Note>
          The marker was never brought under control, so there is no shape to read here yet. Start
          by chasing it gently rather than matching it move for move — over-correcting fights the
          drift instead of cancelling it, and scores no better than doing nothing at all.
        </Note>
      </div>
    );
  }

  const note =
    endurance === "faded"
      ? `You were about ${fade} points worse in the last minute than the first. Holding a standard once concentration starts to cost something is most of what this task measures.`
      : endurance === "built"
        ? "You got better as the run went on — still learning the task while being scored on it, which is a good sign in itself."
        : endurance === "held"
          ? "You held the same standard from the first minute to the last. That steadiness is the point of a five-minute run."
          : null;

  return (
    <div className="mt-3 mb-2">
      <SectionLabel>minute by minute</SectionLabel>
      <div className="flex gap-2 flex-wrap">
        {segments.map((sg) => (
          <Cell
            key={sg.index}
            label={`min ${sg.index + 1}`}
            value={`${Math.round(sg.cancellation)}%`}
            colour={heat(sg.cancellation)}
            narrow
          />
        ))}
      </div>
      {note && <Note>{note}</Note>}
    </div>
  );
}

// ── The learning curve ─────────────────────────────────────────────────────

/**
 * Improvement across sittings — which the real batteries treat as a score in
 * its own right, not a footnote. See lib/adapt/learning.mjs for why.
 *
 * Below the readable threshold the student is told how many more sittings it
 * takes, so "not enough yet" reads as a target rather than as a fault.
 */
export function LearningPanel({ scores }: { scores: number[] }) {
  const learning = learningFor(scores);
  const note = learningNote(learning);

  if (!learning.readable) {
    if (learning.sittings === 0) return null;
    return (
      <p className="text-xs mt-2" style={{ color: "#64748b" }}>
        {learning.sittingsNeeded} more sitting{learning.sittingsNeeded === 1 ? "" : "s"} and this shows
        your learning curve — how fast you improve, which the real screening measures too.
      </p>
    );
  }

  const colour = learning.direction === "improving" ? GREEN : learning.direction === "slipping" ? RED : AMBER;
  const gained = learning.gained ?? 0;

  return (
    <div
      className="mt-3 p-3 rounded-lg"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="text-[11px] font-bold tracking-wide" style={{ color: "#94a3b8" }}>
          LEARNING CURVE
        </span>
        <span className="text-xs font-black" style={{ color: colour }}>
          {gained > 0 ? "+" : ""}
          {gained} across {learning.sittings} sittings
        </span>
      </div>
      <p className="text-xs" style={{ color: "#cbd5e1" }}>{note}</p>
    </div>
  );
}

// ── Small shared pieces ────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold mb-2 uppercase" style={{ color: "#94a3b8", letterSpacing: "0.08em" }}>
      {children}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="text-xs mt-2" style={{ color: "#cbd5e1" }}>{children}</p>;
}

function Cell({
  label,
  value,
  sub,
  colour,
  outlined,
  narrow,
}: {
  label: string;
  value: string;
  sub?: string;
  colour: string;
  outlined?: boolean;
  narrow?: boolean;
}) {
  return (
    <div
      className="flex-1 p-2.5 rounded-lg"
      style={{
        minWidth: narrow ? 64 : 108,
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${outlined ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"}`,
      }}
    >
      <div className="text-[10px] font-bold uppercase" style={{ color: "#64748b" }}>{label}</div>
      <div className="text-lg font-black tabular-nums" style={{ color: colour }}>{value}</div>
      {sub && <div className="text-[10px] tabular-nums" style={{ color: "#64748b" }}>{sub}</div>}
    </div>
  );
}

/**
 * The per-module score line: stanine, the sten beside it, and the band's colour.
 *
 * Both scales are shown because they answer different questions. The stanine is
 * what this site scores in and what the cut table on this page is written
 * against; the sten is what the real report leads with. Showing only one would
 * either break our own published scoring or leave the student unfamiliar with
 * the number they will actually be handed.
 */
export function ModuleScoreLine({ stanine }: { stanine: number }) {
  const line = reportLine(stanine);
  return (
    <span className="text-sm font-bold text-right" style={{ color: line.band.hex }}>
      Stanine {line.stanine} · sten {line.sten}
      <span className="block text-[11px] font-normal">{line.band.label}</span>
    </span>
  );
}
