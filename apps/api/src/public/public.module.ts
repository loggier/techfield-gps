import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { WorkOrdersModule } from '../work-orders/work-orders.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [WorkOrdersModule, UsersModule],
  controllers: [PublicController],
})
export class PublicModule {}
