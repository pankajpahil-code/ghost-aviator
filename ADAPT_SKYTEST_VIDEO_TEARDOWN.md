# Teardown: "Jet Airways Cadet Program | CAE | ADAPT Screening"

*Frame-by-frame and audio analysis of the video supplied 2026-08-16, plus what it
changes for `/adapt-test`. Prepared for Capt. Pankaj Pahil.*

Companion to `ADAPT_COMPETITIVE_AUDIT.md` (2026-08-10). Read that first for what
the real ADAPT test is; this document is about a **competitor's preparation
product**, which is a different thing and is the first correction below.

---

## 0. The correction that governs everything else

**This video contains no footage of the ADAPT test.** Every screen in it is
**SkyTest® Preparation Software for Pan-Asian Pilot Screenings** — a German
third-party prep product — and its own window title says so on screen for the
whole run.

So this is not a teardown of the exam. It is a teardown of **a direct competitor
to what we are building**, made by someone selling access to it. That is still
valuable — arguably more valuable, because we can see a mature competitor's
entire module catalogue, its scoring report and its norm display — but every
sentence below has to be read as "this is how SkyTest models the test", never
"this is the test".

Three further things about provenance, none of which make the video useless but
all of which set how much weight it can carry:

| | |
|---|---|
| **It is an advertisement.** | On-screen text reads *"Discount Link below"* / *"10 euros off"*. The creator is an affiliate. Claims about what the screening contains are marketing-adjacent, not neutral. |
| **It is old.** | An audio file visible in an early frame is named `20180820 0005 Recording.mp3` — suggesting a 2018 recording. Weak evidence on its own, but it fits the software's appearance. |
| **The airline is gone.** | Jet Airways was ordered into liquidation by the Supreme Court on 7 Nov 2024; NCLT Mumbai commenced liquidation 26 Nov 2024 and creditor-classification disputes were still being heard in February 2026. **There is no Jet Airways cadet programme to prepare for.** The relevance is the *format*, not the employer. |

**What IS first-party and does hold** — Symbiotics state on their own CAE
candidate page: *"Throughout the pilot assessment process CAE use ADAPT pilot
aptitude tests which are provided by Symbiotics."* Our previous audit had the
CAE↔ADAPT link on third-party sourcing only. It is now first-party. The video's
title is honest about that much.

---

## 1. What the video actually shows

Runtime 7:39, 1080p24, with audio. Structure:

| From | To | Content |
|---|---|---|
| 0:00 | 0:12 | Title card; SkyTest main window; Multi-Flight Simulator difficulty screen. On-screen advice: *"Practice this in the difficult setting"* |
| 0:20 | 6:45 | One complete **Multi-Flight Simulator** run — a 6:00 countdown |
| 6:45 | 7:00 | Post-run **debriefing quiz**, 5 questions |
| 7:00 | 7:05 | The **results breakdown** screen |
| 7:05 | 7:39 | Tour of the other module categories, with the creator's study advice |

The whole video is one module out of sixty.

### 1.1 The publisher's own description of the module

Quoted from the software's Quick Guide panel:

> **Getting Started** — "Multi-Flight Simulator is a highly complex hand-eye-coordination, divided attention and **long-term memory** test."
>
> **Task** — "The test comprises **three live subtasks** to address during an autopilot flight simulation and **questions about environmental, ATC and flight aspects after the run**."
>
> **Operation** — "**Address all tasks with the same priority** during the flight simulation."

Two of those three sentences matter to us directly and are picked up in §4.

### 1.2 The screen layout

An outside-world view (sky, horizon, ground) fills the top; three instrument
panels sit across the bottom; a countdown clock and Pause/Exit sit top right; a
single feedback line prints under everything.

**Outside view.** Landmarks drift past on the ground — a control tower, a bank
(`$`), a heliport, a train station, a tunnel, a parking area, a cab company, a
glider airfield — plus moving traffic: other aircraft, a glider, a red balloon.
The horizon tilts during the run; the aircraft has to be flown.

