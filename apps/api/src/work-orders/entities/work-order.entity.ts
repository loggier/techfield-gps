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
import { WOType, WOStatus } from '@techfield/types';
import { User } from '../../users/entities/user.entity';
import { Evidence } from './evidence.entity';

@Entity('work_orders')
export class WorkOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  workspaceId: string;

  @Column()
  technicianId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'technicianId' })
  technician: User;

  @Column({ type: 'enum', enum: WOType })
  type: WOType;

  @Column({ type: 'enum', enum: WOStatus, default: WOStatus.DRAFT })
  status: WOStatus;

  @Column()
  clientName: string;

  @Column({ nullable: true })
  clientPhone: string;

  @Column()
  vehicleBrand: string;

  @Column()
  vehicleModel: string;

  @Column()
  vehicleYear: number;

  @Column()
  vehiclePlate: string;

  @Column({ nullable: true })
  vehicleColor: string;

  @Column({ nullable: true })
  vehicleVin: string;

  @Column()
  deviceBrand: string;

  @Column()
  deviceModel: string;

  @Column()
  deviceImei: string;

  @Column({ nullable: true })
  deviceSim: string;

  @Column({ nullable: true })
  deviceOperator: string;

  @Column({ nullable: true })
  devicePlatform: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  clientRating: number;

  @Column({ nullable: true })
  clientSignatureUrl: string;

  @Column({ type: 'decimal', nullable: true })
  latitude: number;

  @Column({ type: 'decimal', nullable: true })
  longitude: number;

  @Column({ nullable: true })
  address: string;

  @Column({ default: false })
  isPrivate: boolean;

  @Column({ nullable: true, type: 'timestamp' })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Evidence, (e) => e.workOrder)
  evidences: Evidence[];
}
