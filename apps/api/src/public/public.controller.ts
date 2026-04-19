import { Controller, Get, Param } from '@nestjs/common';
import { WorkOrdersService } from '../work-orders/work-orders.service';
import { UsersService } from '../users/users.service';

@Controller('public')
export class PublicController {
  constructor(
    private readonly workOrdersService: WorkOrdersService,
    private readonly usersService: UsersService,
  ) {}

  @Get('ot/:slug')
  getPublicOt(@Param('slug') slug: string) {
    return this.workOrdersService.findBySlug(slug);
  }

  @Get('profile/:id')
  getPublicProfile(@Param('id') id: string) {
    return this.usersService.findPublicProfile(id);
  }
}