**Left panel — traffic / flight path.** The student's aircraft symbol plus white
bars representing other traffic. The aircraft symbol turns **red** when a
conflict develops. This is what the report scores as *"Flight path — preventing
collisions"*.

**Centre panel — reporting.** Two buttons, green **Aircraft** and red
**Waypoint**. When a landmark or another aircraft appears outside, the student
presses the matching button. Feedback prints below: *"Waypoint reported
correctly"*, *"Balloon reported correctly"*, *"Glider reported correctly"*.

**Right panel — questions.** Cognitive multiple-choice items appear here at
intervals throughout the run and are also **read aloud**. Feedback prints
*"Correct answer"* / *"Wrong answer"*.

**Audio, continuously, underneath all of it** — a synthetic ATC voice. From the
transcript:

```
[00:23]  ... the airport
[00:25]  Heading 075 degrees
[00:30]  Altitude 5,100 feet
[00:35]  Speed 320 knots
[00:50]  At the waypoint turn left to the bank
[00:54]  Heading 060 degrees
[00:59]  Altitude 6,200 feet
[01:03]  Speed 350 knots
[01:31]  At the waypoint turn right to the glider airfield
[01:40]  Heading 095 degrees
[01:45]  Altitude 6,800 feet
[01:51]  340 knots
```

The student is never asked to act on these numbers during the run. **They are
asked to recall them afterwards.** That is the "long-term memory" claim, and it
is the mechanic we do not have at all.

### 1.3 The fourteen in-run question families

Every one observed, with wording exactly as printed:

| # | Prompt | Format |
|---|---|---|
| 1 | *Select the mirror image* | Figure vs. `?`, 2 choices |
| 2 | *Which compass is pointing NORTH?* / *…SOUTH?* | Four compass roses with aircraft symbols |
| 3 | *Which colour did not appear in the grid?* | Six-tile colour grid, then colour-word options (`CYAN` `YELLOW` `ORANGE` `VIOLET`, each printed in its own colour) |
| 4 | *Which letter did not appear in the grid?* | Letter grid `J C Q / T F R` |
| 5 | *Select the option that completes the sequence* | Dot/dice patterns; shape series |
| 6 | *Select the correct anagram of* **STREAM** | `BMEORS` `BNEARS` `TMEORC` `TMEARS` — only `TMEARS` uses the same six letters |
| 7 | *Solve the equation* `53 + 56 = ?` | `106` `107` `108` `109` — near-miss distractors |
| 8 | *Find the next number in the sequence* `88 86 84 82 80 78 ?` | `75` `76` `77` `78` |
| 9 | *Select the missing piece from the pattern* | `A is to B as C is to ?` — rotated arrows in circles |
| 10 | *Which word is the odd one out?* | `FACTORY` `BRAND` `LOGO` `TRADE MARK` |
| 11 | *Select the correct spelling* | `CREIDE` `CRIDE` `CRIED` `CREID` |
| 12 | Matrix reasoning | 4×4 grid of coloured shapes with `?` cells |
| 13 | *Where will the aircraft meet?* | Four radar displays with converging tracks |
| 14 | Position recall | Grid of shapes shown, then reproduced |

Note the spread: numeracy, verbal, spelling, spatial, orientation, short-term
visual memory, matrix reasoning and a relative-motion problem — **all of it
delivered while flying**. Our equivalent stream fires arithmetic only.

### 1.4 The post-run debriefing quiz

Five questions on a clean white screen after the clock reaches 00:00:

1. *Which one was an altitude the aircraft travelled with?* — `1200 ft` `3400 ft` `5100 ft` `6500 ft` → **answered wrong; software printed "Wrong answer. Correct is 5100 ft"**
2. *What did ATC refer to as the third waypoint?* — `cab company` `glider airfield` `parking area` `heliport`
3. *Where was the glider located?* — `in front of the tunnel` / `the glider airfield` / `the train station` / `the parking area`
4. *Which one was a speed the aircraft travelled with?* — `270 kn` `350 kn` `380 kn` `420 kn`
5. *How many beeps did you hear?* — `2` `3` `4` `5` → **"Wrong answer. Correct is 2"**

