import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../auction/entities/auction.entity';
import { User } from '../user/entities/user.entity';
import { BidController } from './bid.controller';
import { BidGateway } from './bid.gateway';
import { BidService } from './bid.service';
import { Bid } from './entities/bid.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, Auction, User])],
  controllers: [BidController],
  providers: [BidService, BidGateway],
})
export class BidModule {}
