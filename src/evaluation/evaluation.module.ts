import { Module } from '@nestjs/common';
import { NarrationModule } from '../narration/narration.module';
import { ReportsModule } from '../reports/reports.module';
import { RuleEngineModule } from '../rule-engine/rule-engine.module';
import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';

@Module({
  imports: [RuleEngineModule, NarrationModule, ReportsModule],
  controllers: [EvaluationController],
  providers: [EvaluationService],
})
export class EvaluationModule {}
