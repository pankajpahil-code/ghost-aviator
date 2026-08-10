// ADAPT — the pure half of attempt telemetry: building the rows that leave the
// device. Separated from the network call in telemetry.ts precisely so that
// what gets sent is inspectable and testable, rather than assembled inside a
// fetch where nobody ever looks at it again.
//
// The binding rule: a row carries a module, a stanine, one headline percentage
// and (for tracking) the input device. It never carries a question, an answer,
// a sample, or anything at all from the attitudes questionnaire beyond the bare
// fact that it was completed.

/**
 * Build the rows for one finished session.
 * `results` is the mixed list the runner produces.
 */
export function buildRows(seed, results, device) {
  if (!Number.isInteger(seed)) throw new RangeError("telemetry needs the session seed");
  if (typeof device !== "string" || !device) throw new RangeError("telemetry needs a device id");

  return (results ?? [])
    .filter((r) => r && typeof r.moduleId === "string")
    .map((r) => {
      const row = {
        device_id: device,
        session_seed: seed,
        module_id: r.moduleId,
        module_kind: r.kind ?? "unknown",
        stanine: Number.isInteger(r.stanine) ? r.stanine : null,
        headline_pct: null,
        input_class: null,
        completed: true,
      };

      if (r.kind === "knowledge" && Number.isFinite(r.total) && r.total > 0) {
        row.headline_pct = Math.round((r.correct / r.total) * 100);
      } else if (r.kind === "psychomotor") {
        row.headline_pct = r.cancellation == null ? null : Math.round(r.cancellation);
        row.input_class = r.inputClass ?? null;
      } else if (r.kind === "divided-attention") {
        row.headline_pct = Number.isFinite(r.composite) ? Math.round(r.composite) : null;
      } else if (r.kind === "behavioural") {
        // Completion only. There is deliberately no branch here that could put
        // an attitude, a tally or a profile into the row.
        row.completed = Boolean(r.profile?.complete);
      }

      return row;
    });
}

/** Every key a row is allowed to have. Anything else is a leak. */
export const ALLOWED_KEYS = [
  "device_id", "session_seed", "module_id", "module_kind",
  "stanine", "headline_pct", "input_class", "completed",
];
