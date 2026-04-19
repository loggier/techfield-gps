import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { WorkOrder } from '../work-orders/entities/work-order.entity';
import { UserBadge } from '../gamification/entities/user-badge.entity';
import { Referral } from '../referrals/entities/referral.entity';
import { ReferralsModule } from '../referrals/referrals.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, WorkOrder, UserBadge, Referral]),
    ReferralsModule,
    StorageModule,
    MulterModule.register({ limits: { fileSize: 5 * 1024 * 1024 } }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
