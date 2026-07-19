# GHOST TOWER 2.0 — Master Implementation Plan
### A professional pilot's R/T practice simulator: full VFR + IFR + emergencies

*Prepared 2026-07-19 by Claude Fable 5 for Capt. Pankaj Pahil, after web research into the
world's leading radio simulators and a review of every source on disk. STATUS: **PLAN FOR THE
CAPTAIN'S REVIEW — nothing here is built until he approves.** Supersedes the v1 scope in
`RTR_SIMULATOR_DESIGN.md` (whose engine, decisions and iron-rule guardrails all carry forward).*

---

## 1. Honest verdict on v1

What shipped is a working proof of engine + flow: deterministic scoring, examiner probes,
PTT + chips, one scripted VFR scenario. What it is NOT: a professional simulator. Specific gaps
against the world standard:

| Gap | Why it matters |
|---|---|
| One fixed scenario, fixed values | A student memorizes it in 2 runs; zero replay value |
| Composer chips carry the answer | Tapping visible phrases ≠ producing phraseology from memory |
| No IFR track, no emergencies | The exam and real flying are mostly these |
| Robotic single ATC voice | Immersion collapses on desktop; no party-line realism |
| No flight picture | Student can't SEE where the aircraft is in the flight |
| No curriculum or analytics | One-shot practice, no path from first call to exam-ready |

## 2. What the research found (and what we take from each)

**PlaneEnglish ARSim** — the market-leading pilot radio trainer (iOS/Android/web; used by
flight schools to standardize comms training). Speech analysis grades phraseology accuracy,
speech RATE and FILLER words with instant feedback; module-based curriculum with dynamic
visuals (pattern work, holds); selectable ATC personalities. **Take: the grading taxonomy
(accuracy + rate + fillers), module curriculum with a visual stage, proficiency progression.**

**PilotEdge** — real human controllers over a network wired into flight simulators; VHF realism
including signal degradation; a training ladder from pattern work to IFR SIDs/STARs and
approaches; other real pilots audible on frequency. **Take: the "party line" (you are not alone
on frequency), the graded training ladder, radio-realism DSP. Reject: humans-on-duty model —
impossible free.**

**SayIntentions.AI** — cloud-LLM ATC for MSFS/X-Plane: unscripted, 88k airports, vectoring,
sequencing, emergencies, ATIS, handoffs. The realism ceiling. **Take: the ambition — dynamic,
never-the-same-twice ATC with emergency handling. Reject: their architecture (every exchange is
a paid cloud LLM call — unbounded cost + scraping hole on a free site, and non-deterministic
grading violates Iron Rule 1). We reach their variety with a different machine (§4).**

**AIVR (aivr.in) — ⚠️ THE INDIAN COMPETITOR, live today.** Dedicated DGCA RTR platform:
Part 1 MCQ bank (23 chapters) + a Part 2 "RT simulator" over 6 flight phases (Parked, Taxi,
Departure, Enroute, Emergency, Arrival), claiming 500+ dynamically generated scenarios and 17+
predefined exam scenarios stated to be built from real exam-session reports; phone-call mock
vivas by their staff; free 6-minute tier, then ₹399/28 days (₹799 with mock test). Their
weakness: the simulator's technology is opaque (no visible true voice loop or transparent
grading method). **Take seriously: they validated demand and picked the same 6-phase frame.
Beat them on: real voice PTT, transparent deterministic grading, depth of emergencies, the
Captain's authored authority, visual stage — and FREE.**

**Comm1 (the CD in `D:\pk\Radio simulator IFR`)** — the 1990s pioneer: guided lessons,
click-to-talk, recorded controller audio, VFR/IFR editions. Legacy validation that this
category works; FAA phraseology and copyrighted content, so it is reference-only and we do not
mine it. Everything it did is subsumed by this plan.

**Our sources on disk feeding the build:** the Captain's 24-chapter RTR(A) book (phraseology
ch13–21, numbers tables ch23, QB + viva bank ch24); ICAO Doc 9432 + Doc 4444 Ch.12 + Annex 10
Vol II (verified text-extractable); CAR Series G Part VI Section 7 syllabus; his complete RTR
notes + question bank PDFs in `Downloads\rtr`.

## 3. The strategy in one line

**Everyone else sells either scripts (AIVR, Comm1) or a cloud brain (SayIntentions). Ghost
Tower 2.0 builds a third thing: a *procedural radio world* — a deterministic flight-state
machine plus a phraseology grammar that GENERATES the dialogue — so every flight is different,
every grade is auditable, every rupee of runtime cost is zero, and every phrase traces to the
Captain's book and ICAO.**

