@echo off
REM Daily YouTube metadata pass, in PRIORITY ORDER, run after the quota resets
REM (midnight US/Pacific = 12:30 IST). Every step is idempotent, resumable, and
REM checkpoints on quota exhaustion, so this is safe on a daily trigger: once
REM there is nothing left to do it exits having written nothing.
REM
REM THE ORDER IS A JUDGEMENT, NOT AN ACCIDENT.
REM   1. @Capt.GhostAviator FIRST. Measured 2026-09-06: 51 mapped lectures and
REM      ZERO of them carry any link to the site at all. 51 x 50 = 2,550 units.
REM   2. @PankajPahil SECOND. Those 201 already carry a working link above the
REM      fold; the pending pass only moves it from the www host to the canonical
REM      apex, removing a 307 redirect hop. Real, but cosmetic beside a channel
REM      that refers nobody.
REM   Against a 10,000/day cap the brand channel finishes on day one and the
REM   apex republish takes whatever is left (~148 of 201), finishing on day two.
REM
REM Replaces run-apply.cmd, which ran step 2 only. That file is kept so the
REM single-channel invocation is still on record.
REM
REM Cancel with: schtasks /delete /tn "GhostAviator-YouTube-Metadata" /f

cd /d D:\pk\ghost-aviator
echo ================================================== >> tools\yt\_apply.log
echo RUN %DATE% %TIME% >> tools\yt\_apply.log

REM ---- @Capt.GhostAviator -------------------------------------------------
REM SNAPSHOT ONCE, NEVER AGAIN. _snapshot-brand.json is the only record of the
REM original descriptions; re-running snapshot after an apply would overwrite it
REM with the already-rewritten text and destroy the rollback. This is the same
REM trap that makes snapshot.py a one-time command on the other channel.
if not exist tools\yt\_snapshot-brand.json (
  echo --- brand: snapshot ^(first run only^) --- >> tools\yt\_apply.log
  python tools\yt\brand.py snapshot >> tools\yt\_apply.log 2>&1
) else (
  echo --- brand: snapshot exists, not retaken --- >> tools\yt\_apply.log
)

echo --- brand: plan --- >> tools\yt\_apply.log
python tools\yt\brand.py plan >> tools\yt\_apply.log 2>&1

echo --- brand: apply --- >> tools\yt\_apply.log
python tools\yt\brand.py apply --write >> tools\yt\_apply.log 2>&1

REM ---- @PankajPahil (apex-host republish) ---------------------------------
echo --- pankaj: apply --- >> tools\yt\_apply.log
python tools\yt\apply.py --write >> tools\yt\_apply.log 2>&1

echo EXIT %ERRORLEVEL% >> tools\yt\_apply.log
