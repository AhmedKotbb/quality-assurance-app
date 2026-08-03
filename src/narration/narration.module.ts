import { Module } from '@nestjs/common';
import { NarrationService } from './narration.service';
import { LlmNarrationStrategy } from './strategies/llm-narration.strategy';
import { TemplateNarrationStrategy } from './strategies/template-narration.strategy';

@Module({
  providers: [
    TemplateNarrationStrategy,
    LlmNarrationStrategy,
    NarrationService,
  ],
  exports: [NarrationService],
})
export class NarrationModule {}
