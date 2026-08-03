import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { NarrationModule } from './narration/narration.module';
import { RuleEngineModule } from './rule-engine/rule-engine.module';
import { StandardsModule } from './standards/standards.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
      validate: validateEnv,
    }),
    DatabaseModule,
    StandardsModule,
    RuleEngineModule,
    NarrationModule,
    EvaluationModule,
  ],
})
export class AppModule {}
