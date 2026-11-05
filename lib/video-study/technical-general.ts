import type { VideoStudyMap } from "./types";

// Chapter summaries written from the site's own notes for each chapter.
// Shown on the matching /cpl/<subject>/<chapter>/video page.
export const TECHNICAL_GENERAL: VideoStudyMap = {
  "tg-36": {
    summary: [
      "This chapter explains why large transport aircraft generate alternating current as their main electrical supply, and how that supply is kept stable and distributed. AC has several advantages over DC. Alternators are simpler, tougher and lighter for their output than DC generators, because they have no heavy commutator. Transformers can raise or lower AC voltage easily. Transformer rectifier units can turn AC into DC wherever DC is still needed. Three-phase AC motors are also simpler and more efficient than DC motors. The standard aircraft AC frequency is 400 Hz. Most large aircraft use a three-phase system, in which three outputs are generated 120° apart so that the combined supply is smoother and more continuous.",
      "Frequency depends on how fast the alternator turns, so a constant 400 Hz needs a constant drive speed even though engine RPM changes throughout the flight. The constant speed drive unit (CSDU) solves this. It is a hydromechanical gearbox that takes the variable engine input and delivers a constant output speed to the alternator. In modern aircraft the drive and the generator are combined in one housing called the integrated drive generator (IDG). Before several alternators are connected to a common busbar, their voltage, frequency and phase sequence must match. Once they are paralleled, the system shares both the real load (kW) and the reactive load (kVAR) equally between them.",
      "Several components convert power and back up the main supply. The TRU steps 115 V AC down and rectifies it to 28 V DC. An inverter does the opposite, turning battery DC into 115 V, 400 Hz AC so that essential AC instruments keep working if all generators fail. The APU drives its own generator to power the aircraft on the ground and act as a backup in flight. The ram air turbine is the last resort: it drops into the airflow to power only the most essential controls and instruments. Bonding, screening and static wicks keep static and interference under control.",
    ],
    keyPoints: [
      "AC advantages: lighter, more robust alternators, easy voltage change with transformers, easy conversion to DC, and simpler, more efficient motors.",
      "Aircraft AC standard: 400 Hz, usually three-phase with the phases 120° apart.",
      "Constant frequency needs a constant alternator speed, provided by the CSDU. An IDG combines the CSDU and generator in one unit.",
      "Paralleling needs matched voltage, frequency and phase sequence. Real (kW) and reactive (kVAR) loads are then shared.",
      "TRU: 115 V AC → 28 V DC. Inverter: battery DC → 115 V / 400 Hz AC for essential instruments.",
      "Backups: the APU generator (ground and in flight), then the RAT for essential services only.",
      "Bonding equalises potential, screening contains interference, and static wicks discharge static from trailing edges.",
    ],
    traps: [
      "An INVERTER changes DC to AC. A TRU changes AC to DC. Questions often swap them.",
      "The CSDU keeps the alternator SPEED constant, and through it the frequency. It doesn’t regulate voltage.",
      "Bonding prevents sparks from potential differences. Screening protects radios from wiring interference. They do different jobs.",
    ],
  },
};
