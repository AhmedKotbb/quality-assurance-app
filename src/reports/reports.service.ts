import { Injectable, NotFoundException } from '@nestjs/common';
import { EvaluationReport } from '../database/models/evaluation-report.model';
import { Verdict } from '../common/enums';
import {
  CreateEvaluationReportInput,
  ReportsRepository,
} from './reports.repository';

@Injectable()
export class ReportsService {
  constructor(private readonly reportsRepository: ReportsRepository) {}

  create(input: CreateEvaluationReportInput): Promise<EvaluationReport> {
    return this.reportsRepository.create(input);
  }

  async findById(id: string): Promise<EvaluationReport> {
    const report = await this.reportsRepository.findById(id);
    if (!report) {
      throw new NotFoundException(`Evaluation report ${id} not found`);
    }
    return report;
  }

  findAll(verdict?: Verdict): Promise<EvaluationReport[]> {
    return this.reportsRepository.findAll({ verdict });
  }
}
