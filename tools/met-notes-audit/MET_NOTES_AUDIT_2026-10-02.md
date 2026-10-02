# Met notes — question audit and figures, 2 Oct 2026

**Status: CORRECTED and published by a Sonnet-class pass. NOT independently audited.** Every explanation I rewrote, every figure
caption and every alt text was written by me, so under the Contract I cannot certify them. They need a second pass (Opus-class or
you). Nothing below is called "verified" unless a source page is named.

## What was wrong (root cause)

The 29 published Met chapters carried 574 practice Q&A blocks. They were built from the printed answer-key pages of the IC Joshi
question sets, and those keys were copied in with errors. Four defects, all visible to students:

1. **Keys that contradict their own explanation.** The explanation said one thing, the green "Answer" box said another
   (for example Ch.13 lightning: the explanation said "+10 to −10 °C … but answer key says (a)"; Ch.5 mixing ratio marked "increases"
   under an explanation saying "remains constant").
2. **Drafting text left in the published answer:** "Wait —", "per answer key", "follow textbook", "Actually…", "Checking…".
   63 blocks. Students read these as the site admitting the answer is wrong.
3. **Questions that cannot be answered.** About 100 METAR / TAF / ROFOR / station-model questions refer to a coded message or a plotted
   station that was never printed in the notes (Ch.24, 25, 26). A student could not know the answer was right or wrong.
4. **Garbled options** from the scan (Ch.15, 20, 21, 26), including options missing or merged.

## What I did

| | |
|---|---|
| Q&A blocks before / after | 574 → 562 |
| Blocks rebuilt (answer and/or explanation) | 121 (≈ 108 answer changes, 13 explanation-only) |
| Blocks removed (garbled, duplicate or unanswerable as printed) | 12 |
| Drafting artefacts remaining in any answer | **0** (re-scanned) |
| Messages / figure restored so the questions can be answered | METAR, TAF, ROFOR, one station-model plot (transcribed from the book pages) |
| Textbook figures cropped and placed in the notes | 122 (9.4 MB total, JPEG for photographs, palette PNG for line art) |
| Wrong answers also fixed in the quiz bank (`met-verified`) | 12 (snow albedo, clear-day radiation, friction angles, front/jet/WD/SIGWX items; two earlier edits of mine reverted — see below) |

Full before/after list: `MET_NOTES_CHANGES_2026-10-02.tsv` (mechanical diff, so it also lists option-wording restorations).

## How each answer was decided (evidence, not recall)

Authority order: (1) the CAE/Oxford Meteorology text, searched by phrase; (2) physics or arithmetic done in full; (3) the chapter's own
published text; (4) the IC Joshi printed key, read from the **page image** because that book is a scan with no text layer.

- **Disagreement between the printed key and the evidence: 47 questions.** I kept the evidence-supported answer in each. They are
  listed below as FLAGGED because the printed key is what many students memorise. I may also have misread a key letter in the scan;
  where it matters the physics is cited next to the question.
- **Message decoding (Ch.25, 26):** I read the actual METAR, TAF and ROFOR from the book pages, decoded every group myself, and the
  printed key agreed with my decoding on 42 of 43 ROFOR/TAF answers on first comparison (the exception, TAF Q13, is listed).
- **Evidence block examples**
  - Ch.1 Q6 "above 8 km colder over": CAE p.11 — tropopause −75/−80 °C at the equator, −40/−50 °C at the poles → **Equator**, not Poles.
  - Ch.5 Q9 mixing ratio: CAE p.84 text "In unsaturated air, HMR remains constant during ascent" → **constant**, not "increases".
  - Ch.7 Q18 frontal fog: CAE p.285 and the 'frontal fog' section — forms at a **warm** front or occlusion (question reworded, see below).
  - Ch.13 Q33 lightning: CAE p.247 — most likely within 5000 ft of freezing level, **+10 to −10 °C**.
  - Ch.14 Q18/19: CAE p.320 — ahead of a warm front the wind **backs** slightly, temperature is **steady**.
  - Ch.15 Q16: CAE p.114 — greatest shear **just below** the jet core, secondary above.
  - Ch.2 Q16: 160 m ÷ 8 m per hPa = 20 hPa → QFE **985 hPa**.
  - Ch.6 Q31: upper 230/05, lower 050/10 → thermal wind **230/15**; Ch.6 Q45 → **240/40**.
  - Ch.3 Q28: −40 °C = −40 °F, shown by arithmetic. Ch.3 Q35: 68 °F = 20 °C = 293 K.

