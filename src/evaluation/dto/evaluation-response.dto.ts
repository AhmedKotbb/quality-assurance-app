import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  CementType,
  NarrationMode,
  RecommendationCategory,
  Verdict,
} from '../../common/enums';

export class ParameterResultDto {
  @ApiProperty()
  parameter!: string;

  @ApiProperty()
  value!: number;

  @ApiProperty()
  limit!: string;

  @ApiProperty({ enum: Verdict })
  status!: Verdict;

  @ApiProperty()
  group!: string;

  @ApiPropertyOptional()
  notes?: string;
}

export class RecommendationDto {
  @ApiProperty()
  priority!: number;

  @ApiProperty()
  issue!: string;

  @ApiProperty()
  action!: string;

  @ApiProperty({ enum: RecommendationCategory })
  category!: RecommendationCategory;

  @ApiPropertyOptional()
  impact?: string;
}

export class EvaluationResponseDto {
  @ApiProperty({ format: 'uuid' })
  reportId!: string;

  @ApiProperty({ enum: CementType })
  cementType!: CementType;

  @ApiProperty({ enum: Verdict })
  overallVerdict!: Verdict;

  @ApiProperty({ example: 'ASTM C150-22 Type I' })
  standardApplied!: string;

  @ApiProperty({
    example: { LSF: 0.9619, SR: 2.5301, AR: 1.6774 },
  })
  computedRatios!: Record<string, number>;

  @ApiProperty({
    example: { C3S: 63.61, C2S: 12.22, C3A: 8.53, C4AF: 9.43 },
  })
  boguePhases!: Record<string, number>;

  @ApiProperty({ type: [ParameterResultDto] })
  parameterResults!: ParameterResultDto[];

  @ApiProperty({ type: [RecommendationDto] })
  recommendations!: RecommendationDto[];

  @ApiProperty({ enum: NarrationMode })
  narrationMode!: NarrationMode;

  @ApiProperty()
  createdAt!: Date;
}
