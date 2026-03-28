import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Auction, AuctionStatus } from '../auction/entities/auction.entity';
import { User } from '../user/entities/user.entity';
import { BidGateway } from './bid.gateway';
import { BidService } from './bid.service';
import { PlaceBidDto } from './dto/place-bid.dto';
import { Bid } from './entities/bid.entity';

const activeAuction = (): Auction =>
  ({
    id: 'auction-1',
    name: 'Test',
    description: 'Desc',
    startingPrice: 100,
    currentHighestBid: null,
    startsAt: new Date('2026-01-01'),
    endsAt: new Date('2099-12-31'), // far future — not expired
    status: AuctionStatus.ACTIVE,
  }) as Auction;

const mockUser = (): User =>
  ({ id: 'user-1', name: 'User 1', createdAt: new Date() }) as User;

const mockBid = (): Bid =>
  ({
    id: 'bid-1',
    auctionId: 'auction-1',
    userId: 'user-1',
    amount: 150,
    createdAt: new Date(),
  }) as Bid;

describe('BidService', () => {
  let service: BidService;

  // manager is the transactional entity manager mock
  const mockManager = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn((cb) => cb(mockManager)),
  };

  const mockBidRepository = {
    find: jest.fn(),
  };

  const mockBidGateway = {
    emitBidPlaced: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BidService,
        { provide: getRepositoryToken(Bid), useValue: mockBidRepository },
        { provide: getDataSourceToken(), useValue: mockDataSource },
        { provide: BidGateway, useValue: mockBidGateway },
      ],
    }).compile();

    service = module.get<BidService>(BidService);
    jest.clearAllMocks();
    mockDataSource.transaction.mockImplementation((cb) => cb(mockManager));
  });

  describe('placeBid', () => {
    const dto: PlaceBidDto = { userId: 'user-1', amount: 150 };

    it('saves the bid and emits a WebSocket event on success', async () => {
      const bid = mockBid();
      mockManager.findOne
        .mockResolvedValueOnce(activeAuction()) // auction
        .mockResolvedValueOnce(mockUser());     // user
      mockManager.create.mockReturnValue(bid);
      mockManager.save.mockResolvedValue(bid);
      mockManager.update.mockResolvedValue({});

      await service.placeBid('auction-1', dto);

      expect(mockManager.save).toHaveBeenCalled();
      expect(mockManager.update).toHaveBeenCalledWith(Auction, 'auction-1', {
        currentHighestBid: dto.amount,
      });
      expect(mockBidGateway.emitBidPlaced).toHaveBeenCalledWith(
        'auction-1',
        expect.objectContaining({ amount: dto.amount }),
      );
    });

    it('throws NotFoundException when auction does not exist', async () => {
      mockManager.findOne.mockResolvedValueOnce(null);

      await expect(service.placeBid('bad-auction', dto)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when auction status is not ACTIVE', async () => {
      const ended = { ...activeAuction(), status: AuctionStatus.ENDED };
      mockManager.findOne.mockResolvedValueOnce(ended);

      await expect(service.placeBid('auction-1', dto)).rejects.toThrow(
        new BadRequestException('This auction is not active'),
      );
    });

    it('throws BadRequestException when auction has passed its endsAt', async () => {
      const expired = { ...activeAuction(), endsAt: new Date('2000-01-01') };
      mockManager.findOne.mockResolvedValueOnce(expired);

      await expect(service.placeBid('auction-1', dto)).rejects.toThrow(
        new BadRequestException('This auction has already ended'),
      );
    });

    it('throws BadRequestException when bid does not exceed starting price', async () => {
      const lowBid: PlaceBidDto = { userId: 'user-1', amount: 50 };
      mockManager.findOne.mockResolvedValueOnce(activeAuction());

      await expect(service.placeBid('auction-1', lowBid)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when bid does not exceed currentHighestBid', async () => {
      const withBid = { ...activeAuction(), currentHighestBid: 200 };
      const lowBid: PlaceBidDto = { userId: 'user-1', amount: 150 };
      mockManager.findOne.mockResolvedValueOnce(withBid);

      await expect(service.placeBid('auction-1', lowBid)).rejects.toThrow(
        new BadRequestException('Bid must be greater than the current highest bid of 200'),
      );
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockManager.findOne
        .mockResolvedValueOnce(activeAuction())
        .mockResolvedValueOnce(null); // user not found

      await expect(service.placeBid('auction-1', dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByAuction', () => {
    it('returns bids ordered newest first with user relation', async () => {
      const bids = [mockBid()];
      mockBidRepository.find.mockResolvedValue(bids);

      const result = await service.findByAuction('auction-1');

      expect(mockBidRepository.find).toHaveBeenCalledWith({
        where: { auctionId: 'auction-1' },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(bids);
    });
  });
});
