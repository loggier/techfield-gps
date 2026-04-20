import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { PlatformAdminGuard } from './admin.guard';
import { User } from '../users/entities/user.entity';
import { WorkOrder } from '../work-orders/entities/work-order.entity';
import { KbEntry } from '../knowledge-base/entities/kb-entry.entity';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, WorkOrder, KbEntry]),
    KnowledgeBaseModule,
  ],
  controllers: [AdminController],
  providers: [PlatformAdminGuard],
})
export class AdminModule {}
