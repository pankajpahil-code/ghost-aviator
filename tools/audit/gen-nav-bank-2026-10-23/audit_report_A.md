CONTRACT-CORE v1 acknowledged — clauses 1-10.

# Audit report A: Point of Equal Time / Point of Safe Return questions (102) + chapter notes nav-cp-pnr

**Gate 0. Did I build this?** No. I did not write, key or correct any item in `packet_A.json`, nor `nav-cp-pnr/notes.html`. I first saw them in this session. Nothing was edited; the only files I wrote are scratch files in the audit folder (`calcA.py`, `A_dump.txt`, `notesA.txt`, `fpm.txt`, `tableA.md`, `fsn.mjs`, `imgA/`) and this report.

**Gate 1. Can the audit run?** Yes.
- Artefacts: `packet_A.json` (102 items: 97 VERIFIED, 5 CORRECTED), `D:\pk\_wt\nav-kw\public\content\air-navigation\nav-cp-pnr\notes.html`.
- Source book: `D:\question bank\the source book scan`. I rendered answer sheets 291-294, 301, 305, 307 and 308 and viewed all except 292 (pdftoppm, rotated) and read them as images.
- Reference: `D:\01 Air Navigation\Books\Oxford ATPL 4th Ed - Book 07 - Flight Planning and Monitoring.pdf`, pdftotext. I read the PET chapter (Ch 9, book pp.125-140) and the PSR chapter (Ch 11, pp.161-174).
- Primary check for every item: my own recomputation from the stem's data (script `calcA.py`, hand-checked where the parser failed or misread a sign).

## Verdict summary

