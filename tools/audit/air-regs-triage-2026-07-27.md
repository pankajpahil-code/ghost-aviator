# Air Regulations question bank — triage audit

**Date:** 2026-07-27 · **Auditor:** Claude Opus 5 (Examiner profile, playbook Part 2)
**Bank:** `lib/rk-bali-regulations-questions.ts` — 946 questions, live on the site
**Sample:** 50 questions, seeded random (`mulberry32`, seed `20260727`) — redraw with
`tools/audit/sample-regs.mjs` to check this work against the identical sample.

Purpose: measure the defect rate **before** committing to a full 946-question campaign,
so the decision is made on a number rather than a feeling.

---

## Verdict in one line

**The answer keys are in better shape than feared; the question *text* is not.**
One clearly wrong answer in 50 (2%) — but 1 in 8 questions shows a student something
visibly broken, and **not one of the 946 questions has a real explanation.**

---

## Sample results (n = 50)

| Class | Count | Rate |
|---|---|---|
| **CORRECT** — answer verified against ICAO/standard doctrine | 38 | 76% |
| **WRONG** — marked answer is not defensible | 1 | 2% |
| **MALFORMED** — question unusable as printed | 4 | 8% |
| **SUSPECT** — needs an Indian CAR/AIP source I could not reach | 7 | 14% |

**Hard defect rate (wrong + malformed): 5/50 = 10%.**
Add the unverifiable 14% and 24% of the bank needs *some* human attention.

### The one wrong answer

**#407 (ar-9)** — *"A passenger transport aircraft with 250 seats departs with a passenger
load of 136. The number of flight attendants required is:"* — marked **6**.

- Seat-based rule (1 per 50 **seats**): 250 ÷ 50 = **5** (option A)
- Passenger-based rule (1 per 50 **passengers carried**): 136 ÷ 50 → **3** (option B)

**6 follows from neither reading.** Captain: rule on whether India counts seats or
passengers carried, and I will correct it with the citation. Both candidate answers are
already among the options, which is why this is a wrong *key*, not a broken question.

### The four malformed questions

All four are **parser damage**, not authoring errors — one sentence got split across the
stem and the options when the bank was extracted.

- **#579 (ar-4)** — the stem breaks mid-sentence and its tail became option A
  (`"to be 800m. It is:"`), **and that fragment is the marked answer**. Unanswerable.
- **#78 (ar-6)** — the Class D definition is split across options B and C; the marked
  option B ends mid-sentence (`"...VFR flights receive traffic"`).
- **#842 (ar-9)** — option D is the literal string `"(no option d)"`.
- **#720 (ar-4)** — ETOPS option text truncated to `"for Twin Engine Operations"`.
  The *answer* is right; the *text* is broken.

### The seven suspect answers

Not necessarily wrong — each needs an Indian source I could not reach today
(the DGCA portal serves its rule text through JavaScript):

| # | Chapter | Question | Why flagged |
|---|---|---|---|
| 123 | ar-6 | Flying an unrated aircraft for endorsement | Indian rating provision |
| 251 | ar-2 | % of co-pilot time counted as PIC for renewal | Indian CAR figure |
| 297 | ar-9 | Prohibited area around Malabar Hill | "1 NM" vs "1 Mile" — units decide it; the stem also gives the unit away |
| 484 | ar-9 | Photography at an aerodrome — whose permission | DGCA vs Central Govt (Aircraft Rules r.13) both defensible |
| 536 | ar-9 | Carriage of remains — death by plague | Aircraft (Public Health) Rules |
| 681 | ar-8 | Prosecution after a forced landing kills someone | "Cannot be prosecuted" is legally absolute — doubtful as stated |
| 928 | ar-4 | 1000 ft terrain clearance within 20 NM | Cannot source the 20 NM figure |

---

## Whole-bank structural scan (all 946 — exhaustive, no judgement required)

| Defect | Count | Rate |
|---|---|---|
| **Explanation is a placeholder** (`"Correct answer: B"`) | **946** | **100%** |
| Placeholder option text (`"(no option d)"`) | 71 | 7.5% |
| Question-number prefix leaked into the stem (`"Q45."`) | 92 | 9.7% |
| ~~Suspiciously short stem (<25 chars — truncation)~~ | ~~54~~ | **false alarm — see below** |
| Option ends mid-sentence (parser-split signature) | 21 | 2.2% |
| Stem text bled into an option (ends `:` / `It is:`) | 5 | 0.5% |
| Duplicate question stems | 86 | 9.1% |
| Uses all/none-of-the-above | 34 | 3.6% |

### Correction to this report (added during the step-1 repair)

**The "54 suspiciously short stems" finding was wrong.** I used "stem under 25
characters" as a proxy for truncation. On inspection they are overwhelmingly just
*terse questions* — "UTC means", "TMA means", "Threshold lights are",
"Rashtrapati Bhawan is a". Nothing to repair.

The real signal is a broken **option**, not a short stem. A first attempt at
detecting those flagged 411 questions (43% of the bank) — also wrong, because it
fired on ordinary English: it called "AIP" too short and treated any stem ending in
"is" as truncated. Tightening the rules to signatures taken only from *confirmed*
broken questions brought it to 28 candidates, of which manual reading found
**12 genuinely broken and 16 false positives**. Those 12 were dropped.

Lesson worth keeping: a structural heuristic must be calibrated against questions
you have actually read. Both of my first two heuristics would have caused edits to
questions that were completely fine.

**The headline: 100% of explanations teach nothing.** A student who gets a question wrong
is told only *"Correct answer: B"* — no reasoning, no rule, no reference. That is the
single largest lost teaching opportunity on the site, and it is invisible to every build,
lint and test.

---

## Recommendation — and it is not what I expected

I went in expecting to recommend a full answer-verification campaign like the Met one.
**The data says do the cheap mechanical repair first.** In priority order:

1. **Structural repair (mechanical, no judgement, highest visible impact).**
   Fix the 71 `"(no option d)"` placeholders, 92 leaked `"Q45."` prefixes, 54 truncated
   stems, and the ~26 parser-split questions. These are the defects a student *sees*.
   Re-extract from source where the original text still exists; drop what cannot be
   repaired. Roughly 1 in 8 questions improves, with no answer-key risk.

2. **Dedupe the 86 repeated stems** — cheap, and repeats make a bank feel padded.

3. **Explanations.** 946 real explanations is a large body of teaching writing in the
   Captain's voice. Worth doing chapter by chapter, and worth doing *because* it is the
   difference between a question bank and a teacher. This is the biggest single win
   available on the site, and the slowest.

4. **Answer verification, targeted rather than exhaustive.** At a measured 2% wrong-key
   rate, sweeping all 946 is poor value. Better: verify the ~14% suspect class — the
   Indian-specific figures (CAR fatigue limits, licensing percentages, public-health
   rules, prohibited areas) — which is where the uncertainty actually concentrates.
   ICAO-doctrine questions (right of way, signals, VMC minima, separation) sampled clean
   at 100% and do not need the same scrutiny.

**What the Captain must supply for step 4:** an authoritative Indian source. The DGCA
portal is JavaScript-rendered and yields nothing to a fetch. A downloaded CAR set
(Section 7 Series, Aircraft Rules 1937, AIP India ENR) on disk would unblock the whole
suspect class.

---

## Reproducing this audit

```
node tools/audit/sample-regs.mjs      # same seed → identical 50 questions
node tools/audit/structural-scan.mjs  # whole-bank defect counts
```

Nothing in this audit changed a single question. No answer key was edited.
