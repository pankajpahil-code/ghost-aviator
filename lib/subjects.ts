export type ContentType = {
  type: "notes" | "slides" | "video" | "audio" | "questions" | "mock-test";
  label: string;
  icon: string;
  available: boolean;
};

export type Chapter = {
  id: string;
  number: number;
  title: string;
  description: string;
  duration: string;      // estimated study time
  questionCount: number;
  content: ContentType[];
};

export type Subject = {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  description: string;
  examDuration: number;  // minutes
  totalQuestions: number;
  passMark: number;      // percentage
  chapters: Chapter[];
};

const makeContent = (available = false): ContentType[] => [
  { type: "notes",      label: "Notes",          icon: "📄", available },
  { type: "slides",     label: "Slides",         icon: "📊", available },
  { type: "video",      label: "Video Lecture",  icon: "🎥", available },
  { type: "audio",      label: "Audio Overview", icon: "🎧", available },
  { type: "questions",  label: "Questions",      icon: "❓", available },
  { type: "mock-test",  label: "Chapter Test",   icon: "📝", available },
];

// ─────────────────────────────────────────────
// CPL SUBJECTS  (DGCA Standard — 6 Papers)
// ─────────────────────────────────────────────
export const CPL_SUBJECTS: Subject[] = [
  {
    id: "air-regulations",
    name: "Air Regulations",
    shortName: "Air Regs",
    icon: "⚖️",
    color: "#7c3aed",
    description: "DGCA rules, ICAO annexures, ANOs, airspace classification, licensing, and rules of the air.",
    examDuration: 60,
    totalQuestions: 50,
    passMark: 70,
    chapters: [
      { id: "ar-1",  number: 1,  title: "ICAO & International Aviation Law",         description: "Chicago Convention, ICAO structure, bilateral agreements, annexures overview.",       duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "ar-2",  number: 2,  title: "Chicago Convention & Annexures",             description: "Key annexures 1–18, their scope and application to Indian aviation.",               duration: "4 hrs", questionCount: 90,  content: makeContent() },
      { id: "ar-3",  number: 3,  title: "DGCA & Civil Aviation Requirements (CAR)",   description: "DGCA structure, CARs — Section 7 Series C, enforcement, penalties.",               duration: "4 hrs", questionCount: 100, content: makeContent() },
      { id: "ar-4",  number: 4,  title: "Air Navigation Orders (ANO)",               description: "ANOs issued by DGCA, their legal standing and application to pilots.",               duration: "3 hrs", questionCount: 70,  content: makeContent() },
      { id: "ar-5",  number: 5,  title: "Airspace Classification in India",           description: "Class A–G airspace, prohibited/restricted/danger areas, special use airspace.",     duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "ar-6",  number: 6,  title: "Flight Rules — VFR & IFR",                  description: "VMC minima, IFR requirements, flight plans, ATC clearances and separation.",        duration: "4 hrs", questionCount: 90,  content: makeContent() },
      { id: "ar-7",  number: 7,  title: "Pilot Licensing — CPL/PPL/IR",              description: "Requirements, privileges, limitations, currency, medical requirements.",              duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "ar-8",  number: 8,  title: "Aircraft Registration & Airworthiness",     description: "Registration marks, CoA, CRS, maintenance requirements, MEL/CDL.",                  duration: "3 hrs", questionCount: 70,  content: makeContent() },
      { id: "ar-9",  number: 9,  title: "Air Traffic Services (ATS)",                description: "ATC, FIS, ATIS, separation standards, phraseology, emergency procedures.",          duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "ar-10", number: 10, title: "Aviation Security & AVSEC",                 description: "Security requirements, ICAO Annex 17, BCAS, security screening.",                   duration: "2 hrs", questionCount: 60,  content: makeContent() },
    ],
  },
  {
    id: "meteorology",
    name: "Aviation Meteorology",
    shortName: "Meteorology",
    icon: "🌤️",
    color: "#0ea5e9",
    description: "Weather systems, METAR, TAF, turbulence, icing, thunderstorms, and tropical meteorology.",
    examDuration: 60,
    totalQuestions: 50,
    passMark: 70,
    chapters: [
      { id: "met-1",  number: 1,  title: "The Atmosphere",                            description: "Composition, layers, ICSA standard atmosphere, lapse rates.",                      duration: "2 hrs", questionCount: 70,  content: makeContent() },
      { id: "met-2",  number: 2,  title: "Temperature & Humidity",                   description: "Temperature variations, humidity, dewpoint, RH, condensation.",                     duration: "2 hrs", questionCount: 60,  content: makeContent() },
      { id: "met-3",  number: 3,  title: "Pressure & Altimetry",                     description: "QNH, QFE, QNE, altimeter errors, pressure systems.",                               duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "met-4",  number: 4,  title: "Wind Systems",                             description: "General circulation, local winds, gradient wind, jetstream.",                       duration: "3 hrs", questionCount: 75,  content: makeContent() },
      { id: "met-5",  number: 5,  title: "Clouds & Precipitation",                   description: "Cloud classification, formation processes, precipitation types.",                    duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "met-6",  number: 6,  title: "Visibility & Fog",                         description: "Fog types, RVR, low visibility procedures.",                                         duration: "2 hrs", questionCount: 60,  content: makeContent() },
      { id: "met-7",  number: 7,  title: "Thunderstorms & Convection",               description: "CB development, hazards, avoidance, squall lines, ITCZ.",                           duration: "3 hrs", questionCount: 85,  content: makeContent() },
      { id: "met-8",  number: 8,  title: "Icing & Turbulence",                       description: "Icing types, effects on aircraft, CAT, mountain wave, wake turbulence.",            duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "met-9",  number: 9,  title: "Aviation Weather Reports",                 description: "METAR, TAF, SIGMET, AIRMET, PIREP decoding and interpretation.",                    duration: "4 hrs", questionCount: 100, content: makeContent() },
      { id: "met-10", number: 10, title: "Tropical Meteorology",                     description: "Tropical weather patterns, monsoon, cyclones, ITCZs.",                              duration: "2 hrs", questionCount: 60,  content: makeContent() },
    ],
  },
  {
    id: "air-navigation",
    name: "Air Navigation",
    shortName: "Navigation",
    icon: "🗺️",
    color: "#10b981",
    description: "Charts, dead reckoning, heading calculations, wind triangle, radio navigation, and GPS.",
    examDuration: 60,
    totalQuestions: 50,
    passMark: 70,
    chapters: [
      { id: "nav-1",  number: 1,  title: "Earth & Coordinate Systems",               description: "Shape of earth, latitude, longitude, great circles, rhumb lines.",                  duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "nav-2",  number: 2,  title: "Magnetism & Compass",                      description: "Earth's magnetism, variation, deviation, compass errors, DI.",                      duration: "3 hrs", questionCount: 75,  content: makeContent() },
      { id: "nav-3",  number: 3,  title: "Map Projections & Charts",                 description: "Lambert, Mercator, polar stereographic — properties and use.",                       duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "nav-4",  number: 4,  title: "Dead Reckoning",                           description: "TAS, heading, groundspeed, wind triangle, triangle of velocities.",                  duration: "4 hrs", questionCount: 100, content: makeContent() },
      { id: "nav-5",  number: 5,  title: "Flight Planning",                          description: "Route selection, fuel planning, alternate selection, ETOPS.",                        duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "nav-6",  number: 6,  title: "VOR & NDB Navigation",                     description: "VOR radials, NDB bearings, tracking, intercepting, holding.",                       duration: "4 hrs", questionCount: 100, content: makeContent() },
      { id: "nav-7",  number: 7,  title: "ILS & Approach Procedures",               description: "ILS components, localiser, glideslope, marker beacons, approaches.",                duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "nav-8",  number: 8,  title: "GNSS / GPS Navigation",                   description: "GPS principles, WAAS, RAIM, GNSS approaches.",                                       duration: "3 hrs", questionCount: 70,  content: makeContent() },
      { id: "nav-9",  number: 9,  title: "Radar & Secondary Surveillance",           description: "PSR, SSR, transponder modes, TCAS, ADS-B.",                                         duration: "2 hrs", questionCount: 60,  content: makeContent() },
      { id: "nav-10", number: 10, title: "Time & Speed Calculations",               description: "UTC, standard time, sunrise/sunset, speed/distance/time problems.",                  duration: "3 hrs", questionCount: 80,  content: makeContent() },
    ],
  },
  {
    id: "technical-general",
    name: "Technical General",
    shortName: "Technical",
    icon: "⚙️",
    color: "#f59e0b",
    description: "Aerodynamics, piston & turbine engines, hydraulics, electrical systems, pressurisation.",
    examDuration: 60,
    totalQuestions: 50,
    passMark: 70,
    chapters: [
      { id: "tg-1",  number: 1,  title: "Principles of Flight & Aerodynamics",       description: "Lift, drag, Bernoulli, aerofoil shapes, stall, CL/CD curves.",                     duration: "4 hrs", questionCount: 100, content: makeContent() },
      { id: "tg-2",  number: 2,  title: "Piston Engines",                            description: "4-stroke cycle, carburetor, fuel injection, ignition, supercharging.",             duration: "4 hrs", questionCount: 90,  content: makeContent() },
      { id: "tg-3",  number: 3,  title: "Turbine Engines — Jet & Turboprop",         description: "Gas turbine principles, compressor, combustion, turbine, thrust.",                  duration: "4 hrs", questionCount: 90,  content: makeContent() },
      { id: "tg-4",  number: 4,  title: "Propellers",                                description: "Fixed/variable pitch, feathering, reverse thrust, propeller effects.",              duration: "2 hrs", questionCount: 60,  content: makeContent() },
      { id: "tg-5",  number: 5,  title: "Fuel Systems",                              description: "Fuel types, fuel systems, fuel management, contamination.",                         duration: "2 hrs", questionCount: 60,  content: makeContent() },
      { id: "tg-6",  number: 6,  title: "Hydraulic Systems",                         description: "Hydraulic principles, components, systems, accumulators.",                          duration: "2 hrs", questionCount: 60,  content: makeContent() },
      { id: "tg-7",  number: 7,  title: "Electrical Systems",                        description: "DC/AC systems, generators, alternators, batteries, buses.",                         duration: "3 hrs", questionCount: 70,  content: makeContent() },
      { id: "tg-8",  number: 8,  title: "Pressurisation & Air Conditioning",         description: "Cabin pressurisation, outflow valve, hypoxia, decompression.",                     duration: "2 hrs", questionCount: 60,  content: makeContent() },
      { id: "tg-9",  number: 9,  title: "Landing Gear & Brakes",                     description: "Gear types, retraction systems, anti-skid, braking systems.",                      duration: "2 hrs", questionCount: 50,  content: makeContent() },
      { id: "tg-10", number: 10, title: "Ice & Rain Protection",                     description: "De-icing, anti-icing systems, pneumatic boots, TKS, heating.",                     duration: "2 hrs", questionCount: 50,  content: makeContent() },
    ],
  },
  {
    id: "radio-aids",
    name: "Radio Aids & Instruments",
    shortName: "Radio Aids",
    icon: "📡",
    color: "#ef4444",
    description: "Pitot-static instruments, gyroscopic instruments, VOR, NDB, ILS, DME and avionics.",
    examDuration: 60,
    totalQuestions: 50,
    passMark: 70,
    chapters: [
      { id: "ri-1",  number: 1,  title: "Pitot-Static System & Instruments",        description: "ASI, VSI, altimeter — construction, errors, limitations.",                          duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "ri-2",  number: 2,  title: "Gyroscopic Instruments",                   description: "AI, DI, TC — gyro principles, rigidity, precession, errors.",                       duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "ri-3",  number: 3,  title: "Magnetic Compass",                         description: "Compass construction, turning and acceleration errors, serviceability.",             duration: "2 hrs", questionCount: 60,  content: makeContent() },
      { id: "ri-4",  number: 4,  title: "VOR System",                               description: "VOR principles, VORTAC, CDI, OBS, course tracking.",                               duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "ri-5",  number: 5,  title: "NDB & ADF",                                description: "NDB principles, ADF, bearing errors, relative/magnetic bearings.",                  duration: "3 hrs", questionCount: 75,  content: makeContent() },
      { id: "ri-6",  number: 6,  title: "ILS — Instrument Landing System",          description: "Localiser, glideslope, markers, DME, ILS categories.",                             duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "ri-7",  number: 7,  title: "DME & TACAN",                              description: "DME slant range, co-located DME, TACAN.",                                           duration: "2 hrs", questionCount: 50,  content: makeContent() },
      { id: "ri-8",  number: 8,  title: "Radio Propagation",                        description: "EM waves, frequency bands, propagation modes, VHF/HF/UHF.",                        duration: "2 hrs", questionCount: 60,  content: makeContent() },
      { id: "ri-9",  number: 9,  title: "TCAS & ACAS",                              description: "TCAS I/II, RA/TA, manoeuvres, limitations.",                                        duration: "2 hrs", questionCount: 50,  content: makeContent() },
      { id: "ri-10", number: 10, title: "Glass Cockpit & EFIS",                     description: "PFD, ND, EICAS/ECAM, FMS basics, autoflight overview.",                            duration: "3 hrs", questionCount: 70,  content: makeContent() },
    ],
  },
  {
    id: "performance",
    name: "Performance of Aeroplanes",
    shortName: "Performance",
    icon: "📈",
    color: "#8b5cf6",
    description: "V-speeds, takeoff/landing performance, climb, cruise, mass & balance, and performance charts.",
    examDuration: 60,
    totalQuestions: 50,
    passMark: 70,
    chapters: [
      { id: "perf-1",  number: 1,  title: "Atmosphere & Density Altitude",           description: "ISA deviations, density altitude effect on performance.",                          duration: "2 hrs", questionCount: 60,  content: makeContent() },
      { id: "perf-2",  number: 2,  title: "V-Speeds",                               description: "VS, VS0, VNE, VA, VFE, VLO, VLE, VX, VY — definitions and use.",                  duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "perf-3",  number: 3,  title: "Takeoff Performance",                    description: "TODR, TODA, TORA, accelerate-stop distance, V1, VR, V2.",                          duration: "4 hrs", questionCount: 90,  content: makeContent() },
      { id: "perf-4",  number: 4,  title: "Climb Performance",                      description: "Best angle, best rate, service ceiling, absolute ceiling, OEI climb.",              duration: "3 hrs", questionCount: 75,  content: makeContent() },
      { id: "perf-5",  number: 5,  title: "Cruise Performance",                     description: "Range, endurance, best speed for range/endurance, LRC.",                           duration: "3 hrs", questionCount: 70,  content: makeContent() },
      { id: "perf-6",  number: 6,  title: "Descent & Approach",                     description: "Descent rates, glide ratio, engine-out glide, approach speeds.",                   duration: "2 hrs", questionCount: 60,  content: makeContent() },
      { id: "perf-7",  number: 7,  title: "Landing Performance",                    description: "LDR, LDA, Vapp, VREF, ALD, factors affecting landing.",                           duration: "3 hrs", questionCount: 75,  content: makeContent() },
      { id: "perf-8",  number: 8,  title: "Mass & Balance",                         description: "CG limits, load sheet, moment calculations, MAC%, trim.",                          duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "perf-9",  number: 9,  title: "Performance Charts & Graphs",            description: "Reading POH charts, WAT charts, crosswind components.",                            duration: "4 hrs", questionCount: 90,  content: makeContent() },
      { id: "perf-10", number: 10, title: "Fuel Planning",                          description: "Trip fuel, contingency, alternate, final reserve, extra fuel.",                     duration: "2 hrs", questionCount: 60,  content: makeContent() },
    ],
  },
];

