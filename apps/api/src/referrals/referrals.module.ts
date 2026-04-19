import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Referral } from './entities/referral.entity';
import { User } from '../users/entities/user.entity';
import { ReferralsService } from './referrals.service';

@Module({
  imports: [TypeOrmModule.forFeature([Referral, User])],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}
