import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuctionController } from './auction.controller';
import { AuctionService, PaginatedResult } from './auction.service';
import { GetAuctionsQueryDto } from './dto/get-auctions-query.dto';
import { Auction, AuctionStatus } from './entities/auction.entity';

const mockAuction = (): Auction =>
  ({
    id: 'uuid-1',
    name: 'Test Auction',
    description: 'A test auction item',
    startingPrice: 100,
    currentHighestBid: null,
    startsAt: new Date('2026-01-01'),
    endsAt: new Date('2026-12-31'),
    status: AuctionStatus.ACTIVE,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  }) as Auction;

describe('AuctionController', () => {
  let controller: AuctionController;

  const mockAuctionService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuctionController],
      providers: [{ provide: AuctionService, useValue: mockAuctionService }],
    }).compile();

    controller = module.get<AuctionController>(AuctionController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('delegates to the service and returns the created auction', async () => {
      const auction = mockAuction();
      mockAuctionService.create = jest.fn().mockResolvedValue(auction);

      const dto = {
        name: 'New Auction',
        description: 'Desc',
        startingPrice: 100,
        durationHours: 24,
      };
      const result = await controller.create(dto as any);

      expect(mockAuctionService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(auction);
    });
  });

  describe('findAll', () => {
    it('delegates to the service and returns the result', async () => {
      const auction = mockAuction();
      const paginated: PaginatedResult<Auction> = {
        data: [auction],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      mockAuctionService.findAll.mockResolvedValue(paginated);

      const query: GetAuctionsQueryDto = { page: 1, limit: 20 };
      const result = await controller.findAll(query);

      expect(mockAuctionService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(paginated);
    });
  });

  describe('findOne', () => {
    it('delegates to the service and returns the auction', async () => {
      const auction = mockAuction();
      mockAuctionService.findOne.mockResolvedValue(auction);

      const result = await controller.findOne('uuid-1');

      expect(mockAuctionService.findOne).toHaveBeenCalledWith('uuid-1');
      expect(result).toEqual(auction);
    });

    it('propagates NotFoundException from the service', async () => {
      mockAuctionService.findOne.mockRejectedValue(
        new NotFoundException('Auction with id "bad-id" not found'),
      );

      await expect(controller.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
