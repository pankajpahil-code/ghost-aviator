# Daily Shorts from the verified question bank

```
npx tsx tools/shorts/pick.mts     # choose the next unused verified question
python tools/shorts/render.py     # -> out/<chapter>-<slug>.mp4 + .txt caption
```

## Why

Measured 2026-09-06 from `tools/yt/_snapshot.json`: **@PankajPahil has 231 videos,
1,117 total views, 53 subscribers, a median of 1 view per video** — and the
best-performing upload on the channel is a personal video, not a lecture.
**Exactly ONE of 273 videos is a Short**, median length 8m58s.

YouTube does not push a nine-minute lecture from a 53-subscriber channel to
strangers. Shorts are the one surface it does. And unlike every other route
tried, it needs **no gatekeeper, no money, no contacts and almost none of the
Captain's time** — the content is already written and already verified.

**1,696 of 4,397 distinct questions are cardable**, which is 4.6 years of daily
posts.

## The rules it enforces

- **Iron Rule 1 by construction.** Nothing is composed. Every word on a card is
  lifted verbatim from a question already published on the site. A placeholder
  explanation (`Correct answer: B`) is skipped, never padded.
- **Iron Rule 2** from `tools/forbidden-source-names.json`, the same one
  definition `scrub-source-names.mjs` uses. A question naming a textbook is
  skipped, not scrubbed.
- **Nothing that needs a chart the viewer cannot see** — 350 questions rejected
  on that test alone.
- **The question is burned only after a successful encode**, in `_used.json`, so
  a failed ffmpeg run does not silently spend a question.

## The safe area is not decoration

The Shorts player puts the title, channel and description over the bottom of the
frame and the like/share rail down the right. The first render put the site name
at y=1790 — behind the channel bar — and left 60% of the frame empty above it.
Content is now centred inside `SAFE_TOP..SAFE_BOT` and kept clear of the rail.
**Open a frame and look at it before posting.** Three image defects have shipped
in this workspace from skipping that.

## What it found on its first run

The second question it ever picked rendered as *"cted on at once and read
back"*. That was not a renderer bug — it was a **truncated explanation in the
live bank**, invisible in the drill UI and unmissable at 46px. See
`tools/audit/repair-truncated-explanations.mts`: 71 restored, proved against the
question's own correct-option text.
