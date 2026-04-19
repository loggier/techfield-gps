import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReferralStatus } from '@techfield/types';
import { User } from '../../users/entities/user.entity';

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  referrerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'referrerId' })
  referrer: User;

  @Column()
  referredId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'referredId' })
  referred: User;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'enum', enum: ReferralStatus, default: ReferralStatus.PENDING })
  status: ReferralStatus;

  @Column({ nullable: true, type: 'timestamp' })
  firstOtCompletedAt: Date;

  @Column({ default: 0 })
  pointsGranted: number;

  @CreateDateColumn()
  createdAt: Date;
}
