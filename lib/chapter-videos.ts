// Chapter → YouTube lecture mapping — the single source of truth.
// Consumed by the chapter /video route, the notes-page lecture card, and the
// sitemap (whose gate must stay identical to the route's render condition).
//
// The Captain uploads continuously to two channels:
//   https://www.youtube.com/@PankajPahil          (229 videos: Meteorology,
//                                                  Instruments, Radio Nav, Air Law)
//   https://www.youtube.com/@Capt.GhostAviator    (54 videos: Air Regs, Met,
//                                                  Gen Nav, RTR — incl. Hindi)
//
// TO WIRE A NEW LECTURE: add one line below — the video page, the notes-page
// card and the sitemap all light up on their own. Helper:
//   node tools/suggest-chapter-videos.mjs
// prints the newest uploads from both channels next to the chapter they look
// like they belong to, so a human confirms every pairing before it ships.
//
// ⚠️ MAP BY TOPIC, NEVER BY CHAPTER NUMBER. Every lecture series on these
// channels follows a fuller syllabus than this site's chapter list: the Radio
// Nav series' "Ch.14" is MLS while the site's rnav-14 is SSR, and the Air Law
// series runs to Ch.91 against 26 site chapters. Mapping by number would have
// shown a student studying SSR a lecture on MLS. Always read the video title
// against the chapter title in lib/subjects.ts.
//
// ⚠️ ONE LECTURE MAY SERVE TWO CHAPTERS. inst-14 and inst-15 both point at the
// same "Turn Co-ordinator and Turn and Slip Indicator" lecture because that is
// genuinely what it teaches. This is safe — video pages are not submitted to
// the sitemap, so it cannot create the duplicate-URL problem that the
// subject-wide question fallback did.
//
// Hindi lectures are wired as an extra labelled entry on the same chapter
// rather than a separate route, so a student picks the language they think in
// without leaving the page. On the chapters that have both, the Hindi upload
// often outperforms the English one (Gen Nav Ch.2: 52 views vs 5).

/** One lecture. `label` is only needed for multi-part series. */
export type ChapterVideo = { id: string; label?: string };

const HI = "हिन्दी में";

