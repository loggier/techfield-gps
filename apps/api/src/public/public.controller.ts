import { Controller, Get, Param, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { WorkOrdersService } from '../work-orders/work-orders.service';
import { UsersService } from '../users/users.service';
import { ReportsService } from '../reports/reports.service';

@Controller('public')
export class PublicController {
  constructor(
    private readonly workOrdersService: WorkOrdersService,
    private readonly usersService: UsersService,
    private readonly reportsService: ReportsService,
  ) {}

  /** OT pública por slug (sin auth) */
  @Get('ot/:slug')
  getPublicOt(@Param('slug') slug: string) {
    return this.workOrdersService.findBySlug(slug);
  }

  /** Descargar PDF del reporte (sin auth) */
  @Get('ot/:slug/pdf')
  async getOtPdf(@Param('slug') slug: string, @Res() res: FastifyReply) {
    const buffer = await this.reportsService.generateOtPdfBySlug(slug);
    res.headers({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="reporte-ot-${slug}.pdf"`,
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=3600',
    });
    res.send(buffer);
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
