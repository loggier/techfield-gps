import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { KbEntry } from './kb-entry.entity';
import { User } from '../../users/entities/user.entity';

@Entity('kb_votes')
@Unique(['entryId', 'userId'])
export class KbVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entryId: string;

  @ManyToOne(() => KbEntry)
  @JoinColumn({ name: 'entryId' })
  entry: KbEntry;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  isUseful: boolean;

  @Column({ nullable: true })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;
}
