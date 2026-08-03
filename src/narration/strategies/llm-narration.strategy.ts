import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IMPACT_RULES } from '../impact-rules';
import { RecommendationArraySchema } from '../schemas/recommendation.schema';
import {
  EvaluationFindings,
  NarrationStrategy,
  Recommendation,
} from '../narration.types';
import { Verdict } from '../../common/enums';

const NARRATION_SYSTEM_PROMPT = `You are a cement plant process advisor.
You receive EvaluationFindings where PASS/MARGIN/FAIL statuses are already decided by a deterministic rule engine.
Do NOT alter, re-derive, or contradict any status or numeric value.
Only explain practical impact and propose prioritized actionable recommendations.
Return ONLY a JSON array of objects with keys: priority (number), issue (string), action (string), category ("raw_mix"|"kiln"|"grinding"), impact (optional string).
Prioritize FAIL items before MARGIN items. Keep actions concrete and plant-floor actionable.`;

@Injectable()
export class LlmNarrationStrategy implements NarrationStrategy {
  private readonly logger = new Logger(LlmNarrationStrategy.name);

  constructor(private readonly configService: ConfigService) {}

  async narrate(findings: EvaluationFindings): Promise<Recommendation[]> {
    const apiKey = this.configService.get<string>('openai.apiKey');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const model =
      this.configService.get<string>('openai.model') ?? 'gpt-4o-mini';

    const userPrompt = this.buildPrompt(findings);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            model,
            temperature: 0.2,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: NARRATION_SYSTEM_PROMPT },
              {
                role: 'user',
                content: `${userPrompt}\n\nRespond as {"recommendations":[...]}`,
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`LLM HTTP ${response.status}: ${body}`);
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('LLM returned empty content');
      }

      const parsedJson = JSON.parse(content) as {
        recommendations?: unknown;
      };
      const parsed = RecommendationArraySchema.safeParse(
        parsedJson.recommendations ?? parsedJson,
      );

      if (!parsed.success) {
        this.logger.warn(
          `LLM narration failed schema validation: ${parsed.error.message}`,
        );
        throw new Error('LLM output failed schema validation');
      }

      return parsed.data;
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildPrompt(findings: EvaluationFindings): string {
    const flagged = findings.parameterResults.filter(
      (r) => r.status !== Verdict.PASS,
    );

    return JSON.stringify(
      {
        overallVerdict: findings.overallVerdict,
        standardVersion: findings.standardVersion,
        flaggedParameters: flagged,
        computedRatios: findings.computedRatios,
        boguePhases: findings.boguePhases,
        impactContext: IMPACT_RULES,
      },
      null,
      2,
    );
  }
}
