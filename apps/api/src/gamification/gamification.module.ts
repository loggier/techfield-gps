import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';
import { ScoreService } from './score.service';
import { PointsLog } from './entities/points-log.entity';
import { UserBadge } from './entities/user-badge.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PointsLog, UserBadge, User]),
    ScheduleModule.forRoot(),
  ],
  controllers: [GamificationController],
  providers: [GamificationService, ScoreService],
  exports: [GamificationService],
})
export class GamificationModule {}
