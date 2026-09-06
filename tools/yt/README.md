# YouTube channel metadata tooling — both channels

Rewrites titles, descriptions and tags across the channel so every lecture
deep-links to the chapter it teaches, instead of the site homepage.

## Credentials

Two channels, one token each. `_yt.py` holds the registry:

| key | channel | token |
|---|---|---|
| `pankaj` | @PankajPahil | `_secrets/token.pickle` (exists) |
| `brand` | @Capt.GhostAviator | `_secrets/token-ghostaviator.pickle` |

A token is bound to the ONE channel picked in Google's chooser at consent time.
**Verified 2026-09-06** by calling `channels.list(mine=True)` on the existing
token: it returned exactly one channel. So the brand channel cannot be reached
by borrowing the other token, and no code gets around that — it needs a Google
login, which is the Captain's alone:

```
python tools/yt/consent.py brand
```

That opens a browser, and **refuses to save the token if the wrong channel is
picked** rather than leaving a credential that would rewrite the wrong videos.
Every write path also calls `assert_controls()` first (1 quota unit), so a
mis-pointed token cannot reach `videos.update` at all.

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

---

## The second channel: @Capt.GhostAviator (`brand.py`)

**A different job, in a separate script on purpose.** `plan.py` rewrites titles,
descriptions and tags. None of that transfers:

- **Titles are not touched.** `plan.py` extracts a topic by stripping known
  boilerplate from pipe-separated title segments. This channel does not use that
  format (`DGCA Air Regulation - CH003 - Rules of Air`), so the stripper would
  return the whole title as the topic and build nonsense. A title is a public
  claim about what a lecture teaches.
- **Tags are passed through verbatim.** `videos.update(part="snippet")` replaces
  the whole snippet, so omitting tags DELETES them, and tags are not readable
  for a channel the token does not own. That is why consent comes first.
- **Descriptions are only prepended to.** Measured 2026-09-06: **0 of 51** mapped
  lectures here carried ANY link to the site, and the median description is 986
  characters of real writing. The defect is a missing link, not bad prose.

```
python tools/yt/consent.py brand      # the Captain, once, in a browser
python tools/yt/brand.py snapshot     # rollback FIRST, always
python tools/yt/brand.py plan         # writes nothing; read _plan-brand-review.txt
python tools/yt/brand.py apply        # dry run
python tools/yt/brand.py apply --write
```

51 videos x 50 units = 2,550 against the 10,000/day cap: one day, not two.

**Two guards worth knowing about.**

1. **Iron Rule 2.** `plan` refuses to republish a description that names a
   source, and writes it to `_plan-brand-flagged.txt` for the Captain instead of
   silently carrying the attribution forward. The banned list is read from
   `tools/forbidden-source-names.json`, the same one definition
   `scrub-source-names.mjs` uses. On the simulated run, 1 of 51 was flagged:
   `6Vzz8-DJ1VQ` names two textbook sources in its live description.
2. **Simulated snapshots cannot be applied.** The planning logic was tested
   against a snapshot built from public watch pages before consent existed. A
   public scrape cannot see tags, so `plan` marks such a plan `simulated` and
   `apply` refuses to write it. Testing must never be one flag away from data
   loss.

## The daily runner, and why the order is what it is

Scheduled task **GhostAviator-YouTube-Metadata**, daily at 12:40 IST (the quota
resets at midnight US/Pacific = 12:30 IST). It now calls
`tools/yt/run-daily.cmd`, which runs **@Capt.GhostAviator first** and
**@PankajPahil second**, because 51 brand-channel lectures carry no link at all
while the 201 on the other channel already carry a working one and are only
waiting to move from the `www` host to the canonical apex. Against a 10,000/day
cap the brand channel finishes on day one and the apex republish takes what is
left.

`run-daily.cmd` **snapshots the brand channel only if no snapshot exists.**
Re-running the snapshot after an apply would overwrite the only record of the
original descriptions with the rewritten ones and destroy the rollback — the
same reason `snapshot.py` is a one-time command on the other channel.

Every step is idempotent and checkpoints on quota, so leaving it on a daily
trigger is safe: once there is nothing to do it exits having written nothing.
Verified 2026-09-06 by firing the task by hand with the quota exhausted — all
three brand steps refused cleanly and named their own fix, and the apply
checkpointed at 0 updates.
