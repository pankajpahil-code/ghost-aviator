// Declared answer-key corrections — the ONE place a key is changed on purpose.
//
// Why a layer and not an edit in the bank files: several of these questions
// also live in GENERATED files (lib/generated/*) that a rebuild would silently
// overwrite. Applying the correction here, at the two points every page reads
// from (ALL_QUESTIONS in lib/questions.ts and the past papers in
// lib/past-papers.ts), makes it survive regeneration and covers every copy.
//
// Guard: a correction is applied ONLY when the stem matches exactly, the
// currently keyed option text equals `was`, and an option with text `now`
// exists. If a bank is regenerated and the wording changes, nothing is
// silently re-pointed — `npx tsx tools/audit/check-corrections.mts` fails
// instead and names the entry.
//
// Source of every entry: tools/audit/air-regs-full-audit-2026-09-21.md
// (audited 2026-09-21; applied on Capt. Pahil's instruction "apply all").

export type AnswerCorrection = {
  q: string;    // exact question stem (as it stands in the bank)
  was: string;  // text of the option the bank currently keys
  now: string;  // text of the correct option AFTER any `edit` below
  exp: string;  // student-facing explanation, first sentence answers it
  // Optional rewrites for questions whose options no longer contain a right
  // answer (rule changed) or whose stem was ambiguous/damaged.
  edit?: { q?: string; opts?: Record<string, string> };  // opts: old text -> new text
  hide?: boolean;  // unanswerable / unsupported: removed from every page
};

