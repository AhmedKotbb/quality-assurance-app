import {
  calcAR,
  calcBogue,
  calcLSF,
  calcRatios,
  calcSR,
  deriveChemistry,
  resolveBoguePhases,
  sumReportedOxides,
} from './index';

/** Representative OPC-like oxide mix from the design doc example. */
const sampleOxides = {
  CaO: 64.5,
  SiO2: 21.0,
  Al2O3: 5.2,
  Fe2O3: 3.1,
  MgO: 2.1,
  SO3: 2.8,
  LOI: 1.8,
  IR: 0.5,
  freeLime: 1.1,
};

describe('chemistry ratios', () => {
  it('calculates LSF, SR, and AR for the sample mix', () => {
    expect(calcLSF(64.5, 21.0, 5.2, 3.1)).toBeCloseTo(0.9619, 3);
    expect(calcSR(21.0, 5.2, 3.1)).toBeCloseTo(2.5301, 3);
    expect(calcAR(5.2, 3.1)).toBeCloseTo(1.6774, 3);
  });

  it('returns rounded ratio bundle', () => {
    expect(calcRatios(sampleOxides)).toEqual({
      LSF: 0.9619,
      SR: 2.5301,
      AR: 1.6774,
    });
  });

  it('throws when AR denominator is zero', () => {
    expect(() => calcAR(5, 0)).toThrow(/AR/);
  });

  it('throws when SR denominator is zero', () => {
    expect(() => calcSR(21, 0, 0)).toThrow(/SR/);
  });
});

describe('Bogue compounds', () => {
  it('calculates classical Bogue phases from oxides', () => {
    const phases = calcBogue(sampleOxides);

    expect(phases.C3S).toBeCloseTo(63.6129, 3);
    expect(phases.C2S).toBeCloseTo(12.2175, 3);
    expect(phases.C3A).toBeCloseTo(8.5348, 3);
    expect(phases.C4AF).toBeCloseTo(9.4333, 3);
  });

  it('uses supplied Bogue values and fills missing ones', () => {
    const phases = resolveBoguePhases(sampleOxides, {
      C3S: 55,
      C2S: null,
      C3A: undefined,
      C4AF: 10,
    });

    expect(phases.C3S).toBe(55);
    expect(phases.C4AF).toBe(10);
    expect(phases.C2S).toBeCloseTo(12.2175, 3);
    expect(phases.C3A).toBeCloseTo(8.5348, 3);
  });
});

describe('deriveChemistry', () => {
  it('returns ratios, phases, and oxide sum', () => {
    const result = deriveChemistry(sampleOxides);

    expect(result.ratios.SR).toBeCloseTo(2.5301, 3);
    expect(result.boguePhases.C4AF).toBeCloseTo(9.4333, 3);
    expect(result.oxideSum).toBeCloseTo(
      sumReportedOxides(sampleOxides),
      5,
    );
    expect(result.oxideSum).toBeCloseTo(101.0, 1);
  });
});
