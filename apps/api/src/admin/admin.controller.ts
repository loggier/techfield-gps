import {
  Controller, Get, Post, Param, Query, UseGuards,
  ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PlatformAdminGuard } from './admin.guard';
import { User } from '../users/entities/user.entity';
import { WorkOrder } from '../work-orders/entities/work-order.entity';
import { KbEntry } from '../knowledge-base/entities/kb-entry.entity';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { KbStatus, WOStatus } from '@techfield/types';

@UseGuards(JwtAuthGuard, PlatformAdminGuard)
@Controller('admin')
export class AdminController {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(WorkOrder) private readonly woRepo: Repository<WorkOrder>,
    @InjectRepository(KbEntry) private readonly kbRepo: Repository<KbEntry>,
    private readonly kbService: KnowledgeBaseService,
  ) {}

  // ── Dashboard stats ───────────────────────────────────────────────────────

  @Get('stats')
  async stats() {
    const [
      totalUsers, totalOts, closedOts, pendingKb, approvedKb,
    ] = await Promise.all([
      this.usersRepo.count(),
      this.woRepo.count(),
      this.woRepo.count({ where: { status: WOStatus.COMPLETED } }),
      this.kbRepo.count({ where: { status: KbStatus.PENDING } }),
      this.kbRepo.count({ where: { status: KbStatus.APPROVED } }),
    ]);

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersWeek = await this.usersRepo
      .createQueryBuilder('u')
      .where('u.createdAt >= :since', { since })
      .getCount();

    return { totalUsers, newUsersWeek, totalOts, closedOts, pendingKb, approvedKb };
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  @Get('users')
  async users(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('q') q?: string,
    @Query('level') level?: string,
    @Query('country') country?: string,
  ) {
    const qb = this.usersRepo
      .createQueryBuilder('u')
      .select([
        'u.id', 'u.name', 'u.phone', 'u.email', 'u.zoneCountry', 'u.level',
        'u.activityScore', 'u.totalPoints', 'u.isMarketplaceVisible',
        'u.referralCode', 'u.createdAt',
      ])
      .orderBy('u.createdAt', 'DESC');

    if (q) qb.andWhere('u.name ILIKE :q OR u.phone ILIKE :q', { q: `%${q}%` });
    if (level) qb.andWhere('u.level = :level', { level });
    if (country) qb.andWhere('u.zoneCountry = :country', { country });

    const [items, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  @Get('users/:id')
  async user(@Param('id') id: string) {
    return this.usersRepo
      .createQueryBuilder('u')
      .select([
        'u.id', 'u.name', 'u.phone', 'u.email', 'u.zoneCountry', 'u.level',
        'u.activityScore', 'u.totalPoints', 'u.isMarketplaceVisible',
        'u.referralCode', 'u.fcmToken', 'u.createdAt',
      ])
      .where('u.id = :id', { id })
      .getOne();
  }

  // ── Work Orders ───────────────────────────────────────────────────────────

  @Get('work-orders')
  async workOrders(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(25), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('country') country?: string,
  ) {
    const qb = this.woRepo
      .createQueryBuilder('wo')
      .leftJoinAndSelect('wo.technician', 'tech')
      .select([
        'wo.id', 'wo.slug', 'wo.status', 'wo.clientName', 'wo.vehicleBrand',
        'wo.vehicleModel', 'wo.country', 'wo.clientRating', 'wo.createdAt',
        'tech.id', 'tech.name', 'tech.level',
      ])
      .orderBy('wo.createdAt', 'DESC');

    if (status) qb.andWhere('wo.status = :status', { status });
    if (country) qb.andWhere('wo.country = :country', { country });

    const [items, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  // ── KB moderation ─────────────────────────────────────────────────────────

  @Get('kb/pending')
  async pendingKb(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const [items, total] = await this.kbRepo.findAndCount({
      where: { status: KbStatus.PENDING },
      relations: ['author'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  @Post('kb/:id/approve')
  async approveKb(@Param('id') id: string, @CurrentUser() admin: any) {
    return this.kbService.approve(id, admin.id);
  }

  @Post('kb/:id/reject')
  async rejectKb(@Param('id') id: string) {
    await this.kbRepo.update(id, { status: KbStatus.REJECTED as any });
    return { ok: true };
  }
}
