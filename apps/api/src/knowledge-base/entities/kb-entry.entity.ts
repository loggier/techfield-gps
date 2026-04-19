import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { KbType, KbStatus } from '@techfield/types';
import { User } from '../../users/entities/user.entity';

@Entity('kb_entries')
export class KbEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: KbType })
  type: KbType;

  @Column()
  title: string;

  @Column({ nullable: true })
  vehicleBrand: string;

  @Column({ nullable: true })
  vehicleModel: string;

  @Column({ nullable: true })
  yearFrom: number;

  @Column({ nullable: true })
  yearTo: number;

  @Column({ nullable: true })
  deviceBrand: string;

  @Column({ nullable: true })
  deviceModel: string;

  @Column({ nullable: true })
  operator: string;

  @Column({ type: 'jsonb' })
  content: Record<string, any>;

  @Column({ type: 'jsonb', default: [] })
  photos: string[];

  @Column()
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ type: 'enum', enum: KbStatus, default: KbStatus.PENDING })
  status: KbStatus;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ default: 0 })
  useCount: number;

  @Column({ default: 0 })
  voteCount: number;

  @Column({ type: 'decimal', default: 0 })
  ratingAvg: number;

  @Column({ default: 'MX' })
  country: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
