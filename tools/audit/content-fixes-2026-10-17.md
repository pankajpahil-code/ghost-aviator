# Content fixes — flagged conflicts & hygiene — 2026-10-17

**Branch:** `ak-fix-issues-2026-10-17` (linear on `26c6627`, the nav-pass tip; nothing pushed).
**Trigger:** Capt. Pahil's instruction to fix the issues flagged by the answer-key program
(inst-40 / ar-3 / ar-16 / ar-19 conflicts, the ar-15 guard blind spot, and the carried
structural hygiene items).
**Discipline:** every fix was resolved from site sources first (question datasets, source-key
grids, the corrections registry, and the banks' own ICAO-cited explanations). No answer was
flipped by guesswork; where the source key itself is disputed (rnav-15 Q3, rnav-19 Q3) the keyed
answer is preserved and the ruling request stands. Edits were applied by one committed,
byte-exact, re-run-safe script with an assertions pass and a quarantine archive:

- `tools/audit/apply-content-fixes-2026-10-17.mjs` (dry-run by default, `--apply` writes)
- `tools/audit/answer-key-archive/content-fixes-2026-10-17.json` (every before/after + rationale)

## The fixes (15 edits in 10 content files)

| # | File | Fix | Evidence |
|---|------|-----|----------|
| 1 | `instrumentation/inst-40` L478 | Engine Instruments source key, Q10: grid `c` → `b` | Page inline answer (b) L441 + dataset `lib/generated/oxford-instrumentation.ts` (EPR during take-off run) `ans: 1` |
| 2 | `instrumentation/inst-40` L648 | Specimen paper source key, Q11: grid `c` → `b` | Inline answer (b) L632 + dataset (TCAS "Climb or descend") `ans: 1` |
| 3 | `air-regulations/ar-3` Q3 | Highlight moved C → **A** ("Taxiing need not be confined to the taxiways") | ICAO Annex 2 App 1 4.2.3.2 (barred dumb-bell = land/take-off on runways only, other manoeuvres need not be confined) + source key grid 3-A + `rk-bali` L10359 family ("black bar perpendicular to the shaft") |
| 4 | `air-regulations/ar-3` Q6 | Highlight moved A → **C** ("Not land because the airport is not available for landing") | ICAO light-signal table (series of red flashes = aerodrome unsafe, do not land) + grid 6-C + all four `rk-bali` printings key the aerodrome-unsafe option over the "notwithstanding any previous instructions" (red-pyrotechnic) wording |
| 5 | `air-regulations/ar-16` L1778 | Tip mini-key `Q7 / Q16 (C)` → `Q7 (B) / Q16 (C)` | Grid Q7 = B; corrections registry (`lib/answer-corrections.ts`) rules the FDP extension = 2 hrs; Q16 = C (FT +1 hr / FDP +2 hrs) unchanged |
| 6 | `air-regulations/ar-19` Q1 | Highlight moved B → **A**; "per textbook answer key" tag moved with it | Source key grid Q1 = A + the explanation text itself ("Textbook Answer: A") — the B highlight was the outlier |
| 7 | `air-regulations/ar-18` L1797 | Heading reworded: "32. Exam-Prep Quick Cards — Answer Key Highlights" → "32. Exam-Prep Quick Cards" | Recon: orphan heading, no grid in the file; "Answer Key" misleading |
| 8 | `radio-navigation/rnav-15` Q3 | Note rewritten (both derivations stated clearly) | Keyed (b) preserved; the old line printed "Answer: (b)" above a computation yielding 100.3 NM (option a). Key-flip ruling still open |
| 9 | `radio-navigation/rnav-19` Q3 | Note rewritten (both derivations stated clearly) | Keyed (c) preserved; the old line printed "Ans: (c)" above a computation yielding 141 NM (option d). Key-flip ruling still open |
| 10 | `radio-navigation/rnav-3` L705 | Surplus `</div>` removed before the watermark block | Tag stack: 117 opens / 118 closes, the last close closes nothing; browser already ignored it → DOM unchanged, counts now 117/117 |
| 11 | `air-navigation/nav-cx3-9` L505 | CSS comment `per <tr>` → `per table row` | The carried "`<tr>` 45/44 imbalance" was a false positive — a literal `<tr>` inside a CSS comment; counts now 44/44, zero render impact |
| 12 | `air-regulations/ar-25` EOF | Final CRLF appended | File previously ended without a newline |

## Guard extension (structural detection)

`tools/audit/answer-key-guard.mjs` now also flags bare answer grids **by structure** — a table
whose header row is 3+ Q-numbered (or sequential 1..N) cells followed by a same-count row of
single letters A–D — with a 15-line dedup window so already-counted grids are not double-counted.
A `--list` flag prints every pending hit with file:line.

- Found exactly **one** previously invisible grid: `ar-15` L986–991 (`Q1..Q5` = `C,B,B,C,B`) —
  the guard blind spot from the air-regulations recon, now visible and reportable.
- ar-23's second table was initially double-counted (heading 11 lines above); the 15-line window
  resolved it — ar-23's known grids stay counted exactly once.
- STRICT scope (meteorology, radio-navigation, air-navigation): **clean**; `--check` exits 0.
- Pending after this pass: air-regulations 99/18 files, instrumentation 67/26, human-performance 1/1.

## Verification evidence

- Apply: 15/15 edits OK, post-checks clean, archive written (re-run safe — dry-run shows all SKIP).
- Guard: report + `--check` exit 0; structural list shows ar-15 only.
- Tag balances: rnav-3 `div` 117/117; nav-cx3-9 `tr` 44/44; ar-25 ends with newline.
- `git diff --stat`: exactly 10 content files + guard; plus the new tool + archive.
- Visual proof (screenshots) was unavailable at fix time — DOM/byte evidence above stands in.

## Still open for the Captain (deliberately not changed)

1. **rnav-15 Q3 / rnav-19 Q3 key-flip rulings** — whether to flip the displayed answer to the
   delay-corrected / computed option. Pages now state both derivations and keep the source key.
2. **Dataset-side explanation cleanup** for those two questions (`lib/generated/oxford-radio-nav.ts`
   ~L1405 / ~L2085) — recommend via the corrections registry on his instruction (generated files
   are overwritten by rebuilds).
3. **ar pass scope** (ar-15 grid removal + the mapped rewords) and **inst-40 scope** (full
   question-set import; orphan "Master Answer Keys" heading / TOC / key-CSS cleanup).
4. Carried items: met-13 Q23/Q34(c), nav-16 958-question payload anomaly, cross-chapter factual
   consistency (icing range, CB cell life, False Cirrus).
5. **Push go** for the nav branch + this fix branch (linear chain `f39a61a → 318f09d → 23d17fd →
   26c6627 → this branch`).

## Independent audits

Pending — team rule: the builder never audits their own work. Audit A (repo/scope/byte-exactness)
and Audit B (content fidelity) run after the commits; their reports are committed alongside.
