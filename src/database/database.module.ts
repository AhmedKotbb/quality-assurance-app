import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { EvaluationReport } from './models/evaluation-report.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres' as const,
        host: configService.getOrThrow<string>('database.host'),
        port: configService.getOrThrow<number>('database.port'),
        username: configService.getOrThrow<string>('database.user'),
        password: configService.getOrThrow<string>('database.password'),
        database: configService.getOrThrow<string>('database.name'),
        models: [EvaluationReport],
        autoLoadModels: true,
        // Demo only — replace with migrations before production use.
        synchronize: true,
        logging: false,
      }),
    }),
    SequelizeModule.forFeature([EvaluationReport]),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
