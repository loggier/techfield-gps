import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { User } from '../users/entities/user.entity';
import { Referral } from '../referrals/entities/referral.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto, VerifySmsDto, LoginDto, SetPinDto } from './dto/register.dto';
import { UserRole } from '@techfield/types';
import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Referral) private readonly referralsRepo: Repository<Referral>,
    @InjectRepository(RefreshToken) private readonly refreshTokensRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly gamificationService: GamificationService,
  ) {}

  // ── Register ──────────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const referrer = await this.usersRepo.findOne({
      where: { referralCode: dto.referralCode },
    });
    if (!referrer) {
      throw new BadRequestException('Código de referido inválido');
    }

    const existing = await this.usersRepo.findOne({ where: { phone: dto.phone } });
    if (existing) {
      throw new BadRequestException('Este número ya está registrado');
    }

    const user = this.usersRepo.create({
      name: dto.name,
      phone: dto.phone,
      zoneCity: dto.zoneCity,
      zoneState: dto.zoneState,
      zoneCountry: dto.zoneCountry || 'MX',
      specialties: dto.specialties || [],
      referrerId: referrer.id,
      referralCode: this.generateReferralCode(),
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

    await this.sendOtp(dto.phone);
    return { message: 'Código de verificación enviado', userId: user.id };
  }

  // ── Verify SMS ────────────────────────────────────────────────────────────

  async verifySms(dto: VerifySmsDto, deviceInfo?: string) {
    const user = await this.usersRepo.findOne({ where: { phone: dto.phone } });
    if (!user) throw new BadRequestException('Usuario no encontrado');

    const ok = await this.checkOtp(dto.phone, dto.code);
    if (!ok) throw new BadRequestException('Código inválido o expirado');

    user.phoneVerified = true;
    user.lastActivityAt = new Date();
    await this.usersRepo.save(user);

    this.gamificationService.onUserLogin(user.id).catch(() => {});
    return this.issueTokens(user, deviceInfo);
  }

  // ── Resend SMS ────────────────────────────────────────────────────────────

  async resendSms(phone: string) {
    const user = await this.usersRepo.findOne({ where: { phone } });
    if (!user) throw new BadRequestException('Usuario no encontrado');
    await this.sendOtp(phone);
    return { message: 'Código reenviado' };
  }

  // ── Login (phone + PIN, fallback to OTP) ─────────────────────────────────

  async login(dto: LoginDto, deviceInfo?: string) {
    const user = await this.usersRepo
      .createQueryBuilder('u')
      .addSelect('u.pinHash')
      .where('u.phone = :phone', { phone: dto.phone })
      .getOne();

    if (!user || !user.phoneVerified) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // If user has a PIN set, validate it directly
    if (user.pinHash && dto.pin) {
      const valid = await bcrypt.compare(dto.pin, user.pinHash);
      if (!valid) throw new UnauthorizedException('PIN incorrecto');
      user.lastActivityAt = new Date();
      await this.usersRepo.save(user);
      this.gamificationService.onUserLogin(user.id).catch(() => {});
      return this.issueTokens(user, deviceInfo);
    }

    // No PIN yet → OTP flow
    await this.sendOtp(dto.phone);
    return { message: 'Código de verificación enviado', requiresOtp: true };
  }

  // ── Set PIN (after first OTP verify or from profile settings) ────────────

  async setPin(userId: string, dto: SetPinDto) {
    if (dto.pin.length < 4 || dto.pin.length > 8 || !/^\d+$/.test(dto.pin)) {
      throw new BadRequestException('El PIN debe ser de 4 a 8 dígitos numéricos');
    }
    const hash = await bcrypt.hash(dto.pin, 10);
    await this.usersRepo.update(userId, { pinHash: hash } as any);
    return { message: 'PIN configurado correctamente' };
  }

  // ── Refresh ───────────────────────────────────────────────────────────────

  async refreshToken(token: string, deviceInfo?: string) {
    const hash = this.hashToken(token);
    const stored = await this.refreshTokensRepo.findOne({
      where: { tokenHash: hash, revoked: false, expiresAt: MoreThan(new Date()) },
      relations: ['user'],
    });

    if (!stored) throw new UnauthorizedException('Refresh token inválido o expirado');

    // Rotate: revoke old, issue new
    stored.revoked = true;
    await this.refreshTokensRepo.save(stored);

    return this.issueTokens(stored.user, deviceInfo);
  }

  // ── Logout ────────────────────────────────────────────────────────────────

  async logout(token: string) {
    const hash = this.hashToken(token);
    await this.refreshTokensRepo.update({ tokenHash: hash }, { revoked: true });
    return { message: 'Sesión cerrada correctamente' };
  }

  // ── FCM token ─────────────────────────────────────────────────────────────

  async updateFcmToken(userId: string, fcmToken: string) {
    await this.usersRepo.update(userId, { fcmToken });
    return { success: true };
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private async issueTokens(user: User, deviceInfo?: string) {
    const payload = { sub: user.id, phone: user.phone, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.secret'),
      expiresIn: this.configService.get('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    const expiresInDays = 90;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await this.refreshTokensRepo.save(
      this.refreshTokensRepo.create({
        userId: user.id,
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
        deviceInfo,
      }),
    );

    return { accessToken, refreshToken, userId: user.id, role: user.role };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private async sendOtp(phone: string): Promise<void> {
    const sid = this.configService.get('twilio.accountSid');
    if (sid) {
      const twilio = require('twilio')(sid, this.configService.get('twilio.authToken'));
      await twilio.verify.v2
        .services(this.configService.get('twilio.verifySid'))
        .verifications.create({ to: phone, channel: 'sms' });
    } else {
      this.logger.debug(`[DEV] OTP for ${phone}: 123456`);
    }
  }

  private async checkOtp(phone: string, code: string): Promise<boolean> {
    const sid = this.configService.get('twilio.accountSid');
    if (!sid) return code === '123456';
    const twilio = require('twilio')(sid, this.configService.get('twilio.authToken'));
    const result = await twilio.verify.v2
      .services(this.configService.get('twilio.verifySid'))
      .verificationChecks.create({ to: phone, code });
    return result.status === 'approved';
  }
}
