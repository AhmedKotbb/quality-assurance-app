import { Module } from '@nestjs/common';
import { StandardsModule } from '../standards/standards.module';
import { RuleEngineService } from './rule-engine.service';

@Module({
  imports: [StandardsModule],
  providers: [RuleEngineService],
  exports: [RuleEngineService],
})
export class RuleEngineModule {}
