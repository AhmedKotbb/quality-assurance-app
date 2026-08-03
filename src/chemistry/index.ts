import { calcBogue, resolveBoguePhases } from './bogue';
import {
  BoguePhases,
  ComputedRatios,
  Oxides,
  PartialBoguePhases,
  sumReportedOxides,
} from './oxides';
import { calcRatios } from './ratios';

export * from './oxides';
export * from './ratios';
export * from './bogue';

export interface ChemistryResult {
  ratios: ComputedRatios;
  boguePhases: BoguePhases;
  oxideSum: number;
}

/** Derive ratios + Bogue phases from oxide chemistry (and optional supplied phases). */
export function deriveChemistry(
  oxides: Oxides,
  providedBogue?: PartialBoguePhases | null,
): ChemistryResult {
  return {
    ratios: calcRatios(oxides),
    boguePhases: resolveBoguePhases(oxides, providedBogue),
    oxideSum: sumReportedOxides(oxides),
  };
}

export { calcBogue, calcRatios, resolveBoguePhases, sumReportedOxides };
