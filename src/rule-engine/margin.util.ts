import { Verdict } from '../common/enums';
import { LimitOp } from '../standards/standards.types';

export function classifyAgainstLimit(
  value: number,
  op: LimitOp,
  opts: {
    limit?: number;
    min?: number;
    max?: number;
    marginPct: number;
  },
): Verdict {
  const margin = opts.marginPct / 100;

  if (op === 'max') {
    const limit = opts.limit;
    if (limit === undefined) {
      throw new Error('max classification requires limit');
    }
    if (value > limit) {
      return Verdict.FAIL;
    }
    const marginFloor = limit * (1 - margin);
    if (value > marginFloor) {
      return Verdict.MARGIN;
    }
    return Verdict.PASS;
  }

  if (op === 'min') {
    const limit = opts.limit;
    if (limit === undefined) {
      throw new Error('min classification requires limit');
    }
    if (value < limit) {
      return Verdict.FAIL;
    }
    const marginCeiling = limit * (1 + margin);
    if (value < marginCeiling) {
      return Verdict.MARGIN;
    }
    return Verdict.PASS;
  }

  // between
  const min = opts.min;
  const max = opts.max;
  if (min === undefined || max === undefined) {
    throw new Error('between classification requires min and max');
  }
  if (value < min || value > max) {
    return Verdict.FAIL;
  }

  const lowerMargin = min + (max - min) * margin;
  const upperMargin = max - (max - min) * margin;
  if (value < lowerMargin || value > upperMargin) {
    return Verdict.MARGIN;
  }
  return Verdict.PASS;
}

export function worstVerdict(statuses: Verdict[]): Verdict {
  if (statuses.includes(Verdict.FAIL)) {
    return Verdict.FAIL;
  }
  if (statuses.includes(Verdict.MARGIN)) {
    return Verdict.MARGIN;
  }
  return Verdict.PASS;
}
