import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReferralsModule } from './referrals/referrals.module';
import { WorkOrdersModule } from './work-orders/work-orders.module';
import { EvidencesModule } from './evidences/evidences.module';
import { StorageModule } from './storage/storage.module';
import { GamificationModule } from './gamification/gamification.module';
import { PublicModule } from './public/public.module';

// Entities
import { User } from './users/entities/user.entity';
import { Referral } from './referrals/entities/referral.entity';
import { WorkOrder } from './work-orders/entities/work-order.entity';
import { Evidence } from './work-orders/entities/evidence.entity';
import { PointsLog } from './gamification/entities/points-log.entity';
import { UserBadge } from './gamification/entities/user-badge.entity';
import { KbEntry } from './knowledge-base/entities/kb-entry.entity';
import { KbVote } from './knowledge-base/entities/kb-vote.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        database: config.get('database.name'),
        username: config.get('database.user'),
        password: config.get('database.pass'),
        entities: [User, Referral, WorkOrder, Evidence, PointsLog, UserBadge, KbEntry, KbVote, RefreshToken],
        synchronize: config.get('nodeEnv') === 'development',
        logging: config.get('nodeEnv') === 'development',
      }),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    ReferralsModule,
    WorkOrdersModule,
    EvidencesModule,
    StorageModule,
    GamificationModule,
    PublicModule,
  ],
})
export class AppModule {}
