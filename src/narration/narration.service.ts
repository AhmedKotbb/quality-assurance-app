import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NarrationMode } from '../common/enums';
import { EvaluationFindings, Recommendation } from './narration.types';
import { LlmNarrationStrategy } from './strategies/llm-narration.strategy';
import { TemplateNarrationStrategy } from './strategies/template-narration.strategy';

export interface NarrationResult {
  recommendations: Recommendation[];
  modeUsed: NarrationMode;
}

@Injectable()
export class NarrationService {
  private readonly logger = new Logger(NarrationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly templateStrategy: TemplateNarrationStrategy,
    private readonly llmStrategy: LlmNarrationStrategy,
  ) {}

  async narrate(findings: EvaluationFindings): Promise<NarrationResult> {
    const templates = this.templateStrategy.narrate(findings);
    const mode =
      this.configService.get<NarrationMode>('narrationMode') ??
      NarrationMode.TEMPLATE;

    if (mode !== NarrationMode.LLM) {
      return {
        recommendations: templates,
        modeUsed: NarrationMode.TEMPLATE,
      };
    }

    try {
      const recommendations = await this.llmStrategy.narrate(findings);
      return {
        recommendations,
        modeUsed: NarrationMode.LLM,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `LLM narration failed (${message}); falling back to templates`,
      );
      return {
        recommendations: templates,
        modeUsed: NarrationMode.TEMPLATE,
      };
    }
  }
}
