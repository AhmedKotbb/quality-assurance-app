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

  async findAll(options?: {
    overallVerdict?: Verdict;
    page?: number;
    limit?: number;
  }): Promise<{ rows: EvaluationReport[]; count: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const offset = (page - 1) * limit;

    return this.evaluationReportModel.findAndCountAll({
      where: options?.overallVerdict
        ? { overallVerdict: options.overallVerdict }
        : undefined,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  }
}
