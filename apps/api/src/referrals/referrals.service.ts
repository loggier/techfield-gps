import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from './entities/referral.entity';
import { User } from '../users/entities/user.entity';
import { ReferralStatus } from '@techfield/types';

const MILESTONES = [
  { count: 1, points: 20 },
  { count: 3, points: 35 },
  { count: 5, points: 60 },
];

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(Referral) private readonly referralsRepo: Repository<Referral>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async validateCode(code: string): Promise<{ valid: boolean; referrerName: string }> {
    const referrer = await this.usersRepo.findOne({ where: { referralCode: code } });
    if (!referrer) throw new NotFoundException('Código de referido inválido');
    return { valid: true, referrerName: referrer.name };
  }

  async getMyReferrals(userId: string) {
    const referrals = await this.referralsRepo.find({
      where: { referrerId: userId },
      relations: ['referred'],
      order: { createdAt: 'DESC' },
    });

    const activeCount = referrals.filter((r) => r.status !== ReferralStatus.PENDING).length;
    const totalPointsEarned = referrals.reduce((sum, r) => sum + r.pointsGranted, 0);

    const nextMilestone = MILESTONES.find((m) => m.count > activeCount) ?? null;

    return {
      referrals: referrals.map((r) => ({
        id: r.id,
        name: r.referred?.name,
        status: r.status,
        firstOtCompletedAt: r.firstOtCompletedAt,
        pointsGranted: r.pointsGranted,
        createdAt: r.createdAt,
      })),
      stats: {
        total: referrals.length,
        active: activeCount,
        pending: referrals.filter((r) => r.status === ReferralStatus.PENDING).length,
        totalPointsEarned,
      },
      milestones: MILESTONES.map((m) => ({
        count: m.count,
        points: m.points,
        reached: activeCount >= m.count,
      })),
      nextMilestone: nextMilestone
        ? { count: nextMilestone.count, points: nextMilestone.points, remaining: nextMilestone.count - activeCount }
        : null,
    };
  }

  async activateReferral(
    referredUserId: string,
  ): Promise<{ referrerId: string; points: number; referralId: string } | null> {
    const referral = await this.referralsRepo.findOne({
      where: { referredId: referredUserId, status: ReferralStatus.PENDING },
    });
    if (!referral) return null;

    const activeCount = await this.referralsRepo.count({
      where: { referrerId: referral.referrerId, status: ReferralStatus.ACTIVE },
    });

    referral.status = ReferralStatus.ACTIVE;
    referral.firstOtCompletedAt = new Date();

    // Milestone bonus: pick the highest milestone just reached
    const newActiveCount = activeCount + 1;
    const milestone = [...MILESTONES].reverse().find((m) => m.count === newActiveCount);
    const points = milestone?.points ?? 20;

    referral.pointsGranted = points;
    await this.referralsRepo.save(referral);

    return { referrerId: referral.referrerId, points, referralId: referral.id };
  }
}
