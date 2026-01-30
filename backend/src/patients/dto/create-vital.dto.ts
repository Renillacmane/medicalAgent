import { PartialType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BloodPressureDto {
  @IsNumber()
  @Min(0)
  systolic: number;

  @IsNumber()
  @Min(0)
  diastolic: number;
}

export class CreateVitalDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  heartRate?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => BloodPressureDto)
  bloodPressure?: BloodPressureDto;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number; // cm, used for BMI if weight provided (otherwise from user profile)

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  sleepHours?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  stressPerception?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bloodOxygen?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bloodGlucose?: number;
}

/** All fields optional; use for PATCH / update vital. */
export class UpdateVitalDto extends PartialType(CreateVitalDto) {}
