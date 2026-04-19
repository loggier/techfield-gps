import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EvidenceStage } from '@techfield/types';
import { WorkOrder } from './work-order.entity';

@Entity('evidences')
export class Evidence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workOrderId: string;

  @ManyToOne(() => WorkOrder, (wo) => wo.evidences)
  @JoinColumn({ name: 'workOrderId' })
  workOrder: WorkOrder;

  @Column({ type: 'enum', enum: EvidenceStage })
  stage: EvidenceStage;

  @Column()
  url: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'decimal', nullable: true })
  latitude: number;

  @Column({ type: 'decimal', nullable: true })
  longitude: number;

  @Column({ nullable: true, type: 'timestamp' })
  takenAt: Date;

  @Column({ nullable: true })
  fileSize: number;

  @CreateDateColumn()
  uploadedAt: Date;
}
