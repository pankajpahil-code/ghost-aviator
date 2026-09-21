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
  q: string;    // exact question stem
  was: string;  // text of the option the bank keyed (wrong)
  now: string;  // text of the option that is correct
  exp: string;  // student-facing explanation, first sentence answers it
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
];

type Keyed = { q: string; opts: string[]; ans: number; exp?: string };

// Option text compared without trailing full stops / whitespace, because the
// same option is printed "2 mins" in one paper and "2 mins." in another.
export const sameOption = (a: string | undefined, b: string) =>
  a !== undefined && a.trim().replace(/[.\s]+$/, "") === b.trim().replace(/[.\s]+$/, "");

// Apply every correction whose guard passes. Returns new objects; inputs untouched.
export function applyAnswerCorrections<T extends Keyed>(qs: T[]): T[] {
  return qs.map((x) => {
    const c = ANSWER_CORRECTIONS.find((k) => k.q === x.q);
    if (!c || !sameOption(x.opts[x.ans], c.was)) return x;
    const idx = x.opts.findIndex((o) => sameOption(o, c.now));
    if (idx < 0) return x;
    return { ...x, ans: idx, exp: c.exp };
  });
}
