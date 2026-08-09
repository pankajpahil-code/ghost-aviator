# Cadet Screening Simulator — Plan & Review of the "Aviation Aptitude Software Development" report

*Prepared 2026-08-09 by Claude Opus 5 (Examiner tier) for Capt. Pankaj Pahil, after reading
the attached report in full and auditing the existing Ghost Tower simulator it would sit
beside. **STATUS: PLAN FOR THE CAPTAIN'S REVIEW — nothing here is built.** Reading order for
any model picking this up: `D:\pk\CLAUDE.md`, `AI_COPILOT_HANDBOOK.md`, `MODEL_PLAYBOOK.md`,
`VARDAAN.md`, then `GHOST_TOWER_MASTER_PLAN.md` (this feature reuses its machine).*

---

## 1. Verdict on the report in one paragraph

The report is a good *briefing* and a dangerous *specification*. Its description of what the
screening battery measures — numerical reasoning, physics, spatial/pattern reasoning, aviation
knowledge, English, divided-attention multitasking, compensatory tracking, personality — is
sound and matches the public psychology literature. Its legal instinct (clean-room, build the
construct not the copy) is right. But **six of its concrete engineering instructions are wrong
or unsafe for this site**, one of its formulas is mathematically incorrect as written, its
scoring model is statistically invalid in our situation, its legal analysis misses the two risks
that actually apply to an Indian site, and its factual claims about the real test's format come
from coaching blogs and vendor marketing rather than from the airline or the test publisher.
Every one of those is fixable. None is a reason not to build.

---

## 2. Defects found in the report (verified, with the correction)

### 2.1 The RMSE formula is wrong as written — a coder would implement a broken score

The report gives:

```
RMSE = sqrt( (1/N) Σᵢ (xᵢ - x̂ᵢ)² + (yᵢ - ŷᵢ)² )
```

The `y` term sits **outside** both the summation and the `1/N`. Implemented literally you get
"mean squared x-error plus the last y-error", which is not an error metric at all. Correct form
for 2-D radial tracking error:

```
RMSE = sqrt( (1/N) Σᵢ [ (xᵢ - x̂ᵢ)² + (yᵢ - ŷᵢ)² ] )
```

Probably a LaTeX brace slip in the source, but it is the single equation the whole psychomotor
module is scored on, and it is the kind of error that ships silently.

### 2.2 Per-frame RMSE sampling would make the score depend on the student's screen

The report says calculate RMSE "at 60 frames per second" inside the `requestAnimationFrame`
loop. Sampling per frame means a 120 Hz gaming laptop contributes twice as many samples as a
60 Hz budget Android over the same 60 seconds, and the two are weighted differently in the mean.
**Fix: accumulate error on a fixed-rate tick (50 Hz), decoupled from the render loop.** Render
as fast as the device likes; score on a clock. Otherwise students on cheap phones — the exact
students this site is for — get a systematically different score for the same skill.

### 2.3 The Stanine plan is statistically invalid for us, three ways

The report's core scoring proposal is: normalise the student's raw score against "a
continuously updating" Ghost Aviator normative database, convert to z, then
`Stanine = Round(5 + 2z)`. The formula itself is standard and correct. The plan around it is not.

1. **Cold start.** On day one, n = 0. There is no μ and no σ. There is no honest number to
   print on the screen.
2. **Wrong reference population.** Even at n = 10,000, our sample is self-selected students who
   chose to practise on a free site. The airline's cut-off is calibrated against *their*
   applicant pool. A "Stanine 7 on Ghost Aviator" carries no verified relationship to clearing
   a real cadet screening. Printing it implies a prediction we cannot substantiate — that is an
   Iron Rule 1 violation dressed up in mathematics.
3. **Continuous updating makes it worse, not better.** The report itself notes the practice
   effect. Repeat users inflate the running mean, so an identical performance yields a *falling*
   stanine over time for reasons unrelated to the student. If we ever do publish stanines, the
   norm must be a **frozen snapshot per version**, never a live average.

