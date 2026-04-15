import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Auction, AuctionStatus } from '../auction/entities/auction.entity';
import { User } from '../user/entities/user.entity';
import { PlaceBidDto } from './dto/place-bid.dto';
import { Bid } from './entities/bid.entity';
import { BidGateway } from './bid.gateway';

@Injectable()
export class BidService {
  constructor(
    @InjectRepository(Bid)
    private readonly bidRepository: Repository<Bid>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly bidGateway: BidGateway,
  ) {}

  /**
   * Places a bid inside a serialised transaction with a pessimistic write lock
   * on the auction row. This prevents race conditions where two concurrent bids
   * both read the same currentHighestBid and both pass the amount check.
   */
  async placeBid(auctionId: string, dto: PlaceBidDto, userId: string): Promise<Bid> {
    let savedBid: Bid;
    let user: User;

    await this.dataSource.transaction(async (manager) => {
      // Lock the auction row for the duration of this transaction
      const auction = await manager.findOne(Auction, {
        where: { id: auctionId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!auction) {
        throw new NotFoundException(`Auction "${auctionId}" not found`);
      }
      if (auction.status !== AuctionStatus.ACTIVE) {
        throw new BadRequestException('This auction is not active');
      }
      if (new Date() > new Date(auction.endsAt)) {
        throw new BadRequestException('This auction has already ended');
      }

      const floor = Number(auction.currentHighestBid ?? auction.startingPrice);
      if (Number(dto.amount) <= floor) {
        throw new BadRequestException(
          `Bid must be greater than the current highest bid of ${floor}`,
        );
      }

      const foundUser = await manager.findOne(User, {
        where: { id: userId },
      });
      if (!foundUser) {
        throw new NotFoundException(`User "${userId}" not found`);
      }
      user = foundUser;

      const bid = manager.create(Bid, {
        auctionId,
        userId,
        amount: dto.amount,
      });
      savedBid = await manager.save(bid);

      // Update the denormalised highest bid on the auction row
      await manager.update(Auction, auctionId, {
        currentHighestBid: dto.amount,
      });
    });

    // Emit outside the transaction so the event is only sent on commit
    this.bidGateway.emitBidPlaced(auctionId, {
      id: savedBid!.id,
      userId: user!.id,
      userName: user!.name,
      amount: Number(dto.amount),
      createdAt: savedBid!.createdAt,
    });

    savedBid!.user = user!;
    return savedBid!;
  }

  findByAuction(auctionId: string): Promise<Bid[]> {
    return this.bidRepository.find({
      where: { auctionId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
