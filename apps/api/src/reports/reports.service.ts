import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { WorkOrder } from '../work-orders/entities/work-order.entity';
import { WOStatus } from '@techfield/types';
import { OtPdfDocument } from './ot-pdf';

@Injectable()
export class ReportsService {
  private readonly baseUrl = process.env.PUBLIC_BASE_URL ?? 'https://techfieldgps.com';

  constructor(
    @InjectRepository(WorkOrder) private readonly workOrdersRepo: Repository<WorkOrder>,
  ) {}

  async generateOtPdfBySlug(slug: string): Promise<Buffer> {
    const wo = await this.workOrdersRepo.findOne({
      where: { slug, status: WOStatus.COMPLETED, isPrivate: false },
      relations: ['evidences', 'technician'],
    });
    if (!wo) throw new NotFoundException('OT no encontrada o no disponible');
    return this.buildPdf(wo);
  }

  async generateOtPdfById(id: string, technicianId: string): Promise<Buffer> {
    const wo = await this.workOrdersRepo.findOne({
      where: { id, technicianId, status: WOStatus.COMPLETED },
      relations: ['evidences', 'technician'],
    });
    if (!wo) throw new NotFoundException('OT no encontrada o no disponible');
    return this.buildPdf(wo);
  }

  private async buildPdf(wo: WorkOrder): Promise<Buffer> {
    const shareUrl = `${this.baseUrl}/ot/${wo.slug}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(OtPdfDocument, { wo, shareUrl }) as any;
    return renderToBuffer(element) as Promise<Buffer>;
  }
}
