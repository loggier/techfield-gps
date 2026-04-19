import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
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
  verifySms(@Body() dto: VerifySmsDto) {
    return this.authService.verifySms(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Put('fcm-token')
  @UseGuards(JwtAuthGuard)
  updateFcmToken(@CurrentUser() user: User, @Body() dto: UpdateFcmTokenDto) {
    return this.authService.updateFcmToken(user.id, dto.fcmToken);
  }
}
