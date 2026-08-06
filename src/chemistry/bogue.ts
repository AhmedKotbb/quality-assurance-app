import { BoguePhases, Oxides, round } from './oxides';

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
