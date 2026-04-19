import { IsString, IsNotEmpty, IsOptional, IsArray, IsPhoneNumber } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  referralCode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  zoneCity?: string;

  @IsString()
  @IsOptional()
  zoneState?: string;

  @IsString()
  @IsOptional()
  zoneCountry?: string;

  @IsArray()
  @IsOptional()
  specialties?: string[];
}

export class VerifySmsDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  pin: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class UpdateFcmTokenDto {
  @IsString()
  @IsNotEmpty()
  fcmToken: string;
}
