# For the independent check — 37 previous-year explanations (2026-11-03)

Written by Claude (Opus 5.5). I wrote them, so I do not certify them (Contract clause 4).
Data: `tools/previous-questions/explanations-2026-11-03.json` (text + the source each was checked against).
Live at `/dgca-exam-questions` once deployed.

## Where I am least sure — check these first

| uid | why |
|---|---|
| CPLMET-296 | "30 to 45 min" comes from the Captain's own Met notes (Indian syllabus). The European ATPL Met manual gives the mature stage as 15–20 min. The explanation says to use 30–45 for the DGCA paper. Needs the Indian Met reference (scanned, no text layer) opened by eye. |
| CPLMET-330 | The Captain's notes table says As, Ns light to moderate; the European cloud table says Ns moderate to severe. The explanation gives light–moderate and warns about thick Ns near a warm front. |
| CPLNAV-350 | No source on disk states "inform ATC within 30 minutes of landing". The explanation ties the 30 minutes to the uncertainty phase (no arrival within 30 min of ETA) and cites Annex 2 3.3.5.3 / AIP India ENR 1.10 for "without delay". |
| CPLNAV-423 | As printed, statement 3 ("LM = TOM − take-off fuel") is also false. The explanation says so. The question may deserve an orange note or a ruling. |
| CPLNAV-259 | The printed third figure (408.7 NM) does not come out exactly; 5 min before the overtake gives ~408.3 NM. Read as "time behind A" it would be ~364.6 NM. The explanation uses the first reading. |
| CPLNAV-220 | From the 0°50′ start of civil twilight the arithmetic gives ~21 min; the explanation says "about 21 to 24 minutes" and that 24 is the option that fits. |
| CPLNAV-713 | No source on disk states outright that ionospheric absorption falls with frequency; the explanation leans on "absorption (except ionospheric) increases with frequency" and the MUF giving least attenuation. |
| CPLNAV-620 | Says the m/s version holds "with a different constant" (≈20.05); that constant was not checked against a document. |
| CPLMET-489 | "High angle of attack" as the reason for strongest vortices is reasoning, not quoted. The heavy/slow/clean answer itself is from the Ops manual's answer key. |

## What I verified and how

Every other entry's `src` names the paragraph read that day: Annex 2 Table 3-1 and 3.3.5.3, Annex 10 Vol II
5.2.1.3 and 5.2.2.1.1.1, Doc 4444 5.4.2.2.1.1 and 5.6.2, AIP India ENR 1.10, Aircraft Rules 1937 rule 38,
IMD SOP 2.4.1, and the ATPL Met, General Navigation, Instruments, Radio Navigation, Flight Planning,
Performance and Ops manuals. No answer key was changed; the apply script refuses any entry that re-keys or
hides a question.
