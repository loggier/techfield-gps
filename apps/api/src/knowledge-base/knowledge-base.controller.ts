import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { CreateKbEntryDto, UpdateKbEntryDto, VoteKbDto } from './dto/kb.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('kb')
export class KnowledgeBaseController {
  constructor(private readonly kbService: KnowledgeBaseService) {}

  /** Búsqueda full-text (sin auth) */
  @Get()
  search(
    @Query('q') q?: string,
    @Query('type') type?: string,
    @Query('brand') brand?: string,
    @Query('model') model?: string,
    @Query('country') country?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.kbService.search({
      q, type, brand, model, country,
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 50),
    });
  }

  /** Últimas 50 entradas para cache offline (sin auth) */
  @Get('offline-cache')
  offlineCache() {
    return this.kbService.getOfflineCache();
  }

  /** Detalle de entrada (sin auth) */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kbService.findOne(id);
  }

  /** Crear nueva entrada (auth, nivel >= verificado) */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: User, @Body() dto: CreateKbEntryDto) {
    return this.kbService.create(user.id, dto);
  }

  /** Editar entrada (auth, autor o senior+) */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateKbEntryDto,
  ) {
    return this.kbService.update(id, user.id, dto);
  }

  /** Aprobar entrada (auth, senior/elite/admin) */
  @Post(':id/approve')
  @UseGuards(JwtAuthGuard)
  approve(@CurrentUser() user: User, @Param('id') id: string) {
    return this.kbService.approve(id, user.id);
  }

  /** Votar utilidad (auth) */
  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  vote(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: VoteKbDto,
  ) {
    return this.kbService.vote(id, user.id, dto);
  }

  /** Registrar uso (incrementa useCount, sin auth) */
  @Post(':id/use')
  registerUse(@Param('id') id: string) {
    return this.kbService.registerUse(id);
  }
}
