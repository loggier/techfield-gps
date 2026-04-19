import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('points_log')
export class PointsLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  delta: number;

  @Column()
  reason: string;

  @Column({ nullable: true })
  referenceId: string;

  @Column()
  scoreAfter: number;

  @CreateDateColumn()
  createdAt: Date;
}
