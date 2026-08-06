import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiWrappedCreatedResponse,
  ApiWrappedOkResponse,
  ResponseMessage,
} from '../common';
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
  @ResponseMessage('Evaluation completed successfully')
  @ApiWrappedCreatedResponse(EvaluationResponseDto)
  create(@Body() dto: CreateEvaluationDto): Promise<EvaluationResponseDto> {
    return this.evaluationService.evaluate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List evaluation reports' })
  @ResponseMessage('Evaluations retrieved successfully')
  @ApiWrappedOkResponse(PaginatedEvaluationsResponseDto)
  findAll(
    @Query() query: FindEvaluationsQueryDto,
  ): Promise<PaginatedEvaluationsResponseDto> {
    return this.evaluationService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an evaluation report by id' })
  @ResponseMessage('Evaluation retrieved successfully')
  @ApiWrappedOkResponse(EvaluationResponseDto)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EvaluationResponseDto> {
    return this.evaluationService.findById(id);
  }
}
