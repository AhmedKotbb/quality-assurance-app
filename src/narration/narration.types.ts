import { RecommendationCategory, Verdict } from '../common/enums';
import { ParameterResult } from '../rule-engine/rule-engine.service';

export interface Recommendation {
  priority: number;
  issue: string;
  action: string;
  category: RecommendationCategory;
  impact?: string;
}

export interface EvaluationFindings {
  overallVerdict: Verdict;
  standardVersion: string;
  parameterResults: ParameterResult[];
  computedRatios: Record<string, number>;
  boguePhases: Record<string, number>;
}

export interface NarrationStrategy {
  narrate(
    findings: EvaluationFindings,
  ): Recommendation[] | Promise<Recommendation[]>;
}
