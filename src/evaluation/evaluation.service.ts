import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { deriveChemistry } from '../chemistry';
import { CementType, Verdict } from '../common/enums';
import { NarrationService } from '../narration/narration.service';
import { RuleEngineService } from '../rule-engine/rule-engine.service';
import { ReportsService } from '../reports/reports.service';
import { EvaluationReport } from '../database/models/evaluation-report.model';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { EvaluationResponseDto } from './dto/evaluation-response.dto';
import { FindEvaluationsQueryDto } from './dto/find-evaluations-query.dto';
import { PaginatedEvaluationsResponseDto } from './dto/paginated-evaluations-response.dto';

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(
    private readonly ruleEngineService: RuleEngineService,
    private readonly narrationService: NarrationService,
    private readonly reportsService: ReportsService,
  ) {}

  async evaluate(dto: CreateEvaluationDto): Promise<EvaluationResponseDto> {
    if (dto.cementType !== CementType.ASTM_TYPE_I) {
      throw new BadRequestException(
        `Only ${CementType.ASTM_TYPE_I} is supported in this demo`,
      );
    }

    const chemistry = deriveChemistry(dto.oxides);
    const ruleResult = this.ruleEngineService.evaluate({
      cementType: dto.cementType,
      oxides: dto.oxides,
      ratios: chemistry.ratios,
      boguePhases: chemistry.boguePhases,
    });

    if (ruleResult.overallVerdict === Verdict.FAIL) {
      this.logger.warn(`Evaluation FAIL under ${ruleResult.standardVersion}`);
    }

    const narration = await this.narrationService.narrate({
      overallVerdict: ruleResult.overallVerdict,
      standardVersion: ruleResult.standardVersion,
      parameterResults: ruleResult.parameterResults,
      computedRatios: chemistry.ratios,
      boguePhases: chemistry.boguePhases,
    });

    const report = await this.reportsService.create({
      cementType: dto.cementType,
      standardVersion: ruleResult.standardVersion,
      inputPayload: dto as unknown as Record<string, unknown>,
      computedRatios: chemistry.ratios,
      boguePhases: chemistry.boguePhases,
      parameterResults: ruleResult.parameterResults,
      overallVerdict: ruleResult.overallVerdict,
      recommendations: narration.recommendations,
      narrationMode: narration.modeUsed,
    });

    return this.toResponse(report);
  }

  async findById(id: string): Promise<EvaluationResponseDto> {
    const report = await this.reportsService.findById(id);
    return this.toResponse(report);
  }

  async findAll(
    query: FindEvaluationsQueryDto,
  ): Promise<PaginatedEvaluationsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { rows, count } = await this.reportsService.findAll({
      overallVerdict: query.overallVerdict,
      page,
      limit,
    });

    return {
      items: rows.map((report) => this.toResponse(report)),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit) || 0,
      },
    };
  }

  private toResponse(report: EvaluationReport): EvaluationResponseDto {
    return {
      reportId: report.id,
      cementType: report.cementType,
      overallVerdict: report.overallVerdict,
      standardApplied: report.standardVersion,
      computedRatios: report.computedRatios as Record<string, number>,
      boguePhases: report.boguePhases as Record<string, number>,
      parameterResults:
        report.parameterResults as EvaluationResponseDto['parameterResults'],
      recommendations:
        (report.recommendations as EvaluationResponseDto['recommendations']) ??
        [],
      narrationMode: report.narrationMode,
      createdAt: report.createdAt,
    };
  }
}