## 4. The Ghost Tower 2.0 concept

### 4a. WorldGen — a seeded world, not a script
Each session rolls (from a seed) an airport profile (runway, taxi routes, ATIS letter, wind,
QNH, RVR when low-vis), aircraft (VT-reg trainer / light twin IFR / Ghostair jet), route,
traffic, and — per difficulty — armed events (runway change, conditional clearance, wrong
read-back probe, stepped-on transmission, emergency trigger). Combinatorics beat "500+
scenarios" on day one, deterministically (seed shown after flight so any flight can be replayed
or disputed — an examiner's audit trail).

### 4b. DialogueDirector — the controller as a state machine
A flight-phase FSM (clearance → start/push → taxi → line-up → take-off → departure → enroute →
arrival → approach → landing → vacate, with VFR joins/zone ops as a parallel track) where each
transition emits ATC transmissions from grammar templates filled with world state, and expects
pilot transmissions parsed against the same grammar. Probes, corrections, "say again", and
examiner escalation are FSM edges — v1's probe logic, generalized. Emergencies are event
overlays that re-route the FSM (§5c).

### 4c. Understanding the pilot — freeform first, chips as training wheels
- Web Speech ASR (en-IN) remains the base; the existing `engine.mjs` normalization
  (digits/phonetics/gating — already unit-tested) extends to a full slot-grammar NLU:
  intent detection (readback / request / report / emergency call) + slot extraction, still
  100% deterministic.
- ARSim-class delivery metrics added client-side: speech rate (words/sec from ASR timings),
  filler detection ("uh", "umm", "like"), dead-air hesitation before PTT release.
- Optional on-device Whisper (WebGPU, transformers.js) as an opt-in "HD mic" on capable
  devices — still zero server cost. Budget phones keep Web Speech.
- Chips remain ONLY in Learn mode (training wheels), disappear in Practice, banned in Exam.

### 4d. The voice of the tower — concatenative neural VoiceBank
The unlock for dynamic + beautiful + free: aviation R/T is a FINITE vocabulary. Pre-generate
(once, offline) a fragment library per controller voice — digits, phonetic alphabet, station
names, standard phrases, units — with a neural TTS provider (Sarvam/Azure/Bhashini — the same
provider decision as regional languages), pass every fragment through the ffmpeg VHF chain
(300–3400 Hz bandpass + noise bed + squelch), and stitch utterances client-side with Web Audio.
Slightly clipped concatenation is EXACTLY how real ATIS/VOLMET sounds — the artifact IS the
authenticity. 3–4 controller voices + 4–6 "other pilot" voices ≈ a few thousand tiny Opus
files, static hosting (R2/public), zero runtime endpoints. speechSynthesis stays as offline
fallback. (Estimated one-time generation cost: small — low thousands of ₹ at most; exact quote
per provider before Phase 3 starts.)

