import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrder } from './entities/work-order.entity';
import { Evidence } from './entities/evidence.entity';
import { GamificationModule } from '../gamification/gamification.module';
import { ReferralsModule } from '../referrals/referrals.module';
import { StorageModule } from '../storage/storage.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkOrder, Evidence]),
    GamificationModule,
    ReferralsModule,
    StorageModule,
    ReportsModule,
    MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } }),
  ],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}
