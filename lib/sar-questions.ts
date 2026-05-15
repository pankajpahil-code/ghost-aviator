import type { DemoQuestion } from "./demo-questions";

// Search & Rescue — Chapter 10 (CPL) / equivalent ATPL
// Source: Study Notes Capt. Pankaj Pahil · Annex 12 · AIP India Chapter 11
// 38 questions covering all key topics
export const SAR_QUESTIONS: DemoQuestion[] = [

  // ── SECTION 1: SAR SERVICES & INTERNATIONAL OBLIGATIONS ──────────────────

  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "Search and rescue services within the territory of ICAO contracting states are provided:",
    opts: [
      "On a 24-hour basis",
      "When the authority of the contracting state decides to do so",
      "From sunset to sunrise",
    ],
    ans: 0,
    exp: "Contracting states are obligated under Annex 12 to provide SAR services on a 24-hour, 365-day basis — no exceptions, no authority discretion.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "For portions of the high seas or areas of undetermined sovereignty, SAR service areas are determined on the basis of:",
    opts: [
      "ICAO Council decisions",
      "Bilateral agreements between adjacent states",
      "Regional Air Navigation Agreements",
    ],
    ans: 2,
    exp: "Annex 12: those portions of the high seas or areas of undetermined sovereignty for which SAR services will be established shall be determined on the basis of Regional Air Navigation Agreements.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "The units responsible for promoting efficient organisation of search and rescue service are:",
    opts: [
      "Area control centre, flight information centre and rescue coordination centre",
      "Rescue coordination centre and rescue sub-centres",
      "Alerting centre and rescue coordination centre",
    ],
    ans: 1,
    exp: "The RCC and RSC are specifically responsible for promoting efficient organisation of SAR services and coordinating operations. ACCs and FICs serve ATS functions, not SAR management.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "Contracting States shall establish a rescue co-ordination centre:",
    opts: [
      "At every ATS facility",
      "In each search and rescue region",
      "Only if they are adjacent to the sea",
    ],
    ans: 1,
    exp: "One RCC per Search and Rescue Region. In India, four RCCs correspond to the four FIRs: Delhi, Mumbai, Kolkata, Chennai.",
  },

  // ── SECTION 2: SAR REGIONS ───────────────────────────────────────────────

  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "Which statement correctly describes the rules governing Search and Rescue Regions?",
    opts: [
      "SAR regions may overlap to ensure redundant coverage",
      "SAR regions shall not overlap and neighbouring regions shall be contiguous",
      "SAR regions are determined by each state independently with no international constraint",
    ],
    ans: 1,
    exp: "Annex 12: SAR regions shall NOT overlap and neighbouring SAR regions shall be contiguous (no gaps allowed).",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "The boundary of the Indian Aeronautical Search and Rescue Region (SRR) coincides with:",
    opts: [
      "The Indian FIR boundary, excluding Bhutan's sovereign territory",
      "The Indian territorial waters boundary",
      "The Indian ADIZ boundary",
    ],
    ans: 0,
    exp: "AIP India: The Indian Aeronautical SRR boundary coincides with the Indian FIR boundary, EXCLUDING the portion of the FIR over the sovereign territory of the Kingdom of Bhutan.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "A Search and Rescue Region (SRR) is defined as:",
    opts: [
      "A region in which all ATC services are provided by one controlling authority",
      "An area of defined dimensions associated with a Rescue Coordination Centre within which SAR services are provided",
      "The airspace over a state's sovereign territory where SAR operations are authorised",
    ],
    ans: 1,
    exp: "Definition per Annex 12: An SRR is an area of defined dimensions associated with a Rescue Coordination Centre within which SAR services are provided.",
  },

  // ── SECTION 3: RCCs AND RSCs ─────────────────────────────────────────────

  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "A Rescue Sub-Centre (RSC) is:",
    opts: [
      "An independent centre equivalent in authority to an RCC",
      "A unit subordinate to an RCC, established to complement it according to particular needs",
      "A military facility tasked with SAR operations in remote areas",
    ],
    ans: 1,
    exp: "An RSC is subordinate to an RCC and established to complement it according to the particular needs of the SAR authority.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "Airports Authority of India (AAI) coordinates aeronautical SAR through how many Rescue Coordination Centres?",
    opts: [
      "Two RCCs — Delhi and Mumbai",
      "Three RCCs — Delhi, Mumbai and Chennai",
      "Four RCCs — Delhi, Mumbai, Kolkata and Chennai",
    ],
    ans: 2,
    exp: "AAI operates four RCCs, one for each FIR: Delhi (Delhi FIR), Mumbai (Mumbai FIR), Kolkata (Kolkata FIR), and Chennai (Chennai FIR).",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "A Rescue Unit is best described as:",
    opts: [
      "A unit assisting a RCC in SAR administrative duties",
      "A unit composed of trained personnel and provided with equipment suitable for the expeditious conduct of SAR",
      "A unit responsible for SAR service in co-operation with a RCC but without specialised equipment",
    ],
    ans: 1,
    exp: "A Rescue Unit is specifically defined as a unit composed of trained personnel, provided with equipment suitable for the expeditious conduct of SAR operations.",
  },

  // ── SECTION 4: NATIONAL PROVISIONS — INDIA ──────────────────────────────

  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "In India, oceanic SAR areas are the responsibility of:",
    opts: [
      "Airports Authority of India (AAI)",
      "Indian Air Force",
      "Indian Coast Guard",
    ],
    ans: 2,
    exp: "The Indian Coast Guard is responsible for SAR in oceanic/maritime areas. AAI handles aeronautical SAR over land areas through the four RCCs.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "NASARCC (National Aeronautical Search & Rescue Coordination Committee) is chaired by:",
    opts: [
      "Director General of Civil Aviation (DGCA)",
      "Secretary, Ministry of Civil Aviation",
      "Director General, Indian Coast Guard",
    ],
    ans: 1,
    exp: "NASARCC is chaired by the Secretary, Ministry of Civil Aviation. It handles aeronautical SAR over land areas.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "India's Maritime Rescue Coordination Centres (MRCCs) are located at:",
    opts: [
      "Delhi, Mumbai and Kolkata",
      "Mumbai, Chennai and Port Blair",
      "Mumbai, Kolkata and Chennai",
    ],
    ans: 1,
    exp: "Indian Coast Guard operates three MRCCs at Mumbai, Chennai, and Port Blair, responsible for maritime SAR.",
  },

  // ── SECTION 5: SAR EQUIPMENT ─────────────────────────────────────────────

  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "Survival equipment dropped by SAR aircraft and containing food and water is indicated by streamers of which colour?",
    opts: [
      "Green",
      "Blue",
      "Yellow",
    ],
    ans: 1,
    exp: "Per AIP India / Annex 12: Survival equipment dropped by SAR and containing food and water will be packed in containers indicated by streamers of Blue colour.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "The color identification of dropped SAR containers: which of the following statements is correct?",
    opts: [
      "Red for medical supplies and first aid equipment",
      "Black for food and water",
      "Blue for blankets and protective clothing",
    ],
    ans: 0,
    exp: "Red streamers identify medical supplies and first aid equipment. Blue identifies food and water (and blankets/clothing in the full code). Black is not used.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "SAR aircraft used over maritime areas must carry:",
    opts: [
      "A copy of the International Code of Signals",
      "A full set of liferafts for rescue",
      "Dye markers for water visibility",
    ],
    ans: 0,
    exp: "SAR aircraft operating over maritime areas must carry a copy of the International Code of Signals to overcome language difficulties with ships.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "Many vessels can communicate with SAR aircraft on which frequencies?",
    opts: [
      "121.5 MHz only",
      "2182 kHz, 4125 kHz, and 121.5 MHz",
      "406 MHz and 121.5 MHz",
    ],
    ans: 1,
    exp: "Many vessels can communicate with aircraft on 2182 kHz, 4125 kHz, and 121.5 MHz. However, these frequencies — especially 121.5 MHz — may NOT be routinely monitored by all vessels.",
  },

  // ── SECTION 6: OPERATING PROCEDURES — PIC ───────────────────────────────

  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "Three aircraft arrive successively at ten-minute intervals at the scene of a recent aircraft accident. Aircraft (1) cannot contact the SAR Centre. Aircraft (2) can contact the SAR Centre. Aircraft (3) is a SAR helicopter. Command of the situation rests with:",
    opts: [
      "(1), then by mutual consent (2), and then (3)",
      "(1), and then by mutual consent directly to (3)",
      "(1), then by mutual consent (2) until completion of operations",
    ],
    ans: 0,
    exp: "The first aircraft on scene (1) takes command regardless of SAR contact ability. When (2) arrives, command may pass by mutual consent. When the SAR helicopter (3) arrives, it takes over as the designated SAR asset — also by mutual consent.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "If the first aircraft to reach the scene of an accident is NOT a search and rescue aircraft, it shall:",
    opts: [
      "Circle the scene and wait for an SAR aircraft to arrive before taking any action",
      "Take charge of on-scene activities of all other aircraft until the first SAR aircraft arrives",
      "Immediately divert to the nearest aerodrome and report to ATC",
    ],
    ans: 1,
    exp: "Per Annex 12: if the first aircraft to arrive is not an SAR aircraft, it shall take charge of on-scene activities of all other aircraft subsequently arriving until the first SAR aircraft reaches the scene.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "When a PIC observes another aircraft or surface craft in distress and it is possible to assist, which of the following is a required action?",
    opts: [
      "Keep the craft in distress in sight until compelled to leave or advised by RCC it is no longer necessary",
      "Immediately radio all traffic on 121.5 MHz to avoid the area",
      "Descend to minimum safe altitude and circle above the distress location",
    ],
    ans: 0,
    exp: "Per operating procedures: the PIC shall keep the craft in distress in sight until compelled to leave the scene or advised by the RCC it is no longer necessary — plus determine its position and report to RCC/ATS.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "You are flying in Mumbai FIR when you intercept a distress call. You record the message and inform Mumbai FIC. The radio operator tells you to standby. What should you consider doing while awaiting instructions?",
    opts: [
      "Make a general call on 121.5 MHz asking other aircraft to assist",
      "Descend to low level and carry out a surface search",
      "Proceed to the position given in the distress message",
    ],
    ans: 2,
    exp: "Per operating procedures (step e): at the pilot's discretion, while awaiting instructions, proceed to the position given in the distress transmission.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "Whenever a distress signal is intercepted by the PIC, which of the following actions is required?",
    opts: [
      "If possible, take a bearing on the transmission only",
      "Record the position of the craft in distress if given only",
      "Record the position of the craft in distress if given, and if possible take a bearing on the transmission",
    ],
    ans: 2,
    exp: "Both recording the position AND taking a bearing are required actions (if feasible). Neither alone satisfies the full regulatory requirement (Annex 12).",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "Which alerting service statement is correct?",
    opts: [
      "Aircraft in the vicinity of an aircraft known to be subject to unlawful interference shall be informed",
      "The Alert phase is established when no communication has been received within 30 minutes after it should have been received",
      "Alerting Service and Flight Information Service are often provided by the same ATS unit",
    ],
    ans: 2,
    exp: "Alerting Service and FIS are frequently collocated and provided by the same ATS unit (typically a FIC). Option B describes a time period more associated with the Uncertainty phase (INCERFA), not the Alert phase (ALERFA).",
  },

  // ── SECTION 7: SAR SIGNALS — AIRCRAFT TO SURFACE CRAFT ──────────────────

  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "An aircraft wishing to direct a surface craft to a vessel in distress will first:",
    opts: [
      "Cross the bow of the surface craft close ahead at low altitude and rock its wings",
      "Circle the surface craft at least once, then cross its projected course close ahead",
      "Flash its landing lights and proceed in the direction of the distress",
    ],
    ans: 1,
    exp: "The signal sequence is: (a) Circle the surface craft at least once, (b) Cross its projected course close ahead at low altitude while rocking wings / opening-closing throttle / changing propeller pitch, (c) Head in the direction the surface craft should follow.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "To signal 'Assistance No Longer Required' to a surface craft, the aircraft should:",
    opts: [
      "Circle the surface craft twice and then climb away",
      "Cross the wake of the surface craft close astern at low altitude while rocking wings",
      "Waggle its rudder twice and proceed in the original direction",
    ],
    ans: 1,
    exp: "The 'Assistance No Longer Required' signal is: crossing the wake of the surface craft close ASTERN at low altitude, combined with rocking wings or opening/closing throttle or changing propeller pitch.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "A surface craft indicating it has understood an aircraft's directing signal will:",
    opts: [
      "Fire a red flare",
      "Hoist the code pennant (red and white vertical stripes) close up, or flash 'T' in Morse, or change heading to follow",
      "Sound three short blasts on the ship's horn",
    ],
    ans: 1,
    exp: "A surface craft acknowledges by: (1) hoisting the code pennant (red and white stripes) close up, or (2) flashing a succession of 'T's in Morse by signal lamp, or (3) changing heading to follow the aircraft.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "A surface craft indicating inability to comply with an aircraft's SAR directing signal will:",
    opts: [
      "Hoist the international flag 'N' (blue and white checkered) or flash 'N's in Morse",
      "Hoist the international flag 'X' and stop engines",
      "Fire a white flare and maintain course",
    ],
    ans: 0,
    exp: "Inability to comply: the surface craft hoists international flag 'N' (blue and white checkered square) or flashes a succession of 'N's in Morse code.",
  },

  // ── SECTION 8: GROUND-AIR VISUAL SIGNAL CODES ───────────────────────────

  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "What is the meaning of the symbol 'V' in the ground-air visual signal code for use by survivors?",
    opts: [
      "Landing here impossible",
      "Require assistance",
      "Require medical assistance",
    ],
    ans: 1,
    exp: "V = Require Assistance (general help). X = Require Medical Assistance. The five survivor signals are: V (Assistance), X (Medical), N (Negative), Y (Affirmative), and an arrow (Proceeding in this direction).",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "An aircraft flying over a mountainous region sees a ground signal in the form of an 'X'. This indicates:",
    opts: [
      "All occupants alive",
      "Need mechanical assistance",
      "Need medical assistance",
    ],
    ans: 2,
    exp: "X = Require Medical Assistance — this is one of the five survivor ground-air visual signal codes. V = Require Assistance (general).",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "The meaning of SAR signal 'N' when used by survivors on the ground is:",
    opts: [
      "Negative / No",
      "Require medical assistance",
      "Require assistance",
    ],
    ans: 0,
    exp: "In the survivor ground-air visual code: N = No / Negative. X = Require Medical Assistance. V = Require Assistance.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "What is the meaning of the symbol 'LLL' in the ground-air visual signal code for use by rescue units?",
    opts: [
      "Operation completed",
      "We are returning to base",
      "We have found all personnel",
    ],
    ans: 0,
    exp: "LLL = Operation Completed. LL = We have found ALL personnel. XX = Cannot continue / returning to base. NN = Nothing found, will continue to search.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "In the rescue unit ground-air visual code, '++' (two plus signs) indicates:",
    opts: [
      "We have found all personnel",
      "We have found only some personnel",
      "We are not able to continue — returning to base",
    ],
    ans: 1,
    exp: "++ = We have found ONLY SOME personnel. LL = Found ALL. XX = Cannot continue/returning to base.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "In the rescue unit ground-air visual code, 'NN' means:",
    opts: [
      "Need navigational assistance",
      "We have not been able to continue",
      "Nothing found — will continue to search",
    ],
    ans: 2,
    exp: "NN = Nothing found, will continue to search. XX = Cannot continue/returning to base. LL = Found ALL personnel.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "Ground-air visual signal symbols shall have a minimum length of:",
    opts: [
      "1.5 metres (5 feet)",
      "2.5 metres (8 feet)",
      "5 metres (16 feet)",
    ],
    ans: 1,
    exp: "Symbols shall be at least 2.5 metres (8 feet) long and made as conspicuous as possible with maximum colour contrast against the background.",
  },

  // ── SECTION 9: AIR-TO-GROUND SIGNALS ────────────────────────────────────

  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "During daylight hours, how does an aircraft indicate it has understood a ground-air visual signal?",
    opts: [
      "Flash its landing lights once",
      "Rock its wings",
      "Perform a 360-degree turn over the signal",
    ],
    ans: 1,
    exp: "During daylight hours, an aircraft acknowledges ground signals by rocking its wings. Lack of this signal means the ground signal is NOT understood.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "At night, an aircraft observes a luminous signal requesting help. To indicate it has understood these ground signals, the pilot should:",
    opts: [
      "Make at least one complete turn over the group in difficulty",
      "Transmit, by luminous Morse signal, a series of the letter 'R' using navigation lights",
      "Switch landing lights on and off twice, or if not equipped, navigation lights twice",
    ],
    ans: 2,
    exp: "The air-to-ground acknowledgement at night = flashing landing lights (or nav lights) ON and OFF TWICE.",
  },

  // ── SECTION 10: COSPAS-SARSAT ────────────────────────────────────────────

  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "COSPAS-SARSAT is:",
    opts: [
      "A communication system linking all aircraft in distress",
      "A space system for the search of vessels in distress",
      "A SAR satellite-aided tracking system",
    ],
    ans: 2,
    exp: "COSPAS-SARSAT is a SAR satellite-aided tracking system. India participates through INMCC Bangalore, with LUTs at Bangalore and Lucknow.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "COSPAS-SARSAT operates on a frequency of:",
    opts: [
      "121.5 MHz",
      "243.0 MHz",
      "406 MHz",
    ],
    ans: 2,
    exp: "COSPAS-SARSAT operates on 406 MHz with a normal location accuracy of within 5 km.",
  },
  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "India's COSPAS-SARSAT Local User Terminals (LUTs) are located at:",
    opts: [
      "Delhi and Mumbai",
      "Bangalore and Lucknow",
      "Mumbai and Chennai",
    ],
    ans: 1,
    exp: "India has two LUTs at Bangalore and Lucknow. The Indian Mission Control Centre (INMCC) is located at Bangalore.",
  },

  // ── SECTION 11: DISTRESS FREQUENCIES ────────────────────────────────────

  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "Which of the following is NOT an international distress frequency?",
    opts: [
      "243.0 MHz",
      "2182 kHz",
      "2430 kHz",
    ],
    ans: 2,
    exp: "Recognised international distress frequencies include 121.5 MHz (civil), 243.0 MHz (military), 2182 kHz (maritime), and 406 MHz (COSPAS-SARSAT). 2430 kHz is NOT an internationally designated distress frequency.",
  },

  // ── SECTION 12: SAR AGREEMENTS ──────────────────────────────────────────

  {
    subjectIds: ["air-regulations", "atpl-air-regulations"],
    chapterId: "sar",
    q: "India currently has a formal SAR Arrangement with:",
    opts: [
      "Pakistan",
      "Royal Government of Bhutan",
      "Bangladesh",
    ],
    ans: 1,
    exp: "AIP India: India currently has a SAR Arrangement with the Royal Government of Bhutan. India can also seek SAR assistance from adjoining RCCs of other nations in accordance with bilateral agreements.",
  },
];
