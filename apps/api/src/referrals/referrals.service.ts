import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral } from './entities/referral.entity';
import { User } from '../users/entities/user.entity';
import { ReferralStatus } from '@techfield/types';

@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(Referral) private readonly referralsRepo: Repository<Referral>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async validateCode(code: string) {
    const referrer = await this.usersRepo.findOne({ where: { referralCode: code } });
    if (!referrer) {
      throw new NotFoundException('Código de referido inválido');
    }
    return { valid: true, referrerName: referrer.name };
  }

  async getMyReferrals(userId: string) {
    return this.referralsRepo.find({
      where: { referrerId: userId },
      relations: ['referred'],
      order: { createdAt: 'DESC' },
    });
  }

  async activateReferral(referredUserId: string) {
    const referral = await this.referralsRepo.findOne({
      where: { referredId: referredUserId, status: ReferralStatus.PENDING },
    });
    if (!referral) return;

    const activeReferrals = await this.referralsRepo.count({
      where: { referrerId: referral.referrerId, status: ReferralStatus.ACTIVE },
    });

    referral.status = ReferralStatus.ACTIVE;
    referral.firstOtCompletedAt = new Date();
    await this.referralsRepo.save(referral);

    // Return points to grant based on milestone
    let points = 20;
    if (activeReferrals + 1 >= 5) points = 60;
    else if (activeReferrals + 1 >= 3) points = 35;

    return { referrerId: referral.referrerId, points, referralId: referral.id };
  }
}
