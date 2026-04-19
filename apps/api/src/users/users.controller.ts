import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ReferralsService } from '../referrals/referrals.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly referralsService: ReferralsService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: User) {
    return this.usersService.findMe(user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@CurrentUser() user: User, @Body() dto: Partial<User>) {
    return this.usersService.updateMe(user.id, dto);
  }

  @Get('me/referral-code')
  @UseGuards(JwtAuthGuard)
  getReferralCode(@CurrentUser() user: User) {
    return this.usersService.getMyReferralCode(user.id);
  }

  @Get('me/referrals')
  @UseGuards(JwtAuthGuard)
  getMyReferrals(@CurrentUser() user: User) {
    return this.referralsService.getMyReferrals(user.id);
  }

  @Get(':id/public')
  getPublicProfile(@Param('id') id: string) {
    return this.usersService.findPublicProfile(id);
  }
}
