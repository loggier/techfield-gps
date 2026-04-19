import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evidence } from '../work-orders/entities/evidence.entity';
import { WorkOrder } from '../work-orders/entities/work-order.entity';
import { User } from '../users/entities/user.entity';
import { StorageService } from '../storage/storage.service';
import { EvidenceStage, WOStatus } from '@techfield/types';

@Injectable()
export class EvidencesService {
  constructor(
    @InjectRepository(Evidence) private readonly evidencesRepo: Repository<Evidence>,
    @InjectRepository(WorkOrder) private readonly workOrdersRepo: Repository<WorkOrder>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly storageService: StorageService,
  ) {}

  async upload(
    technicianId: string,
    workOrderId: string,
    stage: EvidenceStage,
    file: Express.Multer.File,
    latitude?: number,
    longitude?: number,
    takenAt?: string,
  ) {
    const wo = await this.workOrdersRepo.findOne({ where: { id: workOrderId } });
    if (!wo) throw new NotFoundException('OT no encontrada');
    if (wo.technicianId !== technicianId) throw new ForbiddenException();
    if (wo.status === WOStatus.COMPLETED) {
      throw new BadRequestException('No se pueden agregar evidencias a una OT completada');
    }

    const key = `ot-${workOrderId}/${stage}-${Date.now()}.jpg`;
    const url = await this.storageService.uploadFile(file.buffer, key, file.mimetype);

    const evidence = this.evidencesRepo.create({
      workOrderId,
      stage,
      url,
      latitude,
      longitude,
      takenAt: takenAt ? new Date(takenAt) : new Date(),
      fileSize: file.size,
    });

    await this.evidencesRepo.save(evidence);

    await this.usersRepo.update(technicianId, { lastActivityAt: new Date() });

    return evidence;
  }

  async delete(id: string, technicianId: string) {
    const evidence = await this.evidencesRepo.findOne({
      where: { id },
      relations: ['workOrder'],
    });
    if (!evidence) throw new NotFoundException();
    if (evidence.workOrder.technicianId !== technicianId) throw new ForbiddenException();
    if (evidence.workOrder.status !== WOStatus.DRAFT) {
      throw new BadRequestException('Solo se pueden eliminar evidencias de OTs en borrador');
    }
    await this.evidencesRepo.remove(evidence);
    return { success: true };
  }
}