**Independently verified against the audio, which is why I trust this section:**
the software's stated correct altitude (5,100 ft) is exactly what the ATC voice
said at 00:30, and the third waypoint instruction at 01:31 was "turn right to the
glider airfield". The debrief is scored against the radio stream the student was
half-listening to twenty minutes of workload earlier. That is the whole idea.

### 1.5 The results screen — transcribed exactly

```
Results                                    [ Results | Performance Graphs ]

Flight path
  Preventing collisions:                          98.5 %

Monitoring
  Correct answers:                                20.0 %

Reporting
  Waypoints:
    - Correct responses:                          66.7 %
    - Missed responses:                           33.3 %
  Aircraft:
    - Correct responses:                         100.0 %
    - Missed responses:                            0.0 %

Questions
  Correct responses:                              72.2 %
    - Response time:                       2.7 s / 100.0 %
  Missed responses:                               72.2 %

General
  Difficulty:                                     54.2 %

Total result:                                     40.7 %
```

Five observations, and the first is the useful one:

1. **"Monitoring — 20.0 %" is the debriefing quiz.** One correct out of five is
   exactly 20.0 %. The label is misleading (there is no gauge in this test) but
   the arithmetic is unambiguous, and it means **recall of the radio stream is a
   first-class scored section, not a flourish.**
2. **Correct and missed are reported separately** for every stream. A missed
   item and a wrong item are different failures. We collapse both into accuracy.
3. **Response time is its own reported line** (`2.7 s / 100.0 %`) — a raw
   latency and a score derived from it.
4. **A "Difficulty" factor feeds the total.** `40.7 %` is not the mean of the
   parts; the chosen difficulty scales the result. That is how they let a student
   practise on Easy without the score claiming Difficult-grade performance.
5. **`Questions: correct 72.2 % / missed 72.2 %` is almost certainly a display
   bug** in their software — two different measures cannot both be 72.2 %.
   Recorded as observed; do not copy the shape of it.

Their reference data, shown under the module list: average result across users
**44.0 %**, average single run duration **12:08**. The demo account's own figure
was **32.0 %**. The run in the video was a 6:00 flight phase.

### 1.6 Difficulty and the adaptive assistant

The module opens on a difficulty screen: *"This test module features three levels
of increasing difficulty"* — **Easy / Medium / Difficult** — plus a *Custom
Settings* tab and:

> *"The test can also be launched by Training Assistant, which will adjust a
> difficulty setting according to your current personal performance."*

The creator's advice over the top: *"Practice this in the difficult setting."*

---

## 2. SkyTest as a competitor

Verified on the publisher's own product page, not from the video:

- **Product:** SkyTest® Preparation Software for Pan-Asian Pilot Screenings
- **Price:** **EUR 99.95**, one-time, no subscription (≈ ₹10,000)
- **Scale:** **60 aptitude training modules**
- **Targets named:** Air Asia, **Air India**, **IndiGo**, Thai Airways, Cathay
  Pacific, Malaysian Airlines, Qatar Airways
- **Still maintained** — a bug fix to this very Multi-Flight Simulator module is
  logged for October 2025
- Sold as desktop software and an iPad app

**The catalogue**, which is the part worth studying:

