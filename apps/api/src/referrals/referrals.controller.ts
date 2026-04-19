import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  /** Validate a referral code before registration (no auth required) */
  @Get('validate/:code')
  validate(@Param('code') code: string) {
    return this.referralsService.validateCode(code);
  }

  /** My referral tree + stats */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyReferrals(@CurrentUser() user: User) {
    return this.referralsService.getMyReferrals(user.id);
  }
}