// Key: "<subjectId>/<chapterId>". Value: lectures in viewing order.
export const CHAPTER_VIDEOS: Record<string, ChapterVideo[]> = {

  /* ════════════════ AIR REGULATIONS ════════════════
     Two series cover this subject. @Capt.GhostAviator's numbering matches this
     site's chapters almost exactly (it was built against the same syllabus), so
     it leads. @PankajPahil's 91-part "Air Law & Regs" series is finer-grained —
     up to 12 short lectures land on one site chapter — and follows on after. */

  "air-regulations/ar-1": [
    { id: "U-3qsvPNXSQ", label: "International Organisations & Conventions" },
    { id: "SHo-QjiRnbI", label: HI },
    { id: "JpGnn-DjlMw", label: "International obligations of contracting states" },
    { id: "jBORCiFMJ_w", label: "Duties of ICAO member states" },
    { id: "PdmkxmZ3750", label: "ICAO — structure & function" },
    { id: "ApktRSz4n_E", label: "ICAO publications" },
    { id: "2abJZqxWNZg", label: "Other international agreements" },
    { id: "cICUAvuTcjM", label: "Tokyo, The Hague & Montreal conventions" },
    { id: "b_0I9g2BIh4", label: "European organisations" },
    { id: "6PBKx3tTNiE", label: "The Warsaw Convention" },
  ],
  "air-regulations/ar-2": [
    { id: "3clEEVEFjhs", label: "Aircraft Registration & Markings" },
    { id: "aHQ2MIgMWo8", label: HI },
    { id: "au8FiahVAlk", label: "Nationality & registration marks" },
  ],
  "air-regulations/ar-3": [
    { id: "49Pb_y2Jy4Y", label: "Rules of the Air" },
    { id: "VO4lLbsFUR4", label: "Introduction" },
    { id: "47UODY8EVis", label: "National rules & Annex 2" },
    { id: "dg763P_HjeI", label: "Visual Flight Rules (VFR)" },
    { id: "q7ekrW6maec", label: "Instrument Flight Rules (IFR)" },
    { id: "gJbALJzPShM", label: "Minimum height & cruising levels" },
    { id: "096wf1Ok8dU", label: "Aircraft lights" },
    { id: "xRrUwi1Pq4Q", label: "Flight plans" },
    { id: "Tefbar_6Du4", label: "Communications failure" },
    { id: "_SI6VCs2D-E", label: "Interception of civil aircraft" },
    { id: "XqGnpHJNhI4", label: "Distress & urgency signals" },
    { id: "ZLYWd2MkvrM", label: "Restricted, prohibited & danger areas" },
    { id: "L4O8jpSUUtY", label: "Signals for aerodrome traffic" },
    { id: "o8Foj8tlSMs", label: "Marshalling signals" },
  ],
  "air-regulations/ar-4": [
    { id: "-wNK3jt0_Vc", label: "Air Traffic Services" },
    { id: "TZlOBk51PFw", label: "Classes of airspace" },
    { id: "p2yWT7oHdSM", label: "Units providing ATS" },
    { id: "zyWiUWOZSmQ", label: "Flight information regions" },
    { id: "uxxaSUeU6yQ", label: "Air traffic route structure" },
    { id: "q58NDZN7Uno", label: "Air traffic control service" },
    { id: "GAMhjL9pI1w", label: "Air traffic control clearances" },
    { id: "1F7Ap9A9U1k", label: "Flight information service" },
    { id: "pX9u06RX2-8", label: "Alerting service" },
    { id: "FZBfsX3n4ss", label: "Contingencies" },
    { id: "FLczf-3WTTM", label: "Flight plans (ATM)" },
    { id: "wBhnQ0edMOs", label: "Flow management" },
    { id: "r1atWgSQQBs", label: "Position reporting" },
    { id: "zY1h3iuBvHM", label: "Air traffic management" },
  ],
  "air-regulations/ar-5": [
    { id: "gSiElA8OTKY", label: "Separation Methods" },
    { id: "lVC1r-5Km1g", label: "Separation — principles" },
    { id: "aDrK-U6elho", label: "Vertical separation" },
    { id: "94mzkrUgBIk", label: "Horizontal separation" },
    { id: "X8ujJpexSiE", label: "Area control clearances" },
    { id: "_C70fKG4Mq4", label: "Emergencies & communications" },
  ],
  "air-regulations/ar-6": [
    { id: "yEk9FYgRTho", label: "Separation in the Vicinity of Aerodromes" },
    { id: "bhM6LYDQ6Xk", label: "Approach control — establishment" },
    { id: "QS0NtlmpqBA", label: "Departing aircraft" },
    { id: "8qKEykDWARw", label: "Arriving aircraft" },
    { id: "YwrqTYkl2VI", label: "Stacking" },
    { id: "h-J4UcITCkw", label: "Parallel runway operations" },
  ],
  "air-regulations/ar-7": [
    { id: "wvN_ol_zXPo", label: "Aerodrome Control Service" },
    { id: "ZUXwIpb6TZs", label: "Aerodrome control service" },
    { id: "MBWEAW6z94U", label: "Information to aircraft" },
    { id: "FrTQsTncX3c", label: "Control of aerodrome traffic" },
    { id: "j1mj5D9XZeg", label: "Control of persons & vehicles" },
    { id: "-aY9JS-6HkA", label: "Wake turbulence" },
  ],
  "air-regulations/ar-8": [
    { id: "urz6tppqass", label: "ATS Surveillance Systems" },
    { id: "rHrMgrxqNk0", label: "Radar services — introduction" },
    { id: "1feSl6Ndqa4", label: "General radar procedures" },
    { id: "lyPcBr65-60", label: "Radar separation standards" },
    { id: "Kw_SiPSnQLE", label: "Radar in approach control" },
    { id: "wAriRV0FoQk", label: "Surface movement radar" },
    { id: "xLMoEXslKuk", label: "Air traffic advisory service" },
    { id: "ukRgihOxhzo", label: "Radar emergencies" },
    { id: "Gf43q7zD1kc", label: "Secondary surveillance radar" },
    { id: "JRd6XeNECso", label: "Radar control procedures" },
  ],
  "air-regulations/ar-9": [
    { id: "a1Zda_GDGSs", label: "AIS Data Backbone & the IAIP Ecosystem" },
    { id: "KGurRIjfHyo", label: "Introduction" },
    { id: "bBa-vXGs9Us", label: "NOTAMs" },
    { id: "pUUkJ2X7mJY", label: "Regulation" },
    { id: "8n8pbH8ux0I", label: "Aeronautical information circulars" },
  ],
  "air-regulations/ar-10": [{ id: "cncICehqRws" }],
  "air-regulations/ar-11": [
    { id: "UYUpyJor-UU", label: "Visual Aids for Navigation" },
    { id: "zTYaAPUOX4Q", label: "Aerodromes — introduction" },
    { id: "iTCYanWEkMI", label: "Pavements, runways & hard surfaces" },
    { id: "vw4ciwCFXdU", label: "Visual aids to navigation" },
    { id: "nsV_38iL3DQ", label: "Aerodrome markings" },
    { id: "lemhj_t9Uyk", label: "Aerodrome lights" },
    { id: "iKG60rOyF20", label: "Approach lighting system" },
    { id: "5WKb2lGfVR4", label: "Runway lighting" },
    { id: "fXGc2GdVvdo", label: "PAPI & VASIS" },
  ],
  "air-regulations/ar-12": [
    { id: "KdmMUecbCYY", label: "PANS-OPS Doc 8168" },
    { id: "mu_ck9yfC6Y", label: "Instrument procedures" },
    { id: "ENXyFv6Zq9A", label: "Departure procedures" },
    { id: "5Pz8nWSxfhs", label: "Approach procedures (1)" },
    { id: "zpSb51PUqJQ", label: "Approach procedures (2)" },
    { id: "rra6xTE04bc", label: "Arrival & approach segments" },
    { id: "RTpq1Viw9DQ", label: "Track reversal" },
    { id: "Bwg89D7WlxI", label: "Missed approach" },
    { id: "5IRiYb6hVRA", label: "Holding procedures" },
    { id: "0Q9at5ShhQ0", label: "Visual manoeuvring (circling)" },
    { id: "2aWRB2Qnstc", label: "Altimeter setting procedures" },
    { id: "OOmn7XvvPs4", label: "Simultaneous operations" },
  ],
  // National Law ← "Ch13 The DGCA National Law Matrix"
  "air-regulations/ar-13": [
    { id: "ojBmyaj53cE", label: "The DGCA National Law Matrix" },
    { id: "SaTfP2MyS5Y", label: "The authority of the commander" },
    { id: "wkhhpz_ZRuw", label: "Commercial practices & leasing" },
  ],
  "air-regulations/ar-14": [{ id: "ID4_Qo4yYeY" }],
  // Airworthiness ← "Ch#15 The Regulatory Life Cycle: ICAO Annex 8" (Annex 8 = Airworthiness)
  "air-regulations/ar-15": [
    { id: "iM98a2v25q8", label: "The Regulatory Life Cycle — ICAO Annex 8" },
    { id: "A8Y13jv9zW8", label: "Airworthiness of aircraft" },
  ],
  "air-regulations/ar-16": [{ id: "2m5VJdr9_SI" }],
  "air-regulations/ar-17": [{ id: "PrXRLBTukPw" }],
  "air-regulations/ar-18": [
    { id: "3NWp7gmYYw8", label: "The Communications Masterclass" },
    { id: "LylAMP-t0KU", label: "ATS communications" },
  ],
  "air-regulations/ar-19": [
    { id: "6MF9rZnzGfY", label: "Accident & incident investigation" },
    { id: "wXiSi6-ZScY", label: "Notification & investigation" },
    { id: "rnHrLR8xgKQ", label: "Evidence & custody" },
  ],
  "air-regulations/ar-21": [{ id: "WA4A2uk3IiM" }],
  "air-regulations/ar-24": [{ id: "rqM1zkllly4" }],
  "air-regulations/ar-25": [
    { id: "AQRtHqEQsMY", label: "Part 1" },
    { id: "A7pRpWqpIME", label: "Part 2" },
    { id: "JgpQEckZSS4", label: "Part 3" },
    { id: "eMGIQclKFM0", label: "Part 4" },
    { id: "bZc-_oEVCxE", label: "Part 5" },
  ],

  /* ════════════════ METEOROLOGY ════════════════
     @PankajPahil's 26-chapter "ATPL & CPL Meteorology" series is the spine;
     @Capt.GhostAviator's standalone Met uploads fill the Indian-syllabus
     chapters (Atmosphere, Indian climatology) that series doesn't cover. */

  "meteorology/met-1": [{ id: "6Vzz8-DJ1VQ" }],
  "meteorology/met-2": [
    { id: "MEuSnFKkAnE", label: "Atmospheric pressure — part 1" },
    { id: "1qAcfQkW9kw", label: "Atmospheric pressure — part 2" },
    { id: "Xrqy2zsP2z4", label: "Pressure systems — part 1" },
    { id: "H7VEc3zBm5Y", label: "Pressure systems — part 2" },
    { id: "kTGiLLXe8_k", label: "Pressure systems — part 3" },
    { id: "VMhBsHlrgwI", label: "Pressure systems — part 4" },
    { id: "GiqX4RUutE4", label: "Altimetry — QNH, QFE, QFF" },
    { id: "PoLZtJDc_uw", label: "Altimetry — transition altitude" },
    { id: "gm7ZR4YIlTE", label: "Altimeter errors — high to low" },
  ],
  "meteorology/met-3": [
    { id: "0w7u_rrKM5w", label: "Temperature & the ISA" },
    { id: "EBCbaErTntM", label: "Temperature inversions" },
  ],
  "meteorology/met-4": [{ id: "CChFK1obTr4" }],
  "meteorology/met-5": [
    { id: "r2UxxkI1j0c", label: "Humidity & dew point" },
    { id: "Jrd64Y9X8ko", label: "Cloud base & the LCL" },
  ],
  "meteorology/met-6": [
    { id: "PANbGKCLuI8", label: "Lower winds & surface wind" },
    { id: "BEx1WMnKlOc", label: "Sea breeze & valley winds" },
    { id: "jDtanzRzYag", label: "Foehn, Mistral & Bora" },
    { id: "x2VxuMojgpE", label: "Wind shear & LLWS" },
    { id: "1OCATPoCwPY", label: "Winds — overview" },
  ],
  "meteorology/met-7": [
    { id: "gN9GZYAu8fg", label: "Visibility & fog" },
    { id: "NxhxYp1OCpk", label: "Fog types" },
  ],
  "meteorology/met-8": [
    { id: "D6or0Avul8M", label: "Cloud types" },
    { id: "jotUOuMgJVY", label: "Cloud identification guide" },
    { id: "bsG6rCXW69Y", label: "Cumulonimbus (CB)" },
    { id: "h6rq1jjYbXE", label: "Clouds — overview" },
    { id: "aGCOcp2LWss", label: HI },
  ],
  "meteorology/met-9": [
    { id: "JHAYKe3cWHo", label: "Adiabatics & stability — DALR, SALR" },
    { id: "4sbkQiN8jCk", label: "Atmospheric stability" },
  ],
  "meteorology/met-10": [{ id: "LC_B_w6ErHc" }],
  "meteorology/met-11": [{ id: "5RJlBtJFYAo" }],
  "meteorology/met-12": [
    { id: "z3MuMAjWHog", label: "Aircraft icing" },
    { id: "MoGgvgLeU3w", label: "Icing types & intensity" },
  ],
  "meteorology/met-13": [
    { id: "XjhZF98UrhI", label: "Thunderstorms — the mature stage" },
    { id: "ECLzoawoVJs", label: "Thunderstorm hazards" },
  ],
  "meteorology/met-14": [
    { id: "qkP26k2qmZg", label: "Air masses & fronts" },
    { id: "M2QVtY8p3gI", label: "Warm & cold fronts" },
    { id: "rR5nAbjYNE8", label: "Occluded fronts" },
    { id: "kC8wyBRLS0g", label: "Depressions" },
    { id: "xTbcwTu9GH8", label: "Depression development" },
  ],
  "meteorology/met-15": [
    { id: "qvU6ROQB4us", label: "Upper winds & the jet stream" },
    { id: "zhexgW3l1l4", label: "Tropopause & upper charts" },
  ],
  "meteorology/met-16": [
    { id: "YAnZCKacrBs", label: "Turbulence types" },
    { id: "RQVX6CiVizc", label: "CAT & wake turbulence" },
  ],
  "meteorology/met-17": [{ id: "GwcXE3SwxBs" }],
  "meteorology/met-19": [
    { id: "DhgM_YOyC7Y", label: "Indian climatology" },
    { id: "dmSXdEbzaU0", label: HI },
    { id: "Hk_w16u6Oe4", label: "Area climatology — part 1" },
    { id: "Aw5kxX_-1z4", label: "Area climatology — part 2" },
    { id: "AT6h46lYNU0", label: "Area climatology — part 3" },
  ],
  "meteorology/met-20": [
    { id: "NIfv3ZgMRG8", label: "Global climatology — part 1" },
    { id: "ibmK2ZS15TU", label: "Global climatology — part 2" },
    { id: "fHX1rWvKV9s", label: "Global climatology — part 3" },
  ],
  "meteorology/met-21": [{ id: "HGyxqUMmvfM" }],
  "meteorology/met-22": [
    { id: "lFxpHLQ_yro", label: "Remote sensing — part 1" },
    { id: "_H80wsuZ5XE", label: "Remote sensing — part 2" },
  ],
  "meteorology/met-25": [
    { id: "m4bnq1Zrytw", label: "METARs decoded" },
    { id: "xLhlFMS2k9o", label: "METARs continued" },
    { id: "n72oX0MQUP8", label: "METARs advanced" },
  ],
  "meteorology/met-26": [{ id: "nNgg0PjbDgA" }],
  "meteorology/met-27": [
    { id: "DAwMvuKm_qw", label: "SIGMET explained" },
    { id: "tEQ6BDOK1jI", label: "AIRMET explained" },
  ],
  "meteorology/met-28": [
    { id: "qoRtNQiMtsQ", label: "SIGWX charts" },
    { id: "xU6ZF_HCECk", label: "High-level SIGWX — part 2" },
    { id: "tU0shyNQ0vA", label: "High-level SIGWX — part 3" },
  ],

  /* ════════════════ INSTRUMENTATION ════════════════
     @PankajPahil's 46-part "ATPL Instruments" series, topic-matched onto the
     site's 40 Instrumentation chapters. The numbering does NOT line up. */

  "instrumentation/inst-2": [
    { id: "feF8tvjx5sY", label: "Air pressure instruments & definitions" },
    { id: "t-Eb36ZI7Vo", label: "Pitot-static system errors" },
  ],
  "instrumentation/inst-3": [
    { id: "mAmT0hroKEE", label: "Temperature sensors & TAT" },
    { id: "VsH9HHGft0U", label: "Definitions & corrections" },
  ],
  "instrumentation/inst-4": [
    { id: "CooeghJgUXM", label: "Principle of operation & calibration" },
    { id: "U3e1XFAmakw", label: "ASI definitions & blockages" },
  ],
  "instrumentation/inst-5": [
    { id: "Q0qQQvYSFYE", label: "Operation, calibration & types" },
    { id: "cv5etwzmCUQ", label: "Altimeter settings" },
    { id: "GKKXufngGO0", label: "Transition, pressure & density altitude" },
    { id: "eIdToqoN5cg", label: "Errors, blockages & pressure settings" },
  ],
  "instrumentation/inst-6": [{ id: "1RtTM1EBJUs" }],
  "instrumentation/inst-7": [
    { id: "AE-R4SgNMVE", label: "Theory, operation & construction" },
    { id: "YUuNbcTcZ-w", label: "Mach, TAS & CAS relationship" },
  ],
  "instrumentation/inst-8": [
    { id: "OOD-v9Xo_FM", label: "Air data computer" },
    { id: "HzglZ5gKu54", label: "Angle of attack measurement" },
  ],
  "instrumentation/inst-9": [
    { id: "no_UZUxTcus", label: "Basic magnetism" },
    { id: "SXy2ua1k20c", label: "Variation" },
    { id: "2-l-B5tjq6g", label: "Magnetic dip" },
  ],
  "instrumentation/inst-10": [{ id: "YMg12StWIZE" }],
  "instrumentation/inst-11": [
    { id: "8b6sj9lSwqE", label: "Gyroscopic theory" },
    { id: "UltPsFF3dyM", label: "Types of gyros" },
  ],
  "instrumentation/inst-12": [
    { id: "7fqzFlpY4F4", label: "Principle of operation & errors" },
    { id: "p2t3sdCtqUs", label: "Drift rate calculations" },
  ],
  "instrumentation/inst-13": [{ id: "MzSenPzsTPI" }],
  // One lecture, two chapters — it covers both instruments by name.
  "instrumentation/inst-14": [{ id: "r49EHz1ITNM" }],
  "instrumentation/inst-15": [{ id: "r49EHz1ITNM" }],
  "instrumentation/inst-16": [
    { id: "Eew7NTCvqWw", label: "Aircraft magnetism" },
    { id: "I7T8hrTn9HM", label: "Deviation" },
  ],
  "instrumentation/inst-17": [
    { id: "8FnbU6s_kns", label: "Operation & system construction" },
    { id: "_kS6fEmfXLU", label: "The flux valve" },
    { id: "TwsWwCslNQ4", label: "Components & remote transmission" },
  ],
  "instrumentation/inst-18": [
    { id: "g3XinFJHsjQ", label: "Principle of operation" },
    { id: "VSDy7V7G3uo", label: "Data flow" },
    { id: "vqUi4qT-zRc", label: "Platform stabilisation" },
    { id: "V7me-S2eP1A", label: "Alignment" },
    { id: "zVt3tWsyLjU", label: "Operation" },
    { id: "R4OgG8NmatI", label: "Errors" },
  ],
  "instrumentation/inst-19": [
    { id: "9NiKgNcMPb4", label: "Introduction" },
    { id: "HF7fb5r9UCg", label: "Ring laser gyro" },
    { id: "lenI-VDcLsI", label: "Summary" },
  ],
  "instrumentation/inst-20": [{ id: "kTd3MxS2PjM" }],
  "instrumentation/inst-21": [
    { id: "UEz8XcDId1I", label: "Flight management system" },
    { id: "HwkZj6HN_wA", label: "FMS operation" },
    { id: "RCQLm6bdWyw", label: "FMS equipment operation" },
  ],
  "instrumentation/inst-22": [
    { id: "Osw8oUS4XzA", label: "EFIS & EADI" },
    { id: "MTKlV6Y5i5Y", label: "EHSI & display modes" },
  ],
  "instrumentation/inst-24": [{ id: "kPgBGy9Faqk" }],

  /* ════════════════ RADIO NAVIGATION ════════════════
     @PankajPahil's 28-part series. Lecture number in brackets; it deliberately
     differs from the chapter id. */

  "radio-navigation/rnav-1": [
    { id: "Jq8gsAeRSF0", label: "Electromagnetic waves" },          // [Ch.01]
    { id: "Buq4QSZmWy4", label: "Radio waves" },                    // [Ch.02]
  ],
  "radio-navigation/rnav-2": [{ id: "Vodh-m2QIb0" }],               // [Ch.03] Propagation paths
  "radio-navigation/rnav-3": [{ id: "YqnepRpi1S4" }],               // [Ch.04] Modulation
  "radio-navigation/rnav-4": [{ id: "ZvdjStLdEO8" }],               // [Ch.05] Antennae
  "radio-navigation/rnav-5": [{ id: "lnlfVx_ATYQ" }],               // [Ch.06] Doppler
  "radio-navigation/rnav-6": [{ id: "X6k3O-75myw" }],               // [Ch.07] Ground direction finding
  "radio-navigation/rnav-7": [
    { id: "khFSCtcHplA", label: "NDB / ADF operation" },            // [Ch.08]
    { id: "sXiLAQdQF2E", label: "NDB / ADF interpretation" },       // [Ch.09]
  ],
  "radio-navigation/rnav-8": [
    { id: "DpFHZV1kioI", label: "VOR & Doppler VOR — operation" },  // [Ch.10]
    { id: "I-d2y7vhdu0", label: "VOR & Doppler VOR — interpretation" }, // [Ch.11]
  ],
  "radio-navigation/rnav-9": [
    { id: "N2iy3NquqLQ", label: "ILS operation" },                  // [Ch.12]
    { id: "gySd3fVbatw", label: "ILS interpretation" },             // [Ch.13]
  ],
  "radio-navigation/rnav-10": [{ id: "QbzAevd4qjA" }],              // [Ch.14] MLS
  "radio-navigation/rnav-11": [{ id: "xhQVSoXaib4" }],              // [Ch.16] Radar Principles of Operation
  "radio-navigation/rnav-12": [{ id: "sUEZolnnsKk" }],              // [Ch.17] Ground Radar
  "radio-navigation/rnav-13": [{ id: "IozBeMZ_8kw" }],              // [Ch.18] Airborne Weather Radar
  // SSR covers interrogation modes A/C/S, so the Mode S lecture is part 2 here.
  "radio-navigation/rnav-14": [
    { id: "3c7dyP8_zJM", label: "Secondary Surveillance Radar" },   // [Ch.19]
    { id: "Jiq8HSaEymI", label: "Mode S" },                         // [Ch.20]
  ],
  "radio-navigation/rnav-15": [{ id: "mIMrrpsvMJM" }],              // [Ch.15] DME
  // The FMS lectures are titled "Area Navigation Systems — FMS ...", i.e. the
  // equipment this chapter's syllabus covers, so they run on as parts 2-4.
  "radio-navigation/rnav-16": [
    { id: "AO9CCreBDrM", label: "Area Navigation (RNAV)" },         // [Ch.21]
    { id: "64e3Tgd0aHk", label: "FMS — purpose & components" },     // [Ch.22]
    { id: "rQngpjEKLLE", label: "FMS — equipment operation" },      // [Ch.23]
    { id: "ogIdZu-eiv0", label: "FMS — supplement" },               // [Ch.24]
  ],
  // JUDGEMENT CALL, Captain to confirm: lecture [Ch.25] is titled "Area Nav —
  // Electronic Horizontal Situation Indicator". The EHSI is an EFIS display
  // format, which is what this chapter teaches, so it lands here rather than as
  // a fifth part of rnav-16. Move it if you'd rather it followed the RNAV run.
  "radio-navigation/rnav-17": [{ id: "au8nFcs0z0c" }],              // [Ch.25]
  "radio-navigation/rnav-18": [
    { id: "jHL9w-I707A", label: "GPS · GLONASS · Galileo" },        // [Ch.26]
    { id: "7QzFqzUpfYc", label: "GPS principles of operation" },    // [Ch.27]
  ],

  /* ════════════════ AIR NAVIGATION ════════════════
     @Capt.GhostAviator's General Navigation uploads, most with a Hindi twin. */

  "air-navigation/nav-1": [{ id: "7qKTC6kPtfA" }],
  "air-navigation/nav-6": [
    { id: "zKC3tHEXP_w", label: "Mass & payload limits" },
    { id: "tsOitQF47t8", label: HI },
  ],
  "air-navigation/nav-9": [
    { id: "UOHSv6J-EBs", label: "Point of Equal Time / Critical Point" },
    { id: "q8rAD_XDnxU", label: HI },
  ],
  "air-navigation/nav-13": [
    { id: "psfgixg7IAg", label: "The Earth" },
    { id: "w9CsmyvuB_A", label: HI },
    { id: "tH9OZKlXFYA", label: `${HI} — part 2` },
  ],
  "air-navigation/nav-14": [
    { id: "UEjVvw3zjuE", label: "Great circles, rhumb lines & direction" },
    { id: "wqxHqCIiEDA", label: HI },
  ],
  "air-navigation/nav-15": [
    { id: "vrmQ-3Frg7Q", label: "Earth magnetism & navigation principles" },
    { id: "Z-TyJw6eKxY", label: HI },
  ],
  "air-navigation/nav-20": [
    { id: "zfZlcVwj8hM", label: "Convergency & conversion angle" },
    { id: "dkVLpxpJpvw", label: "Earth convergency & conversion angles" },
    { id: "9wVmMkYesuI", label: HI },
    { id: "QMncJ2xjw00", label: `${HI} — part 2` },
  ],

  /* ════════════════ TECHNICAL GENERAL ════════════════ */

  "technical-general/tg-36": [{ id: "cN32AVdKIXc" }],   // AC Electrics #01 — Introduction to AC

  /* ════════════════ RADIO TELEPHONY (RTR-A) ════════════════ */

  "radio-telephony/rtf-1": [
    { id: "GcAoT5q4ZY0", label: "RTR(A) — the 2026 syllabus" },
    { id: "Hk7sLe2AgXQ", label: HI },
  ],

  /* ════════════════ ATPL ════════════════
     The Air Law series is written for "ATPL & CPL", so the chapters the ATPL
     syllabus shares with CPL point at the same lectures. */

  "atpl-air-regulations/aar-1": [
    { id: "PdmkxmZ3750", label: "ICAO — structure & function" },
    { id: "ApktRSz4n_E", label: "ICAO publications" },
    { id: "jBORCiFMJ_w", label: "Duties of ICAO member states" },
  ],
  "atpl-air-regulations/aar-7": [
    { id: "6MF9rZnzGfY", label: "Accident & incident investigation" },
    { id: "wXiSi6-ZScY", label: "Notification & investigation" },
    { id: "rnHrLR8xgKQ", label: "Evidence & custody" },
  ],
  "atpl-air-regulations/aar-8": [{ id: "WA4A2uk3IiM" }],
  "atpl-meteorology/amet-2": [
    { id: "qvU6ROQB4us", label: "Upper winds & the jet stream" },
    { id: "zhexgW3l1l4", label: "Tropopause & upper charts" },
  ],
  "atpl-meteorology/amet-3": [
    { id: "qoRtNQiMtsQ", label: "SIGWX charts" },
    { id: "xU6ZF_HCECk", label: "High-level SIGWX — part 2" },
    { id: "tU0shyNQ0vA", label: "High-level SIGWX — part 3" },
  ],
  "atpl-meteorology/amet-5": [{ id: "x2VxuMojgpE" }],
  "atpl-navigation/anav-1": [
    { id: "AO9CCreBDrM", label: "Area Navigation (RNAV)" },
    { id: "jHL9w-I707A", label: "GPS · GLONASS · Galileo" },
  ],
  "atpl-navigation/anav-5": [
    { id: "UEz8XcDId1I", label: "Flight management system" },
    { id: "HwkZj6HN_wA", label: "FMS operation" },
    { id: "RCQLm6bdWyw", label: "FMS equipment operation" },
  ],
  "atpl-radio-aids/ari-1": [
    { id: "jHL9w-I707A", label: "GPS · GLONASS · Galileo" },
    { id: "7QzFqzUpfYc", label: "GPS principles of operation" },
  ],
  "atpl-radio-aids/ari-2": [{ id: "QbzAevd4qjA" }],
  "atpl-radio-aids/ari-3": [{ id: "Jiq8HSaEymI" }],
  "atpl-radio-aids/ari-4": [{ id: "IozBeMZ_8kw" }],
  "atpl-radio-aids/ari-5": [{ id: "kPgBGy9Faqk" }],
};

