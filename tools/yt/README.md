# YouTube channel metadata tooling — @PankajPahil

Rewrites titles, descriptions and tags across the channel so every lecture
deep-links to the chapter it teaches, instead of the site homepage.

## Credentials

Uses the OAuth token the dubbing pipeline already established:
`D:\pk\ATPL Training oxford CBT\_secrets\token.pickle`. Its scope is
`.../auth/youtube` (full read/write) plus upload, so **no new Google API setup
is needed for @PankajPahil**. `@Capt.GhostAviator` is a different channel and
needs its own one-time consent before any of this can touch it.

## THE QUOTA IS THE BINDING CONSTRAINT — read this before planning any run

`videos.update` costs **50 units** against a **10,000 units/day** project quota.
That is **200 video updates per day, maximum**, and only if nothing else spends
quota that day. This channel has 229 videos, so a full pass takes two days.

Uploads cost 1,600 units each, so any day the dubbing pipeline uploads even a
handful of videos, there is effectively no quota left for a metadata pass.
Quota resets at **midnight US/Pacific** (12:30 IST).

`apply.py` is built around this: every success is written to `_applied.json`
immediately, so hitting the cap is a checkpoint, not a half-updated channel.
Re-running the same command resumes exactly where it stopped.

## Order of operations

```
python tools/yt/snapshot.py          # 1. capture current state — ALWAYS FIRST
npx tsx tools/export-video-chapter-map.mts   # 2. video -> chapter URL, from the site code
python tools/yt/plan.py              # 3. build proposals — WRITES NOTHING
                                     #    then READ tools/yt/_plan-review.txt
python tools/yt/apply.py             # 4. dry run
python tools/yt/apply.py --write     # 5. apply, resumable
```

`snapshot.py` is the rollback: `_snapshot.json` holds every original title,
description, tag list and privacy status.

## What is deliberately NOT automated

**21 titles are truncated at exactly 73 characters with a literal `...`**, baked
in by whatever tool uploaded them — and the same truncated string was copied
into the description, so the original wording survives nowhere on record.
Completing them would mean inventing a public claim about what a lecture
teaches. `plan.py` holds them out into `_plan-truncated.json` and writes
`_truncated-review.txt` for the Captain to fill in. Nothing is guessed.

Typo corrections in `TYPO_FIX` are the exception, and only where the live text
is unambiguously wrong and costs the lecture its search term — `Rising Laser
Gyro` → `Ring Laser Gyro`, `Pressure Altitudemeter` → `Pressure Altimeter`.

## Topic extraction

Titles are never parsed positionally. The topic is whatever survives after
known boilerplate segments (`Ch.N`, `ATPL & CPL`, `FREE`, the subject name) are
removed, matched against **whole pipe-separated segments, never substrings** —
substring matching would eat real topic words. If nothing survives, the video is
skipped rather than guessed at.

## Generated files (all gitignored)

| file | what it is |
|---|---|
| `_snapshot.json` | pre-change state of every video — the rollback |
| `_plan.json` | proposed changes, machine-readable |
| `_plan-review.txt` | proposed changes, for a human to read |
| `_plan-truncated.json` / `_truncated-review.txt` | the 21 held back |
| `_applied.json` | resume checkpoint — video ids already written |