| Category | Count | Modules |
|---|---|---|
| **Attention** | 12 | Aircraft Counting · Bourdon Test · Dials Perception · Friend or Foe · Grid Scanning · Matching Letters · Matrix Test · Monitoring Ability · Reaction Rate · Shape Recognition · Stroop Test · The E with Dots |
| **Memory** | 6 | Dot and Grid · Dot Matching · **Flight Data Memory** · **Letters Read Back** · Locations on Map · Matching Shapes |
| **Orientation** | 9 | Cube Comparison · Cube Folding · Cube Rotation · Grid Orientation · **Gyro and RBI** · Jumbled Pipes · Mirrored Shapes · **Sense of Heading** · Stack Test |
| **Psycho-motorics** | 6 | Ball Game · Ball in the Bowl · **Multi-Flight Simulator** · Runway Multitasking · **Sonic Multitasking** · Tube Flight |
| **Reasoning** | 10 | Analogies · Computer Checking · Deductive Logical Thinking · Diagrammatic Series · Inductive Thinking · Jigsaw Questions · Logic Gates · Matrices · Shape Comparison · Spot the Difference |
| **Knowledge** | 12 | Maths (5) · Physics (6) · Technical Comprehension (6) |

The creator's on-screen guidance ties the catalogue to the exam:

- Over the Attention / Memory / Orientation / Reasoning lists: *"Also practice
  these test as they will be asked in the right box while the test"* — i.e. the
  in-run question panel draws from all four categories.
- Over the Knowledge lists: *"Practice these for the written test (Online MCQ)
  \* **No calculator**. Along with speed and distance problems."*

**Where they beat us:** sixty modules to our seven, per-module practice history
with a reference band, a selectable difficulty, and an adaptive training
assistant. **Where we beat them:** free versus €99.95, browser versus a
Windows/macOS install, generated-fresh items versus a fixed bank, a published
scoring rule, and no invented norms. Neither product is the real test.

---

## 3. What this changes in `ADAPT_COMPETITIVE_AUDIT.md`

Three amendments, all verified this session:

1. **CAE↔Symbiotics is now first-party**, quoted in §0 above. Previously logged
   as third-party only.
2. **CAE candidates get a 20 % discount** on the practice bundles, via
   Symbiotics' CAE page. Cadet Essentials at **£49.60** instead of £68. Worth
   telling students about — **it is not a task for this workspace.** See §6.
3. **The two pages disagree on list price.** The general practice page still
   shows Knowledge £48 / Dexterity £47 / Essentials £68 / Insight £245, matching
   the 2026-08-10 audit. The CAE page shows "usually" £42 / £42 / £62 / £215.
   Flagged, not resolved. Also noted: the practice Ball Game is the
   **joystick-only version**, which most Indian students will not own.

---

## 4. Task summary — what to build, ranked

Grounded against the code as it stands today (`lib/adapt/session.mjs` registry:
seven modules; `divided-attention.mjs`: four streams — tracking, monitor, radio,
arithmetic).

### Tier 1 — BUILT 2026-08-16, local only, not pushed

All three are done, tested and lint-clean. **409 tests pass, typecheck clean,
production build clean.** What is NOT done is a human watching them run: the
debrief screen only appears at the end of a fifteen-minute run, and the Browser
pane cannot drive this module's canvas. Treat the visual path as unwitnessed
until someone flies it.

Two defects the work found, neither visible in review:

- **`quickHeading` stored `25` as its answer while printing `025`.** Caught by a
  test asserting `options[answerIndex] === String(answer)` across all five
  families — the invariant, not the output. The rendered heading is now the
  answer.
- **A `Math.random()` in a `useRef` initialiser** in `DividedAttentionTask.tsx`.
  It ran on every render AND broke the same-seed-same-run guarantee the module
  is built on. Now derived from the run seed. (Lint had been clean as of
  2026-07-26, so this crept in since — worth knowing that it can.)

