import { Controller, Get, Param } from '@nestjs/common';
import { WorkOrdersService } from '../work-orders/work-orders.service';
import { UsersService } from '../users/users.service';

@Controller('public')
export class PublicController {
  constructor(
    private readonly workOrdersService: WorkOrdersService,
    private readonly usersService: UsersService,
  ) {}

  /** OT pública por slug (sin auth) */
  @Get('ot/:slug')
  getPublicOt(@Param('slug') slug: string) {
    return this.workOrdersService.findBySlug(slug);
  }

  /** Perfil público por userId (sin auth) */
  @Get('profile/id/:id')
  getPublicProfileById(@Param('id') id: string) {
    return this.usersService.findPublicProfile(id);
  }

  /** Perfil público por referralCode — usado en links de referido (sin auth) */
  @Get('profile/:code')
  getPublicProfileByCode(@Param('code') code: string) {
    return this.usersService.findPublicProfileByCode(code);
  }
}
