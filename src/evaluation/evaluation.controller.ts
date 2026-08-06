import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { EvaluationResponseDto } from './dto/evaluation-response.dto';
import { FindEvaluationsQueryDto } from './dto/find-evaluations-query.dto';
import { PaginatedEvaluationsResponseDto } from './dto/paginated-evaluations-response.dto';
import { EvaluationService } from './evaluation.service';

@ApiTags('evaluations')
@Controller('evaluations')
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  @ApiOperation({
    summary: 'Evaluate ASTM C150 Type I cement readings',
  })
  @ApiCreatedResponse({ type: EvaluationResponseDto })
  create(@Body() dto: CreateEvaluationDto): Promise<EvaluationResponseDto> {
    return this.evaluationService.evaluate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List evaluation reports' })
  @ApiOkResponse({ type: PaginatedEvaluationsResponseDto })
  findAll(
    @Query() query: FindEvaluationsQueryDto,
  ): Promise<PaginatedEvaluationsResponseDto> {
    return this.evaluationService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an evaluation report by id' })
  @ApiOkResponse({ type: EvaluationResponseDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EvaluationResponseDto> {
    return this.evaluationService.findById(id);
  }
}
