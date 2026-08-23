// Verified explanations for Air Regulations bank chapter ar-6 (Air Traffic Services).
//
// NOTE ON THE CHAPTER ID. This is BANK ar-6, which the site serves at
// /cpl/air-regulations/ar-4 — CPL_AR_CHAPTER_MAP in lib/questions.ts routes
// site ar-4 -> bank ar-6. The bank ids and the site ids do not correspond and
// have no name relationship; reading the site's chapter titles to decide what a
// bank chapter contains gives the wrong answer, and has already produced a
// wrongly-scoped plan once. Read the map, not the titles.
//
// SCOPE DISCIPLINE — read before adding to this file.
// An explanation is answer-key-grade content. A confidently-worded wrong rule
// does more damage than the "Correct answer: B" placeholder it replaces, because
// a student will believe it and carry it into the exam. So an entry belongs here
// ONLY if the rule was read in the primary source, and the citation names the
// paragraph. Everything else stays a placeholder and goes on the FLAGGED list at
// the bottom of this file until the source to settle it is on disk.
//
// Verified 2026-08-23 against two documents held on disk and read paragraph by
// paragraph for each entry below:
//   • ICAO Annex 2 (Rules of the Air), Tenth Edition — D:\pk\
//   • ICAO Doc 4444 (PANS-ATM) — C:\Users\Admin\Downloads\Telegram Desktop\
// Every `cite` was read in the extracted text, not recalled. Where a marked
// answer depends on a figure that is NOT in either document, that question is
// FLAGGED below rather than explained from memory.
//
// NOT AUDITED. I wrote these, so I do not certify them — clause 4. They want a
// second, independent pass before anyone calls them verified.
//
// Keys are normalised question stems (see key() in apply-explanations.mjs), and
// the applier additionally refuses to write unless the correct option's TEXT
// still matches `expect`.

