export interface Oxides {
  CaO: number;
  SiO2: number;
  Al2O3: number;
  Fe2O3: number;
  MgO?: number;
  SO3?: number;
  LOI?: number;
  IR?: number;
  freeLime?: number;
}

export interface BoguePhases {
  C3S: number;
  C2S: number;
  C3A: number;
  C4AF: number;
}

export interface ComputedRatios {
  LSF: number;
  SR: number;
  AR: number;
}

export type PartialBoguePhases = {
  [K in keyof BoguePhases]?: number | null;
};

/** Sum of major oxides commonly reported in a cement analysis (%). */
export function sumReportedOxides(oxides: Oxides): number {
  return (
    oxides.CaO +
    oxides.SiO2 +
    oxides.Al2O3 +
    oxides.Fe2O3 +
    (oxides.MgO ?? 0) +
    (oxides.SO3 ?? 0) +
    (oxides.LOI ?? 0) +
    (oxides.IR ?? 0)
  );
}

export function round(value: number, digits = 4): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
