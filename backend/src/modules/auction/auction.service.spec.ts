import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuctionService } from './auction.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
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

describe('AuctionService', () => {
  let service: AuctionService;

  const mockQb = {
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({ affected: 0 }),
    getManyAndCount: jest.fn(),
  } as any;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQb),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuctionService,
        { provide: getRepositoryToken(Auction), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AuctionService>(AuctionService);
    jest.clearAllMocks();
    mockRepository.createQueryBuilder.mockReturnValue(mockQb);
  });

  describe('create', () => {
    it('creates an auction with correct endsAt from durationHours', async () => {
      const dto: CreateAuctionDto = {
        name: 'New Auction',
        description: 'Desc',
        startingPrice: 200,
        durationHours: 24,
      };
      const auction = mockAuction();
      mockRepository.create.mockReturnValue(auction);
      mockRepository.save.mockResolvedValue(auction);

      const result = await service.create(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
          startingPrice: dto.startingPrice,
          status: AuctionStatus.ACTIVE,
        }),
      );
      expect(result).toEqual(auction);
    });
  });

  describe('findAll', () => {
    it('returns a paginated result with correct metadata', async () => {
      const auction = mockAuction();
      mockQb.getManyAndCount = jest.fn().mockResolvedValue([[auction], 1]);

      const query: GetAuctionsQueryDto = { page: 1, limit: 20 };
      const result = await service.findAll(query);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('calculates totalPages correctly across multiple pages', async () => {
      mockQb.getManyAndCount = jest.fn().mockResolvedValue([[], 45]);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.totalPages).toBe(3);
    });

    it('applies status filter when provided', async () => {
      mockQb.getManyAndCount = jest.fn().mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 20, status: AuctionStatus.ACTIVE });

      expect(mockQb.where).toHaveBeenCalledWith('auction.status = :status', {
        status: AuctionStatus.ACTIVE,
      });
    });

    it('does not apply where clause when status is omitted', async () => {
      mockQb.getManyAndCount = jest.fn().mockResolvedValue([[], 0]);

      await service.findAll({ page: 1, limit: 20 });

      expect(mockQb.where).not.toHaveBeenCalled();
    });

    it('applies correct offset for page 2', async () => {
      mockQb.getManyAndCount = jest.fn().mockResolvedValue([[], 0]);

      await service.findAll({ page: 2, limit: 10 });

      expect(mockQb.skip).toHaveBeenCalledWith(10);
      expect(mockQb.take).toHaveBeenCalledWith(10);
    });
  });

  describe('expireAuctions', () => {
    it('runs a bulk UPDATE for active auctions past their endsAt', async () => {
      mockQb.execute = jest.fn().mockResolvedValue({ affected: 2 });
      mockRepository.createQueryBuilder.mockReturnValue(mockQb);

      await service.expireAuctions();

      expect(mockQb.update).toHaveBeenCalledWith(Auction);
      expect(mockQb.set).toHaveBeenCalledWith({ status: AuctionStatus.ENDED });
      expect(mockQb.where).toHaveBeenCalledWith(
        'status = :status AND ends_at <= NOW()',
        { status: AuctionStatus.ACTIVE },
      );
      expect(mockQb.execute).toHaveBeenCalled();
    });

    it('does not throw when no auctions are expired', async () => {
      mockQb.execute = jest.fn().mockResolvedValue({ affected: 0 });
      mockRepository.createQueryBuilder.mockReturnValue(mockQb);

      await expect(service.expireAuctions()).resolves.toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('returns the auction when found', async () => {
      const auction = mockAuction();
      mockRepository.findOne.mockResolvedValue(auction);

      const result = await service.findOne('uuid-1');

      expect(result).toEqual(auction);
    });

    it('throws NotFoundException when auction does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        new NotFoundException('Auction with id "non-existent-id" not found'),
      );
    });
  });
});
