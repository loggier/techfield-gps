import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async findMe(userId: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async updateMe(userId: string, dto: Partial<User>): Promise<User> {
    await this.usersRepo.update(userId, dto);
    return this.findMe(userId);
  }

  async findPublicProfile(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const { fcmToken, ...publicProfile } = user;
    return publicProfile;
  }

  async getMyReferralCode(userId: string) {
    const user = await this.findMe(userId);
    return { referralCode: user.referralCode };
  }
}
