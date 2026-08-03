import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { EvaluationReport } from '../database/models/evaluation-report.model';
import { ReportsRepository } from './reports.repository';
import { ReportsService } from './reports.service';

@Module({
  imports: [SequelizeModule.forFeature([EvaluationReport])],
  providers: [ReportsRepository, ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
