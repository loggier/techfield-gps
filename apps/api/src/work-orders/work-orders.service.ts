import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { WorkOrder } from './entities/work-order.entity';
import { Evidence } from './entities/evidence.entity';
import { GamificationService } from '../gamification/gamification.service';
import { ReferralsService } from '../referrals/referrals.service';
import { WOStatus } from '@techfield/types';

export class CreateWorkOrderDto {
  type: string;
  clientName: string;
  clientPhone?: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number;
  vehiclePlate: string;
  vehicleColor?: string;
  vehicleVin?: string;
  deviceBrand: string;
  deviceModel: string;
  deviceImei: string;
  deviceSim?: string;
  deviceOperator?: string;
  devicePlatform?: string;
  notes?: string;
  workspaceId?: string;
}

@Injectable()
export class WorkOrdersService {
  constructor(
    @InjectRepository(WorkOrder) private readonly workOrdersRepo: Repository<WorkOrder>,
    @InjectRepository(Evidence) private readonly evidencesRepo: Repository<Evidence>,
    private readonly gamificationService: GamificationService,
    private readonly referralsService: ReferralsService,
  ) {}

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

  async findAll(technicianId: string, page = 1, limit = 20) {
    const [items, total] = await this.workOrdersRepo.findAndCount({
      where: { technicianId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['evidences'],
    });
    return { items, total, page, limit };
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

  async update(id: string, technicianId: string, dto: Partial<WorkOrder>): Promise<WorkOrder> {
    const wo = await this.findOne(id, technicianId);
    if (wo.status === WOStatus.COMPLETED) {
      throw new ForbiddenException('No se puede modificar una OT completada');
    }
    Object.assign(wo, dto);
    return this.workOrdersRepo.save(wo);
  }

  async close(id: string, technicianId: string): Promise<WorkOrder> {
    const wo = await this.workOrdersRepo.findOne({
      where: { id },
      relations: ['evidences'],
    });
    if (!wo) throw new NotFoundException('OT no encontrada');
    if (wo.technicianId !== technicianId) throw new ForbiddenException();

    if (wo.evidences.length < 2) {
      throw new UnprocessableEntityException('Se requieren mínimo 2 fotos de evidencia');
    }
    if (!wo.clientSignatureUrl) {
      throw new UnprocessableEntityException('Se requiere la firma del cliente');
    }

    wo.status = WOStatus.COMPLETED;
    wo.completedAt = new Date();
    const saved = await this.workOrdersRepo.save(wo);

    // Award points
    await this.gamificationService.onWorkOrderCompleted(
      technicianId,
      id,
      !!wo.clientSignatureUrl,
    );

    // Activate referral if first OT
    const referralResult = await this.referralsService.activateReferral(technicianId);
    if (referralResult) {
      await this.gamificationService.addPoints(
        referralResult.referrerId,
        referralResult.points,
        'Referido completó su primera OT',
        referralResult.referralId,
      );
    }

    return saved;
  }

  async cancel(id: string, technicianId: string): Promise<WorkOrder> {
    const wo = await this.findOne(id, technicianId);
    if (wo.status !== WOStatus.DRAFT) {
      throw new ForbiddenException('Solo se pueden cancelar OTs en borrador');
    }
    wo.status = WOStatus.CANCELLED;
    return this.workOrdersRepo.save(wo);
  }

  async findBySlug(slug: string): Promise<WorkOrder> {
    const wo = await this.workOrdersRepo.findOne({
      where: { slug, isPrivate: false },
      relations: ['evidences', 'technician'],
    });
    if (!wo) throw new NotFoundException('OT no encontrada');
    return wo;
  }

  private generateSlug(): string {
    return uuidv4().replace(/-/g, '').substring(0, 12);
  }
}