// ─────────────────────────────────────────────
// ATPL SUBJECTS  (Advanced — DGCA Standard)
// ─────────────────────────────────────────────
export const ATPL_SUBJECTS: Subject[] = [
  {
    id: "atpl-air-regulations",
    name: "Air Regulations (Advanced)",
    shortName: "Air Regs",
    icon: "⚖️",
    color: "#7c3aed",
    description: "Advanced study of ICAO annexures, SARPS, operational requirements, and AOC regulations.",
    examDuration: 75,
    totalQuestions: 60,
    passMark: 75,
    chapters: [
      { id: "aar-1", number: 1, title: "ICAO SARPs & Annexures (Advanced)",         description: "Deep dive into annexures 1–18 and their SARPS.",                                   duration: "4 hrs", questionCount: 100, content: makeContent() },
      { id: "aar-2", number: 2, title: "Air Operator Certificate (AOC)",             description: "AOC requirements, operations manual, quality system.",                              duration: "4 hrs", questionCount: 90,  content: makeContent() },
      { id: "aar-3", number: 3, title: "ATPL Licensing Requirements",               description: "Hours, type ratings, recency, medical, ATPL privileges.",                           duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "aar-4", number: 4, title: "Dangerous Goods (IATA/ICAO)",               description: "Hazmat classification, packaging, documentation, carriage.",                        duration: "3 hrs", questionCount: 70,  content: makeContent() },
      { id: "aar-5", number: 5, title: "CAT Operations & Minima",                   description: "CAT I/II/III operations, RVR requirements, crew requirements.",                    duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "aar-6", number: 6, title: "Flight & Duty Time Limitations (FTL)",      description: "FDTL regulations, rest requirements, flight time limits.",                          duration: "3 hrs", questionCount: 75,  content: makeContent() },
      { id: "aar-7", number: 7, title: "Aircraft Accident Investigation",            description: "ICAO Annex 13, AAIB, mandatory occurrence reporting.",                             duration: "2 hrs", questionCount: 60,  content: makeContent() },
      { id: "aar-8", number: 8, title: "Security & Threats",                        description: "Unlawful interference, threat assessment, emergency procedures.",                   duration: "2 hrs", questionCount: 55,  content: makeContent() },
    ],
  },
  {
    id: "atpl-meteorology",
    name: "Aviation Meteorology (Advanced)",
    shortName: "Meteorology",
    icon: "🌤️",
    color: "#0ea5e9",
    description: "Advanced synoptic analysis, SIGWX charts, global weather patterns, and aviation hazards.",
    examDuration: 75,
    totalQuestions: 60,
    passMark: 75,
    chapters: [
      { id: "amet-1", number: 1, title: "Synoptic Analysis & Charts",               description: "Surface charts, upper air charts, frontal analysis.",                               duration: "4 hrs", questionCount: 90,  content: makeContent() },
      { id: "amet-2", number: 2, title: "High Altitude Meteorology",                description: "Jetstream, clear air turbulence, tropopause variations.",                          duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "amet-3", number: 3, title: "SIGWX Charts & Forecasts",                 description: "Significant weather charts, SIGMETs, volcanic ash.",                               duration: "3 hrs", questionCount: 75,  content: makeContent() },
      { id: "amet-4", number: 4, title: "Ocean & Global Weather Systems",           description: "ITCZ, trade winds, monsoon, polar fronts.",                                         duration: "3 hrs", questionCount: 70,  content: makeContent() },
      { id: "amet-5", number: 5, title: "Wind Shear & Microburst",                  description: "Low level wind shear, microburst, escape manoeuvre.",                               duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "amet-6", number: 6, title: "In-Flight Weather Avoidance",              description: "Airborne weather radar, PIREP use, weather decision making.",                      duration: "3 hrs", questionCount: 70,  content: makeContent() },
    ],
  },
  {
    id: "atpl-navigation",
    name: "Air Navigation (Advanced)",
    shortName: "Navigation",
    icon: "🗺️",
    color: "#10b981",
    description: "Long range navigation, ETOPS, RVSM, PBN/RNAV, oceanic procedures and flight planning.",
    examDuration: 75,
    totalQuestions: 60,
    passMark: 75,
    chapters: [
      { id: "anav-1", number: 1, title: "PBN & RNAV Operations",                   description: "Performance based navigation, RNAV, RNP, LNAV/VNAV.",                              duration: "4 hrs", questionCount: 90,  content: makeContent() },
      { id: "anav-2", number: 2, title: "ETOPS & Long Range Operations",            description: "ETOPS 60/120/180, entry/exit points, diversion airports.",                         duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "anav-3", number: 3, title: "RVSM Operations",                          description: "Reduced vertical separation, equipment requirements, monitoring.",                   duration: "2 hrs", questionCount: 60,  content: makeContent() },
      { id: "anav-4", number: 4, title: "Oceanic Navigation",                       description: "OTS, NAT HLA, position reporting, contingency procedures.",                         duration: "3 hrs", questionCount: 75,  content: makeContent() },
      { id: "anav-5", number: 5, title: "FMS & Autoflight",                         description: "FMS operation, LNAV/VNAV modes, approach coupling.",                               duration: "4 hrs", questionCount: 90,  content: makeContent() },
      { id: "anav-6", number: 6, title: "Advanced Flight Planning",                 description: "OFP analysis, fuel tankering, EDTO fuel planning.",                                 duration: "3 hrs", questionCount: 75,  content: makeContent() },
    ],
  },
  {
    id: "atpl-technical",
    name: "Technical General (Advanced)",
    shortName: "Technical",
    icon: "⚙️",
    color: "#f59e0b",
    description: "Advanced turbine engine theory, complex aircraft systems, and type-specific knowledge.",
    examDuration: 75,
    totalQuestions: 60,
    passMark: 75,
    chapters: [
      { id: "atg-1", number: 1, title: "Advanced Turbine Engine Systems",           description: "FADEC, thrust management, engine monitoring, OEI.",                                 duration: "4 hrs", questionCount: 90,  content: makeContent() },
      { id: "atg-2", number: 2, title: "Fly-By-Wire & Flight Controls",             description: "FBW systems, control laws, flight envelope protection.",                             duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "atg-3", number: 3, title: "Advanced Hydraulics & Pneumatics",          description: "Triple hydraulics, bleed air, pneumatic systems.",                                  duration: "3 hrs", questionCount: 70,  content: makeContent() },
      { id: "atg-4", number: 4, title: "Avionics & Navigation Systems",             description: "ADIRU, ISIS, radio altimeter, proximity warning.",                                   duration: "3 hrs", questionCount: 75,  content: makeContent() },
      { id: "atg-5", number: 5, title: "ECAM / EICAS Systems",                      description: "Engine and system monitoring, warnings, procedures.",                               duration: "3 hrs", questionCount: 70,  content: makeContent() },
    ],
  },
  {
    id: "atpl-radio-aids",
    name: "Radio Aids & Instruments (Adv)",
    shortName: "Radio Aids",
    icon: "📡",
    color: "#ef4444",
    description: "Advanced avionics, GNSS integrity, MLS, advanced radar, and next-generation CNS/ATM.",
    examDuration: 75,
    totalQuestions: 60,
    passMark: 75,
    chapters: [
      { id: "ari-1", number: 1, title: "Advanced GNSS & SBAS",                     description: "GPS architecture, WAAS, EGNOS, GAGAN, RAIM prediction.",                           duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "ari-2", number: 2, title: "MLS & Advanced Approach Aids",              description: "Microwave landing system, GBAS, CAT II/III operations.",                            duration: "3 hrs", questionCount: 75,  content: makeContent() },
      { id: "ari-3", number: 3, title: "ADS-B & Datalink Systems",                 description: "ADS-B out/in, ACARS, FANS, CPDLC operations.",                                      duration: "3 hrs", questionCount: 70,  content: makeContent() },
      { id: "ari-4", number: 4, title: "Weather Radar (Advanced)",                 description: "Airborne weather radar, returns, tilt management, hazard assessment.",              duration: "2 hrs", questionCount: 60,  content: makeContent() },
      { id: "ari-5", number: 5, title: "Future CNS/ATM Systems",                   description: "SESAR, NextGen, 4D trajectories, performance monitoring.",                          duration: "2 hrs", questionCount: 55,  content: makeContent() },
    ],
  },
  {
    id: "atpl-performance",
    name: "Performance (Advanced)",
    shortName: "Performance",
    icon: "📈",
    color: "#8b5cf6",
    description: "Performance class A/B/C, ETOPS fuel, OEI net flight paths, and airline performance.",
    examDuration: 75,
    totalQuestions: 60,
    passMark: 75,
    chapters: [
      { id: "aperf-1", number: 1, title: "Performance Class A Operations",          description: "MCTOM, MPLM, net flight paths, obstacle clearance.",                               duration: "4 hrs", questionCount: 90,  content: makeContent() },
      { id: "aperf-2", number: 2, title: "OEI — Engine Failure Procedures",         description: "OEI climb, drift down, obstruction clearance, diversion.",                         duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "aperf-3", number: 3, title: "Advanced Weight & Balance",               description: "Computerised load sheets, trim, belly hold loading.",                               duration: "3 hrs", questionCount: 70,  content: makeContent() },
      { id: "aperf-4", number: 4, title: "Contaminated Runway Performance",         description: "Wet/slippery/contaminated runway corrections.",                                      duration: "3 hrs", questionCount: 75,  content: makeContent() },
      { id: "aperf-5", number: 5, title: "Airline Fuel Management",                 description: "Policy fuel, tankering decision, uplift optimisation.",                             duration: "2 hrs", questionCount: 60,  content: makeContent() },
    ],
  },
  {
    id: "human-performance",
    name: "Human Performance & Limitations",
    shortName: "HPL",
    icon: "🧠",
    color: "#06b6d4",
    description: "Human factors, CRM, fatigue, situational awareness, automation and error management.",
    examDuration: 60,
    totalQuestions: 50,
    passMark: 75,
    chapters: [
      { id: "hpl-1", number: 1, title: "Human Factors in Aviation",                 description: "SHEL model, Swiss cheese model, accident causation.",                               duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "hpl-2", number: 2, title: "Physiology & Hypoxia",                      description: "Oxygen requirements, hypoxia types, TUC, decompression.",                          duration: "3 hrs", questionCount: 75,  content: makeContent() },
      { id: "hpl-3", number: 3, title: "Fatigue & Sleep",                           description: "Circadian rhythm, WOCL, sleep debt, countermeasures.",                              duration: "2 hrs", questionCount: 65,  content: makeContent() },
      { id: "hpl-4", number: 4, title: "Situational Awareness & Decision Making",   description: "SA levels, threat & error management (TEM), decision models.",                    duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "hpl-5", number: 5, title: "CRM & Crew Coordination",                  description: "CRM principles, communication, assertiveness, leadership.",                         duration: "3 hrs", questionCount: 75,  content: makeContent() },
      { id: "hpl-6", number: 6, title: "Automation & Mode Awareness",               description: "Autoflight management, automation surprise, complacency.",                          duration: "2 hrs", questionCount: 60,  content: makeContent() },
    ],
  },
  {
    id: "flight-planning",
    name: "Flight Planning & Monitoring",
    shortName: "Flight Planning",
    icon: "🛫",
    color: "#f97316",
    description: "OFP reading, fuel policy, ATC flight plans, NOTAM interpretation, and AIP use.",
    examDuration: 60,
    totalQuestions: 50,
    passMark: 75,
    chapters: [
      { id: "fp-1", number: 1, title: "ATC Flight Plan (ICAO Format)",              description: "FPL format, fields 7–19, filing procedures, amendments.",                         duration: "3 hrs", questionCount: 80,  content: makeContent() },
      { id: "fp-2", number: 2, title: "Operational Flight Plan (OFP)",              description: "Reading airline OFPs, fuel figures, performance data.",                             duration: "3 hrs", questionCount: 75,  content: makeContent() },
      { id: "fp-3", number: 3, title: "NOTAM & AIP",                               description: "NOTAM types, AIP structure, SUPs, AIC, amendments.",                               duration: "2 hrs", questionCount: 60,  content: makeContent() },
      { id: "fp-4", number: 4, title: "Alternate Selection & Minima",               description: "Destination, ERA, take-off alternates, planning minima.",                           duration: "3 hrs", questionCount: 75,  content: makeContent() },
      { id: "fp-5", number: 5, title: "In-Flight Monitoring & Replanning",          description: "Fuel monitoring, PNR, CP, diversion decision.",                                     duration: "3 hrs", questionCount: 70,  content: makeContent() },
    ],
  },
];
