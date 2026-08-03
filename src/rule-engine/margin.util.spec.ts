import { Verdict } from '../common/enums';
import { classifyAgainstLimit, worstVerdict } from './margin.util';

describe('classifyAgainstLimit', () => {
  describe('max limits', () => {
    it('returns FAIL above the limit', () => {
      expect(
        classifyAgainstLimit(3.2, 'max', { limit: 3.0, marginPct: 5 }),
      ).toBe(Verdict.FAIL);
    });

    it('returns MARGIN near the ceiling', () => {
      // 5% of 3.0 → margin starts above 2.85
      expect(
        classifyAgainstLimit(2.9, 'max', { limit: 3.0, marginPct: 5 }),
      ).toBe(Verdict.MARGIN);
    });

    it('returns PASS comfortably under the limit', () => {
      expect(
        classifyAgainstLimit(2.5, 'max', { limit: 3.0, marginPct: 5 }),
      ).toBe(Verdict.PASS);
    });
  });

  describe('min limits', () => {
    it('returns FAIL below the limit', () => {
      expect(
        classifyAgainstLimit(10, 'min', { limit: 12, marginPct: 5 }),
      ).toBe(Verdict.FAIL);
    });

    it('returns MARGIN just above the floor', () => {
      // 12 * 1.05 = 12.6
      expect(
        classifyAgainstLimit(12.3, 'min', { limit: 12, marginPct: 5 }),
      ).toBe(Verdict.MARGIN);
    });

    it('returns PASS comfortably above the limit', () => {
      expect(
        classifyAgainstLimit(22, 'min', { limit: 12, marginPct: 5 }),
      ).toBe(Verdict.PASS);
    });
  });

  describe('between limits', () => {
    it('returns FAIL outside the band', () => {
      expect(
        classifyAgainstLimit(0.9, 'between', {
          min: 0.92,
          max: 0.98,
          marginPct: 5,
        }),
      ).toBe(Verdict.FAIL);
    });

    it('returns MARGIN near an edge', () => {
      expect(
        classifyAgainstLimit(0.922, 'between', {
          min: 0.92,
          max: 0.98,
          marginPct: 5,
        }),
      ).toBe(Verdict.MARGIN);
    });

    it('returns PASS in the comfortable middle', () => {
      expect(
        classifyAgainstLimit(0.95, 'between', {
          min: 0.92,
          max: 0.98,
          marginPct: 5,
        }),
      ).toBe(Verdict.PASS);
    });
  });
});

describe('worstVerdict', () => {
  it('prefers FAIL over MARGIN over PASS', () => {
    expect(worstVerdict([Verdict.PASS, Verdict.MARGIN])).toBe(Verdict.MARGIN);
    expect(worstVerdict([Verdict.MARGIN, Verdict.FAIL, Verdict.PASS])).toBe(
      Verdict.FAIL,
    );
    expect(worstVerdict([Verdict.PASS, Verdict.PASS])).toBe(Verdict.PASS);
  });
});
