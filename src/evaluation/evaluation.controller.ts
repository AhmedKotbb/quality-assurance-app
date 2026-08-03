import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Verdict } from '../common/enums';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { EvaluationResponseDto } from './dto/evaluation-response.dto';
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
  @ApiOperation({ summary: 'List recent evaluation reports' })
  @ApiQuery({
    name: 'verdict',
    required: false,
    enum: Verdict,
  })
  @ApiOkResponse({ type: [EvaluationResponseDto] })
  findAll(
    @Query(
      'verdict',
      new ParseEnumPipe(Verdict, {
        optional: true,
      }),
    )
    verdict?: Verdict,
  ): Promise<EvaluationResponseDto[]> {
    return this.evaluationService.findAll(verdict);
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
