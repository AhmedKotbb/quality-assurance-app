import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BoguePhases, ComputedRatios } from '../chemistry';
import { EvaluationReport } from '../database/models/evaluation-report.model';
import { CementType, NarrationMode, Verdict } from '../common/enums';

export interface CreateEvaluationReportInput {
  cementType: CementType;
  standardVersion: string;
  inputPayload: Record<string, unknown>;
  computedRatios: ComputedRatios;
  boguePhases: BoguePhases;
  parameterResults: unknown[];
  overallVerdict: Verdict;
  recommendations: unknown[] | null;
  narrationMode: NarrationMode;
}

@Injectable()
export class ReportsRepository {
  constructor(
    @InjectModel(EvaluationReport)
    private readonly evaluationReportModel: typeof EvaluationReport,
  ) {}

  create(input: CreateEvaluationReportInput): Promise<EvaluationReport> {
    return this.evaluationReportModel.create({ ...input });
  }

  findById(id: string): Promise<EvaluationReport | null> {
    return this.evaluationReportModel.findByPk(id);
  }

  findAll(filters?: { verdict?: Verdict }): Promise<EvaluationReport[]> {
    return this.evaluationReportModel.findAll({
      where: filters?.verdict ? { overallVerdict: filters.verdict } : undefined,
      order: [['createdAt', 'DESC']],
      limit: 100,
    });
  }
}
