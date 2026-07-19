// Types for lib/rtr-sim/world.mjs — seeded WorldGen.

export interface Wind { dir: number; speed: number; gustTo: number | null }

export interface World {
  seed: number;
  airport: {
    name: string;
    ground: string;
    tower: string;
    runway: string;
    holdingPoint: string;
    taxiway: string;
  };
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
