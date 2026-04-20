import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WorkOrdersService } from './work-orders.service';
import { CreateWorkOrderDto, UpdateWorkOrderDto, CloseWorkOrderDto, ClientRatingDto } from './dto/create-work-order.dto';
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
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.workOrdersService.findAll(user.id, {
      status,
      type,
      dateFrom,
      dateTo,
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100),
    });
  }

  @Get('stats')
  getStats(@CurrentUser() user: User) {
    return this.workOrdersService.getStats(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.workOrdersService.findOne(id, user.id);
  }

  @Put(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateWorkOrderDto,
  ) {
    return this.workOrdersService.update(id, user.id, dto);
  }

  /** Upload client signature (canvas PNG → R2) */
  @Post(':id/signature')
  @UseInterceptors(FileInterceptor('file'))
  uploadSignature(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Se requiere la imagen de la firma');
    return this.workOrdersService.uploadSignature(id, user.id, file);
  }

  /** Close the OT — requires 2+ evidences + signature */
  @Post(':id/close')
  close(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CloseWorkOrderDto,
  ) {
    return this.workOrdersService.close(id, user.id, dto);
  }

  /** Get share link + WhatsApp deep link */
  @Get(':id/share')
  share(@CurrentUser() user: User, @Param('id') id: string) {
    return this.workOrdersService.getShareLink(id, user.id);
  }

  /** Client submits star rating (1–5) after receiving their report */
  @Post(':id/rating')
  rate(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: ClientRatingDto,
  ) {
    return this.workOrdersService.submitRating(id, user.id, dto.rating);
  }

  @Delete(':id')
  cancel(@CurrentUser() user: User, @Param('id') id: string) {
    return this.workOrdersService.cancel(id, user.id);
  }
}