| verdict | count | ids |
|---|---|---|
| OK (key correct, exactly one option defensible) | 98 | all not listed below |
| WRONG KEY | 0 | none |
| AMBIGUOUS | 0 | none (see the stem-wording notes on #30, #55, #80) |
| BAD EXPLANATION (minor: key correct) | 2 | PSR & PET#56, #59 |
| STEM wording defect (key correct) | 2 | PSR & PET#33, #83 |
| NOT CHECKED | 0 | none |

The five CORRECTED items (#33, #43, #81, #83, #114) are all **justified**. I confirmed each one against the scan and my own arithmetic (Finding 1).

Notes: no wrong formula, rule, worked example or practice answer. I recomputed all four worked examples and all eight practice questions, and every one is correct. The engine-failure rule, the wind rules and the fuel-flow method match Book 07. There are three minor defects: a dangling "section 6" reference, an unsupported "Radius of Action" synonym plus an "examiners use every one" claim, and no warning about crosswind drift (Finding 6).

Iron Rule 2: 0 hits in the packet's stems, options or explanations, and 0 in notes.html. Checked with the repo's own compiler, `tools/forbidden-source-names.mjs` (`FORBIDDEN_NAMES` / `namePattern`), plus a manual regex for oxford, keith, williams, cae, bali, joshi, jeppesen, nordian, crp and book.

## Findings (worst first)

### Finding 1. All five CORRECTED items are justified (most important check, no defect)
```
FINDING:      #33, #43, #81, #83, #114 changed away from the book; every change matches the maths.
SEVERITY:     correctness (none found)
CLAIM:        Builder marked these CORRECTED.
HOW CHECKED:  Rendered sheets 291, 293, 301, 307 and read the worked answers as images; recomputed each one.
RAW OUTPUT:   #33 sheet 291: "PET = (1200 nm x 520 nm/h) / (480 nm/h + 520 nm/h) = 624 nm (option d)". The book puts TAS 480 in the denominator instead of O = 460. Correct: 1200x520/980 = 636.7. Published d = 637 (was 624).
              #43 sheet 293: "PSR = (7.33 x 365)/(430+365) = 3.37 hours ... distance to PSR = 365 nm/h x 3.37 h = 1228 nm (option d)". The book multiplies by H (365) instead of O (430). Correct: 3.367 x 430 = 1447.8. Published d = 1448 (was 1228).
              #81 sheet 301: header "PSR & PET 81 c." but the working ends "173.21 nm or approximately 173 nm (option b)". Option b = 173 in both the Word copy and the published item. Published key b.
              #83 sheet 301: "PET = (1300 nm x 525 nm/h) / (485 nm/h + 525 nm/h) = 676 nm (option d)". Same TAS-for-O error. Correct: 1300x525/990 = 689.4. Published key c = 690.
              #114 sheet 307: header "PSR & PET 114 a." but the working ends "= 4.26 hours (option b)". 7x365/600 = 4.258. Published key b.
PROVES:       Each correction replaced a book error with the correct answer. None turned a right answer into a wrong one.
DOES NOT PROVE: That the book's QUESTION pages (sheets 1-122) carry the same option lettering. I compared against the Word copy's options, not the question-page scans.
```

### Finding 2. Four stems were silently changed but are labelled VERIFIED (process, keys correct)
```
FINDING:      #40, #50, #102, #118 publish data that differs from word_copy_original, yet status = VERIFIED.
SEVERITY:     compliance (status vocabulary); correctness OK
CLAIM:        VERIFIED = "key taken as the source key after checking", with the stem implied unchanged.
HOW CHECKED:  Diffed published vs Word-copy stems (whitespace and degree signs normalised). Read the book's worked answers on sheets 293, 294, 305, 308.
RAW OUTPUT:   #40 Word copy GS out 420 -> published 480. Sheet 293: "(480 nm/h + 500 nm/h) = 4.34 hours ... 2081 nm (option b)".
              #50 Word copy GS back 500 -> published 450. Sheet 294: "(9.5 hours x 450 nm/h) / (500 nm/h + 450 nm/h) = 4.5 hours ... 2250 nm (option a)".
              #102 Word copy "40 hours" -> published 4. Sheet 305: "The stated endurance is 4 hours ... (option b)".
              #118 Word copy "65 knots" -> published 20. Sheet 308: "(100 kts - 20 kts headwind) = 80 kts ... 3 hours (option a)".
              With the Word-copy values no option fits (#40: 1940 NM; #50: 2375 NM; #118: 4.125 h).
PROVES:       The published data matches the book's own working and makes the key correct. The Word copy was the corrupt one.
DOES NOT PROVE: What the book's question page prints for these four. I read only the answer sheets. The status should arguably read CORRECTED (stem repaired) so the change is visible to a reviewer.
```

### Finding 3. Radius-of-action items: explanations use a shortcut the reference rules out (keys correct)
```
FINDING:      #31, #34, #56, #59, #81, #84 (TAS on track 090, W/V 045/50, out and back in 1 h) take GS = TAS +/- 35.4 kt and ignore drift.
SEVERITY:     correctness (minor). Two explanations are also internally inconsistent.
CLAIM:        e.g. #56: "... distance = 0.563 x 244.6 = 138 NM. Answer: 135 NM."  #59: "... = 122 NM. Answer: 123 NM."
HOW CHECKED:  Recomputed with drift balanced: GS = sqrt(TAS^2 - XW^2) -/+ HW, XW = HW = 35.36 kt.
              Book 07 Ch 9/11 answers, read via pdftotext: "Remember to balance the drift for both outbound and the reciprocal home legs. There are no short cuts!"
RAW OUTPUT:   Drift-balanced radius: #31 126.4 (key 128), #34 187.5 (188), #56 136.6 (135), #59 121.2 (123), #81 172.3 (173), #84 169.8 (171).
              The component-only shortcut gives 127.6 / 188.4 / 137.8 / 122.5 / 173.2 / 170.9.
              Nearest distractors: #31 158, #34 176, #56 158, #59 116, #81 180, #84 163.
PROVES:       Every key is still the nearest option under either method, so no key changes. #56 and #59 print a computed value that differs from the stated answer (138 vs 135, 122 vs 123), and that teaches a student to distrust the working. #84's margin is the tightest (key 1.2 NM off, nearest distractor 6.8 NM).
DOES NOT PROVE: How the DGCA examiner's key was derived. The source book uses the same shortcut (sheet 291: "Groundspeed out = TAS (260 kts) - headwind (35.36 kts) = 224.64 kts").
```

### Finding 4. #33 and #83 stems: "equivalent headwind is -20 kt ... +40 kt" reads backwards
```
FINDING:      A "headwind of +40" literally means 40 kt on the nose. The key only works if -20 = 20 kt head and +40 = 40 kt tail.
SEVERITY:     correctness (wording)
HOW CHECKED:  Computed both readings.
RAW OUTPUT:   Intended reading: #33 1200x520/980 = 636.7 (key d 637); #83 689.4 (key c 690).
              Literal reading (O = TAS+20, H = TAS-40): #33 561.7, #83 608.9. Neither is an option.
              The explanations use 460/520 and 465/525 without saying how the sign was read.
PROVES:       Only one option fits, so the key stands. A student who reads the stem literally finds no answer and has no help from the explanation.
DOES NOT PROVE: Anything beyond wording. Suggested rewrite: "headwind component 20 kt from A to B; tailwind component 40 kt from B to A".
```

### Finding 5. Smaller items (all keys correct)
- **"60 knots head" with no leg stated (#30, #55, #80).** Read as head on the leg from the first airfield, the keys are right (392 / 290 / 451). For **#80**, the reverse reading (head only on the way back) gives 800x415/950 = 349.5, which is option b (350) exactly. Suggest "headwind component 60 kt on the leg from the first airfield".
- **"Point of safe endurance" (#1, 26, 76, 99, 102, 106, 108, 110, 114, 116, 118, 120, 121, 122, 124, 125).** The book's own answers call this "not a standard term" (sheets 305, 307, 308) and read it as PSR, as the published explanations do. Acceptable, because the notes list it as a synonym. Saying so in one explanation would help students.
- **Explanation rounding that does not match the key** (cosmetic): #40 2082 vs 2081, #64 214 vs 213.5, #65 2013 vs 2012, #68 1439 vs 1438, #73 2158 vs 2157, #79 310 vs 309, #83 689 vs 690, #93 1485 vs 1484, #105 248 vs 249. The key is the nearest option every time.
- **Leftover stem typos:** #36, #38, #40, #41, #43, #61, #63, #65, #66, #68, #86, #88, #90, #91, #93, #101, #103, #105, #107, #109, #111, #113, #115, #117, #119, #123 read "Point of Safe Return (PSR) 'A' is?" or "between 'A' is?". #40 has a stray "between". Cosmetic.
- **Near-duplicates** (no identical stems in the packet): #28 and #66 (same data and answer, 2290; only the irrelevant departure time differs); #50 and #75 (same GS/endurance, answer 2250; only the unused distance differs); #1 and #116 (mirror cases, both 1458); #27 and #61 (both 290 min).

### Finding 6. Chapter notes `nav-cp-pnr/notes.html`
```
FINDING:      No wrong formula, rule or number. Three minor defects.
SEVERITY:     cosmetic / unsupported claim
HOW CHECKED:  Stripped the HTML to text and recomputed every worked example (WE1-WE4) and practice answer (Q1-Q8). Compared the rules with Book 07 (pdftotext, Ch 9 and Ch 11).
RAW OUTPUT:   WE1 675 NM / 1.929 h ok. WE2 1121.2 NM / 2.735 h ok. WE3 2.625 h / 708.75 NM ok. Still-air check 720, headwind check 708.75 ok. WE4 13.33+10.67 = 24.00, 1000 NM, 2.564 h ok.
              Q1 450; Q2 320/480; Q3 1.067 h; Q4 500; Q5 3.0 h/480; Q6 2.0 h/480; Q7 3.6 h/864 (4.5 h trap); Q8 15+10 -> 720: all ok.
              Book 07 p.129: "If there is a wind then the PET moves INTO WIND. The stronger the wind the greater the movement INTO WIND." Matches the notes.
              Book 07 p.132: "To calculate the distance X to an engine-failure PET use the engine-failure TAS ... To calculate the time to fly to an all-engine or an engine-failure PET use the all-engine TAS to calculate the groundspeed". Matches the notes.
              Book 07 p.165: "In still air the distance to the PSR is the greatest. Any wind component reduces ... same for a HEAD or TAIL wind of the same value." Matches.
              Book 07 p.170: CO/CH = fuel flow / ground speed, d = F/(CO+CH). Matches the fuel-flow method.
              Book 07 p.163: PSR for an "isolated destination and no adequate destination alternate exists". Matches "When are they used?".
PROVES:       The teaching content is consistent with the reference and arithmetically correct.
DOES NOT PROVE: Anything about the rendered page layout. I read text, not a browser render.
```
Minor notes defects:
1. **Dangling cross-reference.** Exam Traps says "See section 6." The headings and the "In This Chapter" list (`<ul class="nav-list">`) are not numbered, so students see no section 6. It means "The Point of No Return (PNR)".
2. **Unsupported synonym and claim.** In "One Idea, Many Names", Radius of Action is listed as a PNR name, and the page says "The examiners use every one of these names". Book 07 equates only PSR and PNR ("The POINT OF SAFE RETURN (PSR), or sometimes referred to as the POINT OF NO RETURN (PNR)"). Radius of action is a related but separate term, and there is no evidence for the "every one" claim. The source book's own answers call "point of safe endurance" non-standard. Suggest softening the wording.
3. **Gap, not an error.** The notes never warn that with a wind off the track line, groundspeed must be found with drift balanced, not TAS +/- the along-track component. Book 07 stresses this ("There are no short cuts!"), and six questions in this chapter's bank are of exactly that kind.
- The page has `noindex` and no source or author name; Iron Rule 2 sweep returned 0.

## Every item checked
| id | status | my computed answer | published key | book key (sheet) | verdict | note |
|---|---|---|---|---|---|---|
| PSR & PET#1 | VERIFIED | 1458.3 NM | a) 1458 NM | a / 284 (machine read, not viewed) | OK |  |
| PSR & PET#12 | VERIFIED | 1657 UTC | d) 1657 UTC | d / 287 (machine read, not viewed) | OK |  |
| PSR & PET#22 | VERIFIED | 1345.5 NM | a) 1345 NM | a / 289 (machine read, not viewed) | OK |  |
| PSR & PET#23 | VERIFIED | 2159.8 NM | c) 2160 NM | c / 289 (machine read, not viewed) | OK |  |
| PSR & PET#24 | VERIFIED | 1676.7 NM | b) 1677 NM | b / 289 (machine read, not viewed) | OK |  |
| PSR & PET#25 | VERIFIED | 2111.1 NM | a) 2111 NM | a / 289 (machine read, not viewed) | OK |  |
| PSR & PET#26 | VERIFIED | 1714.3 NM | a) 1714 NM | n/a / not located | OK |  |
| PSR & PET#27 | VERIFIED | 289.6 min | d) 290 min | d / 290 (machine read, not viewed) | OK |  |
| PSR & PET#28 | VERIFIED | 2290.5 NM | a) 2290 NM | a / 290 (machine read, not viewed) | OK |  |
| PSR & PET#29 | VERIFIED | 265.0 NM | a) 265 NM | a / 290 (machine read, not viewed) | OK |  |
| PSR & PET#30 | VERIFIED | 392.0 NM | d) 392 NM | d / 290 (machine read, not viewed) | OK | "60 kt head" leg not stated |
| PSR & PET#31 | VERIFIED | 126.4 NM (drift-balanced) / 127.6 (component only) | b) 128 NM | b / 291 (img) | OK | drift ignored in expl. |
| PSR & PET#32 | VERIFIED | 1671.4 NM | a) 1671 NM | a / 291 (img) | OK |  |
| PSR & PET#33 | CORRECTED | 636.7 NM | d) 637 NM | d / 291 (img: 624, d) | OK key / STEM wording |  |
| PSR & PET#34 | VERIFIED | 187.5 / 188.4 | a) 188 NM | a / 291 (machine read, not viewed) | OK | drift ignored in expl. |
| PSR & PET#35 | VERIFIED | 224.1 min | b) 224 min | b / 291 (machine read, not viewed) | OK |  |
| PSR & PET#36 | VERIFIED | 278.2 min | a) 278 min | a / 292 (machine read, not viewed) | OK |  |
| PSR & PET#37 | VERIFIED | 1920 UTC | d) 1920 UTC | d / 292 (machine read, not viewed) | OK |  |
| PSR & PET#38 | VERIFIED | 2238.2 NM | b) 2238 NM | b / 292 (machine read, not viewed) | OK |  |
| PSR & PET#39 | VERIFIED | 189.5 min | a) 189 min | a / 292 (machine read, not viewed) | OK |  |
| PSR & PET#40 | VERIFIED | 2081.6 NM | b) 2081 NM | b / 293 (img) | OK | stem changed vs Word copy, status says VERIFIED |
| PSR & PET#41 | VERIFIED | 2649.8 NM | b) 2650 NM | b / 293 (img) | OK |  |
| PSR & PET#42 | VERIFIED | 150.6 min | a) 151 min | a / 293 (img) | OK |  |
| PSR & PET#43 | CORRECTED | 1447.8 NM | d) 1448 NM | d / 293 (img: 1228, d) | OK |  |
| PSR & PET#44 | VERIFIED | 1867.4 NM | c) 1867 NM | c / 293 (img) | OK |  |
| PSR & PET#45 | VERIFIED | 105.9 min | d) 106 min | d / 293-294 (img) | OK |  |
| PSR & PET#46 | VERIFIED | 236.0 min | b) 236 min | b / 294 (img) | OK |  |
| PSR & PET#47 | VERIFIED | 1512.6 NM | a) 1513 NM | a / 294 (img) | OK |  |
| PSR & PET#48 | VERIFIED | 1972.9 NM | c) 1973 NM | c / 294 (img) | OK |  |
| PSR & PET#49 | VERIFIED | 1617.5 NM | b) 1618 NM | b / 294 (img) | OK |  |
| PSR & PET#50 | VERIFIED | 2250.0 NM | a) 2250 NM | a / 294 (img) | OK | stem changed vs Word copy, status says VERIFIED |
| PSR & PET#52 | VERIFIED | 320.0 min | d) 320 min | d / 295 (machine read, not viewed) | OK |  |
| PSR & PET#53 | VERIFIED | 2170.4 NM | c) 2170 NM | c / 295 (machine read, not viewed) | OK |  |
| PSR & PET#54 | VERIFIED | 259.0 NM | a) 259.0 NM | n/a / not located | OK |  |
| PSR & PET#55 | VERIFIED | 290.0 NM | d) 290 NM | d / 295 (machine read, not viewed) | OK | "60 kt head" leg not stated |
| PSR & PET#56 | VERIFIED | 136.6 / 137.8 | b) 135 NM | b / 296 (machine read, not viewed) | BAD EXPLANATION (minor) |  |
| PSR & PET#57 | VERIFIED | 1676.5 NM | a) 1676 NM | a / 296 (machine read, not viewed) | OK |  |
| PSR & PET#59 | VERIFIED | 121.2 / 122.5 | a) 123 NM | a / 296 (machine read, not viewed) | BAD EXPLANATION (minor) |  |
| PSR & PET#60 | VERIFIED | 225.6 min | b) 226 min | b / 297 (machine read, not viewed) | OK |  |
| PSR & PET#61 | VERIFIED | 289.7 min | a) 290 min | a / 297 (machine read, not viewed) | OK |  |
| PSR & PET#62 | VERIFIED | 1950 UTC | d) 1950 UTC | d / 297 (machine read, not viewed) | OK |  |
| PSR & PET#63 | VERIFIED | 2141.4 NM | b) 2141 NM | b / 297 (machine read, not viewed) | OK |  |
| PSR & PET#64 | VERIFIED | 213.5 min | a) 213.5 min | a / 297 (machine read, not viewed) | OK |  |
| PSR & PET#65 | VERIFIED | 2013.2 NM | b) 2012 NM | b / 298 (machine read, not viewed) | OK |  |
| PSR & PET#66 | VERIFIED | 2290.5 NM | b) 2290 NM | b / 298 (machine read, not viewed) | OK |  |
| PSR & PET#67 | VERIFIED | 119.9 min | a) 120 min | a / 298 (machine read, not viewed) | OK |  |
| PSR & PET#68 | VERIFIED | 1438.6 NM | d) 1438 NM | d / 298 (machine read, not viewed) | OK |  |
| PSR & PET#69 | VERIFIED | 1876.9 NM | c) 1877 NM | n/a / not located | OK |  |
| PSR & PET#70 | VERIFIED | 96.6 min | d) 97 min | d / 299 (machine read, not viewed) | OK |  |
| PSR & PET#71 | VERIFIED | 255.5 min | b) 255 min | b / 299 (machine read, not viewed) | OK |  |
| PSR & PET#72 | VERIFIED | 1336.4 NM | a) 1336 NM | a / 299 (machine read, not viewed) | OK |  |
| PSR & PET#73 | VERIFIED | 2157.9 NM | c) 2157 NM | c / 299 (machine read, not viewed) | OK |  |
| PSR & PET#74 | VERIFIED | 1690.2 NM | b) 1690 NM | b / 299 (machine read, not viewed) | OK |  |
| PSR & PET#75 | VERIFIED | 2250.0 NM | a) 2250 NM | a / 300 (machine read, not viewed) | OK |  |
| PSR & PET#76 | VERIFIED | 1841.7 NM | a) 1842 NM | a / 300 (machine read, not viewed) | OK |  |
| PSR & PET#77 | VERIFIED | 270.7 min | d) 271 min | d / 300 (machine read, not viewed) | OK |  |
| PSR & PET#78 | VERIFIED | 2057.9 NM | a) 2058 NM | a / 300 (machine read, not viewed) | OK |  |
| PSR & PET#79 | VERIFIED | 309.8 NM | a) 309 NM | a / 301 (img) | OK |  |
| PSR & PET#80 | VERIFIED | 450.5 NM | d) 451 NM | d / 301 (img) | OK | "60 kt head" leg not stated; reverse reading = option b exactly |
| PSR & PET#81 | CORRECTED | 172.3 / 173.2 | b) 173 NM | c / 301 (img: header c, working 173 = b) | OK | drift ignored in expl. |
| PSR & PET#82 | VERIFIED | 1587.8 NM | a) 1588 NM | a / 301 (img) | OK |  |
| PSR & PET#83 | CORRECTED | 689.4 NM | c) 690 NM | d / 301 (img: 676, d) | OK key / STEM wording |  |
| PSR & PET#84 | VERIFIED | 169.8 / 170.9 | a) 171 NM | a / 301 (img, header only) | OK | drift ignored in expl. |
| PSR & PET#85 | VERIFIED | 216.7 min | b) 217 min | b / 302 (machine read, not viewed) | OK |  |
| PSR & PET#86 | VERIFIED | 272.0 min | a) 272 min | a / 302 (machine read, not viewed) | OK |  |
| PSR & PET#87 | VERIFIED | 1827 UTC | d) 1827 UTC | d / 302 (machine read, not viewed) | OK |  |
| PSR & PET#88 | VERIFIED | 1752.2 NM | b) 1752 NM | b / 302 (machine read, not viewed) | OK |  |
| PSR & PET#89 | VERIFIED | 183.1 min | a) 183 min | a / 303 (machine read, not viewed) | OK |  |
| PSR & PET#90 | VERIFIED | 1794.4 NM | b) 1794 NM | b / 303 (machine read, not viewed) | OK |  |
| PSR & PET#91 | VERIFIED | 2521.7 NM | b) 2522 NM | b / 303 (machine read, not viewed) | OK |  |
| PSR & PET#92 | VERIFIED | 220.0 min | a) 220 min | a / 303 (machine read, not viewed) | OK |  |
| PSR & PET#93 | VERIFIED | 1484.7 NM | d) 1484 NM | d / 303 (machine read, not viewed) | OK |  |
| PSR & PET#94 | VERIFIED | 1895.6 NM | c) 1896 NM | c / 304 (machine read, not viewed) | OK |  |
| PSR & PET#95 | VERIFIED | 104.3 min | d) 104 min | n/a / not located | OK |  |
| PSR & PET#96 | VERIFIED | 293.8 min | b) 294 min | b / 304 (machine read, not viewed) | OK |  |
| PSR & PET#97 | VERIFIED | 1470.8 NM | a) 1471 NM | a / 304 (machine read, not viewed) | OK |  |
| PSR & PET#98 | VERIFIED | 2066.4 NM | c) 2066 NM | c / 304 (machine read, not viewed) | OK |  |
| PSR & PET#99 | VERIFIED | 2.130 h | a) 2.1 h | a / 305 (img) | OK |  |
| PSR & PET#101 | VERIFIED | 220.2 min | a) 220 min | a / 305 (img) | OK |  |
| PSR & PET#102 | VERIFIED | 2.330 h | b) 2.3 h | b / 305 (img) | OK | stem changed vs Word copy, status says VERIFIED |
| PSR & PET#103 | VERIFIED | 248.8 min | b) 249 min | b / 305 (img) | OK |  |
| PSR & PET#104 | VERIFIED | 2200.0 NM | a) 2200 NM | a / 305 (img) | OK |  |
| PSR & PET#105 | VERIFIED | 248.5 min | c) 249 min | c / 306 (machine read, not viewed) | OK |  |
| PSR & PET#106 | VERIFIED | 2.750 h | d) 2.75 h | d / 306 (machine read, not viewed) | OK |  |
| PSR & PET#107 | VERIFIED | 112.0 min | a) 112 min | a / 306 (machine read, not viewed) | OK |  |
| PSR & PET#108 | VERIFIED | 1485.0 NM | a) 1485 NM | a / 306 (machine read, not viewed) | OK |  |
| PSR & PET#109 | VERIFIED | 117.6 min | d) 118 min | d / 306 (machine read, not viewed) | OK |  |
| PSR & PET#110 | VERIFIED | 6.120 h | a) 6.1 h | n/a / not located | OK |  |
| PSR & PET#111 | VERIFIED | 378.0 min | a) 378 min | a / 307 (machine read, not viewed) | OK |  |
| PSR & PET#113 | VERIFIED | 248.1 min | a) 248 min | a / 307 (img) | OK |  |
| PSR & PET#114 | CORRECTED | 4.260 h | b) 4.26 h | a / 307 (img: header a, working 4.26 = b) | OK |  |
| PSR & PET#115 | VERIFIED | 202.8 min | a) 203 min | a / 307 (img) | OK |  |
| PSR & PET#116 | VERIFIED | 1458.3 NM | c) 1458 NM | c / 308 (img) | OK |  |
| PSR & PET#117 | VERIFIED | 271.3 min | c) 271 min | c / 308 (img) | OK |  |
| PSR & PET#118 | VERIFIED | 3.000 h | a) 3.0 h | a / 308 (img) | OK | stem changed vs Word copy, status says VERIFIED |
| PSR & PET#119 | VERIFIED | 177.1 min | a) 177 min | a / 308 (img) | OK |  |
| PSR & PET#120 | VERIFIED | 994.4 NM | a) 994 NM | a / 308 (img) | OK |  |
| PSR & PET#121 | VERIFIED | 5.330 h | a) 5.3 h | a / 308 (img) | OK |  |
| PSR & PET#122 | VERIFIED | 3.200 h | d) 3.2 h | d / 309 (machine read, not viewed) | OK |  |
| PSR & PET#123 | VERIFIED | 103.7 min | b) 104 min | b / 309 (machine read, not viewed) | OK |  |
| PSR & PET#124 | VERIFIED | 819.4 NM | a) 819 NM | a / 309 (machine read, not viewed) | OK |  |
| PSR & PET#125 | VERIFIED | 1929.7 NM | d) 1930 NM | d / 309 (machine read, not viewed) | OK |  |

Column notes: "my computed answer" is my own arithmetic from the published stem. For the six W/V 045/50 items it shows the drift-balanced value first and the component-only value second. "Book key": "(img)" means I read it on the rendered scan this session. "(machine read, not viewed)" means the sheet number and letter come from the builder's `book_keys.json` and I did **not** open that scan. "not located" means no machine key and I did not find the sheet.

## Coverage
- **Checked in full:** all 102 items recomputed from their own stem data (parser plus hand checks on the 17 items it could not parse or misread the en-dash minus sign on). Every key compared with my value and with the distance to the nearest distractor. All 102 published-vs-Word-copy stems and options diffed. Iron Rule 2 swept over every stem, option and explanation, and the notes. Duplicate-stem check across the packet. Every worked example, practice answer and rule in the notes.
- **Read on the scan images this session:** answer sheets 291, 293, 294, 301, 305, 307, 308 (sheet 292 was rendered but not viewed; the items marked "img"). This includes all five CORRECTED items and all four silently changed stems.
- **Not read on images:** the answer sheets for the remaining items (book keys there come from the builder's machine read). None of the question pages (sheets 1-122), so option lettering is checked against the Word copy only.
- **A third pass should look at:** the question-page scans for #40, #50, #102, #118 (to settle what the book's stem prints), and how the six radius-of-action explanations render on the live site.
