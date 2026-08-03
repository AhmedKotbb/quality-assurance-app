export type LimitOp = 'min' | 'max' | 'between';

export interface ConditionalLimit {
  whenPath: string;
  whenOp: 'lte' | 'gt' | 'gte' | 'lt';
  whenValue: number;
  value: number;
  limitLabel: string;
}

export interface StandardLimit {
  parameter: string;
  path: string;
  op: LimitOp;
  value?: number;
  min?: number;
  max?: number;
  unit: string;
  group: 'chemical' | 'process' | 'phases' | 'physical';
  required: boolean;
  limitLabel?: string;
  notes?: string;
  conditional?: ConditionalLimit[];
}

export interface StandardTable {
  id: string;
  cementType: string;
  standardVersion: string;
  defaultMarginPct: number;
  limits: StandardLimit[];
}

export interface ResolvedLimit {
  parameter: string;
  path: string;
  op: LimitOp;
  value?: number;
  min?: number;
  max?: number;
  unit: string;
  group: StandardLimit['group'];
  required: boolean;
  limitLabel: string;
  notes?: string;
}
