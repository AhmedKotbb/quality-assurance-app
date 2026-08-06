import { calcBogue } from './bogue';
import {
  BoguePhases,
  ComputedRatios,
  Oxides,
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

export function deriveChemistry(oxides: Oxides): ChemistryResult {
  return {
    ratios: calcRatios(oxides),
    boguePhases: calcBogue(oxides),
    oxideSum: sumReportedOxides(oxides),
  };
}

export { calcBogue, calcRatios, sumReportedOxides };
