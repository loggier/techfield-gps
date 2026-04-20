import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PointsLog } from './entities/points-log.entity';
import { UserBadge } from './entities/user-badge.entity';
import { User } from '../users/entities/user.entity';
import { WorkOrder } from '../work-orders/entities/work-order.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { UserLevel, WOStatus } from '@techfield/types';

// ── Constants ────────────────────────────────────────────────────────────────

export const LEVELS: Record<UserLevel, { min: number; label: string }> = {
  [UserLevel.NOVATO]:     { min: 0,    label: 'Novato' },
  [UserLevel.VERIFICADO]: { min: 50,   label: 'Verificado' },
  [UserLevel.PRO]:        { min: 200,  label: 'Pro' },
  [UserLevel.SENIOR]:     { min: 500,  label: 'Senior' },
  [UserLevel.ELITE]:      { min: 1000, label: 'Elite' },
};

export const ALL_BADGES = [
  { key: 'serial_installer', name: 'Instalador Serial',  description: '50 instalaciones completadas' },
  { key: 'no_errors',        name: 'Sin Errores',        description: '30 OTs consecutivas sin incidencia' },
  { key: 'recruiter',        name: 'Reclutador',         description: '5 referidos activos' },
  { key: 'happy_client',     name: 'Cliente Feliz',      description: 'Rating promedio ≥ 4.8' },
  { key: 'kb_master',        name: 'KB Master',          description: '20 entradas KB aprobadas' },
  { key: 'mentor',           name: 'Mentor',             description: 'Nivel Senior con 3+ técnicos certificados' },
];

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    @InjectRepository(PointsLog) private readonly pointsLogRepo: Repository<PointsLog>,
    @InjectRepository(UserBadge) private readonly badgesRepo: Repository<UserBadge>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(WorkOrder) private readonly workOrdersRepo: Repository<WorkOrder>,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ── Core: add points ─────────────────────────────────────────────────────

  async addPoints(
    userId: string,
    delta: number,
    reason: string,
    referenceId?: string,
  ): Promise<User> {
    const user = await this.usersRepo.findOneOrFail({ where: { id: userId } });
    const prevLevel = user.level;

    user.totalPoints = Math.max(0, user.totalPoints + delta);
    user.lastActivityAt = new Date();
    user.activityScore = Math.min(100, user.activityScore + 5);
    user.isMarketplaceVisible = true;

    user.level = this.calculateLevel(user.totalPoints);
    await this.usersRepo.save(user);

    await this.pointsLogRepo.save(
      this.pointsLogRepo.create({
        userId,
        delta,
        reason,
        referenceId,
        scoreAfter: user.totalPoints,
      }),
    );

    if (user.level !== prevLevel && user.fcmToken) {
      this.notificationsService.notifyLevelUp(user.fcmToken, user.level).catch(() => {});
    }

    return user;
  }

  // ── Work order completed event ────────────────────────────────────────────

  async onWorkOrderCompleted(
    userId: string,
    workOrderId: string,
    hasSignature: boolean,
    clientRating?: number,
  ) {
    await this.addPoints(userId, 5, 'OT completada con evidencias', workOrderId);

    if (hasSignature) {
      await this.addPoints(userId, 10, 'Firma del cliente obtenida', workOrderId);
    }

    if (await this.isFirstOtOfMonth(userId)) {
      await this.addPoints(userId, 15, 'Primera OT del mes', workOrderId);
    }

    if (clientRating && clientRating >= 4) {
      await this.addPoints(userId, 3, `Calificación del cliente: ${clientRating} ⭐`, workOrderId);
    }

    const streak = await this.getConsecutiveCompletedCount(userId);
    if (streak > 0 && streak % 10 === 0) {
      await this.addPoints(userId, 50, `${streak} OTs consecutivas completadas`, workOrderId);
    }

    await this.checkAndAwardBadges(userId);

    const [user, wo] = await Promise.all([
      this.usersRepo.findOne({ where: { id: userId } }),
      this.workOrdersRepo.findOne({ where: { id: workOrderId } }),
    ]);
    if (user?.fcmToken && wo) {
      this.notificationsService.notifyOtClosed(user.fcmToken, wo.slug).catch(() => {});
    }
  }

  async recalculateLevel(userId: string) {
    const user = await this.usersRepo.findOneOrFail({ where: { id: userId } });
    const newLevel = this.calculateLevel(user.totalPoints);
    if (newLevel !== user.level) {
      user.level = newLevel;
      await this.usersRepo.save(user);
      if (user.fcmToken) {
        this.notificationsService.notifyLevelUp(user.fcmToken, newLevel).catch(() => {});
      }
    }
  }

  // ── Weekly login bonus ────────────────────────────────────────────────────

  async onUserLogin(userId: string) {
    if (!(await this.alreadyEarnedThisWeek(userId, 'Login semanal'))) {
      await this.addPoints(userId, 5, 'Login semanal');
    }
    await this.usersRepo.update(userId, { lastActivityAt: new Date() });
  }

  // ── Badge checking ────────────────────────────────────────────────────────

  async checkAndAwardBadges(userId: string) {
    const [completedCount, user, existingBadges] = await Promise.all([
      this.workOrdersRepo.count({
        where: { technicianId: userId, status: WOStatus.COMPLETED },
      }),
      this.usersRepo.findOne({ where: { id: userId } }),
      this.badgesRepo.find({ where: { userId } }),
    ]);

    const hasBadge = (key: string) => existingBadges.some((b) => b.badgeKey === key);

    if (!hasBadge('serial_installer') && completedCount >= 50) {
      await this.awardBadge(userId, 'serial_installer', 'Instalador Serial', user?.fcmToken);
    }

    if (!hasBadge('happy_client')) {
      const ratings = await this.workOrdersRepo
        .createQueryBuilder('wo')
        .select('AVG(wo.clientRating)', 'avg')
        .addSelect('COUNT(*)', 'count')
        .where('wo.technicianId = :userId AND wo.clientRating IS NOT NULL', { userId })
        .getRawOne();

      if (ratings?.count >= 10 && parseFloat(ratings?.avg) >= 4.8) {
        await this.awardBadge(userId, 'happy_client', 'Cliente Feliz', user?.fcmToken);
      }
    }

    if (!hasBadge('no_errors')) {
      const streak = await this.getConsecutiveCompletedCount(userId);
      if (streak >= 30) {
        await this.awardBadge(userId, 'no_errors', 'Sin Errores', user?.fcmToken);
      }
    }
  }

  async awardBadgeIfNotExists(userId: string, key: string, name: string): Promise<void> {
    const [user, existing] = await Promise.all([
      this.usersRepo.findOne({ where: { id: userId } }),
      this.badgesRepo.findOne({ where: { userId, badgeKey: key } }),
    ]);
    if (!existing) {
      await this.awardBadge(userId, key, name, user?.fcmToken);
    }
  }

  private async awardBadge(userId: string, key: string, name: string, fcmToken?: string) {
    await this.badgesRepo.save(this.badgesRepo.create({ userId, badgeKey: key }));
    this.logger.log(`Badge awarded: ${key} → user ${userId}`);
    if (fcmToken) {
      this.notificationsService.notifyBadgeEarned(fcmToken, name).catch(() => {});
    }
  }

  // ── Stats & catalog endpoints ─────────────────────────────────────────────

  async getMyStats(userId: string) {
    const user = await this.usersRepo.findOneOrFail({ where: { id: userId } });
    const [badges, recentLog] = await Promise.all([
      this.badgesRepo.find({ where: { userId } }),
      this.pointsLogRepo.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 30,
      }),
    ]);

    const nextLevelEntry = Object.entries(LEVELS).find(([, v]) => v.min > user.totalPoints);
    const pointsToNextLevel = nextLevelEntry ? nextLevelEntry[1].min - user.totalPoints : 0;

    return {
      totalPoints: user.totalPoints,
      level: user.level,
      levelLabel: LEVELS[user.level].label,
      pointsToNextLevel,
      activityScore: user.activityScore,
      activityStatus: this.getActivityStatus(user.activityScore),
      badges,
      recentLog,
    };
  }

  async getPointsLog(userId: string, page = 1, limit = 30) {
    const [items, total] = await this.pointsLogRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  getLevelsCatalog() {
    return Object.entries(LEVELS).map(([key, val]) => ({
      key,
      label: val.label,
      minPoints: val.min,
      maxPoints: this.getNextLevelMin(key as UserLevel) - 1,
      benefits: this.getLevelBenefits(key as UserLevel),
    }));
  }

  getBadgesCatalog() {
    return ALL_BADGES;
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  calculateLevel(totalPoints: number): UserLevel {
    if (totalPoints >= 1000) return UserLevel.ELITE;
    if (totalPoints >= 500)  return UserLevel.SENIOR;
    if (totalPoints >= 200)  return UserLevel.PRO;
    if (totalPoints >= 50)   return UserLevel.VERIFICADO;
    return UserLevel.NOVATO;
  }

  private getActivityStatus(score: number): string {
    if (score >= 80) return 'Destacado';
    if (score >= 60) return 'Activo';
    if (score >= 40) return 'Inactivo';
    if (score >= 20) return 'Dormido';
    return 'Archivado';
  }

  private getNextLevelMin(level: UserLevel): number {
    const order = [UserLevel.NOVATO, UserLevel.VERIFICADO, UserLevel.PRO, UserLevel.SENIOR, UserLevel.ELITE];
    const idx = order.indexOf(level);
    return idx < order.length - 1 ? LEVELS[order[idx + 1]].min : 99999;
  }

  private getLevelBenefits(level: UserLevel): string[] {
    const map: Record<UserLevel, string[]> = {
      [UserLevel.NOVATO]:     ['Acceso básico a la plataforma'],
      [UserLevel.VERIFICADO]: ['Aparece en marketplace', 'Puede recibir trabajos de empresas'],
      [UserLevel.PRO]:        ['Prioridad en asignaciones', 'Badge visible en perfil'],
      [UserLevel.SENIOR]:     ['Puede aprobar entradas KB', 'Aparece como "certificador"'],
      [UserLevel.ELITE]:      ['Top del marketplace', 'Puede certificar técnicos'],
    };
    return map[level];
  }

  private async isFirstOtOfMonth(userId: string): Promise<boolean> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const count = await this.pointsLogRepo.count({
      where: { userId, reason: 'OT completada con evidencias', createdAt: Between(startOfMonth, now) },
    });
    return count === 1;
  }

  private async alreadyEarnedThisWeek(userId: string, reason: string): Promise<boolean> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const count = await this.pointsLogRepo.count({
      where: { userId, reason, createdAt: Between(startOfWeek, now) },
    });
    return count > 0;
  }

  private async getConsecutiveCompletedCount(userId: string): Promise<number> {
    const recent = await this.workOrdersRepo.find({
      where: { technicianId: userId },
      order: { completedAt: 'DESC' },
      take: 50,
      select: ['status', 'completedAt'],
    });
    let streak = 0;
    for (const wo of recent) {
      if (wo.status === WOStatus.COMPLETED) streak++;
      else if (wo.status === WOStatus.CANCELLED) break;
    }
    return streak;
  }
}
