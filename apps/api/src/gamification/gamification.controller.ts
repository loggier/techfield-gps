import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  /** Puntos, nivel, score, badges + log reciente */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyStats(@CurrentUser() user: User) {
    return this.gamificationService.getMyStats(user.id);
  }

  /** Historial de puntos paginado */
  @Get('me/log')
  @UseGuards(JwtAuthGuard)
  getMyLog(
    @CurrentUser() user: User,
    @Query('page') page = '1',
    @Query('limit') limit = '30',
  ) {
    return this.gamificationService.getPointsLog(user.id, +page, +limit);
  }

  /** Catálogo de niveles y requisitos (sin auth) */
  @Get('levels')
  getLevels() {
    return this.gamificationService.getLevelsCatalog();
  }

  /** Catálogo de badges disponibles (sin auth) */
  @Get('badges')
  getBadges() {
    return this.gamificationService.getBadgesCatalog();
  }
}
