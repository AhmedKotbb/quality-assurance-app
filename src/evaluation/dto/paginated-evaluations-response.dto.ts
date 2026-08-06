import { ApiProperty } from '@nestjs/swagger';
import { EvaluationResponseDto } from './evaluation-response.dto';

export class PaginationMetaDto {
  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class PaginatedEvaluationsResponseDto {
  @ApiProperty({ type: [EvaluationResponseDto] })
  items!: EvaluationResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination!: PaginationMetaDto;
}