> ### ⚑ CAPTAIN'S RULING, 2026-08-09: **stanines, scored as the real test scores them.**
> Concern above was raised and overruled. It is his call and it is now the spec. **How we
> deliver it honestly — the cold-start problem is physics, not caution, so it gets solved
> rather than argued about:**
>
> A norm in `lib/adapt/stanine.mjs` is one of two shapes, and the module reports which one
> produced any score it prints:
>
> 1. **`criterion` (day one → n < 500).** The raw→stanine cut table is derived from the
>    *demands of the module itself* — e.g. Stanine 5 = the pace needed to attempt every item
>    in the time allowed, Stanine 7 = that pace with ≥85% accuracy, Stanine 9 = full marks
>    inside the clock. This is standards-based scoring, it is auditable because the whole cut
>    table is published on the page, and it invents no population.
> 2. **`observed` (n ≥ 500 per module).** Real μ and σ from Ghost Aviator attempts, as a
>    **frozen, versioned snapshot** — never a rolling average, which would make an identical
>    performance drift downward as the practice effect lifts the mean.
>
> Both paths end at the same published transformation, `Stanine = clamp(round(5 + 2z), 1, 9)`,
> so the student sees the 1–9 report the real screening produces. The page states which basis
> was used. What we never print, in either mode, is a claim that the number predicts a real
> airline outcome — that is the line that stays (§6.5).

**The supporting numbers we show alongside the stanine — these were the original recommendation
and they survive as companions, not replacements:**

| Number | What it says | Why it is defensible |
|---|---|---|
| **Criterion score** | "18 of 20 correct, 4 unattempted, mean 41 s per item" | A fact about what happened. No inference. |
| **Personal trend** | Your score across your own attempts | The metric that actually drives improvement, and it needs no population at all. |
| **Percentile among Ghost Aviator users** (once n is meaningful, ≥ 500 per module) | "Faster than 78% of students who have practised this module here" | True as stated, and *labelled* as what it is — not dressed as an airline benchmark. |

Stanines get revisited only if real normative data ever becomes available. Say so on the page.

### 2.4 The scored personality questionnaire should not be built — build the lesson instead

This is my strongest recommendation in the document. The report proposes a 280-item forced-choice
instrument scoring the student against the Five-Factor model, NOTECHS, and the FAA hazardous
attitudes, with a consistency index to flag "fakers". Four problems, any one of which is
disqualifying for us:

1. **We have no validated instrument and no psychologist.** Weights like "+1.0 Conscientiousness,
   −0.5 Impulsivity" invented by a language model are not psychometrics; they are arithmetic
   wearing a lab coat. Any trait profile we print would be fabricated.
2. **It can genuinely hurt a student.** Telling a nineteen-year-old that their profile shows the
   hazardous attitude "Invulnerability", or that the system thinks they were dishonest, is a
   psychological claim with real weight and no evidence behind it. Boon 1 and Boon 7.
3. **It is where the copyright risk actually concentrates.** Item sets and their scoring keys are
   the protectable *expression* of a commercial test — far more so than the idea of tracking a
   crosshair.
4. **It carries the data-protection exposure** (§2.6). Personality responses tied to a named
   student in our database is the worst-liability data on the site.

