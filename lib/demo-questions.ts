export type DemoQuestion = {
  subjectIds: string[];
  chapterId?: string;
  subtopic?: string;                       // e.g. "The Solar System" (from source syllabus)
  difficulty?: "easy" | "medium" | "hard"; // optional, for difficulty-based practice
  source?: string;                         // provenance, e.g. "ECQB 061 General Navigation"
  q: string;
  opts: string[];
  ans: number;
  exp: string;
};

export const DEMO_QUESTIONS: DemoQuestion[] = [
  // ── Air Regulations ──────────────────────────────────────────────────────
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    q: "The minimum age requirement for a CPL in India as per DGCA is:",
    opts: ["17 years", "18 years", "19 years", "21 years"],
    ans: 1,
    exp: "DGCA CAR Section 7 Series C Part I: minimum age to hold a CPL is 18 years.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    q: "Class 1 Medical Certificate validity for a pilot under 40 years of age is:",
    opts: ["6 months", "12 months", "18 months", "24 months"],
    ans: 1,
    exp: "For pilots under 40 years, the Class 1 Medical Certificate is valid for 12 months.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    q: "In the ICAO phonetic alphabet, the letter 'N' is represented by:",
    opts: ["Nancy", "November", "Neutral", "Nordic"],
    ans: 1,
    exp: "N = November in the ICAO phonetic alphabet, used to prevent confusion in radio communications.",
  },

  // ── Aviation Meteorology ─────────────────────────────────────────────────
  {
    subjectIds: ["meteorology", "atpl-meteorology"],
    q: "A METAR showing wind direction 270° means the wind is blowing FROM:",
    opts: ["East", "West", "North", "South"],
    ans: 1,
    exp: "In METAR, wind direction is the direction FROM which wind blows. 270° is due West.",
  },
  {
    subjectIds: ["meteorology", "atpl-meteorology"],
    q: "QNH on an altimeter gives altitude above:",
    opts: [
      "Aerodrome elevation",
      "Mean sea level with standard pressure",
      "Mean sea level with local pressure",
      "Pressure altitude datum",
    ],
    ans: 2,
    exp: "QNH is the altimeter setting that causes the instrument to read altitude above mean sea level using local atmospheric pressure.",
  },
  {
    subjectIds: ["meteorology", "atpl-meteorology"],
    q: "A temperature-dewpoint spread of less than 3°C at an aerodrome indicates:",
    opts: [
      "Good visibility expected",
      "Fog or low cloud likely",
      "Thunderstorm risk",
      "Severe icing above",
    ],
    ans: 1,
    exp: "When the temperature-dewpoint spread falls to 2–3°C, air is near saturation — fog or low cloud formation is likely.",
  },

  // ── Air Navigation ───────────────────────────────────────────────────────
  {
    subjectIds: ["air-navigation", "atpl-navigation"],
    q: "True heading 090°, variation 5°W. Magnetic heading is:",
    opts: ["085°", "090°", "095°", "100°"],
    ans: 2,
    exp: "MH = TH + West variation = 090° + 5° = 095°. (TVMDC rule: East is least, West is best)",
  },
  {
    subjectIds: ["air-navigation", "atpl-navigation"],
    q: "The great circle distance between two points is always:",
    opts: [
      "Greater than the rhumb line distance",
      "Equal to the rhumb line distance",
      "Less than or equal to the rhumb line distance",
      "Exactly half the rhumb line distance",
    ],
    ans: 2,
    exp: "A great circle is the shortest path between two points on a sphere — always ≤ rhumb line distance.",
  },
  {
    subjectIds: ["air-navigation", "atpl-navigation"],
    q: "Lines connecting points of equal magnetic variation on a chart are called:",
    opts: ["Isobars", "Isogonals", "Isodops", "Isogrives"],
    ans: 1,
    exp: "Isogonals (isogonic lines) connect points of equal magnetic variation. The agonic line is where variation = 0.",
  },

  // ── Technical General / Aircraft & Engines ───────────────────────────────
  {
    subjectIds: ["technical-general", "atpl-technical"],
    q: "The correct order of strokes in a four-stroke piston engine is:",
    opts: [
      "Intake – Power – Compression – Exhaust",
      "Intake – Compression – Power – Exhaust",
      "Compression – Intake – Power – Exhaust",
      "Power – Intake – Compression – Exhaust",
    ],
    ans: 1,
    exp: "Four strokes in order: Intake → Compression → Power (combustion) → Exhaust.",
  },
  {
    subjectIds: ["technical-general", "atpl-technical"],
    q: "Bernoulli's theorem states that as velocity of airflow increases, static pressure:",
    opts: ["Increases", "Decreases", "Remains constant", "Increases then decreases"],
    ans: 1,
    exp: "Increasing airflow velocity decreases static pressure. This is the fundamental principle behind lift generation on an aerofoil.",
  },

  // ── Technical Performance ────────────────────────────────────────────────
  {
    subjectIds: ["technical-performance", "atpl-performance"],
    q: "V1 in aircraft performance is defined as:",
    opts: [
      "Stall speed in landing configuration",
      "Takeoff decision speed",
      "Best angle of climb speed",
      "Maximum gear extension speed",
    ],
    ans: 1,
    exp: "V1 is the takeoff decision speed. Above V1, the pilot must continue the takeoff even with an engine failure.",
  },
  {
    subjectIds: ["technical-performance", "atpl-performance"],
    q: "A 'balanced field length' condition means:",
    opts: [
      "TODR equals Landing Distance Required",
      "TODR equals Accelerate-Stop Distance Required",
      "TORA equals ASDA",
      "Landing Distance Required equals ASDR",
    ],
    ans: 1,
    exp: "Balanced field: TODR = ASDR, which optimises V1 selection — runway used for a continued takeoff equals that needed for a rejected takeoff.",
  },

  // ── Radio Telephony / Radio Aids ─────────────────────────────────────────
  {
    subjectIds: ["radio-telephony", "atpl-radio-aids"],
    q: "Full-scale CDI deflection on a standard VOR means the aircraft is at least how many degrees off the selected radial?",
    opts: ["5°", "10°", "15°", "20°"],
    ans: 1,
    exp: "Standard VOR CDI: full-scale deflection occurs at 10° either side of the selected radial.",
  },
  {
    subjectIds: ["radio-telephony", "atpl-radio-aids"],
    q: "The international aeronautical VHF emergency frequency for MAYDAY calls is:",
    opts: ["118.0 MHz", "121.5 MHz", "123.5 MHz", "126.9 MHz"],
    ans: 1,
    exp: "121.5 MHz is the international VHF emergency frequency. All aircraft should guard it whenever possible.",
  },

  // ── Human Performance & Limitations (ATPL) ───────────────────────────────
  {
    subjectIds: ["human-performance"],
    q: "Time of Useful Consciousness (TUC) at FL350 following rapid decompression is approximately:",
    opts: ["30–60 seconds", "3–5 minutes", "8–10 minutes", "15–20 minutes"],
    ans: 0,
    exp: "At FL350, TUC after rapid decompression is 30–60 seconds. Pilots must immediately don oxygen masks without delay.",
  },

  // ── Flight Planning (ATPL) ───────────────────────────────────────────────
  {
    subjectIds: ["flight-planning"],
    q: "In an ICAO flight plan, the 'E/' field (field 19) indicates:",
    opts: [
      "Estimated elapsed time",
      "Emergency radio equipment and survival details",
      "Alternate aerodrome ICAO code",
      "En-route alternates",
    ],
    ans: 1,
    exp: "Field 19 E/ contains supplementary information including endurance, persons on board, emergency radio, survival equipment, and colour of aircraft.",
  },
];
