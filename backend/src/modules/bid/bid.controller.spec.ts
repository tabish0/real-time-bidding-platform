import { Test, TestingModule } from '@nestjs/testing';
import { BidController } from './bid.controller';
import { BidService } from './bid.service';
import { PlaceBidDto } from './dto/place-bid.dto';
import { Bid } from './entities/bid.entity';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

const mockBid = (): Bid =>
  ({
    id: 'bid-1',
    auctionId: 'auction-1',
    userId: 'user-1',
    amount: 150,
    createdAt: new Date(),
  }) as Bid;

const mockRequest = (user: AuthenticatedUser): Partial<Request> => ({ user } as Partial<Request>);

describe('BidController', () => {
  let controller: BidController;

  const mockBidService = {
    placeBid: jest.fn(),
    findByAuction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BidController],
      providers: [{ provide: BidService, useValue: mockBidService }],
    }).compile();

    controller = module.get<BidController>(BidController);
    jest.clearAllMocks();
  });

  describe('placeBid', () => {
    it('extracts userId from JWT and delegates to BidService', async () => {
      const bid = mockBid();
      const dto: PlaceBidDto = { amount: 150 };
      const req = mockRequest({ id: 'user-1', email: 'alice@example.com' });
      mockBidService.placeBid.mockResolvedValue(bid);

      const result = await controller.placeBid('auction-1', dto, req as Request);

      expect(mockBidService.placeBid).toHaveBeenCalledWith('auction-1', dto, 'user-1');
      expect(result).toEqual(bid);
    });
  });

  describe('findByAuction', () => {
    it('delegates to BidService and returns bids', async () => {
      const bids = [mockBid()];
      mockBidService.findByAuction.mockResolvedValue(bids);

      const result = await controller.findByAuction('auction-1');

      expect(mockBidService.findByAuction).toHaveBeenCalledWith('auction-1');
      expect(result).toEqual(bids);
    });
  });
});