> ### ⚑ CAPTAIN'S RULING, 2026-08-09: **the personality module both TEACHES and SCORES.**
> Concern above was raised and overruled. It is his call and it is now the spec. **How we build
> a scored personality module that is still defensible — by anchoring every scored dimension to
> a published, citable instrument instead of to weights a model invented:**
>
> | Scored output | Anchored to | Why it is defensible |
> |---|---|---|
> | **Consistency index** | Nothing external needed | Purely a fact about the student's own responses: linked items answered contradictorily. No psychology is claimed. Fully computable, fully explainable. |
> | **Hazardous-attitude profile** (Anti-authority, Impulsivity, Invulnerability, Macho, Resignation) | The FAA's published hazardous-attitude self-assessment used in aeronautical decision-making training, and already inside the DGCA human-performance syllabus | A real instrument taught in flight training, not something we made up. Citable, and exam-relevant airmanship in its own right. |
> | **NOTECHS behavioural markers** (Cooperation, Leadership, Decision-making, Situational awareness) | The published NOTECHS marker set | A published framework with published markers. We score against the markers, not against invented trait weights. |
> | **Big Five tendencies** | The public five-factor model | Reported as *tendencies with the student's own answers shown back*, so nothing is asserted the student cannot check against what they actually chose. |
>
> **Rules that make the scoring safe without weakening it:**
> - Items are ours, original, and every one declares which published marker it maps to. No
>   commercial test's items, phrasing or keys are used or consulted (§2.5 clean room).
> - The output is a **profile plus coaching**, never a verdict of unsuitability — the same way
>   a hazardous-attitude inventory is used in a training debrief, which is its actual purpose.
> - The teaching module ships *with* the scored one: format, frameworks, why gaming the
>   consistency index fails, and the honest advice to answer as yourself.
> - Responses never leave the student's device (§2.6). This is non-negotiable and is the
>   condition under which a scored personality module is safe to run at all.

### 2.5 The legal analysis is US-centric and misses the nearer risks

- **Abstraction-Filtration-Comparison** (*Computer Associates v. Altai*, US 2nd Circuit) is US
  case law. The report calls it "the global standard" — it is influential, not binding here.
  ghostaviator.com is an Indian site; Indian copyright runs on the Copyright Act, 1957 and its
  own idea/expression reasoning. The *practical* advice — clean room, original items, original
  code, original UI — is correct under any of these regimes and we should follow it absolutely.
  Just do not rely on a US test as the defence.
- **Trademark and passing-off is the nearer risk and the report never mentions it.** The test
  name, the module names and the airline name are marks. A site that calls its product "the
  ADAPT test" invites a complaint that costs them a letter and costs us the page — entirely
  independent of whether every line of our code is original. **Posture: our own product name,
  descriptive copy ("airline cadet screening-style aptitude practice"), and factual reference to
  the real test confined to one honest guide article — never as the product identity.**
- **Practical repo detail:** `CAE` is a blocked token in this site's own source-name guard
  (`tools/scrub-source-names.mjs`, `tools/build-nav-notes.mjs`). Any student-facing string
  containing "CAE Aircrew Selection System" will fail the build. Design around it from day one.

### 2.6 DPDP Act 2023 — the risk the report misses entirely, and the one that matters most

The report proposes logging "massive amounts of user telemetry" — millisecond reaction times,
continuous tracking paths, and personality responses — against user accounts. India's Digital
Personal Data Protection Act, 2023 treats anyone under 18 as a child, requires verifiable
parental consent for their data, and restricts behavioural monitoring directed at children.
A material share of student pilots are 17–18. Behavioural and psychometric telemetry on minors,
stored server-side, is precisely the category that turns an ordinary breach into a serious
incident — and this site holds a student mailing list already.

**Recommended posture (and it costs us nothing, because it is already how this site works):**
raw telemetry — every tracking sample, every reaction time, every response — stays in
localStorage on the student's own device and is never transmitted. Only a small attempt summary
(module, score, duration, date) mirrors to Supabase for signed-in users, exactly like
`lib/exam-history.ts` does today. No personality responses leave the device under any
circumstance. Add a plain-English line on the page saying so. **Confirm the DPDP specifics with
a lawyer before anything that profiles a student ships** — I am flagging a risk, not giving
legal advice.

### 2.7 The proposed backend is the wrong shape for this site

