import { readFileSync } from 'fs';
import { join } from 'path';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CementType } from '../common/enums';
import {
  ConditionalLimit,
  ResolvedLimit,
  StandardLimit,
  StandardTable,
} from './standards.types';

@Injectable()
export class StandardsService implements OnModuleInit {
  private table!: StandardTable;

  onModuleInit() {
    const filePath = join(__dirname, 'data', 'astm-c150-type-i.json');
    this.table = JSON.parse(readFileSync(filePath, 'utf8')) as StandardTable;
  }

  getStandardVersion(): string {
    return this.table.standardVersion;
  }

  getDefaultMarginPct(): number {
    return this.table.defaultMarginPct;
  }

  getTableForCementType(cementType: CementType): StandardTable {
    if (cementType !== CementType.ASTM_TYPE_I) {
      throw new Error(`Unsupported cement type: ${cementType}`);
    }
    return this.table;
  }

  getLimits(cementType: CementType): StandardLimit[] {
    return this.getTableForCementType(cementType).limits;
  }

  /**
   * Resolve a limit definition against the evaluation context
   * (handles C3A-dependent SO3 ceilings, etc.).
   */
  resolveLimit(
    limit: StandardLimit,
    context: Record<string, unknown>,
  ): ResolvedLimit | null {
    if (!limit.conditional?.length) {
      return {
        parameter: limit.parameter,
        path: limit.path,
        op: limit.op,
        value: limit.value,
        min: limit.min,
        max: limit.max,
        unit: limit.unit,
        group: limit.group,
        required: limit.required,
        limitLabel: limit.limitLabel ?? this.buildDefaultLabel(limit),
        notes: limit.notes,
      };
    }

    const matched = limit.conditional.find((rule) =>
      this.matchesCondition(rule, context),
    );

    if (!matched) {
      return null;
    }

    return {
      parameter: limit.parameter,
      path: limit.path,
      op: limit.op,
      value: matched.value,
      unit: limit.unit,
      group: limit.group,
      required: limit.required,
      limitLabel: matched.limitLabel,
      notes: limit.notes,
    };
  }

  private matchesCondition(
    rule: ConditionalLimit,
    context: Record<string, unknown>,
  ): boolean {
    const actual = this.readPath(context, rule.whenPath);
    if (typeof actual !== 'number') {
      return false;
    }

    switch (rule.whenOp) {
      case 'lte':
        return actual <= rule.whenValue;
      case 'lt':
        return actual < rule.whenValue;
      case 'gte':
        return actual >= rule.whenValue;
      case 'gt':
        return actual > rule.whenValue;
      default:
        return false;
    }
  }

  readPath(context: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, key) => {
      if (acc === null || acc === undefined || typeof acc !== 'object') {
        return undefined;
      }
      return (acc as Record<string, unknown>)[key];
    }, context);
  }

  private buildDefaultLabel(limit: StandardLimit): string {
    if (limit.op === 'max' && limit.value !== undefined) {
      return `<= ${limit.value}`;
    }
    if (limit.op === 'min' && limit.value !== undefined) {
      return `>= ${limit.value}`;
    }
    if (
      limit.op === 'between' &&
      limit.min !== undefined &&
      limit.max !== undefined
    ) {
      return `${limit.min} – ${limit.max}`;
    }
    return limit.parameter;
  }
}
