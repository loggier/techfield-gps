import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';
import { ScoreService } from './score.service';
import { PointsLog } from './entities/points-log.entity';
import { UserBadge } from './entities/user-badge.entity';
import { User } from '../users/entities/user.entity';
import { WorkOrder } from '../work-orders/entities/work-order.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PointsLog, UserBadge, User, WorkOrder]),
    ScheduleModule.forRoot(),
    NotificationsModule,
  ],
  controllers: [GamificationController],
  providers: [GamificationService, ScoreService],
  exports: [GamificationService],
})
export class GamificationModule {}
