import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkOrdersService, CreateWorkOrderDto } from './work-orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('work-orders')
@UseGuards(JwtAuthGuard)
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateWorkOrderDto) {
    return this.workOrdersService.create(user.id, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.workOrdersService.findAll(user.id, +page, +limit);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.workOrdersService.findOne(id, user.id);
  }

  @Put(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.workOrdersService.update(id, user.id, dto);
  }

  @Post(':id/close')
  close(@CurrentUser() user: User, @Param('id') id: string) {
    return this.workOrdersService.close(id, user.id);
  }

  @Delete(':id')
  cancel(@CurrentUser() user: User, @Param('id') id: string) {
    return this.workOrdersService.cancel(id, user.id);
  }
}
