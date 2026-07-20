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
