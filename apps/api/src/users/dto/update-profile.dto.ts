import {
  IsString,
  IsOptional,
  IsArray,
  IsIn,
  MaxLength,
  MinLength,
} from 'class-validator';

const VALID_SPECIALTIES = [
  'installation',
  'revision',
  'support',
  'config',
  'motor_cut',
];

export class UpdateProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  zoneCity?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  zoneState?: string;

  @IsString()
  @MaxLength(2)
  @IsOptional()
  zoneCountry?: string;

  @IsArray()
  @IsIn(VALID_SPECIALTIES, { each: true })
  @IsOptional()
  specialties?: string[];
}