**T1. A post-run recall quiz for the divided-attention module. — DONE.**
The publisher calls its module a *"hand-eye-coordination, divided attention and
**long-term memory** test"* and scores recall as a first-class section worth a
fifth of the report. **We score zero of it.** Our radio stream already speaks
callsigns and instructions during the run; the run schedule already holds every
event. The work is to (a) give the radio calls carryable content — heading,
altitude, speed, a named waypoint — and (b) ask five multiple-choice questions
about them after the clock stops, scored as their own sub-score.
*Built:* your own radio calls now carry a clearance — heading, altitude, speed
or waypoint — shown on a strip that expires and is never re-shown. Five
questions afterwards, in `RecallDebrief.tsx`. **Deliberate deviation, recorded
in the code so nobody "fixes" it:** the clearance is shown, not spoken. Speech
would put the datum on the one channel whose timing we do not control, and this
stream is scored on *when* you responded. **Recall is reported beside the
composite and never inside it** — folding it in would change what that number
measures while leaving its published cut ladder alone, and would make every
result already stored for a real student incomparable with every later one.

**T2. Widen the in-run question stream beyond arithmetic. — DONE.**
*Built:* five families now cycle through the one slot — mental arithmetic,
**heading** (reciprocals and turns through north), **number series**, **odd one
out** and **spelling**. Cycled rather than rolled, so a run cannot deal nine
sums and measure the thing this change exists to stop measuring.

The existing six-second rule was kept, not waived: the Aviation Maths
generators were still NOT reused, because those are thirty-second problems and
importing them would turn an attention test back into an arithmetic test. Every
new family is answerable inside a shrinking window by a prepared student.

The two authored-data families are the risk, so they are tested at the
invariant rather than the output: a word can never be both "same" and "odd", and
no misspelling may be another entry's correct spelling. Heading and series
answers are re-derived **by parsing the rendered stem** — the exact characters a
student reads — which is what caught the `025` defect above.

**T3. Score response time and report it. — DONE.**
*Built:* median latency for radio and interruptions, on the result page and in
the stored breakdown. Two deliberate differences from theirs:

1. **Only correct responses are timed.** How fast you got something wrong is not
   a speed measurement, and answering instantly and badly must never out-score
   thinking and being right.
2. **The percentage beside it is the share of the window actually available**,
   not a rank against a population we have not measured. "You used 45% of the
   time you had" is meaningful on its own and stays meaningful as the windows
   tighten phase by phase.

Median, not mean — one call answered late while the aeroplane diverged should
not drag a whole run. Accuracy and the composite are untouched, and a test
asserts a fast run and a slow run score identically.

### Tier 2 — BUILT 2026-08-16

**T4. Split "missed" from "wrong" in every report. — DONE.**
*Built:* `wrong` and `missed` are now named counts on the radio stream, the
interruption stream, the debrief and every knowledge paper — no longer left for
a reader to subtract. A student who MISSES is saturated and needs to shed load;
one who is WRONG had the capacity and got it wrong. Those need opposite advice
and a single accuracy figure gives neither.

**T5. A scan-and-report stream. — DONE.**
*Built:* traffic and landmarks now appear in the outside view and must be called
on one of two buttons before they pass. Two buttons rather than one, because a
lookout with one button is a reaction test — telling traffic from a landmark is
the discrimination.

Three failure modes are counted separately and must stay that way: **missed**
(never called), **misidentified** (called the wrong type) and **false** (called
with nothing there). A test proves that pressing both buttons on every target
scores 0.5, not 1.0 — otherwise spamming would beat looking.

**Scored as its own section, not folded into the composite**, which is what the
real report does too: its sections are listed separately and never averaged.
That also keeps the promise made when recall was added.

**A defect I built and then removed:** the first version lit a halo round the
report buttons whenever a target was in view. My own code comment rationalised
it as "the halo is on the container, not on the answer" — but knowing something
is out there is most of visual search, so it handed the student the harder half.
The target now lives in a ref that nothing outside the canvas can read.

**T6. Selectable difficulty. — DONE, and it reverses my own recommendation.**
Gentle / Standard / Hard, chosen before the seed is rolled.