## Two mistakes of mine, caught before they stayed live

1. I first changed Ch.21 "non-scheduled notice to AMOs" to 3 hr, copying the older bank. The chapter's own table says **6 hr**; restored.
2. I first rewrote several garbled questions (Ch.1 Q45, Ch.15 Q4/Q9/Q10, Ch.3 Q19, Ch.6 Q25/Q41) with options I invented. That is not
   verification. They are **removed** instead, and Ch.15 Q21/22/25, Ch.11 Q7, Ch.19 Q4 were restored to their printed options.
   Rewording that remains is listed under "Reworded" and needs your eye.

## FLAGGED — your ruling (printed key ≠ evidence, or weak evidence)

Kept as published now; tell me to change any.

Ch.1 Q30 homosphere (mixing, book says (b) gravitation) · Q36 · Q44 (latent vs "both") · Ch.2 Q12 · Ch.3 Q27 (77 % latent vs sensible —
my answer is latent, key says sensible; no book line found) · Q29 (1.25 m vs 1.5 m) · Ch.4 Q9 · Ch.6 Q35 (squall vs gust) ·
Ch.7 Q7, Q10, Q17 · Ch.8 Q12 (5/8 vs 8/8), Q13, Q14 (hail under anvil: key False, notes True) · Ch.9 Q6, Q16, Q19 · Ch.10 Q15 ·
Ch.11 Q1 (two identical options (a)/(b)), Q7 (printed options are garbled; Orographic kept), Q14 · Ch.14 Q18, Q19 · Ch.15 Q6, Q7, Q12,
Q17, Q18, Q21, Q23, Q25 · Ch.19 Q4 (key "No WD" contradicts its own stem) · Ch.20 Q3, Q7, Q9, Q10, Q11, Q13 · Ch.21 Q1, Q40 ·
Ch.22 Q11 (3 vs 5 geostationary satellites; chapter text says 5, left alone) · Ch.24 Q12 · Ch.25 Q18, Q21, Q37 · Ch.26 TAF Q13.
**Chapter 15 body text** says vertical shear is "greater above the core than below it"; CAE p.114 and the key say below. The question now
follows CAE; the sentence in the chapter should be corrected by you.
**Reworded because the printed question had no correct option (my wording, flagged):** Ch.7 Q18, Q19 · Ch.13 Q30 · Ch.14 Q12 · Ch.18 Q2 ·
Ch.19 Q7 · Ch.21 Q3, Q10 · Ch.2 Q19 · Ch.3 — (see TSV). Option unit typo corrected: ROFOR Q9 printed "18,000 m", now "18,000 ft".

## What I could NOT verify

- The 364 questions where the notes already agreed with the existing quiz bank: they agree with each other, but the bank itself held at
  least a dozen errors, so agreement is not proof. I spot-checked against the book only where they disagreed with the printed key.
- Chapters 12, 16, 17, 23, 27, 29 have few or no question disagreements and were not re-derived line by line.
- India-specific facts (Norwesters, IMD office counts, WD tracks, STJ dates) rest on the chapter text and the printed key, not on an
  independent source on disk. I did not search the web for IMD material.
- Every figure was opened and looked at, but I cannot certify my alt text or captions (clause 4).

## Figures

122 placed under the matching heading, crops from the vector/raster source (not page screenshots), page furniture and the caption line
kept out, photographs as JPEG, line art as palette PNG, all under `/content/meteorology/met-N/img/` (crawlable; not blocked).
Source names are in no caption, alt text or filename. Two charts whose header names an agency were left out. One station-model plot was
cropped from the question page itself and cleaned to black-and-white.
**Still missing a figure: 20 topics.** Ready-to-paste prompts: `ANTIGRAVITY_DIAGRAM_PROMPTS.md` (colourful, realistic, no baked-in text,
each with the exact labels and numbers). Inspect every generated image at full size before it is used.

## Copies

Site notes (master) and the D: copies are both updated and match question-for-question (562/562). The old D: notes are kept untouched in
`_DGCA_Notes_BEFORE_2026-10-02`. Note: the D: copy of Ch.6 was missing the 27 Sep drift correction until today.

## Tools (in `tools/met-notes-audit/`)
`extract.py` (parse every Q&A block), `crossmatch.py` (match to the bank/CAE pool), `apply_fixes.py` (splice rebuilt blocks, asserts the
block identity), `fixes_build.py` (the corrections), `insert_figures.py`, `figure_plan.py`.
