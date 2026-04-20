import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { WorkOrder } from '../work-orders/entities/work-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkOrder])],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
