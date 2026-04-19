import { IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

const VALID_STAGES = ['before', 'during', 'after', 'device', 'other'];

export class UploadEvidenceDto {
  @IsUUID()
  @IsNotEmpty()
  workOrderId: string;

  @IsIn(VALID_STAGES)
  stage: string;

  @Transform(({ value }) => parseFloat(value))
  @IsOptional()
  latitude?: number;

  @Transform(({ value }) => parseFloat(value))
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  takenAt?: string;
}
