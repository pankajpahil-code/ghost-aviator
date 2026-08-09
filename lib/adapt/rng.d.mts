// Types for lib/adapt/rng.mjs — ADAPT seeded randomness.

export declare function makeRng(seed: number): () => number;
export declare function randomSeed(): number;
export declare function irange(rnd: () => number, lo: number, hi: number): number;
export declare function istep(rnd: () => number, lo: number, hi: number, step: number): number;
export declare function pick<T>(rnd: () => number, arr: readonly T[]): T;
export declare function shuffle<T>(rnd: () => number, arr: readonly T[]): T[];
export declare function subSeed(seed: number, label: string): number;
