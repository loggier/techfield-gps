import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  Max,
  Matches,
  MaxLength,
  IsUUID,
} from 'class-validator';

const WO_TYPES = ['installation', 'revision', 'support', 'config', 'motor_cut'];
const OPERATORS = ['Telcel', 'AT&T', 'Movistar', 'Claro', 'Tigo', 'Otro'];

export class CreateWorkOrderDto {
  @IsIn(WO_TYPES)
  type: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  clientName: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  clientPhone?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  vehicleBrand: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  vehicleModel: string;

  @IsInt()
  @Min(1950)
  @Max(new Date().getFullYear() + 1)
  vehicleYear: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  vehiclePlate: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  vehicleColor?: string;

  @IsString()
  @IsOptional()
  @MaxLength(17)
  vehicleVin?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  deviceBrand: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  deviceModel: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{15}$/, { message: 'El IMEI debe tener exactamente 15 dígitos numéricos' })
  deviceImei: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  deviceSim?: string;

  @IsIn(OPERATORS)
  @IsOptional()
  deviceOperator?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  devicePlatform?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;

  @IsUUID()
  @IsOptional()
  workspaceId?: string;
}

export class UpdateWorkOrderDto {
  @IsIn(WO_TYPES)
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  clientName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  clientPhone?: string;

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
  @Max(new Date().getFullYear() + 1)
  @IsOptional()
  vehicleYear?: number;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  vehiclePlate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  vehicleColor?: string;

  @IsString()
  @IsOptional()
  @MaxLength(17)
  vehicleVin?: string;

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
  @Matches(/^\d{15}$/, { message: 'El IMEI debe tener exactamente 15 dígitos numéricos' })
  deviceImei?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  deviceSim?: string;

  @IsIn(OPERATORS)
  @IsOptional()
  deviceOperator?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  devicePlatform?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

export class CloseWorkOrderDto {
  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  address?: string;
}

export class WorkOrderFiltersDto {
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export class ClientRatingDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}
