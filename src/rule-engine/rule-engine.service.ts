import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BoguePhases, ComputedRatios, Oxides } from '../chemistry';
import { CementType, Verdict } from '../common/enums';
import { StandardsService } from '../standards/standards.service';
import { classifyAgainstLimit, worstVerdict } from './margin.util';

export interface PhysicalReadings {
  blaineFineness?: number;
  initialSettingTimeMin?: number;
  finalSettingTimeMin?: number;
  soundnessMm?: number;
  autoclaveExpansionPct?: number;
  compressiveStrengthMPa?: {
    day3?: number;
    day7?: number;
    day28?: number;
  };
}

export interface RuleEngineInput {
  cementType: CementType;
  oxides: Oxides;
  ratios: ComputedRatios;
  boguePhases: BoguePhases;
  physical?: PhysicalReadings;
}

export interface ParameterResult {
  parameter: string;
  value: number;
  limit: string;
  status: Verdict;
  group: string;
  notes?: string;
}

export interface RuleEngineResult {
  standardVersion: string;
  parameterResults: ParameterResult[];
  overallVerdict: Verdict;
}

@Injectable()
export class RuleEngineService {
  constructor(
    private readonly standardsService: StandardsService,
    private readonly configService: ConfigService,
  ) {}

  evaluate(input: RuleEngineInput): RuleEngineResult {
    const marginPct =
      this.configService.get<number>('marginPct') ??
      this.standardsService.getDefaultMarginPct();

    const context: Record<string, unknown> = {
      oxides: input.oxides,
      ratios: input.ratios,
      bogue: input.boguePhases,
      physical: input.physical ?? {},
    };

    const parameterResults: ParameterResult[] = [];

    for (const limitDef of this.standardsService.getLimits(input.cementType)) {
      const resolved = this.standardsService.resolveLimit(limitDef, context);
      if (!resolved) {
        continue;
      }

      const rawValue = this.standardsService.readPath(context, resolved.path);
      if (rawValue === null || rawValue === undefined) {
        if (resolved.required) {
          throw new Error(
            `Missing required parameter value at path: ${resolved.path}`,
          );
        }
        continue;
      }

      if (typeof rawValue !== 'number' || Number.isNaN(rawValue)) {
        throw new Error(
          `Parameter ${resolved.parameter} must be a number (got ${typeof rawValue})`,
        );
      }

      const status = classifyAgainstLimit(rawValue, resolved.op, {
        limit: resolved.value,
        min: resolved.min,
        max: resolved.max,
        marginPct,
      });

      parameterResults.push({
        parameter: resolved.parameter,
        value: rawValue,
        limit: resolved.limitLabel,
        status,
        group: resolved.group,
        notes: resolved.notes,
      });
    }

    return {
      standardVersion: this.standardsService.getStandardVersion(),
      parameterResults,
      overallVerdict: worstVerdict(parameterResults.map((r) => r.status)),
    };
  }
}
