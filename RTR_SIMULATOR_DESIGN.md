# RTR(A) Practice Simulator — Design Blueprint

*Architecture session 2026-07-19, Claude Fable 5 (Examiner tier) with Capt. Pankaj Pahil.
Status: **APPROVED design — implementation not started.** Any model implementing this: read
`D:\pk\CLAUDE.md`, `D:\pk\AI_COPILOT_HANDBOOK.md`, `D:\pk\MODEL_PLAYBOOK.md` first. The iron
rules apply to every line of this feature.*

---

## 1. Mission context

The DGCA/WPC RTR(A) exam has two parts. Part 1 (written, 50Q/1h/70%) is already served by the
site's question engine. **Part 2 is a practical transmission test — ~6 ATC voice scenarios over
~30 minutes, pass mark 50% — and no prep platform in India simulates it.** This feature is the
flagship differentiator. The Captain holds the R/T instructor knowledge; the site holds his
24-chapter RTR(A) book (modules C "RTF in Practice", D "Exam Arsenal"). Everything student-facing
is built from HIS material — never from third-party products.

> Note (2026-07-19): `D:\pk\Radio simulator IFR\` contains only a disc image of *Comm1 IFR*, a
> commercial US product teaching FAA phraseology. Iron Rule 4: reference/inspiration at most.
> Do not mount, extract, or clone its content. Indian RTR(A) needs ICAO/India procedures anyway.

## 2. Decisions locked (Capt. Pahil, 2026-07-19)

1. **Input: voice + tap composer in v1.** PTT (hold-to-transmit) voice input via browser
   SpeechRecognition where supported; tap-to-compose phrase builder as the always-works path.
   Both feed the same scorer.
2. **Access: Scenario 1 free for everyone; scenarios 2..N require free sign-in** (existing
   Supabase auth). Free taste + signup driver + script protection.
3. **ATC audio v1: browser speechSynthesis + radio-atmosphere layer** (see §6 — and the honest
   engineering note there). Neural pre-generated audio is the v1.5 upgrade, riding the same
   provider decision as the regional-languages project (Bhashini / Sarvam / Azure — ONE provider
   choice serves both).

## 3. Architecture in one paragraph

A **scripted scenario engine with deterministic client-side scoring**. Each scenario is an
authored script graph: ATC transmission → expected pilot response template (required readback
slots, accepted phrasings, branches for missed/wrong readbacks) → next step. No live LLM, no
runtime AI endpoints — that class of design was already rejected for this site (unbounded cost +
scraping hole on a free product), and non-deterministic grading of exam prep would violate Iron
Rule 1 (a mis-graded student is a harmed student). Deterministic scoring is auditable and
unit-testable. Static assets + client logic + the proven local-first Supabase pattern for attempt
history ⇒ **nothing breaks at 10x or 100x students.**

## 4. Scenario data model

Scenario files are JSON (authored in-repo under `tools/rtr-sim/scenarios/`, compiled by a
`tools/build-rtr-sim.mjs` guard script — same pattern as every other content pipeline).

```jsonc
{
  "id": "scn-2-ifr-departure",
  "title": "IFR Departure Clearance",
  "brief": "You are VT-GAK, a PA-34 at stand 4, requesting IFR clearance to Jaipur…",
  "station": { "name": "Bhiwani Tower", "freq": "118.30" },
  "callsign": "VT-GAK",
  "steps": [
    {
      "id": "s3",
      "atc": {
        "text": "VT-GAK, cleared to Jaipur via W15, climb flight level 85, squawk 4321, QNH 1009.",
        "audio": "scn-2/s3.opus"          // v1.5; v1 uses speechSynthesis of .text
      },
      "expect": {
        "slots": [
          { "key": "route",    "critical": true,  "accept": ["cleared to jaipur via w15", "cleared jaipur w15"] },
          { "key": "level",    "critical": true,  "value": "flight level 85" },
          { "key": "squawk",   "critical": true,  "value": "4321" },
          { "key": "qnh",      "critical": true,  "value": "1009" },
          { "key": "callsign", "critical": false, "value": "VT-GAK", "position": "end" }
        ],
        "forbidden": ["over and out"]
      },
      "onMiss":  { "qnh": "s3-probe-qnh" },   // ATC probes like a real examiner: "VT-GAK, confirm QNH?"
      "next": "s4"
    }
  ]
}
```

Rules for authors:
- **Indian airspace throughout**: VT- callsigns, Indian aerodromes/waypoints, AIP-India
  procedures, ICAO Doc 9432 / Annex 10 Vol II phraseology.
- **No source or author names** in any student-visible string; the build guard rejects the
  standard FORBIDDEN list (IC Joshi, Oxford, CAE, RK Bali, Sahil, Redbird, Surender, Comm1, …)
  plus "underprivileged".
- Fictional-but-plausible stations are fine (avoid implying real ATIS/NOTAM data is current).

## 5. Scoring engine (deterministic, unit-tested)

Input: a normalized token stream — identical whether it came from SpeechRecognition transcript
or the tap composer.

Normalization layer (pure functions, fully unit-tested BEFORE any UI work):
- numbers: "one zero zero nine" ≡ "1009" ≡ "one thousand nine" (last form flagged as a
  format error, value still credited);
- phonetic alphabet: "victor tango golf alpha kilo" ≡ "VT-GAK";
- common recognizer confusions map (e.g. "flight level eight five" → "flight level 85";
  "climb" vs "clime"). This map will grow from real usage — keep it data, not code.

Per-transmission scoring:
- **critical slot correct** → full marks for the slot;
- **critical slot wrong value** (read back QNH 1090 for 1009) → safety-critical error: 0 for the
  slot, ATC branches to a correction/probe step, error highlighted in debrief;
- **critical slot missing** → deduction + `onMiss` probe branch (exactly what a WPC examiner does);
- format/order slips, missing callsign, non-standard words → minor deductions;
- `forbidden` phrases → flagged with the correct usage explained in debrief.

Scenario result: percentage + per-transmission gradesheet. Exam-aligned pass mark 50%
(source: Capt. Pahil, instructor knowledge, 2026-07-12 — same provenance note as
`lib/exam-papers.ts`). Attempt history: reuse the `exam-history` local-first pattern
(localStorage + Supabase mirror, fails soft).

## 6. Voice I/O

**Student → site (recognition):** Web Speech API `SpeechRecognition` behind a capability check.
Chrome on Android (the students' actual hardware) and iOS Safari 14.5+ support it; where absent
or mic denied, the UI simply shows the tap composer. PTT button: press-and-hold to "transmit"
(recognition runs while held) — teaches real R/T discipline incidentally.

**Site → student (ATC voice):**
- **v1 — honest engineering note:** `speechSynthesis` audio CANNOT be routed through Web Audio,
  so a true bandpass filter on the browser voice is impossible. The v1 trick is a **radio
  atmosphere overlay**: Web-Audio-generated squelch click at transmission start/end + low
  background hiss under the voice + the visual signal meter. Most of the radio feel, zero cost,
  ships now.
- **v1.5:** pre-generated Opus files (neural TTS → ffmpeg 300–3400 Hz bandpass + noise mix),
  static hosting (Cloudflare R2 free egress if volume grows; `public/` is fine for six scenarios
  of radio-band mono Opus — they are tiny). True VHF sound, still zero runtime endpoints.
  Multiple ATC voices for realism. **Provider = the regional-languages provider decision.**
- Voice-cloning the Captain (for the debrief/instructor voice, not ATC) stays a separate
  explicit-consent decision — do not proceed without it.

## 7. Access gating (Scenario 1 free, rest behind free login)

Locked scenario scripts must NOT ship in the client bundle. Serve them from a Supabase table
(`rtr_scenarios`, RLS: `authenticated` may select; scenario 1 row marked `public` and readable
by `anon`) — real gate, existing infra, no new backend. The SQL goes into `SECURITY.md` §3
like the other tables, for the Captain to run in the dashboard. Fails soft: if the table is
missing, scenario 1 (bundled) still works and locked ones show the sign-in prompt.

Theft analysis: scenario 1 + the engine are exposed (accepted — it is the free sample); locked
scripts require an authenticated session token, so scraping needs an account and effort — same
deterrence-tier posture as the rest of the site, but materially better than static JSON. Audio
files leaking alone is low-value (scripts + scoring are the IP). No print/download/copy
affordances anywhere in the simulator UI; ContentProtection conventions apply.

## 8. Content workflow (Iron Rules 1 & 4)

1. Draft scenario scripts are written by the strongest available model from the Captain's book
   chapters + ICAO Doc 9432/Annex 10, **with citations per transmission**.
2. Every script is a **DRAFT until Capt. Pahil approves it** — R/T instruction is literally his
   rating; nothing publishes on model authority.
3. Candidate scenario set (DRAFT — Captain to correct against the real exam pattern):
   1. Radio check, taxi and departure (VFR)
   2. IFR airways clearance delivery + full readback
   3. Enroute position reports + level change
   4. Weather deviation / diversion request
   5. Arrival: joining, approach and landing clearance
   6. Emergency: MAYDAY / PAN PAN + relay of another station's distress

## 9. Build plan (phases, model tiers per MODEL_PLAYBOOK)

| Phase | Work | Tier |
|---|---|---|
| A | Normalization + scorer as pure functions with unit tests; scenario schema types | Sonnet builds, **Opus/Fable reviews the scorer before anything ships** |
| B | UI: PTT + composer + radio-atmosphere layer + debrief gradesheet; `/rtr-simulator` route (landing indexed for SEO; runner noindex); scenario 1 end-to-end | Sonnet |
| C | Six scripts drafted with citations → Captain review cycle | Opus/Fable drafts, Captain approves |
| D | Gating (`rtr_scenarios` + RLS SQL), attempt history sync, navbar/homepage wiring (data-driven!) | Sonnet |
| E (v1.5) | Neural pre-generated ATC audio once provider chosen | Sonnet pipeline |

Definition of done per phase: build passes, live `curl` verification, scorer test suite green,
no source-name leaks (guard), ONE deploy at the end of each phase.

## 10. Open items

- Feature name (Captain's call; candidates: "Ghost Tower", "R/T Live", "The Radio Room").
- Neural TTS provider (shared with regional-languages decision).
- Voice-clone consent for the instructor/debrief voice.
- Whether simulator attempts appear on `/dashboard` alongside exam papers (recommended: yes,
  as its own card — but after v1 ships).
