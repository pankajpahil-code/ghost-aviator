export const STEN_MEAN: number;
export const STEN_SD: number;

export type ColourBand = {
  key: "well-below" | "below" | "at" | "above" | "well-above";
  sten: [number, number];
  label: string;
  colour: string;
  hex: string;
  advice: string;
};

export type ReportLine = {
  stanine: number;
  sten: number;
  band: ColourBand;
  basis: string | null;
};

export function stenFromZ(z: number): number;
export function stenFromStanine(stanine: number): number;
export const COLOUR_BANDS: ColourBand[];
export function colourBandForSten(sten: number): ColourBand;
export function reportLine(stanine: number, basis?: string | null): ReportLine;
export const BAND_PROVENANCE: string;
