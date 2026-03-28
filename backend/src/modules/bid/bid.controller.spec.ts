import { Test, TestingModule } from '@nestjs/testing';
import { BidController } from './bid.controller';
import { BidService } from './bid.service';
import { PlaceBidDto } from './dto/place-bid.dto';
import { Bid } from './entities/bid.entity';

const mockBid = (): Bid =>
  ({
    id: 'bid-1',
    auctionId: 'auction-1',
    userId: 'user-1',
    amount: 150,
    createdAt: new Date(),
  }) as Bid;

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
    it('delegates to BidService and returns the saved bid', async () => {
      const bid = mockBid();
      const dto: PlaceBidDto = { userId: 'user-1', amount: 150 };
      mockBidService.placeBid.mockResolvedValue(bid);

      const result = await controller.placeBid('auction-1', dto);

      expect(mockBidService.placeBid).toHaveBeenCalledWith('auction-1', dto);
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
