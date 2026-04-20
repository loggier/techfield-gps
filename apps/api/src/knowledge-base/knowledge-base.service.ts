import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KbEntry } from './entities/kb-entry.entity';
import { KbVote } from './entities/kb-vote.entity';
import { User } from '../users/entities/user.entity';
import { GamificationService } from '../gamification/gamification.service';
import { KbStatus, UserLevel, UserRole } from '@techfield/types';
import { CreateKbEntryDto, UpdateKbEntryDto, VoteKbDto } from './dto/kb.dto';

const APPROVABLE_LEVELS = [UserLevel.SENIOR, UserLevel.ELITE];

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);

  constructor(
    @InjectRepository(KbEntry) private readonly kbRepo: Repository<KbEntry>,
    @InjectRepository(KbVote) private readonly votesRepo: Repository<KbVote>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly gamificationService: GamificationService,
  ) {}

  // ── Search ────────────────────────────────────────────────────────────────

  async search(params: {
    q?: string;
    type?: string;
    brand?: string;
    model?: string;
    country?: string;
    page?: number;
    limit?: number;
  }) {
    const { q, type, brand, model, country, page = 1, limit = 20 } = params;

    const qb = this.kbRepo
      .createQueryBuilder('kb')
      .leftJoinAndSelect('kb.author', 'author')
      .where('kb.status = :status', { status: KbStatus.APPROVED });

    if (q) {
      qb.andWhere(
        `to_tsvector('spanish', kb.title || ' ' || COALESCE(kb.vehicleBrand, '') || ' ' || COALESCE(kb.vehicleModel, '') || ' ' || COALESCE(kb.deviceBrand, '') || ' ' || COALESCE(kb.deviceModel, '')) @@ plainto_tsquery('spanish', :q)
         OR kb.title ILIKE :qlike`,
        { q, qlike: `%${q}%` },
      );
    }

    if (type) qb.andWhere('kb.type = :type', { type });
    if (brand) qb.andWhere('kb.vehicleBrand ILIKE :brand OR kb.deviceBrand ILIKE :brand', { brand: `%${brand}%` });
    if (model) qb.andWhere('kb.vehicleModel ILIKE :model OR kb.deviceModel ILIKE :model', { model: `%${model}%` });
    if (country) qb.andWhere('kb.country = :country', { country });

    qb.orderBy('kb.ratingAvg', 'DESC')
      .addOrderBy('kb.useCount', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  // ── Get one ───────────────────────────────────────────────────────────────

  async findOne(id: string): Promise<KbEntry> {
    const entry = await this.kbRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!entry) throw new NotFoundException('Entrada KB no encontrada');
    return entry;
  }

  // ── Create ────────────────────────────────────────────────────────────────

  async create(userId: string, dto: CreateKbEntryDto): Promise<KbEntry> {
    const user = await this.usersRepo.findOneOrFail({ where: { id: userId } });
    const allowedLevels: UserLevel[] = [
      UserLevel.VERIFICADO, UserLevel.PRO, UserLevel.SENIOR, UserLevel.ELITE,
    ];
    if (!allowedLevels.includes(user.level) && user.role !== UserRole.PLATFORM_ADMIN) {
      throw new ForbiddenException('Debes ser nivel Verificado o superior para contribuir a la KB');
    }

    const entry = this.kbRepo.create({
      ...dto,
      authorId: userId,
      status: KbStatus.PENDING,
      photos: dto.photos ?? [],
      country: dto.country ?? 'MX',
    } as any);

    const saved = await this.kbRepo.save(entry);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  // ── Update ────────────────────────────────────────────────────────────────

  async update(id: string, userId: string, dto: UpdateKbEntryDto): Promise<KbEntry> {
    const entry = await this.findOne(id);
    const user = await this.usersRepo.findOneOrFail({ where: { id: userId } });

    const canEdit =
      entry.authorId === userId ||
      [UserLevel.SENIOR, UserLevel.ELITE].includes(user.level) ||
      user.role === UserRole.PLATFORM_ADMIN;

    if (!canEdit) throw new ForbiddenException('No tienes permiso para editar esta entrada');
    if (entry.status === KbStatus.APPROVED && entry.authorId !== userId) {
      throw new ForbiddenException('Solo el autor puede editar una entrada aprobada');
    }

    Object.assign(entry, dto);
    return this.kbRepo.save(entry);
  }

  // ── Approve ───────────────────────────────────────────────────────────────

  async approve(id: string, approverId: string): Promise<KbEntry> {
    const [entry, approver] = await Promise.all([
      this.findOne(id),
      this.usersRepo.findOneOrFail({ where: { id: approverId } }),
    ]);

    const canApprove =
      APPROVABLE_LEVELS.includes(approver.level) ||
      approver.role === UserRole.PLATFORM_ADMIN;

    if (!canApprove) {
      throw new ForbiddenException('Se requiere nivel Senior, Elite o administrador para aprobar');
    }
    if (entry.status === KbStatus.APPROVED) {
      throw new ConflictException('Esta entrada ya está aprobada');
    }

    entry.status = KbStatus.APPROVED;
    entry.approvedBy = approverId;
    const saved = await this.kbRepo.save(entry);

    // Award points to author
    this.gamificationService
      .addPoints(entry.authorId, 20, 'Entrada KB aprobada', id)
      .then(() => this.checkKbMasterBadge(entry.authorId))
      .catch(() => {});

    return saved;
  }

  // ── Vote ──────────────────────────────────────────────────────────────────

  async vote(id: string, userId: string, dto: VoteKbDto): Promise<KbEntry> {
    const entry = await this.findOne(id);
    if (entry.status !== KbStatus.APPROVED) {
      throw new ForbiddenException('Solo se pueden votar entradas aprobadas');
    }
    if (entry.authorId === userId) {
      throw new ForbiddenException('No puedes votar tu propia entrada');
    }

    const existing = await this.votesRepo.findOne({ where: { entryId: id, userId } });
    if (existing) {
      existing.isUseful = dto.isUseful;
      if (dto.rating !== undefined) existing.rating = dto.rating;
      await this.votesRepo.save(existing);
    } else {
      await this.votesRepo.save(
        this.votesRepo.create({ entryId: id, userId, isUseful: dto.isUseful, rating: dto.rating }),
      );
    }

    return this.recalculateVotes(id);
  }

  // ── Register use ──────────────────────────────────────────────────────────

  async registerUse(id: string): Promise<void> {
    await this.kbRepo.increment({ id }, 'useCount', 1);
  }

  // ── Offline cache ─────────────────────────────────────────────────────────

  async getOfflineCache() {
    return this.kbRepo.find({
      where: { status: KbStatus.APPROVED },
      order: { useCount: 'DESC', ratingAvg: 'DESC' },
      take: 50,
      relations: ['author'],
    });
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private async recalculateVotes(entryId: string): Promise<KbEntry> {
    const votes = await this.votesRepo.find({ where: { entryId } });
    const voteCount = votes.length;
    const ratingsWithValue = votes.filter((v) => v.rating != null);
    const ratingAvg =
      ratingsWithValue.length > 0
        ? ratingsWithValue.reduce((sum, v) => sum + v.rating, 0) / ratingsWithValue.length
        : 0;

    await this.kbRepo.update(entryId, {
      voteCount,
      ratingAvg: Math.round(ratingAvg * 100) / 100,
    });

    return this.findOne(entryId);
  }

  private async checkKbMasterBadge(userId: string): Promise<void> {
    const approvedCount = await this.kbRepo.count({
      where: { authorId: userId, status: KbStatus.APPROVED },
    });
    if (approvedCount >= 20) {
      await this.gamificationService.awardBadgeIfNotExists(userId, 'kb_master', 'KB Master');
    }
  }
}
