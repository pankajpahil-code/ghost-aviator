// Types for lib/rtr-sim/director.mjs — the flight dialogue generator.

import type { Scenario } from "./scn1";
import type { World } from "./world.mjs";

export declare function speakDigits(value: string | number): string;
export declare const speakFreq: (value: string | number) => string;
export declare function speakAltitude(feet: number): string;
export declare function speakCallsign(reg: string): string;
export declare function speakCallsignShort(reg: string): string;
export declare function buildVfrDeparture(world: World): Scenario;
export declare function buildIfrFlight(world: World): Scenario;
export declare function buildEmergencyFlight(world: World): Scenario;
export declare function buildRadioFailureFlight(world: World): Scenario;
export declare function buildVfrCircuit(world: World): Scenario;
export declare function buildSraApproach(world: World): Scenario;
export declare function buildMedicalEmergency(world: World): Scenario;
export declare function buildLostPilot(world: World): Scenario;
export declare function buildEmergencyDescent(world: World): Scenario;
export declare function buildTcasEvent(world: World): Scenario;
export declare function buildSpecialVfr(world: World): Scenario;
export declare function buildNdbApproach(world: World): Scenario;
export declare function buildParTalkdown(world: World): Scenario;
export declare function buildVfrArrival(world: World): Scenario;
export declare function buildAirwaysTransit(world: World): Scenario;
export declare function buildFuelDump(world: World): Scenario;
export declare function buildAbandonedTakeoff(world: World): Scenario;
export declare function buildMsawAlert(world: World): Scenario;
export declare function buildRunwayConditions(world: World): Scenario;
