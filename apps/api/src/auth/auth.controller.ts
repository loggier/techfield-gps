import { Body, Controller, Headers, Post, Put, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  LogoutDto,
  RefreshTokenDto,
  RegisterDto,
  ResendSmsDto,
  SetPinDto,
  UpdateFcmTokenDto,
  VerifySmsDto,
} from './dto/register.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify-sms')
  verifySms(
    @Body() dto: VerifySmsDto,
    @Headers('user-agent') deviceInfo?: string,
  ) {
    return this.authService.verifySms(dto, deviceInfo);
  }

  @Post('resend-sms')
  resendSms(@Body() dto: ResendSmsDto) {
    return this.authService.resendSms(dto.phone);
  }

  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Headers('user-agent') deviceInfo?: string,
  ) {
    return this.authService.login(dto, deviceInfo);
  }

  @Post('set-pin')
  @UseGuards(JwtAuthGuard)
  setPin(@CurrentUser() user: User, @Body() dto: SetPinDto) {
    return this.authService.setPin(user.id, dto);
  }

  @Post('refresh')
  refresh(
    @Body() dto: RefreshTokenDto,
    @Headers('user-agent') deviceInfo?: string,
  ) {
    return this.authService.refreshToken(dto.refreshToken, deviceInfo);
  }

  @Post('logout')
  logout(@Body() dto: LogoutDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Put('fcm-token')
  @UseGuards(JwtAuthGuard)
  updateFcmToken(@CurrentUser() user: User, @Body() dto: UpdateFcmTokenDto) {
    return this.authService.updateFcmToken(user.id, dto.fcmToken);
  }
}
