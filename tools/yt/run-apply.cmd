@echo off
REM Runs the YouTube metadata pass after the daily quota resets (midnight
REM US/Pacific = 12:30 IST). apply.py is idempotent and resumable: once every
REM video in the plan is done it exits having written nothing, so leaving this
REM on a daily trigger is safe and finishes the two-day pass on its own.
REM
REM Cancel with:  schtasks /delete /tn "GhostAviator-YouTube-Metadata" /f

cd /d D:\pk\ghost-aviator
echo ================================================== >> tools\yt\_apply.log
echo RUN %DATE% %TIME% >> tools\yt\_apply.log
python tools\yt\apply.py --write >> tools\yt\_apply.log 2>&1
echo EXIT %ERRORLEVEL% >> tools\yt\_apply.log
