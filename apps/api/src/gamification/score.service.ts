import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ScoreService {
  private readonly logger = new Logger(ScoreService.name);

  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async applyActivityDecay() {
    this.logger.log('Running activity score decay...');
    const now = new Date();

    const technicians = await this.usersRepo.find({
      where: { role: 'technician' as any },
    });

    for (const user of technicians) {
      if (!user.lastActivityAt) continue;

      const daysSince = Math.floor(
        (now.getTime() - user.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      let decay = 0;
      let hideFromMarketplace = false;

      if (daysSince >= 30) {
        decay = 30;
        hideFromMarketplace = true;
      } else if (daysSince >= 21) {
        decay = 20;
      } else if (daysSince >= 14) {
        decay = 12;
      } else if (daysSince >= 7) {
        decay = 5;
      }

      if (decay > 0) {
        user.activityScore = Math.max(0, user.activityScore - decay);
        if (hideFromMarketplace) {
          user.isMarketplaceVisible = false;
        }
        await this.usersRepo.save(user);
      }
    }

    this.logger.log('Activity score decay complete');
  }
}
