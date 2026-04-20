import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { WorkOrder } from '../work-orders/entities/work-order.entity';
import { UserBadge } from '../gamification/entities/user-badge.entity';
import { Referral } from '../referrals/entities/referral.entity';
import { StorageService } from '../storage/storage.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { WOStatus } from '@techfield/types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(WorkOrder) private readonly workOrdersRepo: Repository<WorkOrder>,
    @InjectRepository(UserBadge) private readonly badgesRepo: Repository<UserBadge>,
    @InjectRepository(Referral) private readonly referralsRepo: Repository<Referral>,
    private readonly storageService: StorageService,
  ) {}

  async findMe(userId: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async updateMe(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findMe(userId);
    Object.assign(user, dto);
    return this.usersRepo.save(user);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Solo se permiten imágenes');
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('La imagen no puede superar 5MB');
    }

    const key = `avatars/${userId}-${Date.now()}.jpg`;
    const avatarUrl = await this.storageService.uploadFile(file.buffer, key, file.mimetype);

    await this.usersRepo.update(userId, { avatarUrl });
    return { avatarUrl };
  }

  async getMyReferralCode(userId: string): Promise<{ referralCode: string; shareUrl: string }> {
    const user = await this.findMe(userId);
    return {
      referralCode: user.referralCode,
      shareUrl: `https://techfieldgps.vemontech.com/r/${user.referralCode}`,
    };
  }

  async findPublicProfile(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.buildPublicProfile(user);
  }

  async findPublicProfileByCode(referralCode: string) {
    const user = await this.usersRepo.findOne({ where: { referralCode } });
    if (!user) throw new NotFoundException('Perfil no encontrado');
    return this.buildPublicProfile(user);
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private async buildPublicProfile(user: User) {
    const [completedOts, badges, activeReferrals] = await Promise.all([
      this.workOrdersRepo.find({
        where: { technicianId: user.id, status: WOStatus.COMPLETED, isPrivate: false },
        select: ['id', 'type', 'vehicleBrand', 'vehicleModel', 'completedAt', 'clientRating'],
        order: { completedAt: 'DESC' },
        take: 10,
      }),
      this.badgesRepo.find({ where: { userId: user.id } }),
      this.referralsRepo.count({ where: { referrerId: user.id, status: 'active' as any } }),
    ]);

    const ratings = completedOts
      .map((o) => o.clientRating)
      .filter((r): r is number => r !== null && r !== undefined);

    const ratingAvg =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null;

    const totalOts = await this.workOrdersRepo.count({
      where: { technicianId: user.id, status: WOStatus.COMPLETED },
    });

    const yearsActive = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365),
    );

    const completeness = this.calculateCompleteness(user);

    return {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      level: user.level,
      activityScore: user.activityScore,
      isMarketplaceVisible: user.isMarketplaceVisible,
      zoneCity: user.zoneCity,
      zoneState: user.zoneState,
      zoneCountry: user.zoneCountry,
      specialties: user.specialties,
      createdAt: user.createdAt,
      stats: {
        totalOts,
        ratingAvg,
        ratingsCount: ratings.length,
        activeReferrals,
        yearsActive,
      },
      badges,
      recentOts: completedOts,
      completeness,
      shareUrl: `https://techfieldgps.vemontech.com/r/${user.referralCode}`,
    };
  }

  private calculateCompleteness(user: User): { percentage: number; missing: string[] } {
    const checks: Array<{ field: string; label: string; has: boolean }> = [
      { field: 'name', label: 'Nombre', has: !!user.name },
      { field: 'phone', label: 'Teléfono verificado', has: user.phoneVerified },
      { field: 'avatarUrl', label: 'Foto de perfil', has: !!user.avatarUrl },
      { field: 'zoneCity', label: 'Ciudad de trabajo', has: !!user.zoneCity },
      { field: 'zoneState', label: 'Estado', has: !!user.zoneState },
      { field: 'specialties', label: 'Especialidades', has: user.specialties?.length > 0 },
    ];

    const completed = checks.filter((c) => c.has);
    const missing = checks.filter((c) => !c.has).map((c) => c.label);
    const percentage = Math.round((completed.length / checks.length) * 100);

    return { percentage, missing };
  }
}
