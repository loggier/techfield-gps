import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsBoolean,
  IsObject,
  IsArray,
  IsUrl,
} from 'class-validator';

const KB_TYPES = ['motor_cut', 'device_config', 'known_issue', 'install_guide'];

export class CreateKbEntryDto {
  @IsIn(KB_TYPES)
  type: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  vehicleBrand?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  vehicleModel?: string;

  @IsInt()
  @Min(1950)
  @IsOptional()
  yearFrom?: number;

  @IsInt()
  @Min(1950)
  @IsOptional()
  yearTo?: number;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  deviceBrand?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  deviceModel?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  operator?: string;

  @IsObject()
  content: Record<string, any>;

  @IsArray()
  @IsOptional()
  photos?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(5)
  country?: string;
}

export class UpdateKbEntryDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsObject()
  @IsOptional()
  content?: Record<string, any>;

  @IsArray()
  @IsOptional()
  photos?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(80)
  vehicleBrand?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  vehicleModel?: string;

  @IsInt()
  @Min(1950)
  @IsOptional()
  yearFrom?: number;

  @IsInt()
  @Min(1950)
  @IsOptional()
  yearTo?: number;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  deviceBrand?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  deviceModel?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  operator?: string;
}

export class VoteKbDto {
  @IsBoolean()
  isUseful: boolean;

  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;
}

export class SearchKbDto {
  @IsString()
  @IsOptional()
  q?: string;

  @IsIn(KB_TYPES)
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number;
}
