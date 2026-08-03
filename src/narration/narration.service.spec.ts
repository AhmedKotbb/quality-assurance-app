import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { NarrationMode, Verdict } from '../common/enums';
import { NarrationService } from './narration.service';
import { EvaluationFindings } from './narration.types';
import { LlmNarrationStrategy } from './strategies/llm-narration.strategy';
import {
  TemplateNarrationStrategy,
  inferDirection,
} from './strategies/template-narration.strategy';

const findingsWithIssues: EvaluationFindings = {
  overallVerdict: Verdict.FAIL,
  standardVersion: 'ASTM C150-22 Type I',
  computedRatios: { LSF: 0.96, SR: 2.5, AR: 1.7 },
  boguePhases: { C3S: 55, C2S: 18, C3A: 8.5, C4AF: 9 },
  parameterResults: [
    {
      parameter: 'SO3',
      value: 2.9,
      limit: '<= 3.0 (C3A <= 8%)',
      status: Verdict.MARGIN,
      group: 'chemical',
    },
    {
      parameter: 'MgO',
      value: 6.5,
      limit: '<= 6.0',
      status: Verdict.FAIL,
      group: 'chemical',
    },
    {
      parameter: 'freeLime',
      value: 1.0,
      limit: '<= 1.5',
      status: Verdict.PASS,
      group: 'chemical',
    },
  ],
};

describe('inferDirection', () => {
  it('maps max limits to high and min limits to low', () => {
    expect(
      inferDirection({
        parameter: 'MgO',
        value: 6.5,
        limit: '<= 6.0',
        status: Verdict.FAIL,
        group: 'chemical',
      }),
    ).toBe('high');

    expect(
      inferDirection({
        parameter: 'C3S',
        value: 40,
        limit: '>= 45.0',
        status: Verdict.FAIL,
        group: 'phases',
      }),
    ).toBe('low');
  });
});

describe('TemplateNarrationStrategy', () => {
  it('prioritizes FAIL over MARGIN and skips PASS', () => {
    const strategy = new TemplateNarrationStrategy();
    const recommendations = strategy.narrate(findingsWithIssues);

    expect(recommendations).toHaveLength(2);
    expect(recommendations[0].priority).toBe(1);
    expect(recommendations[0].issue).toContain('MgO');
    expect(recommendations[0].action).toMatch(/raw mix/i);
    expect(recommendations[1].issue).toContain('SO3');
    expect(recommendations[1].category).toBe('grinding');
  });
});

describe('NarrationService', () => {
  it('uses templates by default', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        NarrationService,
        TemplateNarrationStrategy,
        LlmNarrationStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'narrationMode' ? NarrationMode.TEMPLATE : undefined,
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(NarrationService);
    const result = await service.narrate(findingsWithIssues);

    expect(result.modeUsed).toBe(NarrationMode.TEMPLATE);
    expect(result.recommendations[0].issue).toContain('MgO');
  });

  it('falls back to templates when LLM mode fails', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        NarrationService,
        TemplateNarrationStrategy,
        {
          provide: LlmNarrationStrategy,
          useValue: {
            narrate: jest.fn().mockRejectedValue(new Error('timeout')),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'narrationMode' ? NarrationMode.LLM : undefined,
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(NarrationService);
    const result = await service.narrate(findingsWithIssues);

    expect(result.modeUsed).toBe(NarrationMode.TEMPLATE);
    expect(result.recommendations).toHaveLength(2);
  });
});
