# Guide drafts — awaiting Capt. Pahil's approval

These are **drafts**, deliberately kept OUT of `public/content/guides/` and NOT
registered in `lib/guides.ts`, so nothing here can reach the site by accident.

Open each `.html` in a browser to read it as a student would.

## Why they are drafts

Two reasons, both from the Iron Rules in `D:\pk\CLAUDE.md`:

1. **Rule 1 — never publish a guessed answer.** Each guide contains a small
   number of regulatory figures (flight-hour minimums, licence validity,
   attempt limits, fees) that could not be verified from an authoritative
   source in this session: the DGCA portal renders its rule text through
   JavaScript, so it yields nothing to a fetch, and the third-party regulation
   PDFs on this machine are reference material, not citable authority. Every
   such figure is wrapped in a yellow **VERIFY** box naming exactly what must
   be confirmed. **Publishing with a VERIFY box still open would break Rule 1.**
2. **Rule 4 — the Captain's voice is the product.** These are written in that
   voice as faithfully as I can hear it, but only he can sign off that it
   sounds like him teaching.

## What IS verified, and where it came from

| Claim | Source on this site |
|---|---|
| CPL exam papers: subjects, question counts, durations, 70% pass mark | `lib/exam-papers.ts` — his own instructor figures, cross-checked 2026-07-12/13 |
| The Navigation paper pools Air Nav + Radio Nav + Instruments | `lib/exam-papers.ts` |
| RTR(A) Part 2 pass mark 50% | `lib/rtr-sim` + the published RTR(A) book, CAR Sec 7 Series G Part VI |
| Computer-number process, 10+2 with Physics & Maths, board verification | his published `/guides/computer-number` |
| Cost assumptions (hourly rate, ground school, medicals, exam fee, living, 10% buffer) | the defaults in `app/components/Calculator.tsx` |

## To publish one, once approved

1. Resolve or delete every VERIFY box.
2. Copy the content between the `<!-- FRAGMENT START/END -->` markers into
   `public/content/guides/<slug>.html` (the guide route injects a fragment; it
   supplies its own page chrome).
3. Add the entry to `GUIDES` in `lib/guides.ts` (slug, title, description,
   author, date).
4. `npm run build`, then check the live URL with `curl` after the deploy.
