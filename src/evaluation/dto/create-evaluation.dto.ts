import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  Max,
  Min,
  Validate,
  ValidateIf,
  ValidateNested,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CementType } from '../../common/enums';

@ValidatorConstraint({ name: 'oxideSumPlausible', async: false })
export class OxideSumPlausibleConstraint implements ValidatorConstraintInterface {
  validate(oxides: OxidesDto): boolean {
    if (!oxides) {
      return false;
    }
    const sum =
      oxides.CaO +
      oxides.SiO2 +
      oxides.Al2O3 +
      oxides.Fe2O3 +
      (oxides.MgO ?? 0) +
      (oxides.SO3 ?? 0) +
      (oxides.LOI ?? 0) +
      (oxides.IR ?? 0);
    return sum >= 95 && sum <= 105;
  }

  defaultMessage(): string {
    return 'Reported oxides (incl. MgO/SO3/LOI/IR when present) must sum to roughly 95–105%';
  }
}

export class OxidesDto {
  @ApiProperty({ example: 64.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  CaO!: number;

  @ApiProperty({ example: 21.0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  SiO2!: number;

  @ApiProperty({ example: 5.2 })
  @IsNumber()
  @Min(0)
  @Max(100)
  Al2O3!: number;

  @ApiProperty({ example: 3.1 })
  @IsNumber()
  @Min(0)
  @Max(100)
  Fe2O3!: number;

  @ApiPropertyOptional({ example: 2.1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  MgO?: number;

  @ApiPropertyOptional({ example: 2.8 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  SO3?: number;

  @ApiPropertyOptional({ example: 1.8 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  LOI?: number;

  @ApiPropertyOptional({ example: 0.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  IR?: number;

  @ApiPropertyOptional({ example: 1.1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  freeLime?: number;
}

export class BoguePhasesDto {
  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  C3S?: number | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  C2S?: number | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  C3A?: number | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber()
  C4AF?: number | null;
}

export class CompressiveStrengthDto {
  @ApiPropertyOptional({ example: 22 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  day3?: number;

  @ApiPropertyOptional({ example: 31 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  day7?: number;

  @ApiPropertyOptional({ example: 46 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  day28?: number;
}

export class PhysicalDto {
  @ApiPropertyOptional({ example: 350 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  blaineFineness?: number;

  @ApiPropertyOptional({ example: 110 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialSettingTimeMin?: number;

  @ApiPropertyOptional({ example: 220 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  finalSettingTimeMin?: number;

  @ApiPropertyOptional({ example: 1.2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  soundnessMm?: number;

  @ApiPropertyOptional({ example: 0.2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  autoclaveExpansionPct?: number;

  @ApiPropertyOptional({ type: CompressiveStrengthDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CompressiveStrengthDto)
  compressiveStrengthMPa?: CompressiveStrengthDto;
}

export class CreateEvaluationDto {
  @ApiProperty({ enum: CementType, example: CementType.ASTM_TYPE_I })
  @IsEnum(CementType)
  cementType!: CementType;

  @ApiProperty({ type: OxidesDto })
  @IsObject()
  @ValidateNested()
  @Validate(OxideSumPlausibleConstraint)
  @Type(() => OxidesDto)
  oxides!: OxidesDto;

  @ApiPropertyOptional({ type: BoguePhasesDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BoguePhasesDto)
  boguePhases?: BoguePhasesDto;

  @ApiPropertyOptional({ type: PhysicalDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PhysicalDto)
  physical?: PhysicalDto;
}
