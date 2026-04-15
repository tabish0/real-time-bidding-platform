import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import appConfig from './config/app.config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import { AuctionModule } from './modules/auction/auction.module';
import { AuthModule } from './modules/auth/auth.module';
import { BidModule } from './modules/bid/bid.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, databaseConfig],
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions =>
        config.get<TypeOrmModuleOptions>('database')!,
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('app.throttle.ttl')!,
            limit: config.get<number>('app.throttle.limit')!,
          },
        ],
      }),
    }),

    ScheduleModule.forRoot(),

    AuthModule,
    AuctionModule,
    BidModule,
    UserModule,
  ],
})
export class AppModule {}