**The line above said to "scale the reported result". That was wrong and is not
what shipped.** A scalar would be an invented number — precisely what this
module refuses to do with norms — and no measurement supports any particular
multiplier. What shipped instead: **the criterion ladder is identical at every
setting.** It says "answer 85% inside the clock for stanine 7". On Gentle the
clock is longer, so more students clear it and a stanine 7 there genuinely means
less — which is *true*, and is therefore stated rather than corrected for. Every
score carries its setting, the result page stamps it, and
`learningByDifficulty()` refuses to draw one trend across two settings.

What difficulty actually moves: the **clock** on timed papers, and **event
density plus response window** in the multitasking run. Item counts never move —
a twenty-question paper with five removed is a different test, not an easier one.

**A defect caught by writing the test first:** the first version scaled the
multitasking *duration* too, which made Hard an 11-minute run and Gentle a
22-minute one — i.e. Hard became the least demanding setting on offer. Duration-
defined tasks now run the same length at every setting. Tracking is left
unscaled entirely and says so: it is scored against a baseline computed from its
own disturbance, so amplifying it moves the baseline by the same amount.

### Tier 3 — one still needs you

**T7. A reference band on the results chart.** Their chart plots your runs
against a shaded population band. Our refusal to invent norms is right and
should not change — but a *measured* band becomes possible once attempts
accumulate. **Check first: `adapt_attempts` may never have been created (see
`tools/adapt/repair-adapt-attempts.sql`), in which case anonymous telemetry has
been failing silently since 2026-08-10 and there is no data behind this at all.**
Verify that before anything else in this tier.

**T8. Per-module run count and cumulative practice time.** Cheap, and it is what
makes a practice product feel like training rather than a quiz.

### Housekeeping

**T9. Apply the three amendments in §3 to `ADAPT_COMPETITIVE_AUDIT.md`.**

**T10. Copy nothing.** SkyTest is a live commercial product. Item wording,
artwork and the specific look of that cockpit are theirs. We take the *design
ideas* — recall-after-the-run, correct-vs-missed, response time, difficulty
scaling — which are not ownable, and we write our own items, as we already do
everywhere else. The descriptive-use posture we take toward the ADAPT trademark
applies here with more force, because this is a competitor rather than the
examiner.

---

## 5. One thing the video confirms we already got right

Their operating instruction is *"Address all tasks with the same priority during
the flight simulation."*

Our divided-attention composite subtracts a penalty proportional to the spread
between stream accuracies, precisely so that three streams at 70 % beats one at
100 % and two at 40 %. That was a design judgement made without knowing what the
competition did. **It is the same instruction, enforced in the scoring rather
than merely printed in a briefing** — which is the stronger form. Keep it.

---

## 6. Buying anything is not a task on this list

Two research documents in this repo now recommend purchasing the official
practice bundle as "the highest-value open item". **Strike that.** Capt. Pahil
has no card and no money; the subscription that runs this workspace is a gift
from his wife. A recommendation he cannot act on is not a recommendation, it is
a wall, and repeating it in every audit turns a build backlog into a bill.

**The standing rule for this project, and for `ADAPT_COMPETITIVE_AUDIT.md` §0
which must be read with this correction applied: never rank a purchase as an
open item.** If a fact can only be had by paying, write it down as *unknown and
unbuyable*, say what we will assume instead, and move on to what can be built
for free. Everything in §4 can be built for free. That is the list.

The one legitimate route, and it costs nothing: **a student who has actually sat
the screening.** He teaches hundreds of them. One debrief from one candidate is
worth more than the practice bundle, because it describes the real battery
rather than the shop window. That is an *ask*, not a purchase, and it is the only
external item that belongs in this file.

---

*Method: 92 frames sampled at 5-second intervals plus targeted full-resolution
extractions (ffmpeg); audio transcribed locally with faster-whisper. Product and
company facts verified against the publishers' own pages, cited inline. Nothing
in §1 is inferred from the narration alone — every claim is visible on screen,
and the debrief answers were cross-checked against the transcript independently.*
