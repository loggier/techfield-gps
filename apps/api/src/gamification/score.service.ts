import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UserRole } from '@techfield/types';

@Injectable()
export class ScoreService {
  private readonly logger = new Logger(ScoreService.name);

  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async applyActivityDecay() {
    this.logger.log('Running activity score decay...');
    const now = new Date();

    const technicians = await this.usersRepo.find({
      where: { role: UserRole.TECHNICIAN },
    });

    let decayed = 0;
    for (const user of technicians) {
      if (!user.lastActivityAt) continue;

      const daysSince = Math.floor(
        (now.getTime() - user.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Only send push on exact threshold days (not every day)
      const isThresholdDay = [7, 14, 21, 30].includes(daysSince);

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
        if (hideFromMarketplace) user.isMarketplaceVisible = false;
        await this.usersRepo.save(user);
        decayed++;

        if (isThresholdDay && user.fcmToken) {
          this.notificationsService
            .notifyScoreDecay(user.fcmToken, user.activityScore, daysSince)
            .catch(() => {});
        }
      }
    }

    this.logger.log(`Activity score decay complete — ${decayed} users affected`);
  }
}
