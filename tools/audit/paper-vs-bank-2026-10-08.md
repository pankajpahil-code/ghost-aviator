# Past papers against the chapter bank: twelve real conflicts (8 Oct 2026)

`npx tsx tools/audit/paper-vs-bank.mts` listed 43 questions keyed differently in a past paper and in
the chapter bank. 31 are the same answer printed with a typo or other wording. Twelve were real
conflicts. Capt. Pahil's instruction: "do as dgca says".

Line numbers are from the text extractions in
`D:\05 Air Regulations\Books\DGCA CARs AIP and statutes - official downloads\`.

## Applied: eight paper copies re-keyed to the DGCA text (the bank was already right)

| Paper | Question | Was | Now | DGCA / AIP text |
|---|---|---|---|---|
| 5 | Which occurrence is an aviation accident | Wingtip broken in a collision | Passenger with second-degree burns | CAR 5-C-I, line 107: damage limited to wing tips is excluded. Serious injury includes second- or third-degree burns (Investigation Rules 2025, draft text, definition (v)) |
| 6 | FL 145 can be used | Eastbound IFR | Westbound VFR | CAR 9-C-I tables of cruising levels, line 2661: 145 is in the 180-359 VFR column |
| 8 | Semi-circular rules start from flight level | 150 | 10 | Same table: first row FL 010 |
| 10 | Separation above F 410 | 3000 ft | 2000 ft | Same table, lines 2689-2691: FL 410, 430, 450, 470 |
| 12 | IFR separated from all, VFR needs clearance | Class E | Class C | AIP India ENR 1.4, 1.1.3 and 1.3.2 |
| 13 | R/T failure by day, aircraft indicates by | Switching nav lights | Rocking wings | CAR 9-C-I Appendix 1, 4.1.2 a) 1), line 2269 |
| 14 | Taxiway lights with centre line lighting | Alternate green and white | Alternate green and yellow (option text rewritten) | CAR 4-B-I 5.3.17.7, line 7405 |
| 14 | Aircraft given priority to land | VVIP on board | Critical shortage of fuel | CAR 9-E-I, lines 3859-3861 |

Measured with `dump-keys.mts` before and after: 8 paper questions re-keyed, 0 chapter-bank changes.

## Held: DGCA does not settle these

| Paper | Question | Paper | Bank | Why held |
|---|---|---|---|---|
| 9 | Position reports where no reporting points exist, IMC | Every 30 min | First after 30 min, then every 60 | CAR 9-C-I 3.6.3.1 says only "at intervals prescribed by the appropriate ATS authority". The half-hour-then-hourly rule is ICAO Doc 4444 4.11.1.2; no AIP India figure was found |
| 4 | Landing over dark or featureless terrain: approach appears | Low | High | No DGCA or ICAO text; the bank follows FAA teaching |
| 7 | ATIS on first contact | "ATIS received" | The ATIS phonetic identifier | CAR 9-E-I says only that receipt is acknowledged. Doc 4444 phraseology ("INFORMATION (ATIS identification)") supports the bank |
| 14 | Testing a flight recorder | None of the above | One hour of the oldest data may be erased | No DGCA text; the bank follows 14 CFR 121.343 |

## Found while checking: two official Indian sources disagree on ETA revision

- DGCA CAR 9-C-I 3.6.2.2 d): inform ATS if the estimate changes "in excess of two minutes ... or such
  other period of time as is prescribed by the appropriate ATS authority".
- AIP India ENR 1.1, 2.1.3 (read on the live eAIP, AMDT 07/2026): estimates are to be revised "if more
  than 3 minutes in error".

The site was changed from 3 to 2 minutes on 21 Sept 2026 on the CAR. The second-pass check on 8 Oct
noted the "or such other period" clause but its search of the AIP used the wrong words and found
nothing. The CAR itself lets the ATS authority set another period, and the AIP is where it would do so.
This is for the Captain to rule on.
