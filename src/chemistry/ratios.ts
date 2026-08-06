import { ComputedRatios, Oxides, round } from './oxides';

function assertPositiveDenominator(name: string, denominator: number): void {
  if (denominator === 0) {
    throw new Error(`Cannot calculate ${name}: denominator is zero`);
  }
}

// lime saturation factor
export function calcLSF(
  CaO: number,
  SiO2: number,
  Al2O3: number,
  Fe2O3: number,
): number {
  const denominator = 2.8 * SiO2 + 1.2 * Al2O3 + 0.65 * Fe2O3;
  assertPositiveDenominator('LSF', denominator);
  return CaO / denominator;
}

// silica ratio
export function calcSR(SiO2: number, Al2O3: number, Fe2O3: number): number {
  const denominator = Al2O3 + Fe2O3;
  assertPositiveDenominator('SR', denominator);
  return SiO2 / denominator;
}

// alumina ratio
export function calcAR(Al2O3: number, Fe2O3: number): number {
  assertPositiveDenominator('AR', Fe2O3);
  return Al2O3 / Fe2O3;
}

export function calcRatios(
  oxides: Pick<Oxides, 'CaO' | 'SiO2' | 'Al2O3' | 'Fe2O3'>,
): ComputedRatios {
  return {
    LSF: round(calcLSF(oxides.CaO, oxides.SiO2, oxides.Al2O3, oxides.Fe2O3)),
    SR: round(calcSR(oxides.SiO2, oxides.Al2O3, oxides.Fe2O3)),
    AR: round(calcAR(oxides.Al2O3, oxides.Fe2O3)),
  };
}
