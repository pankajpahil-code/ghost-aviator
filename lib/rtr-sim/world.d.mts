// Types for lib/rtr-sim/world.mjs — seeded WorldGen.

export interface Wind { dir: number; speed: number; gustTo: number | null }

export interface IfrPlan {
  flightNo: string;
  dest: {
    name: string; ground: string; tower: string; approach: string;
    runway: string; atis: string; qnh: string;
  };
  departureFreq: string;
  controlFreq: string;
  sid: string;
  sidFix: string;
  enrouteFix: string;
  squawk: string;
  cruiseFl: string;
  descentFl: string;
  platformAlt: number;
  vectorHdg: string;
  closingSide: string;
  closingHdg: string;
  avoidHdg: string;
  trafficClock: number;
  trafficMiles: number;
  efcTime: string;
  holdShortRwy: string;
  rvr: { touchdown: number; midpoint: number; stopEnd: number };
  events: { avoidingAction: boolean; hold: boolean; lowVis: boolean };
}

export interface EmergencyPlan {
  cruiseAlt: number;
  divertAlt: number;
  maydayAlt: number;
  distance: number;
  distance2: number;
  direction: string;
  pob: number;
  finalMiles: number;
}

export interface World {
  seed: number;
  airport: {
    name: string;
    ground: string;
    tower: string;
    approach: string;
    control: string;
    runway: string;
    holdingPoint: string;
    taxiway: string;
  };
  ifr: IfrPlan;
  emergency: EmergencyPlan;
  atis: string;
  wind: Wind;
  qnh: string;
  qnhTrap: string;
  callsign: { reg: string; letters: string[] };
  aircraftType: string;
  departureAltitude: number;
  departureDirection: string;
  traffic: { givewayType: string; givewayDir: string; landingType: string };
  events: { conditionalLineup: boolean; qnhUpdate: boolean };
}

export declare function makeRng(seed: number): () => number;
export declare function rollWorld(seed: number): World;
export declare function randomSeed(): number;
