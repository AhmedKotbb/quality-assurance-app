import { BoguePhases, Oxides, PartialBoguePhases, round } from './oxides';

/**
 * Classical Bogue potential compound composition (%).
 * Simplified form from oxides only (no free-lime / SO3 correction).
 */
export function calcBogue(
  oxides: Pick<Oxides, 'CaO' | 'SiO2' | 'Al2O3' | 'Fe2O3'>,
): BoguePhases {
  const { CaO, SiO2, Al2O3, Fe2O3 } = oxides;
  const C3S = 4.071 * CaO - 7.6 * SiO2 - 6.718 * Al2O3 - 1.43 * Fe2O3;
  const C2S = 2.867 * SiO2 - 0.7544 * C3S;
  const C3A = 2.65 * Al2O3 - 1.692 * Fe2O3;
  const C4AF = 3.043 * Fe2O3;

  return {
    C3S: round(C3S),
    C2S: round(C2S),
    C3A: round(C3A),
    C4AF: round(C4AF),
  };
}

/**
 * Prefer caller-supplied Bogue phases when present; derive any missing values.
 */
export function resolveBoguePhases(
  oxides: Pick<Oxides, 'CaO' | 'SiO2' | 'Al2O3' | 'Fe2O3'>,
  provided?: PartialBoguePhases | null,
): BoguePhases {
  const calculated = calcBogue(oxides);

  if (!provided) {
    return calculated;
  }

  return {
    C3S: provided.C3S ?? calculated.C3S,
    C2S: provided.C2S ?? calculated.C2S,
    C3A: provided.C3A ?? calculated.C3A,
    C4AF: provided.C4AF ?? calculated.C4AF,
  };
}
