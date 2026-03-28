import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { GetAuctionsQueryDto } from './dto/get-auctions-query.dto';
import { Auction, AuctionStatus } from './entities/auction.entity';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class AuctionService {
  private readonly logger = new Logger(AuctionService.name);

  constructor(
    @InjectRepository(Auction)
    private readonly auctionRepository: Repository<Auction>,
  ) {}

  create(dto: CreateAuctionDto): Promise<Auction> {
    const now = new Date();
    const endsAt = new Date(now.getTime() + dto.durationHours * 60 * 60 * 1000);

    const auction = this.auctionRepository.create({
      name: dto.name,
      description: dto.description,
      startingPrice: dto.startingPrice,
      startsAt: now,
      endsAt,
      status: AuctionStatus.ACTIVE,
    });

    return this.auctionRepository.save(auction);
  }

  async findAll(query: GetAuctionsQueryDto): Promise<PaginatedResult<Auction>> {
    const { status, page = 1, limit = 20 } = query;

    const qb = this.auctionRepository
      .createQueryBuilder('auction')
      .orderBy('auction.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      qb.where('auction.status = :status', { status });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Auction> {
    const auction = await this.auctionRepository.findOne({ where: { id } });

    if (!auction) {
      throw new NotFoundException(`Auction with id "${id}" not found`);
    }

    return auction;
  }

  /**
   * Runs every minute to flip ACTIVE auctions whose endsAt has passed to ENDED.
   * A bulk UPDATE is used rather than loading entities to avoid N+1 queries.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async expireAuctions(): Promise<void> {
    const result = await this.auctionRepository
      .createQueryBuilder()
      .update(Auction)
      .set({ status: AuctionStatus.ENDED })
      .where('status = :status AND ends_at <= NOW()', {
        status: AuctionStatus.ACTIVE,
      })
      .execute();

    if (result.affected && result.affected > 0) {
      this.logger.log(`Expired ${result.affected} auction(s)`);
    }
  }
}