### 4e. The party line
Background traffic calls generated by the same grammar + VoiceBank: other aircraft get taxi
instructions, report positions, are handed off. Scored listening skill: react only to YOUR
callsign (responding to another aircraft's call = logged error; missing your own call = probe).
No one prepping RTR(A) in India trains this today, and the real exam and real cockpit both
demand it.

### 4f. The stage — see the flight
A stylized SVG airport diagram / route strip (not a flight sim): own-ship dot advancing per
phase, holding point and runway highlighted, circuit legs drawn for VFR, a simple descent strip
for arrivals. ARSim proved visuals lift learning; budget-phone-light SVG keeps it fast.

### 4g. Cockpit controls that grade discipline
- **Radio head**: on a handoff the student must actually TUNE the new frequency (tap-knob);
  wrong frequency = calling into silence (like real life), scored.
- **Transponder widget**: set squawk on clearance; 7600/7700 drills expect the student to set
  the code UNPROMPTED (scored bonus, probed if missed).
- **ATIS**: dialable loop (VoiceBank-generated for the rolled weather); "information Charlie"
  must match what the student actually heard.

## 5. Curriculum — first call to exam-ready

### 5a. Three modes per lesson
1. **LEARN** — hear a model exchange first (VoiceBank pilot voice), then fly it with chips +
   hints + instant correction. Free, no login.
2. **PRACTICE** — freeform voice, dynamic world, probes and party line on; per-call debrief.
   Free login (lead capture, progress sync).
3. **EXAM** — RTR(A) Part 2 mock: continuous flight across all six phases with one surprise
   emergency, timed, no hints, strict WPC-style grading; plus a **viva drill** — oral questions
   fired by voice from the book's ch. 13–21/24 viva banks, answered by voice. Gradesheet
   mirrors the real pass/fail + 50% standard.

### 5b. Tracks
- **VFR track** (trainer, VT-reg): radio check → taxi → circuit ops → zone departure/transit →
  uncontrolled field procedures → position reports → join/land, controlled + uncontrolled.
- **IFR track** (light twin, then Ghostair jet): full clearance delivery → push/start → complex
  taxi (hold short, crossing, conditional) → SID departure → enroute (position reports, level
  changes, direct routings, holds + EFC) → radar environment (ident, vectors, traffic, avoiding
  action) → STAR/approach (expect vs cleared, RVR, wind shear caution) → ILS/SRA talkdown →
  go-around → landing/vacate. (SRA as a full talkdown lesson is a jewel nobody else has — book
  ch17 has the exact patter.)

### 5c. Emergency library (the heart of the request)
Each is an overlay that can fire in Practice/Exam or be flown standalone in Learn:
1. Engine failure → full MAYDAY message build (nature/intentions/position discipline)
2. PAN-PAN medical → priority handling, escalate-to-MAYDAY decision point
3. Engine rough → precautionary PAN → forced-landing MAYDAY escalation (teaches the boundary)
4. Pressurisation failure → MAYDAY + emergency descent + "ATTENTION ALL AIRCRAFT" broadcast
5. Radio failure 7600 → receiver-only vs total drills; transponder acknowledgement ("if you
   read, squawk ident"), blind transmission format, light-signal quiz on arrival
6. Fuel: minimum fuel declaration vs MAYDAY FUEL (Doc 4444 phraseology)
7. Weather: deviation request, wind-shear escape call, diversion with fresh clearance
8. Avoiding action + TCAS RA report ("unable, TCAS RA" / "clear of conflict")
9. Distress RELAY: another station's unanswered MAYDAY — student relays it (book §20.3)
10. SEELONCE awareness beat + DISTRESS TRAFFIC ENDED (aeronautical), maritime forms in viva
11. Go-around (commanded and pilot-initiated), missed-approach re-clearance
12. Unlawful interference (7500): **knowledge/viva only, deliberately not interactive roleplay**
Every script verified against book ch20 + Doc 9432 ch9 + Annex 10 Vol II §5.3 (already on disk,
already cross-checked once in the drafts pass).

### 5d. Analytics & progression
Error taxonomy per transmission (readback-miss, wrong-value, callsign discipline, non-standard
word, number-format, delivery: rate/fillers/hesitation) → weak-area bars on the existing
`/dashboard` (same local-first + Supabase mirror as exam history); proficiency levels per
module; streaks. Exam mode issues a shareable (non-forgeable, watermarked) completion card —
students posting scores IS the marketing.

## 6. Architecture map (all client-side runtime; zero live endpoints)

| Subsystem | What | Builds on |
|---|---|---|
| `lib/rtr-sim/engine.mjs` | normalization + slot scoring (SHIPPED, 21 tests) | extend: intent grammar, delivery metrics |
| `lib/rtr-sim/world.mjs` | seeded WorldGen | new; pure functions, unit-tested |
| `lib/rtr-sim/director.mjs` | flight FSM + grammar templates + probes | generalizes v1 step runner; pure, testable |
| `lib/rtr-sim/voicebank.ts` | fragment fetch/stitch/DSP via Web Audio | new; static Opus assets |
| `tools/rtr-sim/gen-voicebank.mjs` | one-time TTS fragment generation + ffmpeg VHF chain | provider decision needed |
| Stage components | SVG airport/route visuals | new client components |
| Gating | scenario content via Supabase `rtr_scenarios` + RLS (design doc §7) | as approved |
| History | attempts → localStorage + Supabase mirror | existing pattern (exam-history) |

Grammar tables + scenario templates live as data (Captain-reviewable files), never hardcoded;
the source-name guard and "underprivileged" guard run over all generated student-facing text.

## 7. Positioning & business (unchanged covenant: self-study stays free)

- Ghost Tower fully FREE with login for Practice/Exam — against AIVR's ₹399/28 days this is
  checkmate, and it is the seva.
- The human tier nobody can copy: **live 1-on-1 mock viva + R/T check with Capt. Pahil himself**
  (author of the book, R/T instructor) as a paid service inside the existing live-classes
  business — the sim's debrief page links to it. AIVR's phone mocks are staff; ours is the
  examiner-grade instructor.
- Voice-clone of the Captain for the debrief/instructor voice remains a separate personal
  consent decision — not assumed by any delegation.

## 8. Phased roadmap (each phase ships something students feel)

| Phase | Deliverable | Scope notes | Tier |
|---|---|---|---|
| **P1 — Dynamic core** | WorldGen + Director FSM replace fixed scripts; scenario 1 becomes infinite-variation; freeform scoring w/o chips in Practice; delivery metrics | biggest single jump in credibility | Fable designs FSM/grammar; Sonnet builds; Fable reviews |
| **P2 — IFR track + radar** | Full IFR flight (clearance→ILS), vectors/ident/traffic, holds, frequency-tuning radio head, transponder widget | uses drafts SCN-2/3/4 as grammar seeds | same split |
| **P3 — VoiceBank** | Neural fragment library + VHF DSP + party-line traffic + dialable ATIS | needs provider decision + one-time budget | Sonnet pipeline; Captain picks voices by ear |
| **P4 — Emergency library** | All 11 interactive emergencies + escalation logic | every script Captain-approved before publish | Fable drafts w/ citations |
| **P5 — Exam + viva + analytics** | Part 2 mock mode, voice viva from book banks, dashboard card, completion cards, `rtr_scenarios` gating | closes the loop to the real exam | mixed |

Sequencing honest-talk: P1 before beauty (P3) — a gorgeous voice reading a memorized script is
still a script. Each phase = build → verify in browser end-to-end → ONE deploy → Captain flies
it before the next phase starts.

## 9. Risks, named

1. **ASR vs Indian accents/numbers** — mitigations: en-IN, confusion map (data, grows from real
   transcripts), digit-adjacency repairs (shipped), Whisper opt-in, and debrief always shows
   the transcript so the student sees WHAT was heard. Residual risk accepted: voice is primary,
   never sole (Learn mode chips remain).
2. **Scope gravity** — this plan is a quarter's work, not a week's. The phase gates + one-deploy
   rule keep each leg landable.
3. **VoiceBank concatenation quality** — prototype 30 fragments first, Captain listens before
   full generation spend.
4. **AIVR moves first** — they iterate; our moats (free, voice, authority, book, brand art) are
   the durable ones. Ship P1 fast.
5. **iOS Safari quirks** (Web Speech, AudioContext unlock) — explicit device test matrix before
   each deploy; graceful degradation ladder already in v1.

## 10. Success metrics (so "best ever" is measurable)

- A student can go first-call → mock-exam-pass entirely inside Ghost Tower, free.
- Replay distinctness: two consecutive flights share <30% identical ATC lines.
- Every graded error cites a book chapter (tap error → open the chapter).
- Zero runtime inference/API cost at any student volume; page fast on a budget Android.
- Signups attributable to Ghost Tower; students sharing completion cards unprompted.

## 11. Sources (web research, 2026-07-19)

- PlaneEnglish ARSim — https://planeenglishsim.com/pages/arsim · https://arsim.ai/ ·
  Google Play listing (speech analysis: phraseology, rate, fillers; modules; personalities)
- PilotEdge — https://www.pilotedge.net/pages/how-it-works · /pages/training-program-overview
- SayIntentions.AI — https://www.sayintentions.ai/ · their features overview (Freshdesk)
- AIVR — https://www.aivr.in/dgca-rtr.html (Indian RTR platform; 6 phases; pricing)
- RTR(A) exam structure corroboration — aviatorstrainingcentre.in, cpacpilots.com,
  airlineprepschool.com (Part 1 Pariksha CBT / Part 2 practical+viva)
- On-disk: Capt. Pahil's RTR(A) book ch13–24; ICAO Doc 9432 4th ed; Doc 4444 Ch.12; Annex 10
  Vol II (Jul 2016); CAR Series G Part VI Section 7 Annexure A.

---

*Captain — this is the aircraft on paper. Mark it up like a check pilot: cut, add, reorder.
The decisions that unlock the build: (1) approve/amend this plan, (2) the TTS provider +
small one-time VoiceBank budget (shared with regional languages), (3) whether the live
mock-viva-with-you service goes on the roadmap. Nothing publishes without your signature
on the scripts — that covenant does not move.*
