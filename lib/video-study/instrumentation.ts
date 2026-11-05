import type { VideoStudyMap } from "./types";

// Chapter summaries written from the site's own notes for each chapter.
// Shown on the matching /cpl/<subject>/<chapter>/video page.
export const INSTRUMENTATION: VideoStudyMap = {
  "inst-2": {
    summary: [
      "The airspeed indicator, altimeter, vertical speed indicator and Machmeter are only as good as the pressures fed to them, and this chapter is about where those pressures come from. The basic relationship is that pitot (total) pressure equals static pressure plus dynamic pressure. The altimeter and VSI need static pressure only. The ASI and Machmeter need both pitot and static, because they work on the difference between them.",
      "The chapter sets out how each source must be built. A pitot tube faces into the airflow, parallel to it. A static source has its opening at right angles to the airflow, so it senses no dynamic component. Position error arises when the static source picks up a pressure different from undisturbed ambient air. The flush static vent was introduced to reduce it, and vents on both sides are cross-balanced to cut side-slip and yaw errors. At high Mach numbers shock waves upset a static vent, so fast aircraft go back to a combined pitot-static probe mounted ahead of a wing tip, nose or fin.",
      "The last part covers the complete system. That includes manoeuvre-induced error and its lag, which water traps and cross-coupling do not cure. The cross-coupling rule is that static is shared between sides while pitot is kept separate. The chapter finishes with the alternate static source, pitot heat, and the covers and preflight checks that stop a blocked probe from ever reaching the runway.",
    ],
    keyPoints: [
      "Pitot (total) = static + dynamic. Impact pressure = total − static, which is roughly dynamic pressure at low speed.",
      "Static only: altimeter and VSI. Pitot and static: ASI and Machmeter.",
      "A pitot tube is aligned with the airflow. A static opening is at right angles to it.",
      "Cross-balanced static vents on both sides of the fuselage reduce side-slip and yaw errors.",
      "High-speed aircraft use combined pitot-static probes because shock waves corrupt flush static vents at high Mach numbers.",
      "Pitot systems are NOT cross-coupled. Static systems almost always are. Modern systems warn if the pitot sources disagree by more than about 5 kt.",
      "Manoeuvre-induced error lasts about 3 s at low altitude and about 10 s at 30,000 ft, longer for the VSI. Fly manoeuvres on the gyro instruments.",
      "Both pitot and static lines have water traps. Covers carry warning streamers up to about 1 m long.",
    ],
    traps: [
      "Mnemonic: ‘Static = Shared, Pitot = Private’. Options saying pitot pressure is cross-fed between left and right are wrong.",
      "Manoeuvre-induced error is worst during pitch changes (start of climb or descent, levelling off, go-around), not in yaw or roll.",
      "The size and sign of position error depend on installation, speed, angle of attack and configuration. Use the flight manual's calibration data rather than a fixed rule.",
      "An alternate static source inside the cabin is allowed only in unpressurised aircraft.",
    ],
  },
  "inst-3": {
    summary: [
      "Outside air temperature feeds into icing decisions, engine power settings, true airspeed and altitude corrections. Yet a probe on a fast-moving aeroplane never reads the true temperature of the still air around it. This chapter explains why, and how the reading is corrected. Moving air brought to rest at the probe heats up in two ways: adiabatic compression and kinetic, or friction, heating. That added warmth is the ram rise.",
      "The chapter defines three temperatures. Static air temperature (SAT) is the undisturbed outside temperature, also called COAT. Total air temperature (TAT) is the temperature with the full ram rise, also called IOAT. Ram air temperature (RAT) is what a real probe measures, because it recovers only part of the ram rise. The recovery factor Kr expresses that part, and a modern TAT probe has a Kr of about 0.98. At speed the order is always TAT > RAT > SAT.",
      "The notes describe the design of a TAT probe. A right-angle turn inside the intake throws out water droplets. Bleed holes draw off the boundary layer, and a platinum resistance sensor gives a fast, repeatable reading. A self-regulating heater prevents icing with an error under 1°C. On the ground, an aspirator pulls outside air through the probe so heat-soaked air isn't measured. The chapter ends with the correction formulas and ISA reference values.",
    ],
    keyPoints: [
      "TAT = SAT + total ram rise, and RAT = SAT + measured ram rise, where measured ram rise = total ram rise × Kr.",
      "A modern TAT probe has a recovery factor of about 0.98.",
      "Accurate correction: SAT(K) = TAT(K) ÷ (1 + 0.2 Kr M²). Temperatures must be in Kelvin.",
      "Quick in-flight approximation: ram rise ≈ (TAS in kt ÷ 100)², in °C.",
      "COAT = SAT, and IOAT = TAT. At speed, TAT > RAT > SAT.",
      "The probe uses an internal right-angle turn to separate water, bleed holes to remove the boundary layer, and a platinum resistance sensor.",
      "The inbuilt heater error is under 1°C, which is negligible. An aspirator uses engine or APU bleed so the probe reads correctly when stationary.",
    ],
    traps: [
      "The probe reads RAT, not TAT, unless Kr = 1. Treating the probe output as the full total temperature ignores the recovery factor.",
      "Using °C in the accurate SAT formula gives nonsense. Convert to Kelvin first (K = °C + 273).",
      "The (TAS/100)² rule is only a quick approximation. Use the Mach-number formula where an accurate answer is asked for.",
      "Heating error comes from BOTH compression and kinetic heating. An option naming only friction is incomplete.",
    ],
  },
};