export const AR6_EXPLANATIONS = [
  // ──────────────────────────────────────────────────────────────────────
  // VMC minima — Annex 2, Table 3-1
  //
  // The table has three altitude bands, and almost every mistake in this
  // topic comes from reading the wrong band:
  //   at/above 10 000 ft AMSL            → 8 km,  1500 m horiz / 1000 ft vert
  //   below 10 000 ft, above 3000 ft AMSL
  //     (or above 1000 ft AGL, whichever higher) → 5 km, same cloud distances
  //   at/below 3000 ft AMSL or 1000 ft AGL, whichever higher
  //     Classes A–E → 5 km, same cloud distances
  //     Classes F, G → 5 km, clear of cloud and in sight of the surface
  // ──────────────────────────────────────────────────────────────────────
  {
    stem: "The visibility reqd. when flying at (or) below 3000’ in a controlled airspace",
    expect: "5 kms",
    cite: "ICAO Annex 2, Table 3-1 (see 4.1)",
    exp: `Controlled airspace means Class A to E, and in every one of those the VMC flight visibility is 5 km, at every altitude below 10 000 ft. The figure only changes at 10 000 ft AMSL, where it goes up to 8 km. The trap in this question is the phrase "at or below 3000 ft" — that band DOES have a relaxation, but only in Classes F and G, where you may fly clear of cloud and in sight of the surface. Inside controlled airspace there is no such relaxation, so 5 km stands.`,
  },
  {
    stem: "Within controlled airspace below 3000’ feet, visibility reqd. for VFR is",
    expect: "5000 mts",
    cite: "ICAO Annex 2, Table 3-1 (see 4.1)",
    exp: `Same rule as above, written in metres: 5 km is 5000 m. Controlled airspace is Classes A to E, and the VMC flight visibility for all of them below 10 000 ft is 5 km regardless of how low you are. The 1500 m figure that appears in the footnotes to Table 3-1 is a reduction the ATS authority MAY prescribe, and only for Class F and G operations at low speed or in low-traffic areas — never inside controlled airspace.`,
  },
  {
    stem: "What is the minimum flight visibility for flight in VFR if an aircraft is flying at 5000 feet in Class G airspace at a speed of 120 knots and in sight of the surface?",
    expect: "5000 metres",
    cite: "ICAO Annex 2, Table 3-1 (see 4.1)",
    exp: `5000 ft AMSL puts you in the middle band — below 10 000 ft but above 3000 ft — and there the requirement is 5 km, which is 5000 m, in every airspace class including G. The words "in sight of the surface" and the speed are there to pull you toward the bottom band, where Class F and G aircraft may fly clear of cloud with the surface in sight. That concession belongs to the band at or below 3000 ft AMSL (or 1000 ft above terrain, whichever is higher). At 5000 ft you are above it, so the full 5 km applies.`,
  },
  {
    // The same question is in the bank TWICE, spelled "meters" in one block and
    // "metres" in the other (lines ~551 and ~6651 of the bank file). Both need
    // an entry, because the applier keys on stem AND answer text — which is the
    // whole reason it does. A duplicated stem is a separate, known defect: 86 of
    // them are on record as still open, and deduping is not this file's job.
    stem: "What is the minimum flight visibility for flight in VFR if an aircraft is flying at 5000 feet in Class G airspace at a speed of 120 knots and in sight of the surface?",
    expect: "5000 meters",
    cite: "ICAO Annex 2, Table 3-1 (see 4.1)",
    exp: `5000 ft AMSL puts you in the middle band — below 10 000 ft but above 3000 ft — and there the requirement is 5 km, which is 5000 m, in every airspace class including G. The words "in sight of the surface" and the speed are there to pull you toward the bottom band, where Class F and G aircraft may fly clear of cloud with the surface in sight. That concession belongs to the band at or below 3000 ft AMSL (or 1000 ft above terrain, whichever is higher). At 5000 ft you are above it, so the full 5 km applies.`,
  },
  {
    stem: "VFR flight in class F airspace above 3000’ msl and below 10,000 ‘MSL.",
    expect: "Provided flight visibility is 5000 m.",
    cite: "ICAO Annex 2, Table 3-1 (see 4.1)",
    exp: `Between 3000 ft and 10 000 ft AMSL the flight visibility minimum is 5 km — 5000 m — and it is the same in every class from A to G. Class F buys you nothing extra here. The relaxations Class F and G enjoy (clear of cloud, in sight of the surface, and a possible reduction to 1500 m where the ATS authority prescribes it) all live in the band at or below 3000 ft AMSL or 1000 ft above terrain, whichever is higher.`,
  },
  {
    stem: "What is the minimum flight visibility and proximity to cloud requirement s for VFR flight, at 6500 feet MSL, in Class D airspace?",
    expect: "5 Km visibility; and 1000 feet below.",
    cite: "ICAO Annex 2, Table 3-1 (see 4.1)",
    exp: `6500 ft AMSL is the middle band, so the answer is 5 km flight visibility with the standard cloud clearance: 1500 m horizontally and 300 m — that is 1000 ft — vertically. Learn the cloud distances as one pair, because they do not change anywhere in the table above 3000 ft: 1500 m and 1000 ft, whatever the class and whatever the altitude, right up to and including the 8 km band above 10 000 ft.`,
  },
  {
    stem: "When on VFR flight within controlled airspace, a pilot must remain clear of clouds by at least",
    expect: "1,000 feet vertically and 1.5 km horizontally.",
    cite: "ICAO Annex 2, Table 3-1 (see 4.1)",
    exp: `1500 m horizontally and 300 m vertically — and 300 m is 1000 ft, which is how the figure is usually spoken. This pair is worth memorising as a single item, because it is constant across the whole of Table 3-1 wherever a cloud distance is specified at all. Only the visibility changes with altitude (5 km, then 8 km above 10 000 ft), and only Classes F and G at low level escape the cloud distances entirely by flying clear of cloud in sight of the surface.`,
  },
  {
    stem: "At an aerodrome special VFR may be authorized when",
    expect: "Visibility falls below 5 km or cloud ceiling is less than 1500 feet",
    cite: "ICAO Annex 2, 4.2",
    exp: `Annex 2 4.2 says a VFR flight shall not take off or land at an aerodrome within a control zone, or enter its traffic zone or pattern, when the ceiling is less than 450 m (1500 ft) or the ground visibility is less than 5 km — "except when a clearance is obtained from an air traffic control unit". That clearance is what a Special VFR authorisation is. So Special VFR is precisely the mechanism for operating below those two figures, which is why they are the numbers in the answer. Note both are triggers: either one falling below its limit is enough.`,
  },
  {
    stem: "An aircraft on a Special VFR flight has been cleared for “straight in “approach. Because of low ceiling and poor visibility, the pilot is concerned about the exact location of a radio mast in the vicinity. Avoiding this obstruction is the responsibility",
    expect: "of the pilot.",
    cite: "ICAO Annex 2, 2.3.1",
    exp: `A Special VFR clearance separates you from other traffic. It does not separate you from the ground or from anything standing on it. Annex 2 2.3.1 is unambiguous: the pilot-in-command is responsible for the operation of the aircraft in accordance with the rules of the air, whether manipulating the controls or not. Obstacle clearance under VFR — special or otherwise — stays with the pilot, because VFR is by definition flown by visual reference. This is the distinction to hold on to: a clearance is permission to enter airspace, never a guarantee about terrain.`,
  },

  // ──────────────────────────────────────────────────────────────────────
  // Separation minima — PANS-ATM Chapter 5 and Chapter 8
  // ──────────────────────────────────────────────────────────────────────
  {
    stem: "DME separation between A/C on same track, same level and in same direction is",
    expect: "20 NM",
    cite: "PANS-ATM 5.4.2.3.3.1 a)",
    exp: `37 km — 20 NM — for aircraft on the same track, provided both are using the same on-track DME station (or an equivalent GNSS waypoint arrangement) and the separation is checked by simultaneous readings at frequent intervals. There is a 10 NM version in 5.4.2.3.3.1 b), but it is conditional: the leading aircraft must be maintaining a true airspeed at least 20 kt faster than the one behind. With no speed differential stated, 20 NM is the figure.`,
  },
  {
    stem: "DME separation between A/C on same track, same level and in some direction is",
    expect: "20 NM",
    cite: "PANS-ATM 5.4.2.3.3.1 a)",
    exp: `The same rule as the previous question, with a typo in the stem — read it as "same direction". 20 NM (37 km) on the same track, both aircraft referenced to the same on-track DME station, checked by simultaneous readings. The reduced 10 NM minimum applies only when the leading aircraft is 20 kt or more faster in true airspeed than the following one.`,
  },
  {
    stem: "Longitudinal separation between two A/C on same track is _____ min",
    expect: "15",
    cite: "PANS-ATM 5.4.2.2.1.1 a)",
    exp: `15 minutes is the baseline time-based longitudinal minimum for aircraft on the same track at the same level. The other figures in that paragraph are all reductions you must earn: 10 minutes where navigation aids permit frequent determination of position and speed, 5 minutes where the leading aircraft is 20 kt or more faster in TAS and the pair meet one of three listed cases, and 3 minutes where that speed advantage is 40 kt or more. With no such condition given, answer 15.`,
  },
  {
    stem: "Horizontal separation of aircraft at same cruising level and in same track by time is:",
    expect: "15 min.",
    cite: "PANS-ATM 5.4.2.2.1.1 a)",
    exp: `Same rule, asked the other way round: the time-based longitudinal minimum for same track, same level is 15 minutes. Note the word "horizontal" here means longitudinal — along the track — not lateral. Lateral separation is a different mechanism entirely, expressed as an angular divergence plus a distance from the facility rather than as a time.`,
  },
  {
    stem: "VOR Track separation is _______",
    expect: "15º at 15 NMs",
    cite: "PANS-ATM 5.4.1.2.1.2 a)",
    exp: `Lateral separation using a VOR exists when both aircraft are established on radials diverging by at least 15 degrees and at least one of them is 28 km — 15 NM — or more from the facility. Learn the set together, because the exam moves between them: VOR 15 degrees, NDB 30 degrees, dead reckoning 45 degrees, and the distance is 15 NM in all three cases. The angle grows as the navigation aid gets less precise, which is the logic worth remembering rather than three separate numbers.`,
  },
  {
    stem: "Normal horizontal separation provided by radar units is:",
    expect: "5nm",
    cite: "PANS-ATM 8.7.3.1",
    exp: `9.3 km — 5.0 NM — is the standard horizontal separation minimum based on radar or ADS-B. It can be reduced where the ATS authority prescribes it, but not below 3.0 NM in general, and not below 2.5 NM between succeeding aircraft on the same final approach track within 10 NM of the runway end, which itself carries a list of conditions about runway occupancy time, braking action and radar update rate. Unless the question gives you one of those situations, 5 NM is the answer.`,
  },
  {
    stem: "Two a/c flying in the vicinity of aerodrome under radar control will be separated by :",
    expect: "5 nm",
    cite: "PANS-ATM 8.7.3.1",
    exp: `The standard radar/ADS-B horizontal minimum of 5 NM applies here too. Being near an aerodrome does not by itself reduce it. The reductions in 8.7.3.2 are permissions the ATS authority must prescribe — 3 NM where radar capability allows, and 2.5 NM only between aircraft established on the same final approach track inside 10 NM of the runway end. "In the vicinity of an aerodrome" is not the same as "established on final approach", so the standard figure stands.`,
  },
  {
    stem: "A light aircraft taking off from an intermediate position on the runway after a heavy aircraft requires a wake vortex separation of :",
    expect: "3 minutes",
    cite: "PANS-ATM 5.8.3.2 a)",
    exp: `Three minutes, and the reason is the intermediate start. From the same take-off position the minimum is 2 minutes (5.8.3.1), but a lighter aircraft beginning its roll from an intermediate point on the runway starts INSIDE the region where the heavy aircraft's vortices were generated, and it lifts off further along than the heavy did. It therefore needs a full extra minute. The same 3 minutes applies to an intermediate start on a parallel runway separated by less than 760 m.`,
  },

  // ──────────────────────────────────────────────────────────────────────
  // Definitions — identical in Annex 2 and PANS-ATM Chapter 1
  // ──────────────────────────────────────────────────────────────────────
  {
    stem: "Control Zone is from",
    expect: "Surface of earth to a specified upper limit",
    cite: "ICAO Annex 2, Definitions (also PANS-ATM Chapter 1)",
    exp: `A control zone is controlled airspace extending upwards FROM THE SURFACE of the earth to a specified upper limit. That first phrase is the whole distinction: a control ZONE starts at the ground, a control AREA starts at some specified limit above it. If you can only remember one thing about the pair, remember that the zone touches the ground — which is why it is the airspace that surrounds an aerodrome and why VFR arrivals and departures there need a clearance.`,
  },
  {
    stem: "A Control Zone normally is controlled airspace extending upwards from",
    expect: "the surface of the earth to a specified upper limit",
    cite: "ICAO Annex 2, Definitions (also PANS-ATM Chapter 1)",
    exp: `From the surface of the earth to a specified upper limit — that is the definition word for word. The distractors offering a specific height above the surface are describing a control AREA, not a zone. The zone is the one that comes all the way down to the ground.`,
  },
  {
    stem: "A Control Area normally is controlled airspace extending upwards from",
    expect: "A specified height above the surface of the earth, which should not be less than 200 mts",
    cite: "ICAO Annex 2, Definitions (also PANS-ATM Chapter 1)",
    exp: `A control area is controlled airspace extending upwards from a specified limit ABOVE the earth — and that is what decides this question. Every other option either starts at the surface, which would make it a control zone, or names an arbitrary height. The base of a control area is not fixed worldwide; it is prescribed for each area, and the lower limit is set so that aircraft operating beneath it are clear of the controlled airspace. Contrast it with a control zone, which by definition extends upwards from the surface itself.`,
  },
  {
    stem: "“Controlled Airspace “means airspace of defined dimensions within which",
    expect: "An ATC service is provided.",
    cite: "ICAO Annex 2, Definitions (also PANS-ATM Chapter 1)",
    exp: `Controlled airspace is an airspace of defined dimensions within which air traffic CONTROL service is provided in accordance with the airspace classification. Two things are doing work in that definition. First, it is the control service that makes airspace controlled — not flight information service, not an alerting service. Second, "in accordance with the airspace classification" means how much control you actually get depends on the class: A through E are all controlled, but the service each one owes to IFR and VFR traffic differs.`,
  },
  {
    stem: ". What is defined as “ A unit established to provide flight information and alerting service” ?",
    expect: "Flight Information Centre",
    cite: "ICAO Annex 2, Definitions (also PANS-ATM Chapter 1)",
    exp: `A flight information centre is a unit established to provide flight information service and alerting service — exactly those two services, and not air traffic control. That is the point of the definition. An air traffic services unit is the generic term covering an ATC unit, a flight information centre and an ATS reporting office together, so it is too broad to be the answer; area control service is a control service, which an FIC does not provide.`,
  },

  // ──────────────────────────────────────────────────────────────────────
  // Position reporting — PANS-ATM 4.11
  // ──────────────────────────────────────────────────────────────────────
  {
    stem: "Position report is required to be given when",
    expect: "all are correct",
    cite: "PANS-ATM 4.11.1.1 and 4.11.1.4",
    exp: `All three are required. 4.11.1.1 requires a report over, or as soon as possible after passing, each designated compulsory reporting point, and adds that additional reports over other points may be requested by the ATS unit. 4.11.1.4 requires that where prescribed or requested, the last position report before passing from one FIR or control area into an adjacent one is made to the unit serving the airspace about to be entered. So the compulsory point, the FIR boundary and an ATC request are each a trigger in their own right.`,
  },
  {
    stem: "On X-country flight where reporting points are not available then reporting shall be made after every ________ min in.",
    expect: "first report after 30 mins and subsequent after 60 mins",
    cite: "PANS-ATM 4.11.1.2",
    exp: `On routes NOT defined by designated significant points, position reports are made as soon as possible after the first half hour of flight and at hourly intervals thereafter. So the pattern is 30 minutes, then every 60 — not a single repeating interval, which is what the other options offer. The ATS unit may ask for additional reports at shorter intervals, but that is a request, not the standing rule.`,
  },
  {
    stem: "On a X-country flight where reporting points are not available position report shall be made every _____ min in IMC.",
    expect: "first report after 30 mins and subsequent after 60 mins",
    cite: "PANS-ATM 4.11.1.2",
    exp: `Same rule as the previous question: first report after the first half hour, then hourly. Note that 4.11.1.2 is written in terms of the ROUTE — whether it is defined by designated significant points — and not in terms of the meteorological conditions. The mention of IMC in the stem does not change the interval.`,
  },

  // ──────────────────────────────────────────────────────────────────────
  // Crossing a route — PANS-ATM 9.1.4.2.2.2
  //
  // I very nearly flagged these two as unsourceable. The rule was there; my
  // first search was too narrow. Grep the whole extraction before recording
  // anything as "not found" — that sentence is a claim about the search, not
  // about the document.
  // ──────────────────────────────────────────────────────────────────────
  {
    stem: "Crossing of an ATS route should be at angle of:",
    expect: "90º",
    cite: "PANS-ATM 9.1.4.2.2.2",
    exp: `90 degrees, as nearly as possible. PANS-ATM states this for IFR flights intending to cross an advisory route: cross as near to a right angle as you can, and at a level appropriate to your track taken from the cruising-level tables for IFR flights outside controlled airspace. The reason is exposure time — a perpendicular crossing puts you inside the route's protected airspace for the shortest possible period, and it makes your intention obvious to anyone else using the route. A shallow crossing angle keeps you in conflict for far longer.`,
  },
  {
    stem: "While crossing ATS routes the crossing will be done at _____ angles to the route.",
    expect: "90º",
    cite: "PANS-ATM 9.1.4.2.2.2",
    exp: `Right angles — 90 degrees, or as close to it as circumstances allow. The provision in PANS-ATM is written for IFR flights crossing an advisory route, and it pairs the angle with a level requirement: use a cruising level appropriate to your track from the tables for IFR flights outside controlled airspace. Angle and level go together, because crossing quickly at the wrong level is no safer than crossing slowly at the right one.`,
  },

  // ──────────────────────────────────────────────────────────────────────
  // Holding
  // ──────────────────────────────────────────────────────────────────────
  {
    stem: "EAT is the time that an aircraft :",
    expect: "Is expected to leave the hold and commence its approach",
    cite: "PANS-ATM, Chapter 1 — Definitions, \"Expected approach time\"",
    exp: `Expected approach time is defined as the time at which ATC expects that an arriving aircraft, following a delay, will leave the holding fix to complete its approach for a landing. Two traps sit in the other options. EAT is not the landing time — the approach still has to be flown after it. And the definition attaches to the holding fix, so it only has meaning when a delay and a hold exist; the note to the definition adds that the actual time of leaving the fix depends on the approach clearance.`,
  },
];

