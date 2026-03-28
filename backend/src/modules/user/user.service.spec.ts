import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

const mockUser = (): User =>
  ({ id: 'user-1', name: 'Alice', createdAt: new Date() }) as User;

describe('UserService', () => {
  let service: UserService;

  const mockGetMany = jest.fn();
  const mockOrderBy = jest.fn();
  const mockQueryBuilder = { orderBy: mockOrderBy, getMany: mockGetMany };

  const mockUserRepository = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();

    mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
    mockOrderBy.mockReturnValue(mockQueryBuilder);
  });

  describe('findAll', () => {
    it('returns all users ordered numerically by name', async () => {
      const users = [mockUser()];
      mockGetMany.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(mockOrderBy).toHaveBeenCalledWith(
        expect.stringContaining('regexp_replace'),
        'ASC',
        'NULLS LAST',
      );
      expect(result).toEqual(users);
    });
  });
});
