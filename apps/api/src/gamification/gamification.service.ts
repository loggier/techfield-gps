import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PointsLog } from './entities/points-log.entity';
import { UserBadge } from './entities/user-badge.entity';
import { User } from '../users/entities/user.entity';
import { UserLevel } from '@techfield/types';

const LEVEL_THRESHOLDS = {
  [UserLevel.ELITE]: 1000,
  [UserLevel.SENIOR]: 500,
  [UserLevel.PRO]: 200,
  [UserLevel.VERIFICADO]: 50,
  [UserLevel.NOVATO]: 0,
};

const BADGES = {
  SERIAL_INSTALLER: { key: 'serial_installer', threshold: 50 },
  NO_ERRORS: { key: 'no_errors', threshold: 30 },
  RECRUITER: { key: 'recruiter', threshold: 5 },
  HAPPY_CLIENT: { key: 'happy_client', minRating: 4.8 },
  KB_MASTER: { key: 'kb_master', threshold: 20 },
};

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(PointsLog) private readonly pointsLogRepo: Repository<PointsLog>,
    @InjectRepository(UserBadge) private readonly badgesRepo: Repository<UserBadge>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async addPoints(
    userId: string,
    delta: number,
    reason: string,
    referenceId?: string,
  ): Promise<User> {
    const user = await this.usersRepo.findOneOrFail({ where: { id: userId } });
    user.totalPoints = Math.max(0, user.totalPoints + delta);
    user.lastActivityAt = new Date();
    user.activityScore = Math.min(100, user.activityScore + 5);

    const prevLevel = user.level;
    user.level = this.calculateLevel(user.totalPoints);
    await this.usersRepo.save(user);

    await this.pointsLogRepo.save(
      this.pointsLogRepo.create({
        userId,
        delta,
        reason,
        referenceId,
        scoreAfter: user.totalPoints,
      }),
    );

    return user;
  }

  async onWorkOrderCompleted(userId: string, workOrderId: string, hasSignature: boolean) {
    await this.addPoints(userId, 5, 'OT completada con evidencias', workOrderId);

    if (hasSignature) {
      await this.addPoints(userId, 10, 'Firma del cliente obtenida', workOrderId);
    }

    const isFirstOfMonth = await this.isFirstOtOfMonth(userId);
    if (isFirstOfMonth) {
      await this.addPoints(userId, 15, 'Primera OT del mes', workOrderId);
    }

    await this.recalculateLevel(userId);
  }

  async getMyStats(userId: string) {
    const user = await this.usersRepo.findOneOrFail({ where: { id: userId } });
    const badges = await this.badgesRepo.find({ where: { userId } });
    const log = await this.pointsLogRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    return {
      totalPoints: user.totalPoints,
      level: user.level,
      activityScore: user.activityScore,
      badges,
      recentLog: log,
    };
  }

  async recalculateLevel(userId: string) {
    const user = await this.usersRepo.findOneOrFail({ where: { id: userId } });
    const newLevel = this.calculateLevel(user.totalPoints);
    if (newLevel !== user.level) {
      user.level = newLevel;
      await this.usersRepo.save(user);
    }
  }

  private calculateLevel(totalPoints: number): UserLevel {
    if (totalPoints >= 1000) return UserLevel.ELITE;
    if (totalPoints >= 500) return UserLevel.SENIOR;
    if (totalPoints >= 200) return UserLevel.PRO;
    if (totalPoints >= 50) return UserLevel.VERIFICADO;
    return UserLevel.NOVATO;
  }

  private async isFirstOtOfMonth(userId: string): Promise<boolean> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const count = await this.pointsLogRepo.count({
      where: {
        userId,
        reason: 'OT completada con evidencias',
        createdAt: Between(startOfMonth, now),
      },
    });
    return count === 1; // this one is the first
  }
}