// ──────────────────────────────────────────────────────────────────────────
// FLAGGED — deliberately left as placeholders. Each of these has a marked
// answer that may well be right, but nothing on disk settles it, and an
// explanation written from memory is the guess this file exists to prevent.
//
// 1. WAKE TURBULENCE BEHAVIOUR (roughly 15 questions in this chapter: how
//    vortices form, which way they rotate, how they sink and drift, which wind
//    prolongs the hazard, where to touch down behind a heavy). PANS-ATM
//    Chapter 5.8 and Chapter 8.7.3.4 give the SEPARATION MINIMA only — the
//    minutes and the miles — and say nothing about vortex behaviour. The
//    physics is in ICAO Doc 9426 (Air Traffic Services Planning Manual) and in
//    national AIM-type guidance, neither of which is held. The separation
//    questions ARE answered above; the aerodynamics are not.
//
// 2. AIRSPACE CLASSIFICATION — what service each class A–G receives (several
//    questions, including "In class A airspace" and "In class D air space").
//    The classification table is ICAO Annex 11, Appendix 4. Annex 11 is NOT on
//    disk. AIP India ENR 1.4 carries the Indian classification and is free and
//    online (see the recipe in CLAUDE.md, note the SPACE in the filename) —
//    that is the route to closing these.
//
// 3. INDIAN-SPECIFIC RULES — "flights above FL150 must be IFR irrespective of
//    weather", the force-landing reporting questions, aerobatic heights and
//    aerodrome-vicinity limits. These come from Schedule IV of the Aircraft
//    Rules 1937 or from a DGCA CAR. The Aircraft Rules PDF held in
//    D:\pk\Telegram Desktop\ lists Schedule IV in its contents but does NOT
//    contain its text, and the DGCA portal is client-side rendered so a fetch
//    returns the shell. Blocked until the Captain supplies the CAR or the
//    schedule.
//
// 4. TAXIWAY HOLDING LINES, the black "C" on yellow, and other visual-aid
//    questions. ICAO Annex 14, not held.
//
// (An earlier draft of this list also flagged the ATS-route crossing angle as
// unsourceable. That was wrong — PANS-ATM 9.1.4.2.2.2 carries it, and both
// questions are answered above. The first search looked in the separation
// chapters; the rule lives in Chapter 9. Recorded here rather than quietly
// deleted, because the failure mode is the point: a narrow search that comes
// back empty reads exactly like a document that does not contain the rule.)
