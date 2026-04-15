import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../auction/entities/auction.entity';
import { User } from '../user/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { BidController } from './bid.controller';
import { BidGateway } from './bid.gateway';
import { BidService } from './bid.service';
import { Bid } from './entities/bid.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, Auction, User]), AuthModule],
  controllers: [BidController],
  providers: [BidService, BidGateway],
})
export class BidModule {}
