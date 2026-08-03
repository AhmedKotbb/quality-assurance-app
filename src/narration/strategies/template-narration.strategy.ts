import { Injectable } from '@nestjs/common';
import { RecommendationCategory, Verdict } from '../../common/enums';
import { ParameterResult } from '../../rule-engine/rule-engine.service';
import { DeviationDirection, IMPACT_RULES } from '../impact-rules';
import {
  EvaluationFindings,
  NarrationStrategy,
  Recommendation,
} from '../narration.types';

const STATUS_PRIORITY: Record<Verdict, number> = {
  [Verdict.FAIL]: 0,
  [Verdict.MARGIN]: 1,
  [Verdict.PASS]: 2,
};

@Injectable()
export class TemplateNarrationStrategy implements NarrationStrategy {
  narrate(findings: EvaluationFindings): Recommendation[] {
    const flagged = findings.parameterResults
      .filter((r) => r.status !== Verdict.PASS)
      .sort((a, b) => {
        const byStatus = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
        if (byStatus !== 0) {
          return byStatus;
        }
        return a.parameter.localeCompare(b.parameter);
      });

    return flagged.map((result, index) =>
      this.toRecommendation(result, index + 1),
    );
  }

  private toRecommendation(
    result: ParameterResult,
    priority: number,
  ): Recommendation {
    const direction = inferDirection(result);
    const rule = IMPACT_RULES[result.parameter]?.[direction];

    if (!rule) {
      return {
        priority,
        issue: `${result.parameter} is ${result.status} (value ${result.value}, limit ${result.limit})`,
        action: `Review ${result.parameter} against ${result.limit} and adjust the process accordingly.`,
        category: categoryForGroup(result.group),
        impact: result.notes,
      };
    }

    return {
      priority,
      issue: `${rule.issue} [${result.status}: ${result.value} vs ${result.limit}]`,
      action: rule.action,
      category: rule.category,
      impact: rule.impact,
    };
  }
}

export function inferDirection(result: ParameterResult): DeviationDirection {
  const label = result.limit.trim();
  if (label.startsWith('<=')) {
    return 'high';
  }
  if (label.startsWith('>=')) {
    return 'low';
  }

  const between = label.match(/([\d.]+)\s*[–-]\s*([\d.]+)/);
  if (between) {
    const min = Number(between[1]);
    const max = Number(between[2]);
    const mid = (min + max) / 2;
    return result.value < mid ? 'low' : 'high';
  }

  return 'high';
}

function categoryForGroup(group: string): RecommendationCategory {
  if (group === 'physical') {
    return RecommendationCategory.GRINDING;
  }
  if (group === 'chemical' || group === 'process' || group === 'phases') {
    return RecommendationCategory.RAW_MIX;
  }
  return RecommendationCategory.KILN;
}
