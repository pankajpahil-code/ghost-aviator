# Handover to Codex — Met notes audit, figures and India climatology (2–3 Oct 2026)

From: Claude (Sonnet 5.5 session, Captain Pankaj Pahil's workspace). To: Codex.
Read first: `D:\pk\AGENTS.md`, `D:\pk\CLAUDE.md` (Iron Rules 1–5), `D:\pk\VARDAAN.md`. This file only covers this job.

## 0. The one thing to know

**Everything in this handover was built by me, so under the Contract (clause 4) I cannot certify it.** Please treat your role as the
**independent auditor** of items 3.1–3.4. Do not extend my work before you have audited it. The Captain asked for an audit-and-fix
because students complained of wrong answers; a second unaudited layer on top of the first is how that happened.

## 1. What the job was

Captain: "improve the Met notes with diagrams from the Oxford book, crop diagrams perfectly, check the questions in the notes — some
have wrong answers and explanations — correct them and upload to the website, for the whole Met syllabus." Later: add diagrams from two
more PDFs, no Europe images, and an Indian-climatology diagram set.

## 2. Where things are

| What | Where |
|---|---|
| Live notes (master) | `D:\pk\ghost-aviator\public\content\meteorology\met-N\notes.html` (N = 1..29), images in `met-N\img\fig-<sha1>.png|jpg` |
| Standalone D: copies | `D:\04 Meteorology\Notes\IC Joshi met  notes claude\DGCA Notes\ChNN_*.html` + `img\` (kept identical to the site; 562/562 question blocks verified equal) |
| Pre-change D: backup | `...\IC Joshi met  notes claude\_DGCA_Notes_BEFORE_2026-10-02\` |
| Quiz bank (site) | `lib/generated/met-verified.ts`, built by `node tools/met-verify/build-met-verified.mjs` from `tools/met-verify/*.mjs` + `wf-verified.json` |
| My tools | `tools/met-notes-audit/` (see §6) |
| Figure working area | `D:\pk\met-figures\` (`out\`, `working\`, `generated\`, `tools\`) |
| Reports | `tools/met-notes-audit/MET_NOTES_AUDIT_2026-10-02.md` and `MET_NOTES_CHANGES_2026-10-02.tsv` (also copied to the D: notes folder) |
| Diagram prompts | `ANTIGRAVITY_DIAGRAM_PROMPTS.md`, `ANTIGRAVITY_REGENERATE.md`, `ANTIGRAVITY_INDIA_CLIMATE_PROMPTS.md` |

Commits (all on `main`, pushed): `d1fe6a6` answers + first 122 figures + bank · `1a17d00` removed a Ch.1 figure · `1a94ec8` +67 Jeppesen figures ·
`52e38dc` +11 generated diagrams · `d8f98e6` regeneration prompts · `0294dc5` India prompt pack · `e6f7358` removed 20 Europe/non-India figures.
**Live deployment of `52e38dc`, `d8f98e6`, `0294dc5`, `e6f7358` was NOT verified.** Only `d1fe6a6`/`1a94ec8` pages were checked live
(Ch.25 METAR box present, Ch.3 figures load). Check Vercel and a few URLs first.

## 3. What was done, and how sure I am

### 3.1 Question audit — 574 Q&A blocks across 27 chapters (28 and 29 included; 27 and 29 have none)
- Root cause: answer keys copied from the scanned IC Joshi 7th ed. printed key pages (no text layer) with errors; 63 blocks carried drafting text ("Wait —", "per answer key"); ~100 METAR/TAF/ROFOR/station-model questions referred to messages never printed.
- Result: 574 → 562 blocks; 121 rebuilt, 12 removed; the missing METAR, TAF, ROFOR and station-model plot were put back (transcribed by reading the book pages); quiz-bank corrections (snow albedo 80 %, clear-day 5/6, friction 30°/15°, front/jet/WD/SIGWX items).
- Evidence order I used: CAE/Oxford text (searched by phrase, page-aware) → arithmetic → the chapter's own text → IC Joshi printed key read **from page images**.
- **Confidence:** moderate. 47 questions where the printed key disagrees with my final answer are listed in the report's FLAGGED section.
- **My two mistakes, caught and reverted:** (a) set Ch.21 AMO notice to 3 hr (chapter table says 6 hr); (b) rewrote garbled questions with options I invented — now removed or restored to the printed options. Rewording that remains is listed under "Reworded" in the report.

### 3.2 Not verified (do not assume these are right)
- The 364 questions where notes and the existing bank already agreed — they agree with each other; the bank itself had ≥ 12 errors.
- Ch.12, 16, 17, 23, 27, 29 were not re-derived line by line.
- India-specific facts (Norwesters, IMD office counts, WD tracks, STJ dates, geostationary count — chapter says 5, bank says 3) rest on the chapter text and the printed key, with no independent source on disk.
- Chapter 15 body text says vertical shear is greater **above** the jet core; CAE p.114 (and the question now) say **below**. The body sentence is unfixed.
- Chapter 11 Q1 still has options (a) and (b) with identical meaning.

### 3.3 Figures — 179 on the site now
- Sources: CAE ATPL 9 Meteorology (`D:\04 Meteorology\Books\CAE ATPL 9. Meteorology.pdf`; the Downloads "Oxford Meteorology.pdf" is the same book), Jeppesen JAA ATPL Meteorology (`Meteorology.pdf`), and 11 generated diagrams.
- Cropped from the vector/raster page boxes, not screenshots; page furniture and caption lines excluded; photographs → JPEG, line art → palette PNG, long side ≤ 1300 px. ~12 MB.
- Placement is **by section heading, not by paragraph**; a few are a loose fit.
- Captions and alt text are mine and were written from looking at each crop. **Unaudited.** The Captain already caught one bad figure (Ch.1 tropopause fan) that I had placed without checking it taught anything — so check *relevance*, not just crop quality.
- Removed on 3 Oct at the Captain's request ("I don't want Europe images"): 20 UK/Europe/US/Caribbean charts and maps (list in `remove_figures.py`). Ch.27 now has no figure; Ch.14 no occlusion diagram; Ch.18 no easterly-wave map.
- 20 generated images reviewed at full size: 11 placed, 3 held as duplicates of textbook figures (sea/land breeze, anabatic/katabatic, foehn), 6 rejected with defects recorded (greenhouse, cold front, warm front, CAT/jet, tropical cyclone, station model). Five have corrected prompts in `ANTIGRAVITY_REGENERATE.md`; none regenerated yet.

### 3.4 India climatology (Ch.19)
Only a **prompt pack** exists (18 diagrams, facts taken from the published Ch.19 text). **No India images exist yet.** Captain generates them in
Antigravity and saves to `D:\pk\met-figures\generated\india\`. When they arrive: open each at full size, check every label/arrow/number against the prompt
**and the outline of India against the Survey of India map**, then place under Ch.19. The prompts deliberately omit two numbers where the chapter
contradicts itself (Tamil Nadu NE-monsoon share 49 % vs ~60 %; heat-wave threshold beyond "≥ 4 °C above normal").

## 4. Rules that apply (each is from a defect that already shipped)

1. **Iron Rule 2:** no source/author names in student-facing text — captions, alt text, filenames, explanations. Scan: `npx tsx tools/audit/iron-rule-2-scan.mts` (visible-notes count must stay 0).
2. **Iron Rule 3:** the notes' copy protection must stay (`tools/protect-notes.mjs`). I did not re-run it; the figure blocks sit in files that already carried the protection snippet (verified `contextmenu`/`user-select` present). Re-run only if you rebuild notes.
3. **Figures must be real files, never base64** (a 10 MB base64 chapter once 502'd the site). `/content/*/*/img/` is crawlable on purpose — do not re-broaden the `X-Robots-Tag`/robots rules.
4. **Never write raw generated images into `public/`.** Twenty raw files, six of them rejected, were saved into the site's `img` folders and would have been published by a commit. They were deleted; originals are in `D:\pk\met-figures\generated\`. Check `git status` for strays before every commit.
5. **Do not rewrite a garbled printed question with options you invent.** Remove it or flag it.
6. **A fix you cannot source is FLAGGED, not applied.** Status words: VERIFIED / CORRECTED / FLAGGED / DROPPED / BLOCKED only.
7. `tools/met-verify/build-met-verified.mjs` regenerates `lib/generated/met-verified.ts`; edit `wf-verified.json` or the `chN-*.mjs` sources, never the generated file. `wf-verified.json` round-trips with `json.dumps(ensure_ascii=False, indent=1)`.
8. Encoding: after any bulk edit run a bytes-level check for `c3 a2 e2 82 ac` (mojibake) and `ef bf bd` (U+FFFD). Console output is not evidence.
9. Other agents share this repo. **Stage explicit paths only** (never `git add -A` at root). At handover time these are modified and not mine: `SECURITY.md`, `app/components/content/QuestionsPage.tsx`, `VideoPage.tsx`, `lib/subjects.ts`, `package.json`, `tools/shorts/*`, plus untracked `.codex-tmp/`, `TOPIC_OPENERS_FOR_REVIEW.tsv` and others.
10. `npm run build` takes many minutes; run it in the background. A second concurrent build fails with "a previous build didn't exit cleanly" — that is a lock, not a code error (it cost me one false failure). `rm -rf .next` first.
11. `lib/gini/generated/topics.ts` indexes the notes' headings; I re-ran `npx tsx tools/gini/build-topics.mts` once after the answer edits (no change). Re-run it after any heading change.

## 5. Suggested order for you

1. **Verify the deploy** of `e6f7358` (Vercel; open Ch.2, 6, 14, 20, 24 and one removed-figure page; no 404 images).
2. **Audit §3.1** independently: take the 47 FLAGGED questions and the 121 rebuilt blocks (`MET_NOTES_CHANGES_2026-10-02.tsv`, kinds `ANSWER CHANGED` and `EXPLANATION CLEANED`) and re-check each against the CAE text. A fast route: `D:\pk\met-figures\ox2.txt` (Downloads Oxford, full text), `jep.txt` (Jeppesen) and the scratchpad's `cae.txt`/`ox.txt`; page-aware search helper `find.py` is in the session scratchpad — rebuild with `pdftotext` per book and split on form feed.
3. **Audit §3.3 relevance:** open 5 chapters rendered (headless Chrome works: `chrome.exe --headless --screenshot --window-size=1000,9000 file:///...`), look for figures under the wrong heading or that teach nothing.
4. **Fix the Ch.15 body sentence** (vertical shear above vs below) — but only after you have your own source.
5. Only then: place India images when the Captain supplies them; regenerate the five rejected diagrams.

## 6. Tool inventory (`tools/met-notes-audit/`)

| File | Use |
|---|---|
| `extract.py <out.json>` | parse every `qa-block` into JSON (needs `beautifulsoup4`) |
| `crossmatch.py <scratch>` | match blocks to the verified bank and CAE pool (slow, run in background) |
| `apply_fixes.py <fixes.json> [--write] [--base=...] [--expect=...] [--figure=...]` | splice rebuilt/dropped blocks by index; aborts if the block is not the one the fix was written for |
| `fixes_build.py <notes_qa.json>` | the corrections themselves (indices refer to the pre-change numbering — do not re-run blindly on current files) |
| `insert_figures.py <final.json> --site|--d <dir> [--write]` | place planned figures under headings; idempotent by hashed file name |
| `figure_plan.py`, `jep_plan.py` | the figure → heading → caption → alt-text plan (CAE keys `"2.1"`, Jeppesen keys `J<index>`, generated `G_*`) |
| `remove_figures.py` | remove named figures from site + D: and delete unreferenced image files |

Figure crop tools in `D:\pk\met-figures\tools\`: `scan_figures.py`, `catalogue.py`, `crop_cae.py`, `crop_jep.py`, `trim_blocks.py`, `qa_sheets.py`. They need `PyMuPDF`, `Pillow`, `numpy`.
**Pitfall:** `trim_blocks.py` trims to the dominant ink block and can delete a legitimate second panel; I used per-figure box adjustments in `crop_jep.py` instead. Never trust an automatic trim without looking.

## 7. Open items for the Captain (his rulings, not yours)

- The 47 FLAGGED printed-key disagreements.
- Which Antigravity images to regenerate; whether to keep the three held duplicates.
- Whether the six rejected generated PNGs in `...\DGCA Notes\img\` should be deleted (not published; they sit there).
- Whether the textbook-chart figures that remain (station plots, upper-air symbol tables) should stay; he objected to Europe-specific content only.

— Claude, 3 Oct 2026. Nothing here is claimed as done unless it names where it was checked.
