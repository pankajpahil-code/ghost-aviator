# Navigation: five answer-key corrections and one key confirmed (8 Oct 2026)

**Origin.** The CPL Navigation recall-bank build (2 Oct 2026) listed six questions in the live site bank
as wrongly keyed. Capt. Pahil's instruction on 8 Oct: "apply but back it with evidence ... book can make
mistake or printed wrong so double check."

**Who checked.** Claude Opus 5.5, a different session from the one that raised them. Every calculation
was done twice by different methods (closed formula, then a vector solve by bisection or stepping). The
two reasoning questions were checked against three independent keyed banks and by plotting.
Scripts: the working is reproduced below so it can be redone by hand.

**Applied through** `lib/answer-corrections.ts`. `npx tsx tools/audit/check-corrections.mts`:
162 corrections (29 hides), 0 failing.

| # | Question | Was | Now | Status |
|---|---|---|---|---|
| 1 | TAS 140, wind 050/20, track 090: wind correction angle | 8°L | 5°L | CORRECTED |
| 2 | Point of safe return: 340 NM, wind 100/25, TAS 140, track 135, endurance 3 h 10 | 1 hr 44 min | option rewritten to 1 hr 49 min | CORRECTED (option text changed) |
| 3 | Rhumb lines on a polar stereographic chart | Convex to the nearer pole | Concave to the nearer pole | CORRECTED |
| 4 | Isogonal lines converge at | Magnetic poles only | Magnetic and geographic poles | CORRECTED |
| 5 | Course 040, TAS 120, wind 30 kt: direction for greatest drift | 245° | unchanged | VERIFIED as it stands |
| 6 | Advantage of Mode S over Mode A/C | uses VHF frequencies | selective addressing | CORRECTED |

## Working

**1. Wind correction angle.** Wind from 050 on track 090 is 40° off the nose, from the left.
- Formula: sin⁻¹(20 × sin 40° ÷ 140) = sin⁻¹(0.0918) = 5.27°.
- Vector solve (find the heading whose ground track is 090): heading 084.73, correction 5.27° left.
- The old key, 8°, would need a crosswind of 19.5 kt; the crosswind here is 12.9 kt.

**2. Point of safe return.**
- Outbound, track 135, wind 35° off the nose: drift 5.88°, groundspeed 118.8 kt.
- Homebound, track 315, same wind now behind: groundspeed 159.7 kt.
- Formula: 190 min × 159.7 ÷ (118.8 + 159.7) = 109.0 min = 1 h 49.
- Stepping check (fly out t minutes, fly back, largest t that fits in 190 min): 108.9 min.
- The printed options were 1 h 44, 1 h 37, 1 h 21 and 5 h 30. None equals 1 h 49, so the keyed option's
  text was changed rather than the key moved. **Not established:** why the source printed 1 h 44. An
  endurance of 3 h 02 would give it; nothing in the stem supports that.

**3. Rhumb lines on a polar stereographic chart.**
- Reasoning: a rhumb line keeps a constant angle to the meridians; on this chart the meridians are
  straight radials from the pole, so the line must keep turning round the pole.
- Plotted check: a rhumb line on track 060 from 50°N, three points 5° of latitude apart, projected with
  r = 2 tan(co-latitude ÷ 2). The chord's midpoint is 0.6103 chart units from the pole and the curve's
  middle point is 0.6306, so the curve bows away from the pole: concave to it.
- Independent keys: two separate question banks and the site's own two sister questions
  (`site-0a307d`, `site-764972` in `_ref/pool.json`) all key "concave to the pole". The corrected
  question was the only copy saying convex.

**4. Isogonals.**
- Reasoning: variation is the angle between true and magnetic north. It is undefined where either
  direction is undefined, which is at the magnetic poles and at the geographic poles.
- Independent keys: two separate question banks, one reference textbook, and the site's own two sister
  questions (`site-d7cd74`, `site-9765f3`) all key magnetic and geographic poles.
- **No DGCA or ICAO text states this.** A search of USGS material found only that isogonic lines crowd
  together near the geomagnetic poles. The correction rests on reasoning plus four agreeing keys.

**5. Greatest drift (no change).** The recall-bank note said the key had no basis. That note was wrong.
Drift for each offered wind direction, by sin⁻¹(30 × sin(angle off track) ÷ 120): 220° gives 0.0°,
230° gives 2.5°, 235° gives 3.7°, 245° gives 6.1°. The true maximum is a wind at 90° to track
(130° or 310°, 14.5°), but it is not offered, so 245° is the right choice among the four.

**6. Mode S.** ICAO Annex 10 Volume IV (July 2014 edition, on disk in the Air Regulations library):
3.1.1.1.1 sets the interrogation carrier at 1 030 MHz and 3.1.1.2.1 sets the reply at 1 090 MHz. Both
are UHF, so "uses VHF frequencies" is false. The question's own stored explanation already described
selective addressing.

## What this does not prove

- Rows 3 and 4 have no regulation behind them. They are geometry and definition, backed by agreeing
  keys from sources that could share a common origin.
- Only these six questions were examined. The rest of the Navigation bank was not re-audited here.
