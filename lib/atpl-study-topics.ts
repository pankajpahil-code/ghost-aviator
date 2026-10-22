// Navigation index for existing authored notes, not a claim of complete syllabus coverage.
// Keep chapter identities and source files intact across both study tracks.
export type AtplTopic = {
  id: string;
  title: string;
  sources: { subjectId: string; chapterIds: string[] }[];
};

const source = (subjectId: string, prefix: string, numbers: number[]) => ({
  subjectId, chapterIds: numbers.map(n => `${prefix}-${n}`),
});
const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const topic = (id: string, title: string, ...sources: AtplTopic["sources"]): AtplTopic => ({ id, title, sources });

export const ATPL_STUDY_TOPICS: Record<string, AtplTopic[]> = {
  "atpl-navigation": [
    topic("earth", "Earth, directions and magnetism", source("air-navigation", "nav", [13, 14, 15, 20, 21])),
    topic("charts", "Charts and map reading", source("air-navigation", "nav", [3, 19, 22, 23, 24, 25, 26])),
    topic("time", "Time calculations", source("air-navigation", "nav", [27, 28, 29])),
    topic("navigation", "Navigation calculations and flight planning", source("air-navigation", "nav", [16, 17, 18, 9]),
      { subjectId: "air-navigation", chapterIds: ["nav-cx3-5", "nav-cx3-6", "nav-cx3-7", "nav-cx3-8a", "nav-cx3-9"] }),
    topic("mass-performance", "Mass, balance and aeroplane performance", source("air-navigation", "nav", [6, 7, 8])),
    topic("revision", "Navigation revision", source("air-navigation", "nav", [33])),
  ],
  "atpl-meteorology": [
    topic("atmosphere", "Atmosphere, pressure and temperature", source("meteorology", "met", [1, 2, 3, 4, 5])),
    topic("clouds", "Clouds, stability, precipitation and visibility", source("meteorology", "met", [7, 8, 9, 10, 11])),
    topic("systems", "Winds, weather systems and climatology", source("meteorology", "met", [6, 14, 15, 18, 19, 20])),
    topic("hazards", "Icing, thunderstorms and turbulence", source("meteorology", "met", [12, 13, 16, 17])),
    topic("reports", "Observations, reports, forecasts and briefing", source("meteorology", "met", range(21, 29))),
  ],
  "atpl-radio-aids": [
    topic("radio", "Radio principles and propagation", source("radio-navigation", "rnav", [1, 2, 3, 4])),
    topic("aids", "Navigation aids and approach systems", source("radio-navigation", "rnav", [5, 6, 7, 8, 9, 10, 15, 16, 17, 18])),
    topic("radar", "Radar and surveillance", source("radio-navigation", "rnav", [11, 12, 13, 14])),
    topic("air-data", "Air data and pressure instruments", source("instrumentation", "inst", range(1, 8))),
    topic("heading", "Compasses, gyros and attitude instruments", source("instrumentation", "inst", range(9, 17))),
    topic("navigation-systems", "Inertial navigation, FMS and electronic displays", source("instrumentation", "inst", range(18, 24))),
    topic("automatic-flight", "Flight guidance and automatic flight", source("instrumentation", "inst", range(25, 30))),
    topic("warnings", "Warnings, recorders and engine instruments", source("instrumentation", "inst", range(32, 39))),
    topic("revision", "Radio aids and instruments revision", source("radio-navigation", "rnav", [19, 20]), source("instrumentation", "inst", [31, 40])),
  ],
  "atpl-air-regulations": [
    topic("law", "Conventions, national law and licensing", source("air-regulations", "ar", [1, 2, 13, 14, 15, 20])),
    topic("ats", "Rules of the air, ATS and aerodrome procedures", source("air-regulations", "ar", [3, 4, 5, 6, 7, 8, 11, 12])),
    topic("operations", "Information services, operations and security", source("air-regulations", "ar", [9, 10, 16, 17, 18, 19, 21])),
    topic("human-factors", "Human factors, CRM and operational decision-making", source("air-regulations", "ar", range(22, 26)), source("human-performance", "hpl", [1, 19, 20, 21, 22, 23, 24])),
    topic("physiology", "Aviation physiology and limitations", source("human-performance", "hpl", range(2, 18))),
    topic("human-performance-revision", "Human performance revision", source("human-performance", "hpl", [25, 26])),
  ],
  "atpl-technical": [
    topic("aerodynamics", "Aerodynamics, stability and control", source("technical-general", "tg", range(1, 10))),
    topic("piston", "Piston engines and associated systems", source("technical-general", "tg", range(11, 18))),
    topic("turbine", "Gas turbine engines and APU", source("technical-general", "tg", range(19, 25))),
    topic("airframe", "Airframes and aircraft systems", source("technical-general", "tg", range(26, 33))),
    topic("electrical", "Electrical generation and distribution", source("technical-general", "tg", range(34, 36))),
  ],
  "atpl-technical-specific": [
    topic("systems", "DA-42 NG systems", source("technical-specific", "da42", range(1, 6))),
    topic("procedures", "DA-42 NG limitations and procedures", source("technical-specific", "da42", [7, 8, 9])),
    topic("performance", "DA-42 NG performance, mass and balance", source("technical-specific", "da42", [10])),
  ],
  "atpl-performance": [
    topic("mass-balance", "Mass and balance", source("air-navigation", "nav", [6])),
    topic("aeroplane-performance", "Single-engine and multi-engine performance", source("air-navigation", "nav", [7, 8])),
  ],
  "atpl-radio-telephony": [
    topic("regulations", "Radio regulations, licensing and aeronautical information", source("radio-telephony", "rtf", range(1, 6))),
    topic("principles", "Radio principles and equipment", source("radio-telephony", "rtf", range(7, 12))),
    topic("procedures", "Communication procedures and phraseology", source("radio-telephony", "rtf", range(13, 19))),
    topic("emergency-weather", "Emergency communications and weather broadcasts", source("radio-telephony", "rtf", [20, 21, 22])),
    topic("revision", "RT reference tables and oral practice", source("radio-telephony", "rtf", [23, 24])),
  ],
};
