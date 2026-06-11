export type ContentType = {
  type: "notes" | "slides" | "video" | "audio" | "questions" | "mock-test" | "chapter-quiz";
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

const makeContent = (hasQuestions = false): ContentType[] => [
  { type: "notes",        label: "Notes",          icon: "📄", available: true         },
  { type: "questions",    label: "Practice Qs",    icon: "❓", available: hasQuestions },
  { type: "slides",       label: "Slides",         icon: "📊", available: false        },
  { type: "video",        label: "Video Lecture",  icon: "🎥", available: false        },
  { type: "audio",        label: "Audio Overview", icon: "🎧", available: false        },
  { type: "chapter-quiz", label: "Chapter Quiz",   icon: "✅", available: true         },
];

// ─────────────────────────────────────────────────────────────────────────────
// CPL SUBJECTS  (DGCA CAR Section 7 Series B Part IV — 7 Papers)
// Chapters map directly to the official DGCA CPL syllabus appendices.
// ─────────────────────────────────────────────────────────────────────────────
export const CPL_SUBJECTS: Subject[] = [

  // ── PAPER 1 ── Appendix A ────────────────────────────────────────────────
  {
    id: "air-navigation",
    name: "Air Navigation",
    shortName: "Navigation",
    icon: "🗺️",
    color: "#10b981",
    description: "Navigation basics, DR, charts, radio aids, instruments, mass & balance, performance, and flight planning. Covers Appendix A of the DGCA CPL syllabus.",
    examDuration: 60,
    totalQuestions: 50,
    passMark: 70,
    chapters: [
      {
        id: "nav-1", number: 1, title: "Basics of Navigation",
        description: "Solar system, seasonal/apparent sun movements, the earth, great circles, rhumb lines, convergency, conversion angle, latitude, longitude, time conversions (UTC/LMT/standard), international dateline, directions, terrestrial magnetism, units of distance.",
        duration: "4 hrs", questionCount: 90, content: makeContent(),
      },
      {
        id: "nav-2", number: 2, title: "Magnetism & Compasses",
        description: "Terrestrial magnetism, earth's total magnetic force (vertical/horizontal components), directive force, magnetic dip, variation, aircraft magnetism (hard iron/vertical soft iron), turning & acceleration errors, direct reading & remote reading compasses, serviceability tests, compass adjustment.",
        duration: "3 hrs", questionCount: 80, content: makeContent(),
      },
      {
        id: "nav-3", number: 3, title: "Aeronautical Charts",
        description: "Mercator, Lambert conformal conic, polar stereographic, transverse Mercator, oblique Mercator — properties, representation of meridians/parallels/great circles/rhumb lines. Use of aeronautical charts: plotting positions, scale, conventional signs, measuring tracks & distances, plotting bearings.",
        duration: "3 hrs", questionCount: 80, content: makeContent(),
      },
      {
        id: "nav-4", number: 4, title: "Dead Reckoning Navigation",
        description: "Track, heading (compass/magnetic/true/grid), wind velocity, airspeed (IAS/CAS/TAS/Mach), groundspeed, ETA, drift, wind correction angle, DR position, navigational computer (speed/time/distance/fuel/conversions), triangle of velocities, DR position determination, max range, radius of action, PSR, PET.",
        duration: "4 hrs", questionCount: 100, content: makeContent(),
      },
      {
        id: "nav-5", number: 5, title: "In-Flight Navigation",
        description: "Use of visual observations, navigation in climb & descent (average airspeed, average wind velocity, ground speed during climb/descent), navigation in cruising flight (groundspeed revision, off-track corrections, wind calculation, ETA revisions), flight log.",
        duration: "3 hrs", questionCount: 75, content: makeContent(),
      },
      {
        id: "nav-6", number: 6, title: "Mass & Balance — Aeroplanes",
        description: "Centre of gravity definition, importance for aircraft stability, mass and balance terminology (empty mass, dry operating mass, zero fuel mass, standard masses, useful load), effects of overloading, datum, moment arm, moment, CG calculation, expression in % MAC, effect of load-shift.",
        duration: "3 hrs", questionCount: 80, content: makeContent(),
      },
      {
        id: "nav-7", number: 7, title: "Performance — Single-Engine Aeroplanes",
        description: "Definitions of terms and speeds, take-off and landing performance, effect of aeroplane mass/wind/density altitude/runway slope/runway conditions, use of AFM data, climb & cruise performance, effect of density altitude and mass, endurance, still air range with various power settings.",
        duration: "3 hrs", questionCount: 75, content: makeContent(),
      },
      {
        id: "nav-8", number: 8, title: "Performance — Multi-Engine Aeroplanes",
        description: "New terms for multi-engine performance, take-off and landing distances, obstacle clearance at take-off, rate of climb/descent, effects of power settings/speeds/configuration, cruise altitudes and ceiling, en-route requirements, payload/range and speed/economy trade-offs, performance graphs and flight manual.",
        duration: "3 hrs", questionCount: 80, content: makeContent(),
      },
      {
        id: "nav-9", number: 9, title: "Flight Planning & Monitoring",
        description: "Navigation plan (route, terrain/obstacle clearance, wind forecast, heading/groundspeed/ETA computation), fuel plan (fuel log, holding/diversion/reserve fuel), in-flight re-planning, ICAO ATC flight plan (format, completing, filing, adherence), practical chart preparation and flight plan completion.",
        duration: "4 hrs", questionCount: 90, content: makeContent(),
      },
      {
        id: "nav-10", number: 10, title: "Radio Navigation Aids",
        description: "Ground D/F, ADF & NDB (principles, presentation, range, errors), VOR & Doppler VOR (principles, coverage, errors), DME, ILS (principles, presentation, coverage, errors), SSR & transponder (modes/codes including Mode S), GPS/GLONASS (principle, advantages, disadvantages).",
        duration: "4 hrs", questionCount: 90, content: makeContent(),
      },
      {
        id: "nav-11", number: 11, title: "Flight Instruments",
        description: "Air data instruments: pitot-static system, altimeter, ASI (IAS, coloured sectors, VMO/MMO), VSI (aneroid & IVSI). Gyroscopic instruments: gyro fundamentals (stability, precession, types, ring laser gyro), directional gyro, slaved gyro compass, attitude indicator, turn & bank indicator, turn coordinator. Magnetic compass: construction, errors.",
        duration: "4 hrs", questionCount: 90, content: makeContent(),
      },
      {
        id: "nav-12", number: 12, title: "Power Plant Instruments & Avionics",
        description: "Pressure gauge, temperature gauge (ram rise, recovery factor), RPM indicator, fuel flowmeter, fuel gauge (volume/mass, measuring sensors), torque meter. EFIS, EICAS, ECAM, FMS basics. Radio propagation: EM waves, wavelength/amplitude/phase/frequency, frequency bands, carrier/modulation/demodulation, antennas, ground/space wave, MUF, fading.",
        duration: "3 hrs", questionCount: 75, content: makeContent(),
      },
      // ── Oxford General Navigation study-notes chapters (book numbering in title) ──
      {
        id: "nav-13", number: 13, title: "Direction, Latitude & Longitude",
        description: "Shape of the Earth, poles and equator, latitude/longitude, d-lat and d-long, true/magnetic/compass direction and position expression. Oxford General Navigation Ch.1 study notes with practice Q&A.",
        duration: "2 hrs", questionCount: 3, content: makeContent(true),
      },
      {
        id: "nav-14", number: 14, title: "Great Circles, Rhumb Lines & Directions",
        description: "Great circle and rhumb line properties, vertices, track direction changes and when each is used for navigation. Oxford General Navigation Ch.2 study notes.",
        duration: "2 hrs", questionCount: 2, content: makeContent(true),
      },
      {
        id: "nav-15", number: 15, title: "Earth Magnetism",
        description: "The Earth's magnetic field, variation and isogonals, dip, deviation, and compass-to-true conversions. Oxford General Navigation Ch.3 study notes with practice Q&A.",
        duration: "2 hrs", questionCount: 14, content: makeContent(true),
      },
      {
        id: "nav-16", number: 16, title: "The 1 in 60 Rule",
        description: "The 1 in 60 rule — track error angle, closing angle and distance off track, with fully worked examples. Oxford General Navigation Ch.10 study notes.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "nav-17", number: 17, title: "Navigation Using the 1 in 60 Rule",
        description: "Applying the 1 in 60 rule in flight — regaining track, heading corrections and revised ETAs, with worked problems. Oxford General Navigation Ch.11 study notes.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "nav-18", number: 18, title: "Other Applications of the 1 in 60 Rule",
        description: "Glide-path heights, rates of descent, base-of-cloud calculations and other practical 1 in 60 applications. Oxford General Navigation Ch.12 study notes.",
        duration: "1 hr", questionCount: 0, content: makeContent(),
      },
      {
        id: "nav-19", number: 19, title: "Topographical Maps & Map Reading",
        description: "Topographical chart features, relief, scale, map-reading technique and visual fix selection. Oxford General Navigation Ch.13 study notes.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "nav-20", number: 20, title: "Convergency & Conversion Angle",
        description: "Convergency between meridians, conversion angle between great circle and rhumb line tracks, with worked examples. Oxford General Navigation Ch.14 study notes.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
    ],
  },

  // ── PAPER 2 ── Appendix B ────────────────────────────────────────────────
  {
    id: "meteorology",
    name: "Aviation Meteorology",
    shortName: "Meteorology",
    icon: "🌤️",
    color: "#0ea5e9",
    description: "Atmosphere, wind, thermodynamics, clouds, fronts, pressure systems, Indian climatology, flight hazards, and aviation weather reports. Covers Appendix B of the DGCA CPL syllabus.",
    examDuration: 60,
    totalQuestions: 50,
    passMark: 70,
    chapters: [
      {
        id: "met-1", number: 1, title: "Atmosphere",
        description: "Composition of the atmosphere, extent, vertical divisions (troposphere, tropopause, stratosphere, mesosphere), variation of temperature with height, ISA, heat transfer processes.",
        duration: "3 hrs", questionCount: 80, content: makeContent(true),
      },
      {
        id: "met-2", number: 2, title: "Atmospheric Pressure",
        description: "Pressure and its measurement, isobars, variation of pressure with height, QFE/QNH/QFF, high and low pressure systems, diurnal and semi-diurnal pressure variation.",
        duration: "2 hrs", questionCount: 60, content: makeContent(true),
      },
      {
        id: "met-3", number: 3, title: "Temperature",
        description: "Solar and terrestrial radiation, conduction, convection, advection, lapse rates (DALR, SALR, ELR), temperature inversions, diurnal and seasonal variation of temperature.",
        duration: "2 hrs", questionCount: 60, content: makeContent(true),
      },
      {
        id: "met-4", number: 4, title: "Air Density",
        description: "Relationship between pressure, temperature and density, effect of humidity on density, density altitude and its effect on aircraft performance.",
        duration: "2 hrs", questionCount: 50, content: makeContent(true),
      },
      {
        id: "met-5", number: 5, title: "Humidity",
        description: "Water vapour in the atmosphere, evaporation and condensation, dew point, relative humidity, mixing ratio, latent heat, saturation.",
        duration: "2 hrs", questionCount: 55, content: makeContent(true),
      },
      {
        id: "met-6", number: 6, title: "Winds",
        description: "Pressure gradient force, Coriolis force, geostrophic and gradient wind, surface friction, backing and veering, local winds (land/sea breeze, anabatic, katabatic, foehn), Buys Ballot's law.",
        duration: "3 hrs", questionCount: 80, content: makeContent(true),
      },
      {
        id: "met-7", number: 7, title: "Visibility and Fog",
        description: "Factors affecting visibility, RVR, mist, haze, smoke, dust; fog types — radiation, advection, frontal, steaming and hill fog — their formation and dispersal.",
        duration: "2 hrs", questionCount: 60, content: makeContent(true),
      },
      {
        id: "met-8", number: 8, title: "Vertical Motion and Clouds",
        description: "Causes of vertical motion, adiabatic processes, cloud formation, classification of clouds (low, medium, high, CB, NS), cloud recognition and associated weather.",
        duration: "3 hrs", questionCount: 75, content: makeContent(true),
      },
      {
        id: "met-9", number: 9, title: "Stability and Instability of Atmosphere",
        description: "Stable, unstable and neutral conditions, environmental vs adiabatic lapse rates, conditional and convective instability, effect of stability on cloud and turbulence.",
        duration: "2 hrs", questionCount: 60, content: makeContent(true),
      },
      {
        id: "met-10", number: 10, title: "Optical Phenomena",
        description: "Refraction, mirage, halo, corona, rainbow, glory, St Elmo's fire and other optical phenomena relevant to aviation.",
        duration: "1 hr", questionCount: 40, content: makeContent(true),
      },
      {
        id: "met-11", number: 11, title: "Precipitation",
        description: "Formation of precipitation (coalescence and Bergeron process), types — rain, drizzle, snow, hail, sleet — and their association with cloud types.",
        duration: "2 hrs", questionCount: 50, content: makeContent(true),
      },
      {
        id: "met-12", number: 12, title: "Ice Accretion",
        description: "Airframe icing (rime, clear/glaze, mixed), conditions favourable for icing, hoar frost, carburettor and engine icing, effects on performance and avoidance.",
        duration: "2 hrs", questionCount: 55, content: makeContent(true),
      },
      {
        id: "met-13", number: 13, title: "Thunderstorm",
        description: "Conditions and stages of thunderstorm development, air-mass and frontal storms, squall lines, microbursts and downbursts, lightning, hazards and avoidance.",
        duration: "2 hrs", questionCount: 60, content: makeContent(true),
      },
      {
        id: "met-14", number: 14, title: "Air Masses, Fronts and Western Disturbances",
        description: "Source regions and classification of air masses; warm, cold, occluded and stationary fronts; frontal weather; depressions; Western Disturbances affecting India.",
        duration: "3 hrs", questionCount: 75, content: makeContent(true),
      },
      {
        id: "met-15", number: 15, title: "Jet Streams",
        description: "Formation and location of jet streams, polar-front and subtropical jets, associated clear air turbulence, seasonal variation and significance for flight planning.",
        duration: "1 hr", questionCount: 45, content: makeContent(true),
      },
      {
        id: "met-16", number: 16, title: "Clear Air Turbulence",
        description: "Definition and causes of CAT, association with jet streams and wind shear, detection, reporting and avoidance.",
        duration: "1 hr", questionCount: 40, content: makeContent(true),
      },
      {
        id: "met-17", number: 17, title: "Mountain Waves",
        description: "Formation of mountain and standing waves, rotor and lenticular clouds, associated turbulence and icing, effect on aircraft and avoidance.",
        duration: "1 hr", questionCount: 40, content: makeContent(true),
      },
      {
        id: "met-18", number: 18, title: "Tropical Systems",
        description: "ITCZ, trade winds, tropical revolving storms (cyclones), monsoon depressions, characteristics and hazards of tropical weather.",
        duration: "2 hrs", questionCount: 55, content: makeContent(true),
      },
      {
        id: "met-19", number: 19, title: "Climatology of India",
        description: "Seasons of India, SW and NE monsoon, pre-monsoon weather (Nor'westers, Kalbaisakhi), monsoon onset and withdrawal, local seasonal weather.",
        duration: "2 hrs", questionCount: 55, content: makeContent(true),
      },
      {
        id: "met-20", number: 20, title: "General Circulation",
        description: "Global pressure belts, three-cell circulation model, planetary winds, effect of land and sea distribution, semi-permanent pressure systems.",
        duration: "2 hrs", questionCount: 50, content: makeContent(true),
      },
      {
        id: "met-21", number: 21, title: "Meteorological Services for Aviation",
        description: "Organisation of met services, functions of a met office, observations and briefing, IMD and ICAO Annex 3 requirements for aviation.",
        duration: "1 hr", questionCount: 45, content: makeContent(true),
      },
      {
        id: "met-22", number: 22, title: "Weather Radar and Met Satellites",
        description: "Principles of weather radar, interpretation of returns, geostationary and polar-orbiting satellites, satellite imagery (visible and IR) and its use in weather analysis.",
        duration: "1 hr", questionCount: 40, content: makeContent(true),
      },
      {
        id: "met-23", number: 23, title: "Met Instruments",
        description: "Thermometers, barometers (mercury and aneroid), barograph, hygrometer, anemometer, wind vane, rain gauge and sunshine recorder and their exposure.",
        duration: "1 hr", questionCount: 40, content: makeContent(true),
      },
      {
        id: "met-24", number: 24, title: "Station Model",
        description: "Plotting and decoding the synoptic station model — symbols for cloud, weather, wind, pressure and pressure tendency.",
        duration: "1 hr", questionCount: 35, content: makeContent(true),
      },
      {
        id: "met-25", number: 25, title: "Aerodrome Met Reports — METAR, SPECI & TREND",
        description: "Decoding and encoding METAR, SPECI and TREND forecasts — groups for wind, visibility, RVR, weather, cloud, temperature, QNH and significant changes.",
        duration: "2 hrs", questionCount: 60, content: makeContent(true),
      },
      {
        id: "met-26", number: 26, title: "Aviation Weather Forecasts — TAF, ARFOR & ROFOR",
        description: "Decoding TAF, area forecasts (ARFOR) and route forecasts (ROFOR), validity periods, change groups and probability groups.",
        duration: "2 hrs", questionCount: 50, content: makeContent(true),
      },
      {
        id: "met-27", number: 27, title: "Radar Report, SIGMET & Satellite Bulletin",
        description: "SIGMET and AIRMET messages, radar weather reports, satellite bulletins and their use in flight planning.",
        duration: "1 hr", questionCount: 40, content: makeContent(),
      },
      {
        id: "met-28", number: 28, title: "Met Documentation and Briefing",
        description: "Pre-flight meteorological documentation, flight forecast charts, significant weather and wind/temperature charts, self-briefing and met briefing.",
        duration: "1 hr", questionCount: 40, content: makeContent(true),
      },
      {
        id: "met-29", number: 29, title: "Flight Forecast & Cross-Section Forecast of Route Conditions",
        description: "Tabular flight forecast, cross-section forecast of route conditions and their interpretation for flight planning and in-flight decisions.",
        duration: "1 hr", questionCount: 40, content: makeContent(),
      },
    ],
  },

  // ── PAPER 3 ── Appendix C ────────────────────────────────────────────────
  {
    id: "air-regulations",
    name: "Air Regulations",
    shortName: "Air Regs",
    icon: "⚖️",
    color: "#7c3aed",
    description: "ICAO conventions, annexures, rules of the air, ATS, AIS, aerodromes, Indian law, human factors, operational procedures, and VFR/IFR communications. Covers Appendix C of the DGCA CPL syllabus.",
    examDuration: 60,
    totalQuestions: 50,
    passMark: 70,
    chapters: [
      {
        id: "ar-1", number: 1, title: "International Organisations and Conventions",
        description: "Chicago Convention 1944: sovereignty, territory, scheduled/non-scheduled flights, cabotage, ICAO SARPs. ICAO: objectives, structure, annexures, regional offices. Five Freedoms of the Air. Security conventions: Tokyo, Hague, Montreal. Liability conventions: Warsaw, Rome, Geneva, Cape Town. DGCA, AAI, MoCA — roles and functions.",
        duration: "4 hrs", questionCount: 90,
        content: [
          { type: "notes",        label: "Notes",          icon: "📄", available: true  },
          { type: "questions",    label: "Practice Qs",    icon: "❓", available: true  },
          { type: "slides",       label: "Slides",         icon: "📊", available: true  },
          { type: "video",        label: "Video Lecture",  icon: "🎥", available: true  },
          { type: "audio",        label: "Audio Overview", icon: "🎧", available: true  },
          { type: "chapter-quiz", label: "Chapter Quiz",   icon: "✅", available: true  },
        ],
      },
      {
        id: "ar-2", number: 2, title: "Aircraft Nationality and Registration Marks",
        description: "ICAO Annex 7: nationality marks, registration marks, common marks, display requirements, marks on aircraft parts. Indian VT- registration series, DGCA registration procedures, certificates of registration, de-registration.",
        duration: "2 hrs", questionCount: 40,
        content: [
          { type: "notes",        label: "Notes",          icon: "📄", available: true  },
          { type: "questions",    label: "Practice Qs",    icon: "❓", available: true  },
          { type: "slides",       label: "Slides",         icon: "📊", available: true  },
          { type: "video",        label: "Video Lecture",  icon: "🎥", available: true  },
          { type: "audio",        label: "Audio Overview", icon: "🎧", available: true  },
          { type: "chapter-quiz", label: "Chapter Quiz",   icon: "✅", available: true  },
        ],
      },
      {
        id: "ar-3", number: 3, title: "Rules of the Air",
        description: "ICAO Annex 2: applicability, general rules, VFR rules, IFR rules, signals, interception of civil aircraft, table of cruising levels. Right-of-way rules, formation flying, aerobatic flight, unmanned free balloons, prohibited areas.",
        duration: "3 hrs", questionCount: 75,
        content: [
          { type: "notes",        label: "Notes",          icon: "📄", available: true  },
          { type: "questions",    label: "Practice Qs",    icon: "❓", available: true  },
          { type: "slides",       label: "Slides",         icon: "📊", available: true  },
          { type: "video",        label: "Video Lecture",  icon: "🎥", available: true  },
          { type: "audio",        label: "Audio Overview", icon: "🎧", available: true  },
          { type: "chapter-quiz", label: "Chapter Quiz",   icon: "✅", available: true  },
        ],
      },
      {
        id: "ar-4", number: 4, title: "Air Traffic Services",
        description: "ICAO Annex 11 & Doc 4444: ATS objectives and divisions, airspace classification (A–G), ATC service, flight information service, alerting service (INCERFA/ALERFA/DETRESFA), ATC clearances and instructions, coordination procedures.",
        duration: "4 hrs", questionCount: 90,
        content: [
          { type: "notes",        label: "Notes",          icon: "📄", available: true  },
          { type: "questions",    label: "Practice Qs",    icon: "❓", available: true  },
          { type: "slides",       label: "Slides",         icon: "📊", available: true  },
          { type: "video",        label: "Video Lecture",  icon: "🎥", available: true  },
          { type: "audio",        label: "Audio Overview", icon: "🎧", available: true  },
          { type: "chapter-quiz", label: "Chapter Quiz",   icon: "✅", available: true  },
        ],
      },
      {
        id: "ar-5", number: 5, title: "Separation Methods and Minima",
        description: "Vertical separation, RVSM operations, horizontal separation (lateral and longitudinal), radar separation minima, wake turbulence categories and separation, time-based and distance-based separation standards.",
        duration: "3 hrs", questionCount: 65,
        content: [
          { type: "notes",        label: "Notes",          icon: "📄", available: true  },
          { type: "questions",    label: "Practice Qs",    icon: "❓", available: true  },
          { type: "slides",       label: "Slides",         icon: "📊", available: true  },
          { type: "video",        label: "Video Lecture",  icon: "🎥", available: true  },
          { type: "audio",        label: "Audio Overview", icon: "🎧", available: true  },
          { type: "chapter-quiz", label: "Chapter Quiz",   icon: "✅", available: true  },
        ],
      },
      {
        id: "ar-6", number: 6, title: "Separation in the Vicinity of Aerodromes",
        description: "Visual separation at aerodromes, separation between arriving and departing aircraft, low-visibility procedures, runway occupancy, circuit procedures, visual approach separation.",
        duration: "2 hrs", questionCount: 50,
        content: [
          { type: "notes",        label: "Notes",          icon: "📄", available: true  },
          { type: "questions",    label: "Practice Qs",    icon: "❓", available: true  },
          { type: "slides",       label: "Slides",         icon: "📊", available: true  },
          { type: "video",        label: "Video Lecture",  icon: "🎥", available: true  },
          { type: "audio",        label: "Audio Overview", icon: "🎧", available: true  },
          { type: "chapter-quiz", label: "Chapter Quiz",   icon: "✅", available: true  },
        ],
      },
      {
        id: "ar-7", number: 7, title: "Procedures for Aerodrome Control Service",
        description: "Runway selection, ground movement control, ATIS, take-off and landing clearances, aerodrome signals and markings, low-visibility procedures, ground radar, apron management.",
        duration: "3 hrs", questionCount: 60,
        content: [
          { type: "notes",        label: "Notes",          icon: "📄", available: true  },
          { type: "questions",    label: "Practice Qs",    icon: "❓", available: true  },
          { type: "slides",       label: "Slides",         icon: "📊", available: true  },
          { type: "video",        label: "Video Lecture",  icon: "🎥", available: true  },
          { type: "audio",        label: "Audio Overview", icon: "🎧", available: true  },
          { type: "chapter-quiz", label: "Chapter Quiz",   icon: "✅", available: true  },
        ],
      },
      {
        id: "ar-8", number: 8, title: "Use of Air Traffic Services Surveillance System",
        description: "SSR transponder operations, Mode A/C/S, radar vectoring, position reporting using radar, ACAS/TCAS procedures and phraseology, ADS-B, surveillance minima.",
        duration: "2 hrs", questionCount: 50,
        content: [
          { type: "notes",        label: "Notes",          icon: "📄", available: true  },
          { type: "questions",    label: "Practice Qs",    icon: "❓", available: true  },
          { type: "slides",       label: "Slides",         icon: "📊", available: true  },
          { type: "video",        label: "Video Lecture",  icon: "🎥", available: true  },
          { type: "audio",        label: "Audio Overview", icon: "🎧", available: true  },
          { type: "chapter-quiz", label: "Chapter Quiz",   icon: "✅", available: true  },
        ],
      },
      {
        id: "ar-9", number: 9, title: "Aeronautical Information Services",
        description: "ICAO Annex 15 & AIP India: AIP structure (GEN/ENR/AD), NOTAM format and categories, AIRAC cycle, AIC, SNOWTAM, ASHTAM, pre-flight information, integrated aeronautical information package.",
        duration: "3 hrs", questionCount: 60,
        content: [
          { type: "notes",        label: "Notes",          icon: "📄", available: true  },
          { type: "questions",    label: "Practice Qs",    icon: "❓", available: true  },
          { type: "slides",       label: "Slides",         icon: "📊", available: true  },
          { type: "video",        label: "Video Lecture",  icon: "🎥", available: true  },
          { type: "audio",        label: "Audio Overview", icon: "🎧", available: true  },
          { type: "chapter-quiz", label: "Chapter Quiz",   icon: "✅", available: true  },
        ],
      },
      {
        id: "ar-10", number: 10, title: "Search and Rescue",
        description: "ICAO Annex 12: SAR organisation, RCC/RSC, emergency phases (uncertainty/alert/distress), SAR procedures for PIC, ground/air visual signals, SARSAT/COSPAS, survivor behaviour, SAR signals.",
        duration: "2 hrs", questionCount: 45,
        content: [
          { type: "notes",        label: "Notes",          icon: "📄", available: true  },
          { type: "questions",    label: "Practice Qs",    icon: "❓", available: true  },
          { type: "slides",       label: "Slides",         icon: "📊", available: true  },
          { type: "video",        label: "Video Lecture",  icon: "🎥", available: true  },
          { type: "audio",        label: "Audio Overview", icon: "🎧", available: true  },
          { type: "chapter-quiz", label: "Chapter Quiz",   icon: "✅", available: true  },
        ],
      },
      {
        id: "ar-11", number: 11, title: "Visual Aids for Navigation",
        description: "ICAO Annex 14: runway/taxiway markings, approach lighting (HIALS/MIALS/LIALS), PAPI and VASIS, runway and taxiway lights, aerodrome beacon, obstruction lighting, signal area, windsock, stopway/RESA markings.",
        duration: "3 hrs", questionCount: 55, content: makeContent(true),
      },
      {
        id: "ar-12", number: 12, title: "Procedures for Air Navigation Services Aircraft Operations",
        description: "ICAO Doc 8168 PANS-OPS Vol I: SIDs and STARs, instrument approach procedure segments, circling approach, missed approach, holding procedures, altimeter setting, RNAV and RNP approaches, performance-based navigation.",
        duration: "4 hrs", questionCount: 85, content: makeContent(true),
      },
      {
        id: "ar-13", number: 13, title: "National Law",
        description: "Indian Aircraft Act 1934 (Sections 1, 2, 8, 10, 11A, 11B, 17, 18). Aircraft Rules 1937. Indian Aircraft Rules 1920. Aircraft Rules 1954 (Public Health). Aircraft Rules 2003 (Dangerous Goods). CARs Sections 2, 7 and 8. Penalties and enforcement.",
        duration: "4 hrs", questionCount: 90, content: makeContent(true),
      },
      {
        id: "ar-14", number: 14, title: "Personnel Licensing",
        description: "ICAO Annex 1 & DGCA CARs: student pilot, PPL, CPL, ATPL licence requirements, privileges and limitations. Medical standards Class 1/2/3, validity, waivers. Flight instructor and examiner authorisations. Recent experience requirements.",
        duration: "3 hrs", questionCount: 60, content: makeContent(true),
      },
      {
        id: "ar-15", number: 15, title: "Airworthiness of Aircraft",
        description: "ICAO Annex 8: certificate of airworthiness, type certificate, continued airworthiness, maintenance release, MEL/CDL. Airworthiness directives, modifications and repairs, mass and balance documentation, DGCA airworthiness requirements.",
        duration: "3 hrs", questionCount: 55, content: makeContent(true),
      },
      {
        id: "ar-16", number: 16, title: "Operational Procedures",
        description: "ICAO Annex 6 & CAR-OPS: AOC requirements, operational control, fuel policy, mass and balance, performance planning, aerodrome operating minima, CAT I/II/III LVO, flight and duty time limitations, MEL operations.",
        duration: "4 hrs", questionCount: 75, content: makeContent(true),
      },
      {
        id: "ar-17", number: 17, title: "Special Operational Procedures and Hazards (General Aspects)",
        description: "Wind shear and microburst, wake turbulence avoidance, volcanic ash procedures, laser hazards, bird strikes, ground de-icing/anti-icing, GPWS/EGPWS, TCAS RAs, contaminated runways, dangerous goods (Annex 18).",
        duration: "3 hrs", questionCount: 60, content: makeContent(true),
      },
      {
        id: "ar-18", number: 18, title: "Communications",
        description: "ICAO Annex 10 Vol II: VHF radiotelephony procedures, standard phraseology, RTF call signs, readback requirements, position reports, distress (MAYDAY) and urgency (PAN-PAN) calls, communication failure procedures, SELCAL, CPDLC.",
        duration: "3 hrs", questionCount: 65, content: makeContent(true),
      },
      {
        id: "ar-19", number: 19, title: "Aircraft Accident and Incident",
        description: "ICAO Annex 13: definitions (accident/serious incident/incident), notification obligations, investigation principles, final report structure, mandatory occurrence reporting (MOR), DGCA safety reporting system, just culture.",
        duration: "2 hrs", questionCount: 40, content: makeContent(true),
      },
      {
        id: "ar-20", number: 20, title: "Facilitation",
        description: "ICAO Annex 9: entry and departure formalities, required aircraft documents (general declaration, passenger manifest), crew documentation, persons in distress, customs and immigration procedures for aviation.",
        duration: "2 hrs", questionCount: 35, content: makeContent(true),
      },
      {
        id: "ar-21", number: 21, title: "Security — Safeguarding International Civil Aviation against Acts of Unlawful Interference",
        description: "ICAO Annex 17: national aviation security programme, threat assessment, access control, passenger and baggage screening, hold baggage reconciliation, air cargo security, response to unlawful interference, AVSEC training.",
        duration: "2 hrs", questionCount: 45, content: makeContent(true),
      },
      {
        id: "ar-22", number: 22, title: "Human Performance and Limitations",
        description: "Information processing, perception and attention, memory, decision-making models, situational awareness, workload management, threat and error management framework, automation and complacency.",
        duration: "3 hrs", questionCount: 70, content: makeContent(true),
      },
      {
        id: "ar-23", number: 23, title: "Crew Resource Management (CRM) Threat and Error Management (TEM) and Line-Oriented Flight Training (LOFT)",
        description: "CRM principles: communication, leadership, teamwork, conflict resolution. TEM model: threats, errors, undesired aircraft states. LOFT methodology, scenario-based training, non-technical skills assessment, NOTECHS framework.",
        duration: "3 hrs", questionCount: 55, content: makeContent(true),
      },
      {
        id: "ar-24", number: 24, title: "Aviation Psychology and Human Factors",
        description: "Stress and fatigue in aviation, motivation and attitudes, hazardous attitudes, personality factors, vigilance and boredom, interpersonal dynamics, organisational culture, error-producing conditions, defensive behaviours.",
        duration: "3 hrs", questionCount: 55, content: makeContent(true),
      },
      {
        id: "ar-25", number: 25, title: "Aviation Physiology and Human Factors",
        description: "Hypoxia types and time of useful consciousness, hyperventilation, spatial disorientation and illusions (leans, graveyard spiral, somatogravic), G-forces, vision in flight (night vision, empty field myopia), hearing, altitude physiology.",
        duration: "3 hrs", questionCount: 60, content: makeContent(true),
      },
      {
        id: "ar-26", number: 26, title: "Additional Practice Questions: Human Factors",
        description: "Integrated practice questions spanning human performance, CRM, aviation psychology, and aviation physiology — designed for final revision and exam consolidation.",
        duration: "2 hrs", questionCount: 50, content: makeContent(true),
      },
    ],
  },

  // ── PAPER 4 ── Appendix D ────────────────────────────────────────────────
  {
    id: "technical-general",
    name: "Aircraft & Engines",
    shortName: "Tech General",
    icon: "⚙️",
    color: "#f59e0b",
    description: "Airframe, systems, electrical, power plant, aerodynamics, stability, control, limitations, propellers, and flight mechanics. Covers Appendix D of the DGCA CPL syllabus.",
    examDuration: 60,
    totalQuestions: 50,
    passMark: 70,
    chapters: [
      {
        id: "tg-1", number: 1, title: "Airframe & Flight Controls",
        description: "Fuselage types and stress, wings (types, structural components), stabilising surfaces (vertical, horizontal, V-tail, flutter, mach trim). Primary controls: elevator, aileron, rudder, trim, actuation modes (mechanical/hydraulic/electrical/fly-by-wire). Secondary controls: leading/trailing edge devices, lift dumpers, speed brakes, variable elevator.",
        duration: "3 hrs", questionCount: 80, content: makeContent(),
      },
      {
        id: "tg-2", number: 2, title: "Landing Gear & Hydraulic Systems",
        description: "Landing gear types, locking devices, emergency extension, accidental retraction prevention, position/movement lights, nose wheel steering, wheels/tyres, braking systems (parking brake, anti-skid, autobrake). Hydraulic principles, fluids, schematic construction, main/standby/emergency systems, operation, indicators, warnings, ancillary systems.",
        duration: "3 hrs", questionCount: 75, content: makeContent(),
      },
      {
        id: "tg-3", number: 3, title: "Pneumatic, Air Conditioning & Pressurisation",
        description: "Pneumatic power sources, construction, failures, pneumatic-operated systems. Air conditioning: construction, heating/cooling, temperature regulation, ram air ventilation. Pressurisation: cabin altitude, maximum differential pressure, pressurised zones, safety devices, rapid decompression, emergency procedures.",
        duration: "3 hrs", questionCount: 75, content: makeContent(),
      },
      {
        id: "tg-4", number: 4, title: "Anti-Ice Systems & Fuel Systems",
        description: "Anti-ice: aerofoil/control surfaces, power plant, air intakes, windshield, operating limitations, de-icing timing, ice warning. Non-pneumatic de-ice: air intake, propeller, pitot/static, stall warning, windshield, rain repellent. Fuel system: tank types/location, re-fuelling sequence, unusable fuel, gravity/pressure feed, crossfeed, fuel management, dipstick.",
        duration: "3 hrs", questionCount: 70, content: makeContent(),
      },
      {
        id: "tg-5", number: 5, title: "Electrical Systems — DC & AC",
        description: "DC: electric circuits, Ohm's law, capacitor, batteries (types/capacity/hazards), magnetism, electromagnetic induction, generators, alternators, regulation, starter generator, DC buses, ammeter/voltmeter, inverter. AC: single/multi-phase, frequency, phase shift, 3-phase generator, brushless generator, constant speed drive, integrated drive, AC distribution, protection, transformers, TRUs. Basic logic circuits.",
        duration: "4 hrs", questionCount: 90, content: makeContent(),
      },
      {
        id: "tg-6", number: 6, title: "Piston Engines",
        description: "Design types, 4-stroke internal combustion cycle, mechanical components, lubrication system, air cooling (cylinder head temperature, cowl flaps), ignition (magneto types, magneto check), engine fuel supply (carburetor icing, fuel injection, alternate air), engine performance (density altitude), turbocharger/supercharger, fuel types/grades/octane/colour coding, mixture (rich/lean, power/economy settings).",
        duration: "4 hrs", questionCount: 90, content: makeContent(),
      },
      {
        id: "tg-7", number: 7, title: "Propellers",
        description: "Fixed pitch and constant speed propellers, principles and operation on single/multi-engine aircraft, propeller check, efficiency as function of airspeed, ground/air limitations. Torque reaction, gyroscopic precession, asymmetric slipstream effect, asymmetric blade effect, engine failure (windmilling drag, feathering), design features (blade aspect ratio, diameter, blade count, noise).",
        duration: "3 hrs", questionCount: 70, content: makeContent(),
      },
      {
        id: "tg-8", number: 8, title: "Turbine Engines",
        description: "Principles of operation, types (turboprop, turbojet, turbofan). Construction: air inlet, compressor (stall/surge), diffuser, combustion chamber (types, fuel injectors, thermal load), turbine (thermal/mechanical stress), jet pipe (types, noise silencing). Pressure/temperature/airflow, reverse thrust, bleed air effects, auxiliary gearbox. Engine systems: ignition, starter (malfunctions), fuel, lubrication. Thrust formula, flat rating, APU, RAT.",
        duration: "4 hrs", questionCount: 95, content: makeContent(),
      },
      {
        id: "tg-9", number: 9, title: "Emergency Equipment",
        description: "Doors and emergency exits, evacuation slides. Smoke detection (location, function test). Fire detection (warning modes, function test). Fire fighting equipment (contents, gauge). Aircraft oxygen equipment (rapid decompression drill, oxygen generators). Portable fire extinguisher, smoke protection hood, portable oxygen, ELT, life jacket, life raft, emergency lighting, megaphone, crash axe.",
        duration: "2 hrs", questionCount: 55, content: makeContent(),
      },
      {
        id: "tg-10", number: 10, title: "Subsonic Aerodynamics",
        description: "Newton's laws, Bernoulli's theorem, continuity equation, IAS/CAS/EAS/TAS. Aerofoil shape (camber, chord, thickness, nose radius, angle of attack, angle of incidence). 2D and 3D airflow, lift/drag coefficients, CL-α graph, CLmax, CD, profile polar. Tip vortices, induced drag, ground effect. Stall (boundary layer, flow separation, stall speed, wing planform, high-lift devices, stall warning, spin recovery).",
        duration: "5 hrs", questionCount: 110, content: makeContent(),
      },
      {
        id: "tg-11", number: 11, title: "Transonic Aerodynamics",
        description: "Mach number, speed of sound, compressibility. Normal shock waves, Mcrit, influence of Mach/control deflection/angle of attack/aerofoil thickness/sweep/area ruling. Shock stall, Mach buffet, aerodynamic heating. Mach trim, buffet margin, aerodynamic ceiling. Supercritical aerofoil, vortex generators.",
        duration: "3 hrs", questionCount: 70, content: makeContent(),
      },
      {
        id: "tg-12", number: 12, title: "Aircraft Stability",
        description: "Longitudinal stability: static/dynamic, neutral point, CG limits, CM-α graph, elevator-speed graph, stick force per g, phugoid, short period, bob weight, down spring, Mach trim. Directional stability: CN-β graph, dorsal fin, strakes. Lateral stability: CL-β graph, dihedral/anhedral, wing location. Dynamic lateral: Dutch roll, yaw damper, spiral dive, effects of altitude.",
        duration: "4 hrs", questionCount: 85, content: makeContent(),
      },
      {
        id: "tg-13", number: 13, title: "Aircraft Control, Limitations & Flight Mechanics",
        description: "Control: pitch (elevator, down-wash, ice on tail), yaw (VMCA/VMCG, engine failure), roll (ailerons, spoilers, adverse yaw, frise ailerons). Aerodynamic & artificial balance, mass balance, trimming. Limitations: flutter, aileron reversal, VMO/VNE/MMO. Manoeuvring envelope (VA/VC/VD, load factor, mass/altitude/Mach contribution). Gust envelope, VB/VRA. Flight mechanics: forces in flight, asymmetric thrust, VMCA/VMCL/VMCG, emergency descent, windshear.",
        duration: "4 hrs", questionCount: 90, content: makeContent(),
      },
    ],
  },

  // ── PAPER 5 ── Technical Specific ────────────────────────────────────────
  {
    id: "technical-specific",
    name: "Technical Specific",
    shortName: "Tech Specific",
    icon: "🛩️",
    color: "#ec4899",
    description: "Aircraft-type specific paper covering the systems and operations of the particular aircraft for which the CPL is sought.",
    examDuration: 60,
    totalQuestions: 50,
    passMark: 70,
    chapters: [
      {
        id: "ts-1", number: 1, title: "Aircraft Type — Systems Overview",
        description: "General description of the specific aircraft type: manufacturer, model, certification category, max take-off weight, seating, powerplant type.",
        duration: "2 hrs", questionCount: 50, content: makeContent(),
      },
      {
        id: "ts-2", number: 2, title: "Powerplant — Type Specific",
        description: "Engine model, type (piston/turboprop/turbojet), fuel type, oil type, engine limitations (RPM limits, CHT/EGT limits), engine operating procedures.",
        duration: "3 hrs", questionCount: 70, content: makeContent(),
      },
      {
        id: "ts-3", number: 3, title: "Fuel System — Type Specific",
        description: "Fuel tank arrangement, total usable/unusable fuel, fuel selector positions, crossfeed procedures, fuel management, fuel system limitations.",
        duration: "2 hrs", questionCount: 55, content: makeContent(),
      },
      {
        id: "ts-4", number: 4, title: "Electrical System — Type Specific",
        description: "Generator/alternator type, battery specifications, bus configuration, circuit breakers layout, emergency electrical procedures.",
        duration: "2 hrs", questionCount: 50, content: makeContent(),
      },
      {
        id: "ts-5", number: 5, title: "Avionics & Navigation Equipment",
        description: "Installed navigation radios (VHF COM/NAV, ADF, GPS), autopilot (if fitted), transponder, ELT, intercom. EFIS/glass cockpit layout (if applicable).",
        duration: "2 hrs", questionCount: 55, content: makeContent(),
      },
      {
        id: "ts-6", number: 6, title: "Normal Operating Procedures",
        description: "Pre-flight inspection, starting procedures, taxiing, take-off, climb, cruise, descent, landing, shutdown — as per the specific AFM/POH.",
        duration: "3 hrs", questionCount: 70, content: makeContent(),
      },
      {
        id: "ts-7", number: 7, title: "Abnormal & Emergency Procedures",
        description: "Engine failure procedures (on ground and in-flight), electrical failures, fire procedures, forced landing, emergency descent, pressurisation emergencies — as per AFM/POH.",
        duration: "3 hrs", questionCount: 70, content: makeContent(),
      },
      {
        id: "ts-8", number: 8, title: "Aircraft Limitations & V-Speeds",
        description: "All published limitations: MTOW, ZFW, CG limits, flap/gear speed limits, max demonstrated crosswind, Vne/Vno/Va/Vfe/Vlo/Vle/Vx/Vy/Vso/Vs1 for the specific type.",
        duration: "2 hrs", questionCount: 60, content: makeContent(),
      },
    ],
  },

  // ── PAPER 6 ── Technical Performance ─────────────────────────────────────
  {
    id: "technical-performance",
    name: "Technical Performance",
    shortName: "Tech Perf",
    icon: "📈",
    color: "#8b5cf6",
    description: "Performance of aircraft with MTOW above 5700 kg or twin-engine helicopters. Covers take-off, climb, cruise, landing, OEI performance, mass & balance, and performance charts.",
    examDuration: 60,
    totalQuestions: 50,
    passMark: 70,
    chapters: [
      {
        id: "tp-1", number: 1, title: "Performance Terms & V-Speeds",
        description: "Definitions of all performance speeds (V1, VR, V2, VMCA, VMCG, VNE, VA, VFE, VLO, VLE, VX, VY, VREF, VAP), performance terminology (TODR, TORA, TODA, ASDA, ASD, LDR, LDA), field length requirements.",
        duration: "3 hrs", questionCount: 80, content: makeContent(),
      },
      {
        id: "tp-2", number: 2, title: "Take-Off Performance",
        description: "Effect of mass, wind, density altitude, runway slope, runway surface condition, obstacle clearance at take-off, accelerate-stop distance, balanced field length, use of performance charts and AFM data.",
        duration: "4 hrs", questionCount: 90, content: makeContent(),
      },
      {
        id: "tp-3", number: 3, title: "Climb Performance",
        description: "Rate of climb, angle of climb, best-rate/best-angle speeds, service ceiling, absolute ceiling, effect of density altitude and mass, climb gradients (1st/2nd/3rd segments), OEI climb performance, obstacle clearance on departure.",
        duration: "3 hrs", questionCount: 75, content: makeContent(),
      },
      {
        id: "tp-4", number: 4, title: "Cruise & En-Route Performance",
        description: "En-route requirements (OEI drift down), cruise altitude and altitude ceiling, payload/range trade-offs, speed/economy trade-offs, specific air range, LRC, effect of selected power settings and aircraft configuration.",
        duration: "3 hrs", questionCount: 75, content: makeContent(),
      },
      {
        id: "tp-5", number: 5, title: "Landing Performance",
        description: "Landing distance required, approach speed (VREF, VAPP), effect of mass/wind/density altitude/runway slope/runway condition, autoland performance, contaminated runway corrections, missed approach climb gradient.",
        duration: "3 hrs", questionCount: 75, content: makeContent(),
      },
      {
        id: "tp-6", number: 6, title: "Mass & Balance — Heavy Aircraft",
        description: "DOM, ZFW, MZFW, TOW, MTOW, LW, MLW, moment and CG calculations, load sheet completion, % MAC, effect of fuel burn on CG, trim, CG limits in take-off/landing/cruise, effect of undercarriage position.",
        duration: "3 hrs", questionCount: 80, content: makeContent(),
      },
      {
        id: "tp-7", number: 7, title: "Fuel Planning",
        description: "Trip fuel, contingency fuel, alternate fuel, final reserve, additional fuel, extra fuel, minimum fuel, total fuel requirement, fuel policy, fuel monitoring in flight, comparison of actual vs planned consumption.",
        duration: "3 hrs", questionCount: 70, content: makeContent(),
      },
      {
        id: "tp-8", number: 8, title: "Performance Charts & Graphs",
        description: "Reading and applying aircraft flight manual performance charts (WAT charts, climb charts, range/endurance graphs, crosswind component chart, contaminated runway correction tables). Use of tabulated data.",
        duration: "4 hrs", questionCount: 85, content: makeContent(),
      },
    ],
  },

  // ── PAPER 7 ── Radio Telephony ────────────────────────────────────────────
  {
    id: "radio-telephony",
    name: "Radio Telephony",
    shortName: "RTF",
    icon: "📻",
    color: "#ef4444",
    description: "RTF procedures, phraseology, call signs, distress & urgency, communication failure actions, and VHF propagation as per DGCA CPL syllabus section 2.1.7.",
    examDuration: 45,
    totalQuestions: 30,
    passMark: 70,
    chapters: [
      {
        id: "rtf-1", number: 1, title: "RTF Terminology & Definitions",
        description: "Meaning and significance of associated terms, ATS abbreviations, Q-code groups commonly used in RTF air-ground communications, categories of messages.",
        duration: "2 hrs", questionCount: 55, content: makeContent(),
      },
      {
        id: "rtf-2", number: 2, title: "General Operating Procedures",
        description: "Transmission of letters (phonetic alphabet), transmission of numbers (including level information), transmission of time, standard words and phrases, radiotelephony call signs for aeronautical stations and aircraft (including abbreviated call signs), transfer of communication.",
        duration: "3 hrs", questionCount: 70, content: makeContent(),
      },
      {
        id: "rtf-3", number: 3, title: "Readback, Test & Radar Phraseology",
        description: "Test procedures including readability scale, establishment of RTF communications, read-back and acknowledgement requirements, radar procedural phraseology, level changes and reports.",
        duration: "2 hrs", questionCount: 60, content: makeContent(),
      },
      {
        id: "rtf-4", number: 4, title: "Weather Information in RTF",
        description: "Aerodrome weather broadcasts, ATIS, VOLMET, in-flight weather information relevant to VFR and IFR operations, SIGMET notification phraseology.",
        duration: "2 hrs", questionCount: 50, content: makeContent(),
      },
      {
        id: "rtf-5", number: 5, title: "Communication Failure Procedures",
        description: "Action required to be taken in case of RTF communication failure in VMC and IMC, transponder squawk 7600, actions by pilot-in-command, ATC expectations following communication failure.",
        duration: "2 hrs", questionCount: 55, content: makeContent(),
      },
      {
        id: "rtf-6", number: 6, title: "Distress & Urgency Procedures",
        description: "Distress: definition, frequencies, watch of distress frequencies, MAYDAY signal, distress message format. Urgency: definition, frequencies, PAN-PAN signal, urgency message format. PAN medical. ELT operation.",
        duration: "2 hrs", questionCount: 60, content: makeContent(),
      },
      {
        id: "rtf-7", number: 7, title: "VHF Propagation & Frequency Allocation",
        description: "General principles of VHF propagation, line-of-sight range, frequency band allocation for aviation communications, SELCAL, HF communications basics.",
        duration: "2 hrs", questionCount: 50, content: makeContent(),
      },
    ],
  },

  // ── INSTRUMENTATION (Oxford ATPL Book 5) ─────────────────────────────────
  {
    id: "instrumentation",
    name: "Navigation — Instrumentation",
    shortName: "Instrumentation",
    icon: "🧭",
    color: "#f59e0b",
    description: "Flight instruments, gyroscopics, compasses, air data, INS/IRS, FMS, EFIS, automatic flight control, warning & recording systems, and powerplant instrumentation. Chapter-wise notes from the Oxford ATPL Instrumentation manual.",
    examDuration: 60,
    totalQuestions: 50,
    passMark: 70,
    chapters: [
      {
        id: "inst-1", number: 1, title: "Characteristics and General Definitions",
        description: "Oxford ATPL Instrumentation, Chapter 1: Characteristics and General Definitions. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 8, content: makeContent(true),
      },
      {
        id: "inst-2", number: 2, title: "Pitot and Static Sources",
        description: "Oxford ATPL Instrumentation, Chapter 2: Pitot and Static Sources. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 8, content: makeContent(true),
      },
      {
        id: "inst-3", number: 3, title: "Air Temperature Measurement",
        description: "Oxford ATPL Instrumentation, Chapter 3: Air Temperature Measurement. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 8, content: makeContent(true),
      },
      {
        id: "inst-4", number: 4, title: "The Airspeed Indicator (ASI)",
        description: "Oxford ATPL Instrumentation, Chapter 4: The Airspeed Indicator (ASI). DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 9, content: makeContent(true),
      },
      {
        id: "inst-5", number: 5, title: "The Pressure Altimeter",
        description: "Oxford ATPL Instrumentation, Chapter 5: The Pressure Altimeter. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 7, content: makeContent(true),
      },
      {
        id: "inst-6", number: 6, title: "The Vertical Speed Indicator",
        description: "Oxford ATPL Instrumentation, Chapter 6: The Vertical Speed Indicator. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 9, content: makeContent(true),
      },
      {
        id: "inst-7", number: 7, title: "The Machmeter",
        description: "Oxford ATPL Instrumentation, Chapter 7: The Machmeter. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 9, content: makeContent(true),
      },
      {
        id: "inst-8", number: 8, title: "Air Data Computer",
        description: "Oxford ATPL Instrumentation, Chapter 8: Air Data Computer. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 6, content: makeContent(true),
      },
      {
        id: "inst-9", number: 9, title: "Terrestrial Magnetism",
        description: "Oxford ATPL Instrumentation, Chapter 9: Terrestrial Magnetism. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 7, content: makeContent(true),
      },
      {
        id: "inst-10", number: 10, title: "The Direct Indicating Compass",
        description: "Oxford ATPL Instrumentation, Chapter 10: The Direct Indicating Compass. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 9, content: makeContent(true),
      },
      {
        id: "inst-11", number: 11, title: "Gyroscopes",
        description: "Oxford ATPL Instrumentation, Chapter 11: Gyroscopes. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 9, content: makeContent(true),
      },
      {
        id: "inst-12", number: 12, title: "Directional Gyro Indicator (DGI)",
        description: "Oxford ATPL Instrumentation, Chapter 12: Directional Gyro Indicator (DGI). DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 10, content: makeContent(true),
      },
      {
        id: "inst-13", number: 13, title: "The Artificial Horizon",
        description: "Oxford ATPL Instrumentation, Chapter 13: The Artificial Horizon. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 9, content: makeContent(true),
      },
      {
        id: "inst-14", number: 14, title: "The Turn and Slip Indicator",
        description: "Oxford ATPL Instrumentation, Chapter 14: The Turn and Slip Indicator. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 6, content: makeContent(true),
      },
      {
        id: "inst-15", number: 15, title: "The Turn Co-ordinator",
        description: "Oxford ATPL Instrumentation, Chapter 15: The Turn Co-ordinator. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 3, content: makeContent(true),
      },
      {
        id: "inst-16", number: 16, title: "Aircraft Magnetism",
        description: "Oxford ATPL Instrumentation, Chapter 16: Aircraft Magnetism. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 7, content: makeContent(true),
      },
      {
        id: "inst-17", number: 17, title: "Remote Indicating Magnetic Compass",
        description: "Oxford ATPL Instrumentation, Chapter 17: Remote Indicating Magnetic Compass. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 6, content: makeContent(true),
      },
      {
        id: "inst-18", number: 18, title: "Inertial Navigation Systems",
        description: "Oxford ATPL Instrumentation, Chapter 18: Inertial Navigation Systems. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 8, content: makeContent(true),
      },
      {
        id: "inst-19", number: 19, title: "Inertial Reference System",
        description: "Oxford ATPL Instrumentation, Chapter 19: Inertial Reference System. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 1, content: makeContent(true),
      },
      {
        id: "inst-20", number: 20, title: "Radio Altimeter",
        description: "Oxford ATPL Instrumentation, Chapter 20: Radio Altimeter. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-21", number: 21, title: "Flight Management System",
        description: "Oxford ATPL Instrumentation, Chapter 21: Flight Management System. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-22", number: 22, title: "Electronic Flight Information Systems",
        description: "Oxford ATPL Instrumentation, Chapter 22: Electronic Flight Information Systems. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 16, content: makeContent(true),
      },
      {
        id: "inst-23", number: 23, title: "Basic Computers",
        description: "Oxford ATPL Instrumentation, Chapter 23: Basic Computers. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 12, content: makeContent(true),
      },
      {
        id: "inst-24", number: 24, title: "Future Air Navigation Systems (FANS)",
        description: "Oxford ATPL Instrumentation, Chapter 24: Future Air Navigation Systems (FANS). DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-25", number: 25, title: "Flight Director Systems",
        description: "Oxford ATPL Instrumentation, Chapter 25: Flight Director Systems. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-26", number: 26, title: "Autopilot",
        description: "Oxford ATPL Instrumentation, Chapter 26: Autopilot. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-27", number: 27, title: "Autoland",
        description: "Oxford ATPL Instrumentation, Chapter 27: Autoland. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-28", number: 28, title: "Autothrottle",
        description: "Oxford ATPL Instrumentation, Chapter 28: Autothrottle. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-29", number: 29, title: "Yaw Dampers",
        description: "Oxford ATPL Instrumentation, Chapter 29: Yaw Dampers. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-30", number: 30, title: "Control Laws",
        description: "Oxford ATPL Instrumentation, Chapter 30: Control Laws. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-31", number: 31, title: "AFCS Revision Questions",
        description: "Oxford ATPL Instrumentation, Chapter 31: AFCS Revision Questions. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-32", number: 32, title: "Flight Warning Systems",
        description: "Oxford ATPL Instrumentation, Chapter 32: Flight Warning Systems. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-33", number: 33, title: "Aerodynamic Warnings",
        description: "Oxford ATPL Instrumentation, Chapter 33: Aerodynamic Warnings. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-34", number: 34, title: "Ground Proximity Warning System",
        description: "Oxford ATPL Instrumentation, Chapter 34: Ground Proximity Warning System. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-35", number: 35, title: "Airborne Collision and Avoidance System",
        description: "Oxford ATPL Instrumentation, Chapter 35: Airborne Collision and Avoidance System. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-36", number: 36, title: "Flight Data Recorder",
        description: "Oxford ATPL Instrumentation, Chapter 36: Flight Data Recorder. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-37", number: 37, title: "Cockpit Voice Recorder",
        description: "Oxford ATPL Instrumentation, Chapter 37: Cockpit Voice Recorder. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-38", number: 38, title: "Engine Instrumentation",
        description: "Oxford ATPL Instrumentation, Chapter 38: Engine Instrumentation. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-39", number: 39, title: "Electronic Instrumentation",
        description: "Oxford ATPL Instrumentation, Chapter 39: Electronic Instrumentation. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
      {
        id: "inst-40", number: 40, title: "Revision Questions",
        description: "Oxford ATPL Instrumentation, Chapter 40: Revision Questions. DGCA CPL/ATPL exam-ready study notes with diagrams, worked examples, and practice Q&A.",
        duration: "2 hrs", questionCount: 0, content: makeContent(),
      },
    ],
  },
  {
    id: "radio-navigation",
    name: "Radio Navigation",
    shortName: "Radio Nav",
    icon: "📡",
    color: "#06b6d4",
    description: "Radio wave properties and propagation, modulation and antennae, and the full suite of radio navigation aids — Doppler, VDF, ADF/NDB, VOR, ILS, MLS, radar (ground/airborne/SSR), DME, RNAV, EFIS and GNSS. Chapter-wise notes from the Oxford ATPL Radio Navigation manual with practice Q&A.",
    examDuration: 60,
    totalQuestions: 50,
    passMark: 70,
    chapters: [
      {
        id: "rnav-1", number: 1, title: "Properties of Radio Waves",
        description: "The electromagnetic spectrum, wavelength/frequency/velocity, phase and polarisation — the physical basis of all radio navigation.",
        duration: "2 hrs", questionCount: 12, content: makeContent(true),
      },
      {
        id: "rnav-2", number: 2, title: "Radio Propagation Theory",
        description: "Ground, sky and space waves, surface attenuation, ionospheric refraction, critical angle, skip distance, fading and the factors affecting range.",
        duration: "2 hrs", questionCount: 8, content: makeContent(true),
      },
      {
        id: "rnav-3", number: 3, title: "Modulation",
        description: "Amplitude and frequency modulation, sidebands, bandwidth, keying and the carrier/intelligence relationship used by nav aids.",
        duration: "1 hr", questionCount: 3, content: makeContent(true),
      },
      {
        id: "rnav-4", number: 4, title: "Antennae",
        description: "Antenna principles, dipoles and directional arrays, polar diagrams, gain and the aerials used by ground and airborne equipment.",
        duration: "1 hr", questionCount: 4, content: makeContent(true),
      },
      {
        id: "rnav-5", number: 5, title: "Doppler Radar Systems",
        description: "The Doppler shift principle, beam geometry, drift and groundspeed measurement, and Doppler navigation system operation.",
        duration: "1 hr", questionCount: 3, content: makeContent(true),
      },
      {
        id: "rnav-6", number: 6, title: "VHF Direction Finder (VDF)",
        description: "VDF principles, QDM/QDR/QTE/QUJ bearings, classes of bearing accuracy, range and operational use.",
        duration: "1 hr", questionCount: 6, content: makeContent(true),
      },
      {
        id: "rnav-7", number: 7, title: "ADF / NDB",
        description: "NDB and ADF principles, the loop and sense aerials, relative/magnetic bearings, RMI, errors and factors affecting accuracy and range.",
        duration: "2 hrs", questionCount: 19, content: makeContent(true),
      },
      {
        id: "rnav-8", number: 8, title: "VOR",
        description: "VOR principle of operation, reference and variable phases, radials, Doppler VOR, cockpit display/CDI, errors, coverage and designated operational range.",
        duration: "2 hrs", questionCount: 33, content: makeContent(true),
      },
      {
        id: "rnav-9", number: 9, title: "ILS",
        description: "Instrument Landing System — localiser, glidepath, marker beacons, categories, coverage, false glidepaths and ILS errors and limitations.",
        duration: "2 hrs", questionCount: 14, content: makeContent(true),
      },
      {
        id: "rnav-10", number: 10, title: "MLS",
        description: "Microwave Landing System — principle of operation, coverage, advantages over ILS and the reasons it never replaced it.",
        duration: "1 hr", questionCount: 1, content: makeContent(true),
      },
      {
        id: "rnav-11", number: 11, title: "Radar Principles",
        description: "Pulse radar theory — PRF, PRP, pulse width, maximum/minimum range, range resolution, the radar equation and factors affecting radar performance.",
        duration: "2 hrs", questionCount: 14, content: makeContent(true),
      },
      {
        id: "rnav-12", number: 12, title: "Ground Radar",
        description: "Area surveillance radar, terminal/approach radar, surface movement radar — frequencies, ranges and ATC use of primary ground radars.",
        duration: "1 hr", questionCount: 4, content: makeContent(true),
      },
      {
        id: "rnav-13", number: 13, title: "Airborne Weather Radar",
        description: "AWR functions, weather and mapping modes, cosecant-squared beam, tilt management, colour returns, windshear/turbulence detection and operating precautions.",
        duration: "2 hrs", questionCount: 11, content: makeContent(true),
      },
      {
        id: "rnav-14", number: 14, title: "SSR",
        description: "Secondary Surveillance Radar — interrogation modes A/C/S, transponder codes, advantages over primary radar, and Mode S datalink.",
        duration: "1 hr", questionCount: 5, content: makeContent(true),
      },
      {
        id: "rnav-15", number: 15, title: "DME",
        description: "Distance Measuring Equipment — twin-pulse interrogation, slant range, frequency pairing with VOR/ILS, station identification and accuracy.",
        duration: "2 hrs", questionCount: 19, content: makeContent(true),
      },
      {
        id: "rnav-16", number: 16, title: "Area Navigation (RNAV)",
        description: "RNAV principles, 2D/3D/4D systems, B-RNAV and P-RNAV, RNP, waypoint navigation and the inputs an RNAV computer uses.",
        duration: "2 hrs", questionCount: 15, content: makeContent(true),
      },
      {
        id: "rnav-17", number: 17, title: "EFIS",
        description: "Electronic Flight Information System — EADI/EHSI displays, map/plan/rose modes, colour conventions and the symbology shown in each mode.",
        duration: "2 hrs", questionCount: 9, content: makeContent(true),
      },
      {
        id: "rnav-18", number: 18, title: "GNSS",
        description: "Global Navigation Satellite Systems — GPS/GLONASS/Galileo segments, position fixing, errors, RAIM, and augmentation (SBAS/GBAS/ABAS).",
        duration: "2 hrs", questionCount: 25, content: makeContent(true),
      },
      {
        id: "rnav-19", number: 19, title: "Revision Questions",
        description: "Full-syllabus Radio Navigation revision bank — 243 exam-style questions with answers covering every chapter of the book.",
        duration: "4 hrs", questionCount: 243, content: makeContent(true),
      },
      {
        id: "rnav-20", number: 20, title: "Quick Reference",
        description: "One-stop quick-reference summary — frequencies, bands, ranges and key numbers for every radio navigation aid. Ideal last-minute revision.",
        duration: "30 min", questionCount: 0, content: makeContent(),
      },
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
      { id: "aar-1", number: 1, title: "ICAO SARPs & Annexures (Advanced)",         description: "Deep dive into annexures 1–18 and their SARPS.",                                   duration: "4 hrs", questionCount: 100, content: makeContent(true) },
      { id: "aar-2", number: 2, title: "Air Operator Certificate (AOC)",             description: "AOC requirements, operations manual, quality system.",                              duration: "4 hrs", questionCount: 90,  content: makeContent(true) },
      { id: "aar-3", number: 3, title: "ATPL Licensing Requirements",               description: "Hours, type ratings, recency, medical, ATPL privileges.",                           duration: "3 hrs", questionCount: 80,  content: makeContent(true) },
      { id: "aar-4", number: 4, title: "Dangerous Goods (IATA/ICAO)",               description: "Hazmat classification, packaging, documentation, carriage.",                        duration: "3 hrs", questionCount: 70,  content: makeContent(true) },
      { id: "aar-5", number: 5, title: "CAT Operations & Minima",                   description: "CAT I/II/III operations, RVR requirements, crew requirements.",                    duration: "3 hrs", questionCount: 80,  content: makeContent(true) },
      { id: "aar-6", number: 6, title: "Flight & Duty Time Limitations (FTL)",      description: "FDTL regulations, rest requirements, flight time limits.",                          duration: "3 hrs", questionCount: 75,  content: makeContent(true) },
      { id: "aar-7", number: 7, title: "Aircraft Accident Investigation",            description: "ICAO Annex 13, AAIB, mandatory occurrence reporting.",                             duration: "2 hrs", questionCount: 60,  content: makeContent(true) },
      { id: "aar-8", number: 8, title: "Security & Threats",                        description: "Unlawful interference, threat assessment, emergency procedures.",                   duration: "2 hrs", questionCount: 55,  content: makeContent(true) },
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
