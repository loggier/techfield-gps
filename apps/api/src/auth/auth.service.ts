import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/entities/user.entity';
import { Referral } from '../referrals/entities/referral.entity';
import { RegisterDto, VerifySmsDto, LoginDto } from './dto/register.dto';
import { UserRole } from '@techfield/types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Referral) private readonly referralsRepo: Repository<Referral>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const referrer = await this.usersRepo.findOne({
      where: { referralCode: dto.referralCode },
    });
    if (!referrer) {
      throw new BadRequestException('Código de referido inválido');
    }

    const existing = await this.usersRepo.findOne({ where: { phone: dto.phone } });
    if (existing) {
      throw new BadRequestException('Este número de teléfono ya está registrado');
    }

    const referralCode = this.generateReferralCode();

    const user = this.usersRepo.create({
      name: dto.name,
      phone: dto.phone,
      zoneCity: dto.zoneCity,
      zoneState: dto.zoneState,
      zoneCountry: dto.zoneCountry || 'MX',
      specialties: dto.specialties || [],
      referrerId: referrer.id,
      referralCode,
      role: UserRole.TECHNICIAN,
      phoneVerified: false,
    });

    await this.usersRepo.save(user);

    await this.referralsRepo.save(
      this.referralsRepo.create({
        referrerId: referrer.id,
        referredId: user.id,
        code: dto.referralCode,
      }),
    );

    await this.sendVerificationSms(dto.phone);

    return { message: 'Código de verificación enviado', userId: user.id };
  }

  async verifySms(dto: VerifySmsDto) {
    const user = await this.usersRepo.findOne({ where: { phone: dto.phone } });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const verified = await this.checkVerificationCode(dto.phone, dto.code);
    if (!verified) {
      throw new BadRequestException('Código inválido o expirado');
    }

    user.phoneVerified = true;
    user.lastActivityAt = new Date();
    await this.usersRepo.save(user);

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({ where: { phone: dto.phone } });
    if (!user || !user.phoneVerified) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // In production: validate PIN stored as hash. For now send OTP flow.
    await this.sendVerificationSms(dto.phone);
    return { message: 'Código de verificación enviado' };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.refreshSecret'),
      });
      const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException();
      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async updateFcmToken(userId: string, fcmToken: string) {
    await this.usersRepo.update(userId, { fcmToken });
    return { success: true };
  }

  private generateTokens(user: User) {
    const payload = { sub: user.id, phone: user.phone, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.secret'),
      expiresIn: this.configService.get('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    return { accessToken, refreshToken, userId: user.id };
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private async sendVerificationSms(phone: string): Promise<void> {
    // Twilio Verify integration — stub for dev, real in prod
    if (this.configService.get('twilio.accountSid')) {
      const twilio = require('twilio')(
        this.configService.get('twilio.accountSid'),
        this.configService.get('twilio.authToken'),
      );
      await twilio.verify.v2
        .services(this.configService.get('twilio.verifySid'))
        .verifications.create({ to: phone, channel: 'sms' });
    }
    // In dev without Twilio: log code to console
  }

  private async checkVerificationCode(phone: string, code: string): Promise<boolean> {
    if (!this.configService.get('twilio.accountSid')) {
      return code === '123456'; // dev bypass
    }
    const twilio = require('twilio')(
      this.configService.get('twilio.accountSid'),
      this.configService.get('twilio.authToken'),
    );
    const result = await twilio.verify.v2
      .services(this.configService.get('twilio.verifySid'))
      .verificationChecks.create({ to: phone, code });
    return result.status === 'approved';
  }
}
