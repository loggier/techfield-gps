import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindManyOptions } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { WorkOrder } from './entities/work-order.entity';
import { Evidence } from './entities/evidence.entity';
import { GamificationService } from '../gamification/gamification.service';
import { ReferralsService } from '../referrals/referrals.service';
import { StorageService } from '../storage/storage.service';
import { WOStatus } from '@techfield/types';
import { CreateWorkOrderDto, UpdateWorkOrderDto, CloseWorkOrderDto } from './dto/create-work-order.dto';

@Injectable()
export class WorkOrdersService {
  constructor(
    @InjectRepository(WorkOrder) private readonly workOrdersRepo: Repository<WorkOrder>,
    @InjectRepository(Evidence) private readonly evidencesRepo: Repository<Evidence>,
    private readonly gamificationService: GamificationService,
    private readonly referralsService: ReferralsService,
    private readonly storageService: StorageService,
  ) {}

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async create(technicianId: string, dto: CreateWorkOrderDto): Promise<WorkOrder> {
    const wo = this.workOrdersRepo.create({
      ...dto,
      technicianId,
      slug: this.generateSlug(),
      status: WOStatus.DRAFT,
    } as any);
    const saved = await this.workOrdersRepo.save(wo);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async findAll(
    technicianId: string,
    filters: {
      status?: string;
      type?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { status, type, dateFrom, dateTo, page = 1, limit = 20 } = filters;

    const where: any = { technicianId };
    if (status) where.status = status;
    if (type) where.type = type;
    if (dateFrom && dateTo) {
      where.createdAt = Between(new Date(dateFrom), new Date(dateTo));
    }

    const [items, total] = await this.workOrdersRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['evidences'],
    });

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, technicianId: string): Promise<WorkOrder> {
    const wo = await this.workOrdersRepo.findOne({
      where: { id },
      relations: ['evidences', 'technician'],
    });
    if (!wo) throw new NotFoundException('OT no encontrada');
    if (wo.technicianId !== technicianId) throw new ForbiddenException();
    return wo;
  }

  async update(id: string, technicianId: string, dto: UpdateWorkOrderDto): Promise<WorkOrder> {
    const wo = await this.findOne(id, technicianId);
    if (wo.status === WOStatus.COMPLETED || wo.status === WOStatus.CANCELLED) {
      throw new ForbiddenException('No se puede modificar una OT cerrada o cancelada');
    }
    // Move to in_progress when first update after draft
    if (wo.status === WOStatus.DRAFT) {
      wo.status = WOStatus.IN_PROGRESS;
    }
    Object.assign(wo, dto);
    return this.workOrdersRepo.save(wo);
  }

  // ── Signature ─────────────────────────────────────────────────────────────

  async uploadSignature(
    id: string,
    technicianId: string,
    file: Express.Multer.File,
  ): Promise<WorkOrder> {
    const wo = await this.findOne(id, technicianId);
    if (wo.status === WOStatus.COMPLETED) {
      throw new ForbiddenException('OT ya completada');
    }

    const key = `signatures/ot-${id}-${Date.now()}.png`;
    const url = await this.storageService.uploadFile(file.buffer, key, 'image/png');

    wo.clientSignatureUrl = url;
    return this.workOrdersRepo.save(wo);
  }

  // ── Close ─────────────────────────────────────────────────────────────────

