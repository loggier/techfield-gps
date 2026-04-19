import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserRole, UserLevel } from '@techfield/types';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.TECHNICIAN })
  role: UserRole;

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Column({ default: false })
  phoneVerified: boolean;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  zoneCity: string;

  @Column({ nullable: true })
  zoneState: string;

  @Column({ default: 'MX' })
  zoneCountry: string;

  @Column({ type: 'jsonb', default: [] })
  specialties: string[];

  @Column({ nullable: true })
  referrerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'referrerId' })
  referrer: User;

  @Column({ default: 0 })
  totalPoints: number;

  @Column({ type: 'enum', enum: UserLevel, default: UserLevel.NOVATO })
  level: UserLevel;

  @Column({ default: 100 })
  activityScore: number;

  @Column({ nullable: true, type: 'timestamp' })
  lastActivityAt: Date;

  @Column({ default: true })
  isMarketplaceVisible: boolean;

  @Column({ nullable: true })
  fcmToken: string;

  @Column({ nullable: true, unique: true })
  referralCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
