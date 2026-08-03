import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { deriveChemistry } from '../chemistry';
import { CementType, Verdict } from '../common/enums';
import { StandardsModule } from '../standards/standards.module';
import { RuleEngineService } from './rule-engine.service';

describe('RuleEngineService', () => {
  let service: RuleEngineService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [StandardsModule],
      providers: [
        RuleEngineService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => (key === 'marginPct' ? 5 : undefined),
          },
        },
      ],
    }).compile();

    // Load standards JSON via OnModuleInit
    await moduleRef.init();
    service = moduleRef.get(RuleEngineService);
  });

  const sampleOxides = {
    CaO: 64.5,
    SiO2: 21.0,
    Al2O3: 5.2,
    Fe2O3: 3.1,
    MgO: 2.1,
    SO3: 2.8,
    LOI: 1.8,
    IR: 0.5,
    freeLime: 1.1,
  };

  it('classifies a healthy Type I sample without FAIL', () => {
    const chemistry = deriveChemistry(sampleOxides);
    const result = service.evaluate({
      cementType: CementType.ASTM_TYPE_I,
      oxides: sampleOxides,
      ratios: chemistry.ratios,
      boguePhases: chemistry.boguePhases,
      physical: {
        blaineFineness: 350,
        initialSettingTimeMin: 110,
        finalSettingTimeMin: 220,
        soundnessMm: 1.2,
        compressiveStrengthMPa: { day3: 22, day7: 31, day28: 46 },
      },
    });

    expect(result.standardVersion).toContain('ASTM C150');
    expect(result.overallVerdict).not.toBe(Verdict.FAIL);

    const so3 = result.parameterResults.find((r) => r.parameter === 'SO3');
    expect(so3).toBeDefined();
    // C3A ≈ 8.53 → SO3 limit 3.5; 2.8 is comfortably PASS
    expect(so3!.limit).toContain('3.5');
    expect(so3!.status).toBe(Verdict.PASS);
  });

  it('flags FAIL when MgO exceeds the ASTM ceiling', () => {
    const oxides = { ...sampleOxides, MgO: 6.5 };
    const chemistry = deriveChemistry(oxides);
    const result = service.evaluate({
      cementType: CementType.ASTM_TYPE_I,
      oxides,
      ratios: chemistry.ratios,
      boguePhases: chemistry.boguePhases,
    });

    expect(result.overallVerdict).toBe(Verdict.FAIL);
    expect(
      result.parameterResults.find((r) => r.parameter === 'MgO')?.status,
    ).toBe(Verdict.FAIL);
  });

  it('uses the lower SO3 ceiling when C3A <= 8%', () => {
    // Lower Al2O3 to pull C3A under 8%
    const oxides = {
      ...sampleOxides,
      Al2O3: 4.0,
      Fe2O3: 3.5,
      SO3: 2.95,
    };
    const chemistry = deriveChemistry(oxides);
    expect(chemistry.boguePhases.C3A).toBeLessThanOrEqual(8);

    const result = service.evaluate({
      cementType: CementType.ASTM_TYPE_I,
      oxides,
      ratios: chemistry.ratios,
      boguePhases: chemistry.boguePhases,
    });

    const so3 = result.parameterResults.find((r) => r.parameter === 'SO3');
    expect(so3!.limit).toContain('3.0');
    expect(so3!.status).toBe(Verdict.MARGIN);
  });
});