The report specifies a Python/FastAPI service over Postgres. This site is Next.js 16 on Vercel
with Supabase (which *is* Postgres) and Supabase auth. A second runtime means a second deploy
target, a second bill, a second auth surface, and a second thing to keep alive — for a solo
operator, against maybe forty lines of statistics. **The scoring math belongs in a Next route
handler or a Postgres function. Zero new infrastructure.** That is the rule that lets Ghost Tower
cost nothing at any student volume, and it should govern here too.

### 2.8 Two smaller technical corrections

- **`performance.now()` does not prevent background-tab throttling.** It measures accurately;
  it does not schedule. A backgrounded tab has its timers and `requestAnimationFrame` throttled
  regardless. The real handling is `visibilitychange` → pause and invalidate the run (which the
  report mentions separately, under anti-cheat, without connecting the two).
- **`speechSynthesis` is the wrong source for a scored auditory task.** We already learned on
  Ghost Tower that browser speech cannot be routed through Web Audio and needs a watchdog
  because synthesis can silently fail. For a *timed, graded* listening task, voice availability
  and timing vary across Android and iOS — that is a scoring-validity problem, not a polish
  problem. Use pre-generated audio fragments. See §4.3: the VoiceBank already planned for
  Ghost Tower is the same fragment set.
- **WebGL and "locked 60 FPS" are unnecessary.** Canvas 2D at `devicePixelRatio` with delta-time
  physics is plenty for a crosshair and a target box, and it is far safer on a budget Android.

### 2.9 The report's facts about the real test are not verified sources