export const ANSWER_CORRECTIONS: AnswerCorrection[] = [
  {
    q: "The pilot has to inform the ATC if the ETA changes by",
    was: "3 mins", now: "2 mins",
    exp: "Two minutes. If the time estimate for the next reporting point, FIR boundary or destination changes by more than two minutes from what ATC was given, the crew must tell ATC. Older books say three minutes; that figure has been replaced.\n\nReference: DGCA CAR Section 9 Series C Part I (Rules of the Air), 3.6.2.2 d)",
  },
  {
    q: "An aerial work aircraft on a VFR plan to Jaipur departs at 1032 hrs UTC. Sunset time at Jaipur is 1318 UTC. The flying time available to him to reach jaipur is :",
    was: "2 hrs & 46 minutes.", now: "3 hrs & 06",
    exp: "3 hours 06 minutes. In India VFR flights may operate from 20 minutes before sunrise to 20 minutes after sunset, so the VFR day at Jaipur ends at 1318 + 20 = 1338 UTC. From 1032 to 1338 is 3 h 06 min. Flying only to sunset (2 h 46) is the old rule.\n\nReference: DGCA CAR Section 9 Series C Part I (Rules of the Air), 4.3",
  },
  {
    q: "Regular amendments to the AIP will be:",
    was: "Once every year in the month of April of each year", now: "On as required basis",
    exp: "As required. The AIP is amended or reissued at whatever intervals are needed to keep it current; operationally significant changes are published on the 28-day AIRAC cycle. There is no once-a-year amendment.\n\nReference: DGCA CAR Section 9 Series I Part I (AIS), 6.2 and 6.3.1.1",
  },
  {
    q: "The maximum duty time limit per day extension is",
    was: "4 hrs", now: "2 hrs",
    exp: "Two hours. For unforeseen operational circumstances the Flight Duty Period may be extended by a maximum of 2 hours (flight time by 1 hour, one extra landing). The 4-hour figure belongs to the old FDTL scheme.\n\nReference: DGCA CAR Section 7 Series J Part III, 16.1",
  },
  {
    q: "The 2nd section of an air report contains",
    was: "Met Info", now: "ETA",
    exp: "ETA. An air-report has three sections: Section 1 is position information, Section 2 is operational information (ETA and endurance), and Section 3 is meteorological information.\n\nReference: ICAO Doc 4444 (PANS-ATM), 4.12",
  },
  {
    q: "For an aircraft having seating capacity of 215 passengers, number of cabin attendants required is_____.",
    was: "7", now: "5",
    exp: "Five. Above 50 seats the rule is two cabin crew plus one for each unit (or part of a unit) of 50 seats above a seating capacity of 99. 215 − 99 = 116, which is 3 part-units, so 2 + 3 = 5. Crew are counted on seats installed, not passengers carried.\n\nReference: Aircraft Rules 1937, Rule 38B(1)(iii)",
  },
  {
    q: "Incubation period for typhus is_________ days:",
    was: "5", now: "14",
    exp: "14 days. The rules fix the incubation period of each quarantinable disease: yellow fever 6, plague 6, cholera 5, smallpox 14, typhus 14, relapsing fever 8.\n\nReference: Aircraft (Public Health) Rules 1954, Rule 2(15)",
  },
  {
    q: "Prohibition of flights over Mathura refinery is:",
    was: "With in a radius of 10 Nms", now: "With in a radius of 10 km",
    exp: "Within a radius of 10 km. Schedule I lists the area within ten kilometres of the Mathura refineries as a prohibited area, ground to unlimited. The unit is kilometres, not nautical miles.\n\nReference: Aircraft Rules 1937, Schedule I (4); AIP India ENR 5.1",
  },
  {
    q: "A/C incident should be notified with in _______ hrs.",
    was: "48 hrs", now: "24 hrs",
    exp: "24 hours. Under the 2025 investigation rules the pilot-in-command (or owner/operator) must notify an accident OR an incident to the AAIB and DGCA not later than 24 hours after becoming aware of it. The older 48-hour figure for incidents no longer applies.\n\nReference: Aircraft (Investigation of Accidents and Incidents) Rules 2025, Rule 4(1)",
  },
  {
    q: "Wake turbulence is near maximum behind a jet transport just after takeoff because",
    was: "The engines are at maximum thrust output at slow air speed", now: "Of the high angle of attack and high gross weight",
    exp: "Because of the high angle of attack and high gross weight. Wingtip vortices are a by-product of lift, not of engine thrust, and they are strongest when the aircraft is heavy, clean and slow — exactly the condition just after take-off.\n\nReference: FAA Aeronautical Information Manual 7-4 (Wake Turbulence)",
  },
  {
    q: "Second section of “Air Report” contains:",
    was: "Met information.", now: "Operational Information",
    exp: "Operational information. Section 1 is position, Section 2 is operational information (ETA and endurance), Section 3 is meteorological information.\n\nReference: ICAO Doc 4444 (PANS-ATM), 4.12",
  },
  {
    q: "Under what circumstances should an aircraft giving way alter its course to the left?",
    was: "Only when overtaking on the ground", now: "Never",
    exp: "Never. Head-on in the air or on the ground, each aircraft turns right; an overtaking aircraft in the air alters to the right; on the ground the overtaking aircraft simply keeps well clear. No rule requires a turn to the left.\n\nReference: DGCA CAR Section 9 Series C Part I (Rules of the Air), 3.2.2.2, 3.2.2.4, 3.2.2.7.1",
  },
  {
    q: "HAT for Precision approaches Cat II is:",
    was: "50’", now: "100’",
    exp: "100 ft. A Category II operation has a decision height lower than 60 m (200 ft) but not lower than 30 m (100 ft). Anything below 100 ft is Category III.\n\nReference: DGCA CAR Section 8 Series C Part I (All Weather Operations)",
  },
  {
    q: "Oxygen is carried on board for crew members and passengers when atmospheric pressure will be less than:",
    was: "700 hPa", now: "620 hPa",
    exp: "620 hPa. Oxygen must be carried for ALL crew and passengers for any period the cabin pressure is below 620 hPa. Between 700 and 620 hPa the requirement is only all crew plus 10% of passengers, for periods over 30 minutes.\n\nReference: DGCA CAR Section 8 Series O Part II, 4.3.9.1",
  },
  {
    q: "The amount of fuel carried on board any propeller driven aeroplane at the commencement of a day VFR flight must be sufficient ,having regard to the meteorological conditions and foreseeable delays that are expected in flight , to fly to the destination aerodrome",
    was: "Then to a specified alternate and then for a period of 45 minutes at normal cruising speed.", now: "And then fly for a period of 30 minutes at normal cruising speed.",
    exp: "Destination, then 30 minutes. For a day VFR flight the fuel must cover the flight to the aerodrome of intended landing plus a final reserve of at least 30 minutes at normal cruising altitude. Destination + alternate + 45 minutes is the IFR requirement.\n\nReference: DGCA CAR Section 8 Series O Part III, 2.2.3.6 c)",
  },
  {
    q: "Flight to be operated in pressurized a/c, flight is not to commence unless oxygen is carried to supply:",
    was: "All crew when pressure below 700 hPa.", now: "All crew Passengers",
    exp: "All crew and passengers. A pressurised aeroplane must carry enough oxygen for all crew members AND passengers, in the event of loss of pressurisation, for any period the cabin pressure would be below 700 hPa.\n\nReference: DGCA CAR Section 8 Series O Part II, 4.3.9.2",
  },
  {
    q: "46 Runway threshold stripes are 8 on each side of central line of runway:",
    was: "30 m", now: "60 m",
    exp: "60 m. Eight stripes on EACH side is 16 stripes in total, which is the pattern for a 60 m wide runway (18 m: 4, 23 m: 6, 30 m: 8, 45 m: 12, 60 m: 16).\n\nReference: DGCA CAR Section 4 Series B Part I (Aerodromes), 5.2.4.5",
  },
  {
    q: "What is the principle objective of a rescue and firefighting service?",
    was: "To extinguish any fire with minimum delay", now: "To save lives",
    exp: "To save lives. Fighting the fire serves that aim — the service exists to create and maintain survivable conditions after an accident at or near the aerodrome.\n\nReference: DGCA CAR Section 4 Series B Part I (Aerodromes), 9.2",
  },
  {
    q: "A pilot has flown 120 hrs as p-i-c in last 29 consecutive days. He can fly _____ on 30th day:",
    was: "8 hrs as Supernumerary pilot", now: "6 hrs as co-pilot",
    exp: "6 hours as co-pilot. The limit is 125 hours in any 30 consecutive days, with PIC time counted in full and co-pilot or supernumerary time counted at 80%. After 120 hours, 5 remain: 6 h as co-pilot counts as 4.8 h (allowed); 8 h as supernumerary counts as 6.4 h (too much); 6 h as PIC is 6 h (too much).\n\nReference: Aircraft Rules 1937, Rule 42A and Explanation",
  },
  {
    q: "Green Light on an aircraft is visible if seen from the front",
    was: "At an arc of 110º to the port side", now: "At an arc of 110º to the starboard side",
    exp: "110° to the starboard (right) side. The red light covers 110° to the left, the green light 110° to the right, and the white tail light 70° either side of dead astern.\n\nReference: DGCA CAR Section 9 Series C Part I (Rules of the Air), Appendix 6",
  },
  {
    q: "Sun rise at Kalikut aerodrome is at 0550h. A VFR flight can take off from there at the earliest at:",
    was: "0550 h", now: "0530 h",
    exp: "0530. VFR flights may operate from 20 minutes before sunrise to 20 minutes after sunset, so the earliest VFR departure is 0550 − 20 = 0530.\n\nReference: DGCA CAR Section 9 Series C Part I (Rules of the Air), 4.3",
  },
  {
    q: "Oxygen is carried on board for all crew members and passengers when at atmospheric pressure will be less than:",
    was: "700 hPa", now: "620 hPa",
    exp: "620 hPa. Below 620 hPa oxygen is required for ALL crew and passengers. Between 700 and 620 hPa it is all crew plus 10% of passengers, for periods over 30 minutes.\n\nReference: DGCA CAR Section 8 Series O Part II, 4.3.9.1",
  },
  {
    q: "ATPL who is 28 years old, medical is valid for",
    was: "6 months", now: "1 yr",
    exp: "One year. The ATPL medical is valid for 12 months, reduced to 6 months only after the holder reaches 40.\n\nReference: Aircraft Rules 1937, Rule 39C",
  },
  {
    q: "Air report II section contains",
    was: "Air temp, icing, spot wind", now: "Operational information",
    exp: "Operational information (ETA and endurance). Air temperature, wind, icing and turbulence are Section 3, the meteorological section.\n\nReference: ICAO Doc 4444 (PANS-ATM), 4.12",
  },
  {
    q: "High noise level in a cockpit is a mismatch between:",
    was: "Liveware – Liveware.", now: "Liveware – Environment.",
    exp: "Liveware – Environment. Noise, temperature, humidity and vibration are part of the physical environment the pilot works in; soundproofing and air conditioning are the Liveware–Environment fixes. Liveware–Liveware is people with people.\n\nReference: SHELL model (Human Performance)",
  },
  {
    q: "Flickering light when reflected from helicopter blades or propellers of aircraft rotating at high RPM:",
    was: "Can not cause any harm, hence no action is required.", now: "Can cause Stroboscopic Vertigo, hence make frequent but small changes in RPM.",
    exp: "It can cause stroboscopic (flicker) vertigo. Light flickering at certain frequencies through rotor blades or propellers can cause nausea, dizziness and even convulsions; changing RPM changes the flicker rate.\n\nReference: Human Performance — flicker effect",
  },
  // ---- 2026-09-21 second batch: every FLAGGED item, checked against DGCA sources ----
  // hidden: stem damaged; no rule sets a highest flight level
  {"q": "The highest flight level that can be flown in is", "was": "460", "now": "460", "hide": true, "exp": ""},
  {"q": "The air report contains following items:", "was": "Air temperature, Turbulence, Upper winds & aircraft Icing & humidity", "now": "Air temperature, Turbulence, Upper winds & aircraft Icing", "exp": "Air temperature, turbulence, upper winds and icing - the meteorological section of the air-report.\n\nReference: ICAO Doc 4444 4.12", "edit": {"opts": {"Air temperature, Turbulence, Upper winds & aircraft Icing & humidity": "Air temperature, Turbulence, Upper winds & aircraft Icing"}}},
  // hidden: stem damaged
  {"q": "time of an Airport in calculated for an altitude of the Sun", "was": "0 degrees at the horizon", "now": "0 degrees at the horizon", "hide": true, "exp": ""},
  {"q": "What is the definition of MEA?", "was": "The lowest published altitude, which meets obstacle clearance requirements and assures acceptable navigational signal coverage.", "now": "The altitude for an en-route segment that provides adequate reception of navigation facilities and ATS communications, complies with the airspace structure and provides the required obstacle clearance.", "exp": "MEA is the altitude for an en-route segment that provides adequate reception of navigation facilities and ATS communications, complies with the airspace structure and provides the required obstacle clearance.\n\nReference: DGCA CAR Section 9 Series I Part I (definition of MEA)", "edit": {"opts": {"The lowest published altitude, which meets obstacle clearance requirements and assures acceptable navigational signal coverage.": "The altitude for an en-route segment that provides adequate reception of navigation facilities and ATS communications, complies with the airspace structure and provides the required obstacle clearance."}}},
  {"q": "Hazardous wake turbulence caused by aircraft in still air", "was": "May persist for two minutes or more", "now": "May persist for two minutes or more", "exp": "It may persist for two minutes or more. Vortices sink and decay slowly in still air, which is why wake-turbulence separations behind heavier aircraft are two to three minutes.\n\nReference: FAA AIM 7-4; ICAO Doc 4444 5.8"},
  {"q": "Two aircraft of the different category are approaching an airport for the purpose of landing. The right-of-way belongs to the aircraft", "was": "At the lower altitude, but the pilot shall not take advantage of this rule to cut in front of or to overtake the other aircraft", "now": "At the lower altitude, but the pilot shall not take advantage of this rule to cut in front of or to overtake the other aircraft", "exp": "The lower aircraft has right of way, but may not cut in or overtake an aircraft on final. The same rule applies whatever the category, with one exception: power-driven heavier-than-air aircraft always give way to gliders.\n\nReference: DGCA CAR Section 9 Series C Part I (Rules of the Air), 3.2.2.5.2"},
  {"q": "Number of threshold stripes on a runway of 25 m width shall be:", "was": "8", "now": "8", "exp": "8 stripes. The number of threshold stripes depends on runway width: 18 m 4, 23 m 6, 30 m 8, 45 m 12, 60 m 16.\n\nReference: DGCA CAR Section 4 Series B Part I, 5.2.4.5", "edit": {"q": "Number of threshold stripes on a runway of 30 m width shall be:"}},
  {"q": "FDTL for 2 crew international flight is ______ hrs and _____ landing.", "was": "9 hrs and 3 landings", "now": "2 landings", "exp": "2 landings. With 9 hours' flight time the maximum FDP is 13:00 and only 2 landings are allowed (8 h allows up to 6 landings at an 11:00 FDP; 10 h allows 1). The old domestic/international table no longer exists.\n\nReference: DGCA CAR Section 7 Series J Part III, 6.1", "edit": {"q": "Under the current DGCA FDTL CAR, a two-pilot crew flying the maximum flight time of 9 hours in 24 hours may make at most:", "opts": {"10 hrs and 3 landings": "1 landing", "Three hrs and 9 landings": "4 landings", "9 hrs and 3 landings": "2 landings", "8 hrs and 3 landings.": "3 landings"}}},
  {"q": "Anti-collision light is a light :", "was": "A red light visible 30deg above and below the horizon of the aircraft which is visible in all directions", "now": "A flashing red light intended to attract attention to the aircraft, visible in all directions", "exp": "A flashing red (or white) light that attracts attention to the aircraft and is visible in all directions. Anti-collision lights are required on all aeroplanes operated at night.\n\nReference: DGCA CAR Section 9 Series C Part I (Rules of the Air) 3.2.3; DGCA CAR Section 8 Series O Part II 6.10", "edit": {"opts": {"A red light visible 30deg above and below the horizon of the aircraft which is visible in all directions": "A flashing red light intended to attract attention to the aircraft, visible in all directions"}}},
  // hidden: default-minima table no longer exists in CAR 8-C-I
  {"q": "The visibility minima for those Airlines who have not filed their own Minima with the DGCA for an airport for Non Precession approach is:", "was": "3.7 km", "now": "3.7 km", "hide": true, "exp": ""},
  // hidden: no rule found on take-off after a forced landing
  {"q": "An aircraft force lands at an uncontrolled aerodrome, it can take off again:", "was": "Matter is to be reported to DGCA as an incident", "now": "Matter is to be reported to DGCA as an incident", "hide": true, "exp": ""},
  // hidden: 'trainee pilot' not defined in the FDTL CAR
  {"q": "The duty time of the trainee pilot:", "was": "is calculated as per the FDTL", "now": "is calculated as per the FDTL", "hide": true, "exp": ""},
  {"q": "The CVR has the capability of recording information", "was": "At least 30 minutes", "now": "At least the last 2 hours", "exp": "At least the last 2 hours. All CVRs must retain the information recorded during at least the last two hours of operation (25 hours for new large aeroplanes).\n\nReference: DGCA CAR Section 2 Series I Part VI, 4.3.1", "edit": {"opts": {"One hour or more": "At least the last 2 hours"}}},
  {"q": "The FDR is fitted in an aircraft to", "was": "a&b Both are correct", "now": "a&b Both are correct", "exp": "Both. The flight recorder exists to support accident and incident investigation, and its data is also used in the operator's flight data analysis programme to monitor performance.\n\nReference: DGCA CAR Section 8 Series O Part II (flight recorder definition, 3.3.2 FDAP)"},
  // hidden: colour-coded route designators are obsolete (CAR 9-E-I App 1 uses letters)
  {"q": "The designators for world wide ATS routes are in which colour", "was": "Red, Green, Blue, Amber & White", "now": "Red, Green, Blue, Amber & White", "hide": true, "exp": ""},
  {"q": "An aircraft can fly over a danger area", "was": "Out side the stipulated time", "now": "Out side the stipulated time", "exp": "Outside the stipulated time. A danger area is not closed to flight; dangerous activities may exist there only at specified times, which are promulgated.\n\nReference: DGCA CAR Section 9 Series C Part I (Rules of the Air), definition of Danger area"},
  // hidden: current FDTL CAR restricts training landings too; no option correct
  {"q": "FDTL for training flights does not restrict:", "was": "Number of landings", "now": "Number of landings", "hide": true, "exp": ""},
  {"q": "Taking simple medicine like ‘aspirin’ prior to a flight", "was": "May seriously impair judgment", "now": "May seriously impair judgment", "exp": "It may seriously impair judgement. Both prescribed and over-the-counter medicines can seriously degrade pilot performance; do not fly on any medication without medical advice.\n\nReference: FAA AIM 8-1-1", "edit": {"q": "Taking even a simple over-the-counter medicine before a flight:"}},
  // hidden: time is not a lateral separation; no such rule in Doc 4444
  {"q": "The lateral separation reqd. if an A/C is holding at a level", "was": "5 mins", "now": "5 mins", "hide": true, "exp": ""},
  // hidden: no current 'above 5700 kg' anti-collision rule; all aeroplanes at night need them
  {"q": "Anti-collision lights are required on aircraft above", "was": "5700 kgs", "now": "5700 kgs", "hide": true, "exp": ""},
  {"q": "Night flying hours can be logged between __________ mins after sunset to ________ mins before sunrise:", "was": "20 mins", "now": "30 mins", "exp": "30 minutes. For logging, 'flight by night' is from half an hour after sunset to half an hour before sunrise. (VFR operations use a different limit: 20 minutes.)\n\nReference: Aircraft Rules 1937, Schedule II para 4", "edit": {"opts": {"20 mins": "30 mins"}}},
  {"q": "The Min. Separation above F 290 is:", "was": "2000’", "now": "2000’", "exp": "2000 ft. Outside RVSM airspace the vertical separation above FL290 is 2000 ft; inside RVSM airspace (FL290-FL410) it is 1000 ft.\n\nReference: ICAO Doc 4444 5.3.2", "edit": {"q": "Outside RVSM airspace, the minimum vertical separation above FL 290 is:"}},
  // hidden: EET treatment of stopovers not settled by a held source
  {"q": "Estimated elapsed time A to B 1hr 15minutes. Estimated stopover time at B 30 minutes. Estimated elapsed time B to C 1 hr 20 minutes Using the above information, what time should be entered in the “Elapsed Time “ BOX OF VFR flight plan ?", "was": "3hrs 05minutes.", "now": "3hrs 05minutes.", "hide": true, "exp": ""},
  {"q": "The demolition of buildings and trees act came into effect in the year:", "was": "1994", "now": "1994", "exp": "1994. The original Aircraft (Demolition of Obstructions caused by Buildings and Trees etc.) Rules were notified in 1994; they have since been replaced by the 2026 Rules.\n\nReference: DGCA list of Rules (Demolition Rules 1994 / 2026)", "edit": {"q": "The original Aircraft (Demolition of Obstructions caused by Buildings and Trees etc.) Rules were notified in the year:"}},
  {"q": "Indian Airspace comes under ________ class of airspace.", "was": "D,E,F& G", "now": "C, D, E, F & G", "exp": "C, D, E, F and G. Classes A and B are designated but their implementation is still under consideration; controlled airspace uses C and D, ATS routes outside controlled airspace E and F, the rest G.\n\nReference: AIP India ENR 1.4", "edit": {"opts": {"D,E,F& G": "C, D, E, F & G"}}},
  {"q": "In separation between IFR and IFR is provided in ______ class of Airspace.", "was": "B", "now": "C, D & E", "exp": "C, D and E. IFR flights are separated from other IFR flights in Classes C, D and E (and A/B once implemented); Class F gives advisory service only.\n\nReference: AIP India ENR 1.4", "edit": {"opts": {"D& E": "C, D & E"}}},
  // hidden: default-minima table no longer exists in CAR 8-C-I
  {"q": "The visibility minima for take off, if the aerodrome is not equipped with radio nav aid is ______ km.", "was": "5 kms", "now": "5 kms", "hide": true, "exp": ""},
  {"q": "An Air-miss incident report made by radio (or) telephone must be confirmed with in _____ days.", "was": "7", "now": "1 day (within 24 hours)", "exp": "Within 24 hours. The Air Traffic Incident Report Form confirming a radio report must be submitted as promptly as possible after landing and in any case within 24 hours.\n\nReference: AIP India ENR 1.14, 5.1", "edit": {"opts": {"2": "1 day (within 24 hours)"}}},
  {"q": "‘Flight by night ‘means a flight performed between the periods of", "was": "20 mins after sunset to 20 mins before sunrise", "now": "30 mins after sunset to 30 mins before sunrise", "exp": "From 30 minutes after sunset to 30 minutes before sunrise.\n\nReference: Aircraft Rules 1937, Schedule II para 4 (Flight by night)", "edit": {"opts": {"20 mins after sunset to 20 mins before sunrise": "30 mins after sunset to 30 mins before sunrise"}}},
  // hidden: answer split across options by extraction
  {"q": "Which response is most correct with respect to wake turbulence?", "was": "Response", "now": "Response", "hide": true, "exp": ""},
  {"q": "Runway direction designator is:", "was": "QDM", "now": "QDM", "exp": "QDM. A runway designation is based on its magnetic direction, and QDM is the magnetic heading/bearing to a station or along a runway.\n\nReference: ICAO Q-code usage (runway direction = magnetic)"},
  // hidden: as #225
  {"q": "Anti collision light is read. for A/C whose AUW exceeds", "was": "5700 Kg", "now": "5700 Kg", "hide": true, "exp": ""},
  // hidden: time is not a lateral separation; no such rule in Doc 4444
  {"q": "Lateral separation between two aircraft, one climbing and another holding is", "was": "5 mins", "now": "5 mins", "hide": true, "exp": ""},
  {"q": "26 Second section of ‘Air Report’ contains", "was": "met information", "now": "operational information", "exp": "Operational information (ETA and endurance). Section 1 is position, Section 3 is meteorological information.\n\nReference: ICAO Doc 4444 4.12", "edit": {"opts": {"route information": "operational information"}}},
  // hidden: default-minima table no longer exists in CAR 8-C-I
  {"q": "For an operator who has not filed minima, visibility minima for take off, if the aerodrome is equipped with VOR is _______ Km:", "was": "3.7 kms", "now": "3.7 kms", "hide": true, "exp": ""},
  // hidden: no rule says the following aircraft shall climb
  {"q": "Two aircraft are on approach to land, the following aircraft shall:", "was": "Climb.", "now": "Climb.", "hide": true, "exp": ""},
  // hidden: VFR above FL290 is not permitted in India (CAR 9-C-I 4.4-4.5)
  {"q": "An aircraft cruising VFR in level flight above F 290 on a track of 290 deg M shall be flown at", "was": "F320, F360, F400, F440", "now": "F320, F360, F400, F440", "hide": true, "exp": ""},
  // hidden: as #225
  {"q": "Anit-collision light is required for a/c whose AUW exceeds:", "was": "5700 kg", "now": "5700 kg", "hide": true, "exp": ""},
  // hidden: chicken pox is not a quarantinable disease; no regulatory figure
  {"q": "Incubation period of Chicken Pox is:", "was": "14 days", "now": "14 days", "hide": true, "exp": ""},
  {"q": "The maximum permitted flight time for flight crew is:", "was": "1000 hours in the year up to the end of the month prior to the present flight", "now": "1000 hours in any 365 consecutive days", "exp": "1000 hours in any 365 consecutive days. The cumulative limits are 35/65/100/300/1000 hours over 7/14/28/90/365 days.\n\nReference: DGCA CAR Section 7 Series J Part III, 8", "edit": {"opts": {"1000 hours in the year up to the end of the month prior to the present flight": "1000 hours in any 365 consecutive days"}}},
  {"q": "A public transport aircraft shall not take-off unless the following minima for the departure airfield are satisfactory :", "was": "Cloud ceiling and RVR", "now": "Visibility or RVR (and cloud ceiling where necessary)", "exp": "Visibility or RVR, with cloud conditions where needed. Take-off minima are expressed as visibility or RVR limits; cloud ceiling is added only where obstacles must be seen and avoided.\n\nReference: DGCA CAR Section 8 Series C Part I, 1 and 14.1", "edit": {"opts": {"Cloud base and visibility": "Visibility or RVR (and cloud ceiling where necessary)"}}},
  {"q": "What is the minimum visibility requirement in under special VFR operation in Class D airspace below 10000 feet", "was": "Day- 1.5 Km when so prescribed by appropriate ATS authority.", "now": "1.5 km ground visibility", "exp": "Ground visibility of 1.5 km. Special VFR may be authorised in a control zone when the ground visibility is not less than 1500 m.\n\nReference: ICAO Doc 4444 7.14.1.3", "edit": {"opts": {"Day- 1.5 Km when so prescribed by appropriate ATS authority.": "1.5 km ground visibility"}}},
  {"q": "Avoiding wake turbulence is", "was": "The sole responsibility of the pilot.", "now": "A responsibility shared by both the pilot and ATC.", "exp": "A shared responsibility. ATC applies wake-turbulence separation minima to the flights covered by the rules, and where the responsibility rests with the pilot-in-command (e.g. visual approaches) ATC advises and the pilot keeps the spacing.\n\nReference: ICAO Doc 4444 5.8.1 and 7.4.1.6.1"},
  // hidden: as #225
  {"q": "Anti collision light is reqd. for A/C whose AUW exceeds", "was": "5700 Kg", "now": "5700 Kg", "hide": true, "exp": ""},
  {"q": "A VFR flt takes off from Jaipur at 1040 hrs for Ahmedabad. Sunset time at Ahmedabad is1232hrs. What is the maximum flying time available to the p-i-c to land at Ahmedabad?", "was": "1 hr and 52 mins", "now": "2 hrs 12 mins", "exp": "2 hours 12 minutes. VFR may continue until 20 minutes after sunset: 1232 + 20 = 1252; from 1040 to 1252 is 2 h 12 min.\n\nReference: DGCA CAR Section 9 Series C Part I (Rules of the Air), 4.3", "edit": {"opts": {"2 hrs 02 mins": "2 hrs 12 mins"}}},
  {"q": "Indian ATS Routes come under _______class of airspace:", "was": "A, B, C, & D", "now": "C, D, E, & F", "exp": "C, D, E and F. ATS routes inside controlled airspace are Class C or D; ATS route segments outside controlled airspace are Class E or F.\n\nReference: AIP India ENR 1.4", "edit": {"opts": {"D, E, F, & G": "C, D, E, & F"}}},
  {"q": "All the flights at night must be conducted in accordance with IFR.", "was": "Irrespective of weather condition and flight level.", "now": "Irrespective of weather condition and flight level.", "exp": "Yes - in India VFR is permitted only from 20 minutes before sunrise to 20 minutes after sunset, so night flights are IFR unless ATC exempts local or flying-club training flights.\n\nReference: DGCA CAR Section 9 Series C Part I (Rules of the Air) 4.3; AIP India ENR 1.2 3", "edit": {"q": "Except for local and training flights exempted by ATC, flights at night in India must be conducted in accordance with IFR:"}},
  {"q": "In night starts from", "was": "20 mts after sunset", "now": "30 mts after sunset", "exp": "30 minutes after sunset, for the Aircraft Rules definition of flight by night. (Do not confuse it with the VFR limit of 20 minutes after sunset.)\n\nReference: Aircraft Rules 1937, Schedule II para 4"},
  {"q": "Flight Duty Time can be extended by______ hrs in a day:", "was": "4 hrs", "now": "2 hrs", "exp": "2 hours. For unforeseen operational circumstances the FDP may be extended by a maximum of 2 hours (flight time by 1 hour).\n\nReference: DGCA CAR Section 7 Series J Part III, 16.1", "edit": {"opts": {"4 hrs": "2 hrs"}}},
  {"q": "International flight flying time in one day is restricted to_____ for flight crew:", "was": "9 hrs 3 landing", "now": "2 landings", "exp": "2 landings. With 9 hours' flight time the maximum FDP is 13:00 and only 2 landings are allowed (8 h allows up to 6 landings at an 11:00 FDP; 10 h allows 1). The old domestic/international table no longer exists.\n\nReference: DGCA CAR Section 7 Series J Part III, 6.1", "edit": {"q": "Under the current DGCA FDTL CAR, a two-pilot crew flying the maximum flight time of 9 hours in 24 hours may make at most:", "opts": {"9 hrs 3 landing": "2 landings", "6 hrs 4 landing": "4 landings", "8 hrs 4 landing": "1 landing", "8 hrs 3 landing .": "3 landings"}}},
  // hidden: answer split across options by extraction
  {"q": "A flight to be operated at altitudes at which the atmospheric pressure in personnel compartments will be less than 700 hpa should not be commenced unless sufficient stored breathing oxygen is carried to supply: all crew", "was": "compartments occupied by them will be less than 620 hPa.", "now": "compartments occupied by them will be less than 620 hPa.", "hide": true, "exp": ""},
  {"q": "For a VFR flight making approach at night, the approach will be", "was": "steeper than normal", "now": "shallower than normal", "exp": "Shallower than normal. With few visual cues at night (the black-hole effect) the pilot feels too high and tends to fly a shallow approach, landing short.\n\nReference: Human Performance - black-hole approach illusion"},
  {"q": "An aircraft on a reciprocal track will be separated by:", "was": "10 mins at the time levels are crossed", "now": "10 mins before and after the estimated time of passing", "exp": "Vertical separation for 10 minutes before and after the estimated time of passing, where lateral separation is not provided.\n\nReference: ICAO Doc 4444 5.4.2.2.3", "edit": {"opts": {"10 mins at the time levels are crossed": "10 mins before and after the estimated time of passing"}}},
  // hidden: answer split across options by extraction (same content as the cholera question kept elsewhere)
  {"q": "A person dies of cholera, his body can be brought to if: Packed in a wooden box. Cannot be brought.", "was": "impregnated with carbolic powder.", "now": "impregnated with carbolic powder.", "hide": true, "exp": ""},
  {"q": "RVR/DH for cat II ILS ops is:", "was": "350m/30m", "now": "300m/30m", "exp": "RVR 300 m / DH 30 m. Category II: decision height below 60 m but not below 30 m, RVR not less than 300 m.\n\nReference: DGCA CAR Section 8 Series C Part I (AWO)", "edit": {"opts": {"350m/30m": "300m/30m"}}},
  {"q": "RVR/DH minima cat III A MLS is:", "was": "200m/Nil", "now": "RVR below 300m / DH below 30m or no DH", "exp": "RVR below 300 m with DH below 30 m (or no DH). The current CAR no longer splits Category III into IIIA/IIIB.\n\nReference: DGCA CAR Section 8 Series C Part I (AWO)", "edit": {"q": "RVR/DH for Category III operations is:", "opts": {"200m/Nil": "RVR below 300m / DH below 30m or no DH"}}},
  {"q": "Indian airspace is classified as:", "was": "D,E,F,G", "now": "C, D, E, F, G", "exp": "C, D, E, F and G (Classes A and B designated, implementation under consideration).\n\nReference: AIP India ENR 1.4", "edit": {"opts": {"D,E,F,G": "C, D, E, F, G"}}},
  // hidden: answer split across options by extraction
  {"q": "The sensations which lead to spatial disorientation during instrument flight conditions:", "was": "instrument flight.", "now": "instrument flight.", "hide": true, "exp": ""},
  {"q": "CTA extends from:", "was": "At least 700’ from the surface of the earth to unlimited", "now": "A specified height (not less than 700’) above the surface to a specified upper limit", "exp": "From a specified height above the earth (not less than 200 m / 700 ft) to a specified upper limit.\n\nReference: DGCA CAR Section 9 Series C Part I (Rules of the Air) (definition of Control area); Annex 11 2.10.3", "edit": {"opts": {"At least 700’ from the surface of the earth to unlimited": "A specified height (not less than 700’) above the surface to a specified upper limit"}}},
  {"q": "Hypoxia can be controlled by:", "was": "Using oxygen above 5000 AMSL during night time", "now": "Using oxygen above 5000 AMSL during night time", "exp": "Using supplemental oxygen above 5,000 ft at night. Night vision is the first thing hypoxia degrades, so pilots are encouraged to use oxygen above 10,000 ft by day and above 5,000 ft at night.\n\nReference: FAA AIM 8-1-2"},
  {"q": "In Cat II ILS approach, what is DH & RVR?", "was": "100’ & upto 350m", "now": "100’ & RVR not less than 300m", "exp": "DH 100 ft and RVR not less than 300 m (Category II).\n\nReference: DGCA CAR Section 8 Series C Part I (AWO)", "edit": {"opts": {"100’ & upto 350m": "100’ & RVR not less than 300m"}}},
  {"q": "Met report contains", "was": "Air temp, turbulence, spot wind", "now": "Air temp, turbulence, wind", "exp": "Air temperature, turbulence and wind - the meteorological section of the air-report.\n\nReference: ICAO Doc 4444 4.12", "edit": {"opts": {"Air temp, turbulence, spot wind": "Air temp, turbulence, wind"}}},
  {"q": "The demolition of buildings and trees act was came into effect in year", "was": "1994", "now": "1994", "exp": "1994. The original Demolition Rules were notified in 1994 and have since been replaced by the 2026 Rules.\n\nReference: DGCA list of Rules (Demolition Rules 1994 / 2026)", "edit": {"q": "The original Aircraft (Demolition of Obstructions caused by Buildings and Trees etc.) Rules were notified in the year:"}},
  {"q": "Night flying hours can be logged between", "was": "20 mins after Sunset to 20 mins before", "now": "30 mins after sunset to 30 mins before sunrise", "exp": "30 minutes after sunset to 30 minutes before sunrise - the Aircraft Rules definition of flight by night used for logging.\n\nReference: Aircraft Rules 1937, Schedule II para 4", "edit": {"opts": {"20 mins after Sunset to 20 mins before": "30 mins after sunset to 30 mins before sunrise"}}},
  {"q": "International flying time in one day is:", "was": "9 hrs 3 landing", "now": "2 landings", "exp": "2 landings. With 9 hours' flight time the maximum FDP is 13:00 and only 2 landings are allowed (8 h allows up to 6 landings at an 11:00 FDP; 10 h allows 1). The old domestic/international table no longer exists.\n\nReference: DGCA CAR Section 7 Series J Part III, 6.1", "edit": {"q": "Under the current DGCA FDTL CAR, a two-pilot crew flying the maximum flight time of 9 hours in 24 hours may make at most:", "opts": {"8 hrs 4 landing": "4 landings", "8 hrs 3 landing": "3 landings", "9 hrs 3 landing": "2 landings", "6 hrs 4 landing": "1 landing"}}},
  {"q": "If you fly into Severe Turbulence which flight condition should you intend to maintain -", "was": "Constant Airspeed", "now": "Level flight attitude", "exp": "Level flight attitude. Slow to manoeuvring speed and hold a level attitude, accepting changes in altitude and speed.\n\nReference: FAA knowledge-test standard (turbulence penetration)", "edit": {"opts": {"Level flt Altitude": "Level flight attitude"}}},
  {"q": "En-route Altitude will be determined for each stage of the route by taking 1000 ft of Terrain clearance with in a width of:", "was": "20 Nms", "now": "20 Nms", "exp": "20 NM. DGCA's CAR on minimum flight altitudes states that published ATS routes provide at least 1000 ft clearance above the highest obstacle within the route width of 20 nautical miles.\n\nReference: DGCA CAR Section 9 Series R Part I, 1.2"},
  {"q": "Flt Duty Time in the event of being extended shall be limited to:", "was": "4 hrs", "now": "2 hrs", "exp": "2 hours - the maximum FDP extension for unforeseen operational circumstances.\n\nReference: DGCA CAR Section 7 Series J Part III, 16.1", "edit": {"opts": {"4 hrs": "2 hrs"}}},
  {"q": "Flt Crew on Domestic Flt, the Flt time should not exceed more than ______ and No. of landing restrictions is", "was": "8 hrs and 6 landings", "now": "8 hrs and 6 landings", "exp": "8 hours and 6 landings. For a two-pilot crew with 8 hours' flight time, up to 6 landings are allowed within an 11-hour FDP (fewer as the FDP gets longer).\n\nReference: DGCA CAR Section 7 Series J Part III, 6.1", "edit": {"q": "For a two-pilot crew, the maximum flight time and landings allowed within an 11-hour flight duty period are:"}},
  {"q": "Abrupt head movement during a prolonged constant rate turns in 1MC or simulated inst. conditions can cause:", "was": "Pilot Disorientation", "now": "Pilot Disorientation", "exp": "Spatial disorientation (the Coriolis illusion: a false sensation of rotation in a different axis).\n\nReference: FAA AIM 8-1-5", "edit": {"opts": {"Illusion of rotation or movement in an entirely different axis": "Improved sense of orientation"}}},
  {"q": "Take off Alternate Aerodrome shall be located from the Aerodrome of departure not more than a distance equal to the Flt of______ with one engine inoperative cruise speed.", "was": "1 hr for 2 Eng A/c and 2 hrs or more for 3 Eng or more than 3 Eng A/c", "now": "1 hr for 2 Eng A/c and 2 hrs or more for 3 Eng or more than 3 Eng A/c", "exp": "One hour for two-engine aeroplanes at one-engine-inoperative cruise speed; two hours for three or more engines at all-engines cruise speed.\n\nReference: DGCA CAR Section 8 Series O Part II, 4.3.4.1.2", "edit": {"q": "A take-off alternate aerodrome shall be located from the aerodrome of departure within a flight time of:"}},
  // hidden: absolute legal claim with no statute behind it
  {"q": "While force landing an aircraft in a field due to engine failure, one person is killed on ground P-i-C can be prosecuted for", "was": "cannot be prosecuted", "now": "cannot be prosecuted", "hide": true, "exp": ""},
  {"q": "Flight Duty time is calculated based on:", "was": "From the time you report for the duty till 15 minutes after switch off.", "now": "From reporting for duty until engines off at the end of the last flight", "exp": "From reporting for duty until engines off at the end of the last flight.\n\nReference: DGCA CAR Section 7 Series J Part III (definition of Flight Duty Period)", "edit": {"opts": {"From the time you report for the duty till 15 minutes after switch off.": "From reporting for duty until engines off at the end of the last flight"}}},
  {"q": "ATPL medical fitness and license validity period is", "was": "six months & two years", "now": "12 months (6 months after age 40) & 10 years", "exp": "Medical 12 months (6 months after age 40); licence 10 years since the 2023 amendment.\n\nReference: Aircraft Rules 1937, Rule 39C (as amended by G.S.R. 733(E), 2023)", "edit": {"opts": {"six months & two years": "12 months (6 months after age 40) & 10 years"}}},
  {"q": "On PAPI approach, if a pilot sees 3 lights white and green, the aircraft is", "was": "slightly high", "now": "slightly high", "exp": "Slightly high. One red and three white means slightly above the approach slope; two and two is on slope.\n\nReference: DGCA CAR Section 4 Series B Part I, 5.3.5", "edit": {"q": "On a PAPI approach, if a pilot sees three white lights and one red, the aircraft is"}},
  {"q": "MDA is calculated for:", "was": "both", "now": "both", "exp": "Both. MDA/H is used for non-precision (2D) approaches and for circling approaches.\n\nReference: DGCA CAR Section 8 Series C Part I (definition of MDA/H)", "edit": {"opts": {"non-precision approach &": "Non-precision approaches"}}},
  {"q": "Registration of an aircraft is valid for:", "was": "Till it is destroyed in an accident", "now": "Till the date indicated on the Certificate of Registration", "exp": "Until the date indicated on the certificate. The Certificate of Registration is valid from the date of registration till the date printed on it.\n\nReference: DGCA CAR Section 2 Series F Part I, 7.3", "edit": {"opts": {"Till it is destroyed in an accident": "Till the date indicated on the Certificate of Registration"}}},
  {"q": "Succession of command is given by:", "was": "The operator to pilots by a circular", "now": "The operator, in the Operations Manual", "exp": "By the operator, in the Operations Manual, which must designate the succession of command for each route.\n\nReference: Aircraft Rules 1937, Rule 140B(2)(b)", "edit": {"opts": {"The operator to pilots by a circular": "The operator, in the Operations Manual"}}},
  {"q": "Flt plan is to be filed in in respect of:", "was": "All flts other than local flts", "now": "All flights, including local flights", "exp": "All flights, including local flights. Every flight in Indian airspace must be notified to ATS; flying-club training flights in the ATZ may file by fax or telephone.\n\nReference: AIP India ENR 1.10, 1.1 and 2.4.2", "edit": {"opts": {"All flts other than local flts": "All flights, including local flights"}}},
  {"q": "To overcome severe turbulence pilot should maintain", "was": "Constant airspeed", "now": "Constant flt attitude", "exp": "Constant attitude. In severe turbulence slow to manoeuvring speed and hold a level flight attitude; accept the changes in height and speed, because chasing altitude overstresses the aircraft.\n\nReference: FAA knowledge-test standard (turbulence penetration)"},
  // hidden: colour-coded route designators are obsolete
  {"q": "Route designator for domestic routes is:", "was": "White", "now": "White", "hide": true, "exp": ""},
  {"q": "ARP is at the:", "was": "Geometric centre of an aerodrome", "now": "Near the initial or planned geometric centre of the aerodrome", "exp": "Near the geometric centre of the aerodrome, where it normally stays once established.\n\nReference: DGCA CAR Section 4 Series B Part I, 2.2.2", "edit": {"opts": {"Geometric centre of an aerodrome": "Near the initial or planned geometric centre of the aerodrome"}}},
  {"q": "In Cat II, What is DH & RVR?", "was": "100’ & upto 350m", "now": "100’ & RVR not less than 300m", "exp": "DH 100 ft and RVR not less than 300 m (Category II).\n\nReference: DGCA CAR Section 8 Series C Part I (AWO)", "edit": {"opts": {"100’ & upto 350m": "100’ & RVR not less than 300m"}}},
  {"q": "Validity of ATPL medical and licence is", "was": "6 months and 2 years", "now": "12 months (6 months after age 40) and 10 years", "exp": "Medical 12 months (6 months after age 40); licence 10 years since the 2023 amendment.\n\nReference: Aircraft Rules 1937, Rule 39C (as amended by G.S.R. 733(E), 2023)", "edit": {"opts": {"6 months and 2 years": "12 months (6 months after age 40) and 10 years"}}},
  {"q": "An aircraft incident and accident is to be reported within", "was": "incident 48 hrs, accident 24 hours", "now": "Both incident and accident within 24 hours", "exp": "Both within 24 hours. Accidents and incidents must be notified to AAIB and DGCA not later than 24 hours after the person becomes aware of them.\n\nReference: Aircraft (Investigation of Accidents and Incidents) Rules 2025, Rule 4(1)", "edit": {"opts": {"incident 12 hrs, accident 24 hours": "Both incident and accident within 24 hours"}}},
  {"q": "PIC of an aeroplane shall", "was": "All above is correct", "now": "All above is correct", "exp": "All of the above. The PIC is responsible for the operation and safety of the aircraft and everyone on board, and for maintaining good order and discipline.\n\nReference: DGCA CAR Section 9 Series C Part I (Rules of the Air), 2.3; Aircraft Rules 1937, Rules 22-23"},
  {"q": "An operator can designate as a PIC of an aeroplane only if", "was": "He has made 3 take offs and landings on the aerodromes along the route within the last 3 months", "now": "He has made at least 3 take-offs and landings on the type within the preceding 90 days", "exp": "At least 3 take-offs and landings on the type within the preceding 90 days.\n\nReference: DGCA CAR Section 8 Series O Part II, 9.4.1.1", "edit": {"opts": {"He has made 3 take offs and landings on the aerodromes along the route within the last 3 months": "He has made at least 3 take-offs and landings on the type within the preceding 90 days"}}},
  {"q": "An operator can designate as a PIC of an aeroplane if", "was": "He has flown as a copilot of an aeroplane along the route for minimum of last 12 months", "now": "He has made at least one trip over the route within the preceding 12 months", "exp": "He has made at least one trip over the route within the preceding 12 months.\n\nReference: DGCA CAR Section 8 Series O Part II, 9.4.3", "edit": {"opts": {"He has flown as a copilot of an aeroplane along the route for minimum of last 12 months": "He has made at least one trip over the route within the preceding 12 months"}}},
  // hidden: answer split across options by extraction
  {"q": "A turbojet aircraft is required to carry minimum amount of fuel as", "was": "fuel for take off taxi holding and landing, plus 30 minutes of reserve", "now": "fuel for take off taxi holding and landing, plus 30 minutes of reserve", "hide": true, "exp": ""},
  {"q": "To acquire a valid a test for flight data recorder, at least 1hr of the data should be deleted", "was": "The oldest accumulated data at the time of testing should be erased.", "now": "The oldest recorded data at the time of testing may be erased", "exp": "The oldest recorded data at the time of testing may be erased. A total of one hour of data may be erased for testing, and it must be the oldest data accumulated.\n\nReference: 14 CFR 121.343(h)"},
  {"q": "At runway and taxiway holding lines:", "was": "While dashes lie towards nearest runway.", "now": "Yellow dashed lines lie towards the runway.", "exp": "The dashed lines face the runway. A runway-holding position marking has two solid and two dashed yellow lines; the solid lines are on the side where the aircraft holds.\n\nReference: DGCA CAR Section 4 Series B Part I 5.2.10; FAA AIM 2-3-5", "edit": {"opts": {"White dashes lie towards nearest runway.": "Yellow dashed lines lie towards the runway.", "While dashes lie towards nearest runway.": "White dashed lines lie towards the taxiway."}}},
  // hidden: no rule sets a 30-minute diversion intimation
  {"q": "You have diverted your flt to field alternate. In what time you have to intimate to your original destination:", "was": "30 min", "now": "30 min", "hide": true, "exp": ""},
  // hidden: no rule sets a 30-minute diversion intimation
  {"q": "On x-country flt you divert to another aerodrome, you have to inform ATC if delayed by:", "was": "30 min", "now": "30 min", "hide": true, "exp": ""},
  {"q": "time is 0550 hrs VFR flt can take off at", "was": "0550 hrs", "now": "0530 hrs", "exp": "0530. VFR flights may start 20 minutes before sunrise: 0550 - 20 = 0530.\n\nReference: DGCA CAR Section 9 Series C Part I (Rules of the Air), 4.3", "edit": {"opts": {"0535 hrs": "0530 hrs"}}},
  {"q": "time 0550 there is no night flying facilities, earliest departure can be at:", "was": "0520", "now": "0520", "exp": "0520. For the Aircraft Rules, 'night' runs from half an hour after sunset to half an hour before sunrise; with no night facilities the earliest departure is 0550 - 30 = 0520.\n\nReference: Aircraft Rules 1937, Schedule II para 4"},
  {"q": "Flight plan is required", "was": "For all flights except local flights.", "now": "For all flights, including local flights.", "exp": "For all flights, including local flights (flying-club local flights may file by fax or telephone).\n\nReference: AIP India ENR 1.10, 1.1 and 2.4.2", "edit": {"opts": {"For all flights except local flights.": "For all flights, including local flights."}}},
  {"q": "Amendment to aircraft rules 1937 is given in:", "was": "AIC", "now": "Gazette of India (with advance notice by AIC)", "exp": "Amendments to the Aircraft Rules are notified in the Gazette of India; an AIC gives advance notice of major legislative changes.\n\nReference: AIP India GEN 3.1 (AIC); Aircraft Rules amendments (G.S.R. notifications)", "edit": {"opts": {"AIC": "Gazette of India (with advance notice by AIC)"}}},
  {"q": "Cat II ILS approach", "was": "Decision height lower than 60 m (200 ft), but not lower than 30 m (100ft), and a runway visual range not less than 350 m.", "now": "Decision height lower than 60 m (200 ft), but not lower than 30 m (100ft), and a runway visual range not less than 300 m.", "exp": "DH lower than 60 m (200 ft) but not lower than 30 m (100 ft), and RVR not less than 300 m.\n\nReference: DGCA CAR Section 8 Series C Part I (AWO)", "edit": {"opts": {"Decision height lower than 60 m (200 ft), but not lower than 30 m (100ft), and a runway visual range not less than 350 m.": "Decision height lower than 60 m (200 ft), but not lower than 30 m (100ft), and a runway visual range not less than 300 m."}}},
  {"q": "Oxygen supply is required for cabin pressure below 700 hPa:", "was": "All passengers and crew", "now": "All passengers and crew", "exp": "All passengers and crew. A pressurised aeroplane must carry oxygen for all crew and passengers for any period the cabin pressure would be below 700 hPa after a loss of pressurisation.\n\nReference: DGCA CAR Section 8 Series O Part II, 4.3.9.2", "edit": {"q": "In a pressurised aeroplane, oxygen for loss of pressurisation must be carried below 700 hPa for:"}},
  {"q": "Outside controlled airspace above 3000’AMSL", "was": "Fly on 1013.2", "now": "Fly on 1013.2", "exp": "Fly on 1013.2 hPa. VFR flights above 3000 ft from the ground fly the cruising levels of the flight-level table, which are set on the standard pressure 1013.2 hPa.\n\nReference: AIP India ENR 1.7 para 4.1"},
  {"q": "To counter turbulence:", "was": "Maintain airspeed", "now": "Maintain a level flight attitude", "exp": "Maintain a level flight attitude (at manoeuvring speed), accepting height and speed changes.\n\nReference: FAA knowledge-test standard (turbulence penetration)", "edit": {"opts": {"Maintain altitude": "Maintain a level flight attitude"}}},
  {"q": "Certificate of registration is valid till", "was": "A/c is destroyed in an accident.", "now": "The date indicated on the Certificate of Registration", "exp": "The date indicated on the certificate.\n\nReference: DGCA CAR Section 2 Series F Part I, 7.3", "edit": {"opts": {"A/c is destroyed in an accident.": "The date indicated on the Certificate of Registration"}}},
  {"q": "International flying time in one day for flight Crew is:", "was": "9 hrs 3 landing", "now": "2 landings", "exp": "2 landings. With 9 hours' flight time the maximum FDP is 13:00 and only 2 landings are allowed (8 h allows up to 6 landings at an 11:00 FDP; 10 h allows 1). The old domestic/international table no longer exists.\n\nReference: DGCA CAR Section 7 Series J Part III, 6.1", "edit": {"q": "Under the current DGCA FDTL CAR, a two-pilot crew flying the maximum flight time of 9 hours in 24 hours may make at most:", "opts": {"8 hrs 4 landing": "4 landings", "8 hrs 3 landing": "3 landings", "9 hrs 3 landing": "2 landings", "6 hrs 4 landing.": "1 landing"}}},
  {"q": "A certificate of registration is valid from the date of registration to.", "was": "Till the aircraft is destroyed in an accident", "now": "Till the date indicated on the Certificate of Registration", "exp": "Till the date indicated on the certificate.\n\nReference: DGCA CAR Section 2 Series F Part I, 7.3", "edit": {"opts": {"Till the aircraft is destroyed in an accident": "Till the date indicated on the Certificate of Registration"}}},
  {"q": "IFR flight within controlled airspace shall immediately report any deviations from flight plan resulting in;", "was": "All above are correct", "now": "All above are correct", "exp": "All of the above: a TAS change of ±10 kt (or Mach 0.02), an ETA change of more than 2 minutes, and any change to the flight plan.\n\nReference: DGCA CAR Section 9 Series C Part I (Rules of the Air), 3.6.2.2", "edit": {"opts": {"Variation of TAS by 5%": "Variation of TAS by 10 kt (or Mach 0.02) or more", "Change in ETA over reporting point by more then 3 minutes": "Change in ETA over reporting point by more than 2 minutes"}}},
  {"q": "The aerodrome at is not declared suitable for night operations. If the sunrise is at 0550 the earliest time by which an aircraft operation at the station can take place is;", "was": "0520", "now": "0520", "exp": "0520. With no night facilities the aerodrome cannot be used by night, and for the Aircraft Rules night ends half an hour before sunrise: 0550 - 30 = 0520.\n\nReference: Aircraft Rules 1937, Schedule II para 4"},
  {"q": "The responsibility for control of departing aircraft will be transferred from aerodrome control to approach control when IMC is prevailing;", "was": "Immediately before the aircraft enters the runway in use for take off.", "now": "Immediately after the aircraft is airborne.", "exp": "Immediately after the aircraft is airborne. In IMC, control of a departing aircraft passes from aerodrome control to approach control immediately after it becomes airborne.\n\nReference: ICAO Doc 4444 4.3.2.1.3 b)", "edit": {"opts": {"Immediately before the aircraft enters the runway in use for take off.": "Immediately after the aircraft is airborne."}}},
  {"q": "The flight crew consists of pilot and copilot on an international flight. The flight time should not exceed more than ___ number of landings restricted to _____.", "was": "9 hrs & 3 landings", "now": "2 landings", "exp": "2 landings. With 9 hours' flight time the maximum FDP is 13:00 and only 2 landings are allowed (8 h allows up to 6 landings at an 11:00 FDP; 10 h allows 1). The old domestic/international table no longer exists.\n\nReference: DGCA CAR Section 7 Series J Part III, 6.1", "edit": {"q": "Under the current DGCA FDTL CAR, a two-pilot crew flying the maximum flight time of 9 hours in 24 hours may make at most:", "opts": {"8 hrs & 4 landings": "4 landings", "9 hrs & 3 landings": "2 landings", "8 hrs & 3 landings": "3 landings", "6 hrs & 4 landings": "1 landing"}}},
  {"q": "The take off alternate aerodrome shall be located from the aerodrome of departure, not more than a distance equivalent to a flight time of:", "was": "One hour for a two engine aero plane and 2 hour for 3 or more engines aero plane.", "now": "One hour for a two engine aero plane and 2 hour for 3 or more engines aero plane.", "exp": "One hour for two-engine aeroplanes (at one-engine-inoperative cruise speed) and two hours for three or more engines (at all-engines cruise speed).\n\nReference: DGCA CAR Section 8 Series O Part II, 4.3.4.1.2"},
  {"q": "If you fly into severe turbulence, which flight condition should you attempt to maintain:", "was": "Constant air speed (VA)", "now": "Level flight attitude", "exp": "Level flight attitude. Slow to manoeuvring speed (VA) and hold a level attitude, accepting changes in altitude and airspeed; trying to hold altitude or speed overstresses the aircraft.\n\nReference: FAA knowledge-test standard (turbulence penetration)"},
  {"q": "Enroute altitude will be determined for each stage of the route by taking 1000 ft terrain clearance within:", "was": "20 nm", "now": "20 nm", "exp": "20 NM. Minimum flight altitudes on ATS routes give at least 1000 ft clearance above the highest obstacle within the route width of 20 nautical miles.\n\nReference: DGCA CAR Section 9 Series R Part I, 1.2"},
  {"q": "A flight plan is required to be submitted to the appropriate ATS unit for", "was": "All flights other then local flights", "now": "All flights, including local flights", "exp": "All flights, including local flights.\n\nReference: AIP India ENR 1.10, 1.1 and 2.4.2", "edit": {"opts": {"All flights other then local flights": "All flights, including local flights"}}},
  {"q": "Flight duty time if inevitably extended, will be limited to:", "was": "4 hrs", "now": "2 hrs", "exp": "2 hours - the maximum FDP extension for unforeseen operational circumstances.\n\nReference: DGCA CAR Section 7 Series J Part III, 16.1", "edit": {"opts": {"4 hrs": "2 hrs"}}},
  {"q": "In a category D airspace, ATC will provide separation between:", "was": "request to IFR flights and traffic information to VFR flights", "now": "IFR flights and IFR flights", "exp": "IFR flights from IFR flights. In Class D, IFR flights are separated from other IFR flights; VFR flights receive traffic information only.\n\nReference: AIP India ENR 1.4 (Class D)"},
  {"q": "CO poisoning symptoms:", "was": "Loss of muscular power.", "now": "Loss of muscular power.", "exp": "Loss of muscular power is one of the symptoms of CO poisoning, along with headache and tightness across the forehead, dizziness and impaired judgement.\n\nReference: Human Performance - carbon monoxide poisoning", "edit": {"opts": {"Tightening of forehead.": "Improved alertness."}}},
  {"q": "The State has to notify the Council of ICAO if a state finds that it is impracticable to comply with an International Standard. The notice period is:", "was": "It shall give 60 days notice to ICAO of the differences between its own practices and the International Standard", "now": "It shall give immediate notice to ICAO", "exp": "Immediately. A State that finds it impracticable to comply with an International Standard must give immediate notification to ICAO; the 60-day period applies to amendments to Standards.\n\nReference: Chicago Convention, Article 38"},
  {"q": "Inefficient warning system in the cockpit is a mismatch between:", "was": "Liveware – Software.", "now": "Liveware – Hardware.", "exp": "Liveware - Hardware. Displays, controls and warning systems belong to the design of the flight deck, which is the Hardware of the SHELL model.\n\nReference: SHELL model (Human Performance)", "edit": {"opts": {"Liveware – Software.": "Liveware – Hardware."}}},
  {"q": "Introducing Automation in a cockpit:", "was": "Generally relocates potential for error and increases workload.", "now": "Generally relocates potential for error and changes the nature of workload.", "exp": "It relocates the potential for error and changes the workload rather than simply reducing it - automation creates new kinds of error.\n\nReference: Human Performance - automation", "edit": {"opts": {"Generally relocates potential for error and increases workload.": "Generally relocates potential for error and changes the nature of workload."}}},
  {"q": "Categories of errors defined by TEM are:", "was": "Intentional non-compliance error, Procedural error, Communication error, Proficiency error and Operational decision error.", "now": "Intentional non-compliance error, Procedural error, Communication error, Proficiency error and Operational decision error.", "exp": "Intentional non-compliance, procedural, communication, proficiency and operational decision errors - the five error types of the LOSA/TEM classification.\n\nReference: Threat and Error Management (LOSA)"},
  {"q": "Operational Threats outside the control of flight crew are:", "was": "Time pressure, Irregular operations, Flight diversions, Missed approaches etc.", "now": "Time pressure, Irregular operations, Flight diversions, Missed approaches etc.", "exp": "Time pressure, irregular operations, diversions and missed approaches are operational threats that arise outside the crew's control; weather, terrain and airport conditions are classed as environmental threats.\n\nReference: Threat and Error Management (LOSA)"},
  {"q": "Generally, active pilots should not donate blood, because:", "was": "The effects at ground level are minimal, flying during this period may entail a risk.", "now": "The effects at ground level are minimal, flying during this period may entail a risk.", "exp": "Because the effects at ground level are minimal but flying soon after donating may carry a risk of faintness; aircrew should not fly for at least 24 hours after giving blood.\n\nReference: Human Performance - blood donation and aircrew"},
  // hidden: no option correct (hyperventilation lowers CO2)
  {"q": "During an extensive gym work out one experiences:", "was": "Hyperventilation due to excessive CO₂ in blood.", "now": "Hyperventilation due to excessive CO₂ in blood.", "hide": true, "exp": ""},
  {"q": "A pilot, climbing in a non-pressurized aircraft and without using supplemental oxygen will pass the \"critical threshold\" at approximately:", "was": "22,000 feet.", "now": "20,000 feet.", "exp": "About 20,000 ft. The critical zone of hypoxia begins above 20,000 ft, where consciousness can be lost in minutes.\n\nReference: Human Performance - stages of hypoxia", "edit": {"opts": {"22,000 feet.": "20,000 feet."}}},
  {"q": "Otis Barotraumas is due to stretching of the ear drum caused by:", "was": "The expansion and contraction of gases trapped in the inner ear by a blocked Eustachian tube.", "now": "The expansion and contraction of gases trapped in the middle ear by a blocked Eustachian tube.", "exp": "Gas trapped in the MIDDLE ear by a blocked Eustachian tube expands and contracts with pressure changes, stretching the ear drum.\n\nReference: Human Performance - the ear", "edit": {"opts": {"The expansion and contraction of gases trapped in the inner ear by a blocked Eustachian tube.": "The expansion and contraction of gases trapped in the middle ear by a blocked Eustachian tube."}}},
  {"q": "Flying Cessna 172 at 6,000 feet without heaters on, you feel sick, suffer blurred vision and feel weak. The most probable reason could be due to:", "was": "Low BP resulting in Ischemic hypoxia/stagnant hypoxia, taking 100% oxygen doesn't help.", "now": "Low BP resulting in Ischemic hypoxia/stagnant hypoxia, taking 100% oxygen doesn't help.", "exp": "Low blood pressure causing stagnant (ischaemic) hypoxia - the blood itself carries enough oxygen, so breathing 100% oxygen does not cure it.\n\nReference: Human Performance - types of hypoxia"},
  {"q": "Alcohol leaves the body at an average rate of:", "was": "0.015 g/100 mL/hour, for men, this is usually a rate of about one standard drink per hour.", "now": "0.015 g/100 mL/hour, for men, this is usually a rate of about one standard drink per hour.", "exp": "About 0.015 g/100 mL per hour - roughly one standard drink per hour; nothing speeds it up.\n\nReference: Human Performance - alcohol"},
  {"q": "Barotrauma is caused by:", "was": "The trapped gases inside the outer ear, which cause damage to the ossicles or the ear drum.", "now": "The trapped gases inside the middle ear, which cause pain and can damage the ear drum.", "exp": "Gas trapped in the middle ear (behind the ear drum) expands and contracts with pressure change and can damage the ear drum.\n\nReference: Human Performance - the ear", "edit": {"opts": {"The trapped gases inside the outer ear, which cause damage to the ossicles or the ear drum.": "The trapped gases inside the middle ear, which cause pain and can damage the ear drum."}}},
  {"q": "Breathing 100% oxygen will lift the pilot's physiological safe altitude to approximately:", "was": "38,000 ft.", "now": "40,000 ft.", "exp": "About 40,000 ft. Breathing 100% oxygen gives sea-level equivalence up to about 33,700 ft and the equivalent of 10,000 ft air at about 40,000 ft.\n\nReference: Human Performance - oxygen thresholds", "edit": {"opts": {"38,000 ft.": "40,000 ft."}}},
  {"q": "Night vision can be affected by:", "was": "Age, hypoxia, altitudes above 8,000 ft, smoking and alcohol.", "now": "Age, hypoxia, altitudes above 5,000 ft, smoking and alcohol.", "exp": "Age, hypoxia, altitudes above 5,000 ft, smoking and alcohol all reduce night vision.\n\nReference: FAA AIM 8-1-6", "edit": {"opts": {"Age, hypoxia, altitudes above 8,000 ft, smoking and alcohol.": "Age, hypoxia, altitudes above 5,000 ft, smoking and alcohol."}}},
  {"q": "\"Oxygen moves from the alveoli into the blood and from the blood into the tissues\" this phenomenon is explained by:", "was": "Graham's law.", "now": "Fick's law.", "exp": "Fick's law: gas transfer is proportional to the area and the partial-pressure difference and inversely proportional to the thickness of the membrane.\n\nReference: Human Performance - respiration", "edit": {"opts": {"Graham's law.": "Fick's law."}}},
  {"q": "Bright runway / app. lights give illusion of being:", "was": "Low, resulting in high approaches.", "now": "Closer to the runway than it is, resulting in high approaches.", "exp": "Closer to the runway than it really is, leading to a high approach.\n\nReference: FAA AIM 8-1-5 (bright lights: illusion of less distance)", "edit": {"opts": {"Low, resulting in high approaches.": "Closer to the runway than it is, resulting in high approaches."}}},
];

type Keyed = { q: string; opts: string[]; ans: number; exp?: string };

// Option text compared without trailing full stops / whitespace, because the
// same option is printed "2 mins" in one paper and "2 mins." in another.
export const sameOption = (a: string | undefined, b: string) =>
  a !== undefined && a.trim().replace(/[.\s]+$/, "") === b.trim().replace(/[.\s]+$/, "");

// Apply every correction whose guard passes. Returns new objects; inputs untouched.
export function applyAnswerCorrections<T extends Keyed>(qs: T[]): T[] {
  return qs.flatMap((x) => {
    const c = ANSWER_CORRECTIONS.find((k) => k.q === x.q && sameOption(x.opts[x.ans], k.was));
    if (!c) return [x];
    if (c.hide) return [];
    const map = c.edit?.opts ?? {};
    const opts = x.opts.map((o) => {
      const hit = Object.keys(map).find((k) => sameOption(o, k));
      return hit ? map[hit] : o;
    });
    const idx = opts.findIndex((o) => sameOption(o, c.now));
    if (idx < 0) return [x];
    return [{ ...x, q: c.edit?.q ?? x.q, opts, ans: idx, exp: c.exp }];
  });
}