  async close(id: string, technicianId: string, dto: CloseWorkOrderDto = {}): Promise<WorkOrder> {
    const wo = await this.workOrdersRepo.findOne({
      where: { id },
      relations: ['evidences'],
    });
    if (!wo) throw new NotFoundException('OT no encontrada');
    if (wo.technicianId !== technicianId) throw new ForbiddenException();
    if (wo.status === WOStatus.COMPLETED) {
      throw new ForbiddenException('OT ya completada');
    }

    if (wo.evidences.length < 2) {
      throw new UnprocessableEntityException(
        `Se requieren mínimo 2 fotos de evidencia (tienes ${wo.evidences.length})`,
      );
    }
    if (!wo.clientSignatureUrl) {
      throw new UnprocessableEntityException('Se requiere la firma digital del cliente');
    }

    wo.status = WOStatus.COMPLETED;
    wo.completedAt = new Date();
    if (dto.latitude) wo.latitude = dto.latitude;
    if (dto.longitude) wo.longitude = dto.longitude;
    if (dto.address) wo.address = dto.address;

    const saved = await this.workOrdersRepo.save(wo);

    // Gamification events (fire-and-forget, non-blocking)
    this.gamificationService
      .onWorkOrderCompleted(technicianId, id, !!wo.clientSignatureUrl)
      .catch(() => {});

    this.referralsService
      .activateReferral(technicianId)
      .then(async (result) => {
        if (result) {
          await this.gamificationService.addPoints(
            result.referrerId,
            result.points,
            'Referido completó su primera OT',
            result.referralId,
          );
        }
      })
      .catch(() => {});

    return saved;
  }

  // ── Cancel ────────────────────────────────────────────────────────────────

  async cancel(id: string, technicianId: string): Promise<WorkOrder> {
    const wo = await this.findOne(id, technicianId);
    if (wo.status === WOStatus.COMPLETED) {
      throw new ForbiddenException('No se puede cancelar una OT completada');
    }
    wo.status = WOStatus.CANCELLED;
    return this.workOrdersRepo.save(wo);
  }

  // ── Rating ───────────────────────────────────────────────────────────────

  async submitRating(id: string, technicianId: string, rating: number): Promise<WorkOrder> {
    const wo = await this.findOne(id, technicianId);
    if (wo.status !== WOStatus.COMPLETED) {
      throw new ForbiddenException('Solo se pueden calificar OTs completadas');
    }
    wo.clientRating = rating;
    const saved = await this.workOrdersRepo.save(wo);
    this.gamificationService
      .onWorkOrderCompleted(technicianId, id, !!wo.clientSignatureUrl, rating)
      .catch(() => {});
    return saved;
  }

  // ── Share / Public ────────────────────────────────────────────────────────

  async getShareLink(id: string, technicianId: string) {
    const wo = await this.findOne(id, technicianId);
    if (wo.status !== WOStatus.COMPLETED) {
      throw new ForbiddenException('Solo se puede compartir una OT completada');
    }
    return {
      slug: wo.slug,
      shareUrl: `https://techfieldgps.vemontech.com/ot/${wo.slug}`,
      whatsappUrl: `https://wa.me/?text=${encodeURIComponent(
        `📍 Reporte de instalación GPS\nhttps://techfieldgps.vemontech.com/ot/${wo.slug}`,
      )}`,
    };
  }

  async findBySlug(slug: string): Promise<WorkOrder> {
    const wo = await this.workOrdersRepo.findOne({
      where: { slug, status: WOStatus.COMPLETED, isPrivate: false },
      relations: ['evidences', 'technician'],
    });
    if (!wo) throw new NotFoundException('OT no encontrada');
    return wo;
  }

  // ── Summary stats for dashboard ───────────────────────────────────────────

  async getStats(technicianId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, thisMonth, byStatus] = await Promise.all([
      this.workOrdersRepo.count({ where: { technicianId, status: WOStatus.COMPLETED } }),
      this.workOrdersRepo.count({
        where: {
          technicianId,
          status: WOStatus.COMPLETED,
          completedAt: Between(startOfMonth, now),
        },
      }),
      this.workOrdersRepo
        .createQueryBuilder('wo')
        .select('wo.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('wo.technicianId = :technicianId', { technicianId })
        .groupBy('wo.status')
        .getRawMany(),
    ]);

    return { total, thisMonth, byStatus };
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private generateSlug(): string {
    return uuidv4().replace(/-/g, '').substring(0, 12);
  }
}