The module timings the report states as fact — 20 questions in 30 minutes for maths, 50 in 60
for aviation knowledge, ~282 personality items, ~15 minutes of multitasking — trace in its own
works-cited list to coaching-company blogs and the test vendor's marketing pages, not to the
airline or a published test manual. Under this site's evidence standard those cannot be
published as authoritative. Either label them for what they are ("the format candidates
commonly report") or corroborate from candidates the Captain knows personally, which is better
evidence than any of the cited pages. This is the Air Regs lesson again: a plausible number
backed by a coaching blog is not a verified number.

---

## 3. What the report gets right and we should keep

- The construct list. Numerical/physics/spatial/pattern reasoning, aviation knowledge, English,
  divided attention, compensatory tracking — that is a fair map of what these batteries measure,
  and it is the right syllabus for a practice product.
- **Procedural variance to defeat the practice effect.** Generate the numbers and contexts fresh
  every run so the student trains the skill, not the item. This is exactly what Ghost Tower's
  seeded WorldGen already does, and it is the strategic heart of the build (§4.2).
- **Device-aware handling of input hardware.** Its conclusion (separate populations per device)
  is impractical for us because it fragments an already-empty sample — but the underlying
  observation is right and important: a touchscreen and a joystick are not the same test. Our
  answer is to score tracking *within* a device class only, compare a student only to their own
  past runs on the same input, and say so plainly.
- Compensatory vs pursuit tracking as distinct tasks; sum-of-sines disturbance; anomaly
  detection on impossible scores; the four-week preparation structure; a radar-chart feedback
  dashboard with actionable remediation. All good, all cheap, all keep.

---

## 4. The recommendation

**Build it as the same machine as Ghost Tower, with three scope changes from the report:
no scored personality test, no stanines against our own population, no new backend.**

### 4.1 Why "the same machine" is the whole answer to the Captain's question

The radio simulator is not primarily a radio thing. It is a pattern, and it is already proven in
production on this site:

| Ghost Tower has | The screening sim needs | Reuse |
|---|---|---|
| Pure `.mjs` logic modules + `.d.mts` types under `lib/rtr-sim/`, run by `node --test` (`npm run test:rtr-sim`) | Item generators, tracking math, task scheduler, scorer — all pure functions | **Pattern reused wholesale** |
| `makeRng` (mulberry32) seeded PRNG in `world.mjs`; seed shown after the flight so any run is replayable and disputable | Every test run must be replayable for the debrief and auditable if a student disputes a score | **Code reused directly** |
| Zero runtime endpoints, zero inference cost, static + client logic | Same | **Architecture reused** |
| Local-first attempt history (`lib/exam-history.ts`) + soft-failing Supabase mirror | Attempt history, personal trend | **Code reused directly** |
| Free sample public, rest behind free login via Supabase RLS | Same gating story | **Pattern reused** |
| Landing page indexed for SEO, runner `noindex`, canonical set, no crawler-only text | Same | **Pattern reused** |
| Content protection conventions, no download/print/copy | Same | **Pattern reused** |
| Every graded error cross-linked to the Captain's own chapters | Every wrong answer links to the chapter that teaches it | **Pattern reused** |

The genuinely new engineering is four pure modules and one canvas component. Everything around
them already exists and is already debugged.

### 4.2 The strategic unlock: items that are correct by construction

The site's largest open content debt is 1,211 questions carrying placeholder explanations,
because every human-authored answer must be verified against a source before it can teach.

**A procedurally generated maths or physics item does not have that problem.** The generator
rolls a ground speed and a distance, *computes* the answer, and emits the worked solution
alongside it. There is no marked answer to distrust, no source to chase, and infinite
non-repeating items. This is the first content on the site that is verified by construction.

The trade is honest and must be stated: **the risk moves from the item to the generator.** One
bug in one generator is a wrong answer at scale. Therefore every generator ships with unit tests
asserting the closed-form result against an independent computation, and every generator gets an
adversarial Opus review before it goes live — the same two-pass discipline as a question bank,
applied to a hundred lines of code instead of a thousand questions. That is a far better deal
than we get anywhere else on this site.

### 4.3 Where this feature *pays back* Ghost Tower

The multitasking module needs spoken digits, letters, headings and standard phrases, delivered
with exact timing. Ghost Tower's planned VoiceBank (master plan §4d) is a pre-generated fragment
library of *precisely that vocabulary*, already passed through a VHF audio chain. **One
generation run, one one-time cost, two simulators.** If the Captain approves this project, it
also strengthens the case for finally settling the neural-TTS provider decision that has been
open since July — it now serves three things (regional languages, Ghost Tower P3, this).

### 4.4 Module-by-module scope

| # | Module | What it is | Build cost | Notes |
|---|---|---|---|---|
| 1 | **Aviation Knowledge** | 50-question timed paper across the eight core areas | **Days** | Configuration over the 4,269 verified questions and the existing exam-mode machinery. Near-zero risk, immediate value. |
| 2 | **Aviation Maths** | Procedurally generated speed/distance/time, fuel, %, ratio, heading items, no calculator, worked solutions | 1–2 weeks | The unlock in §4.2. Generators are Opus-reviewed. |
| 3 | **Physics & mechanical** | Newton, Bernoulli, pressure, the four forces, simple machines | 1 week | Part generated, part authored from the Captain's own Technical General material — which he wrote, so no source problem. |
| 4 | **Spatial & pattern** | Instrument-orientation, compass/heading, rotated figures, number and figure sequences | 2 weeks | SVG-generated stimuli, seeded. The most fun to build, the most "wow". |
| 5 | **Psychomotor tracking** | Compensatory and pursuit tracking; sum-of-sines disturbance; RMSE on a 50 Hz clock; touch/mouse first-class, Gamepad API optional | 2 weeks | §2.1, §2.2, §2.8 corrections applied. Score compared within input class only. |
| 6 | **Divided attention** | Three concurrent streams — monitor a gauge against a redline, an auditory sequence task, an arithmetic interruption — with fixation penalties | 3 weeks | The hardest module. Needs VoiceBank (§4.3). |
| 7 | **English** | ICAO-aligned comprehension, structure, vocabulary | 1–2 weeks | Original items. Lower priority. |
| 8 | **Personality — teaching module, not a test** | The format, the frameworks, hazardous attitudes as airmanship, how to answer honestly | 1 week | §2.4. The Captain's voice, no score printed. |
| 9 | **Debrief + 4-week programme** | Radar chart of module results, personal trend, targeted "practise this next" links into his chapters, the four-week plan | 1 week | Ties it together; the actual product. |

### 4.5 Phasing (each phase ships something a student can feel)

| Phase | Deliverable | Tier |
|---|---|---|
| **P0** | The Captain's decisions (§5). Name, personality call, scoring language, naming policy. Nothing is built until these land. | Captain |
| **P1** | Aviation Knowledge timed paper + Aviation Maths generators + landing page + debrief v1. **This alone is most of the student value.** | Sonnet builds, Opus reviews generators |
| **P2** | Physics, spatial and pattern modules; radar-chart debrief; four-week programme page | Sonnet |
| **P3** | Psychomotor tracking (canvas, fixed-rate RMSE, touch-first, joystick optional) | Opus specifies the math, Sonnet builds, Opus reviews |
| **P4** | Divided-attention module + VoiceBank fragments (shared with Ghost Tower P3) | Sonnet pipeline; Captain picks voices by ear |
| **P5** | English module, personality teaching module, gating, dashboard card, completion cards | Mixed |

Realistically this is a quarter of work at the pace this site actually moves, not a fortnight.
**P1 alone is roughly two weeks and delivers the large majority of what a student preparing for
a cadet screening actually needs to drill.** If time is short, ship P1 and stop — that is the
cheaper alternative, and it is a good product on its own.

### 4.6 What this displaces — the manager's duty to say it

Currently open on this site: 1,211 placeholder explanations (Air Regs 742, RTF 418, Nav 51); the
DA42 master manual's never-performed audit and its unresolved copyright question; Ghost Tower
P1–P5, of which P1 is the credibility jump; and the site's real ceiling, which is **one external
backlink**. This project cannot be added on top of all of that without something slipping.

Its counter-argument is strong, though, and it is worth stating: cadet-screening preparation is
a subject *nobody* serves free in India, it is searched by exactly the students this site
targets, and unlike more chapters it is the kind of thing schools and forums link to. Given the
backlink ceiling, a genuinely first-of-its-kind free tool is worth more than the next hundred
chapters. **That is the Captain's call to make, not mine.**

---

## 4b. BUILD STATUS (2026-08-09)

| Piece | File | State |
|---|---|---|
| Seeded randomness | `lib/adapt/rng.mjs` | ✅ Built. Kept in lockstep with Ghost Tower's PRNG by test. |
| Scoring core (stanine) | `lib/adapt/stanine.mjs` | ✅ Built. Criterion + frozen-observed norms, composite, anomaly detection. |
| Shared MCQ assembly | `lib/adapt/items/mcq.mjs` | ✅ Built. Named-error distractors, plausibility rule, throws rather than ship a 3-option item. |
| Paper assembly | `lib/adapt/items/paper.mjs` | ✅ Built. Round-robin family coverage, duplicate-stem rejection, prefix stability. |
| Aviation Maths bank | `lib/adapt/items/maths.mjs` | ✅ Built. 10 families. |
| Physics bank | `lib/adapt/items/physics.mjs` | ✅ Built. 8 families. |
| Session engine | `lib/adapt/session.mjs` | ✅ Built. Module registry, assembly, per-module + composite scoring. |
| Runner UI | `app/adapt-test/AdaptRunner.tsx` | ✅ Built. Timed, wall-clock deadline, question palette, full debrief. |
| Landing page | `app/adapt-test/page.tsx` | ✅ Built. Canonical set, FAQ schema, honest-notes section. |
| Spatial / pattern module | — | ⬜ Next. |
| Psychomotor tracking | — | ⬜ Not started (fixed-rate RMSE per §2.1/§2.2). |
| Divided attention | — | ⬜ Not started (needs VoiceBank). |
| English | — | ⬜ Not started. |
| Personality (teach + score) | — | ⬜ Not started (§2.4 ruling box governs). |
| Navbar / sitemap wiring | — | ⬜ Not done — must be derived from data, not hardcoded (Iron Rule 5). |
| Attempt history | — | ⬜ Not done. Reuse `lib/exam-history.ts` local-first pattern; summary only, never raw responses (§2.6). |

**112 tests, all green. Repo lint clean.** `npm run test:adapt`.

**Defects the tests caught during the build** — recorded because each one is a
class of mistake that will recur in the modules still to come: degenerate
crosswind distractors at 90°/80°/45°; a paper repeating a question; a fuel
distractor going negative and being silently filtered to nothing; a
rate-of-descent roll left with a single teaching distractor; and every padded
distractor collapsing onto the answer when the answer is a small integer, which
shipped a three-option question. None of these were visible by reading the code.

## 5. Decisions — TAKEN by Capt. Pahil, 2026-08-09

| # | Decision | Status |
|---|---|---|
| 1 | **Called ADAPT.** | ✅ Ruled. One implementation detail awaiting his confirmation — see §5.1. |
| 2 | **Personality module both teaches AND scores.** | ✅ Ruled. Implemented per §2.4 ruling box — every scored dimension anchored to a published instrument. |
| 3 | **Stanine scoring, as the real screening scores it.** | ✅ Ruled. Implemented per §2.3 ruling box — criterion cut-table first, frozen observed norms at n ≥ 500. |
| 4 | **No airline named anywhere. "Airline screening" as the descriptor.** | ✅ Ruled. Guard added to the build (§6.2). |
| 5 | **Ships on the website. Treated as a priority project.** | ✅ Ruled. |
| 6 | Neural TTS provider (needed for the divided-attention module, P4) | ⏳ Still open — same decision as regional languages and Ghost Tower P3. |

### 5.1 The one open detail on the name

`ADAPT` is the *test vendor's* product name — a different thing from the airline name the
Captain has already correctly ruled out. Using it as **our brand identity** ("Ghost Aviator
ADAPT") asserts we are that product. Using it **descriptively** ("free practice for the ADAPT
airline screening test") states a true fact about what we prepare students for, which is the
standard and defensible posture every legitimate test-prep publisher uses.

Descriptive use is also *better* for the Captain's actual goal: the phrase students search is
"ADAPT test practice", and descriptive use puts that exact phrase in the `<h1>`, the title tag
and the URL — where brand use would put it in a logo. **Recommendation, pending his one-line
confirmation:**

- Page title / H1: **"ADAPT Test Practice — Free Airline Screening Aptitude Simulator"**
- URL: `/adapt-test`
- Standing footer line on every ADAPT page: *"Independent practice material. Not affiliated
  with, endorsed by, or connected to the publisher of the ADAPT assessment or any airline."*
- Internal/product family name stays ours (`lib/adapt/`, Ghost Aviator branding on the shell).

This delivers 100% of what he asked for — students find it by that name, it is that test's
battery, it scores in stanines — with the one sentence that keeps it his.

---

## 6. Non-negotiables carried into this feature

1. Every generated item's answer is computed and unit-tested, or it does not ship. No marked
   answers, no guessed keys.
2. No source or author names in any student-facing string; the existing guards run over
   generated text too — including the `CAE` token (§2.5).
3. No download, print or copy affordances anywhere in the runner.
4. Raw behavioural telemetry never leaves the student's device (§2.6).
5. No claim, anywhere, that a score on this site predicts the outcome of a real airline
   assessment.
6. Mobile-first. A budget Android is the reference device, not a gaming laptop.
7. Landing page indexed with real text; runner `noindex`; canonical set; nothing served only to
   a crawler.
8. Zero runtime inference cost at any student volume.

---

*Captain — mark this up like a check pilot. The three cuts I am recommending against the
report (no scored personality test, no stanines, no separate backend) are the ones I would
defend hardest; everything else in it is negotiable. The single fastest thing of real value in
here is P1, and most of it is already built and sitting in your question bank.*