/* ────────────────────────────────────────────────────────────────────────────
   AWAITING THE CAPTAIN'S RULING — deliberately NOT mapped, because a guess here
   would put the wrong lecture on a chapter a student is trusting:

   • P8lKdWQgwEA  "[Ch.28] Loran C"
       This site's 20-chapter Radio Nav subject has no Loran chapter at all. It
       needs either a new chapter or a home inside an existing one.
   • s8eDBrSIr9g + pAJnbSVahLk  "DGCA Computer Number" (x2)
       Not chapter material — this is the eGCA computer-number process, which is
       exactly the subject of the /guides/computer-number guide. Best embedded
       there, which needs a small guide-page video slot (not built yet).
   • oEbA_o28UHo  "DGCA - Aviation Meteorology Winds"
       A second Winds upload alongside 1OCATPoCwPY. Which is the keeper?

   DUPLICATE UPLOADS found on @PankajPahil 2026-08-13 — the lower-view copy of
   each pair is NOT mapped, so students only ever see one. These should be
   deleted or unlisted on YouTube, because two URLs for one lesson splits the
   watch time and the search ranking between them:

     Cloud Types          D6or0Avul8M (4 views)  vs  uZQWlQbTKDc (0)
     Thunderstorm Hazards ECLzoawoVJs (0)        vs  fdI-gXfPYKk (1)
     Visibility & Fog     gN9GZYAu8fg (57)       vs  R4ZaagYZhGw (0)
     Fog Types            NxhxYp1OCpk (2)        vs  vkLU6i7lFfk (0)
     Aircraft Icing       z3MuMAjWHog (1)        vs  9_WzG0HqiRE (0)
     Icing Types          MoGgvgLeU3w (0)        vs  ithjJSySKh8 (0)

   GAPS IN THE SOURCE SERIES (nothing to map, not a mapping error):
     Meteorology  Ch.22  — never uploaded
     Air Law      Ch.39  — never uploaded
   ──────────────────────────────────────────────────────────────────────────── */

export function getChapterVideos(subjectId: string, chapterId: string): ChapterVideo[] {
  return CHAPTER_VIDEOS[`${subjectId}/${chapterId}`] ?? [];
}

/** First lecture for a chapter, or null — for callers that show just one. */
export function getChapterVideo(subjectId: string, chapterId: string): string | null {
  return getChapterVideos(subjectId, chapterId)[0]?.id ?? null;
}
