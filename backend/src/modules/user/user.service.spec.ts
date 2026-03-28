import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

const mockUser = (): User =>
  ({ id: 'user-1', name: 'Alice', createdAt: new Date() }) as User;

describe('UserService', () => {
  let service: UserService;

  const mockUserRepository = {
    find: jest.fn(),
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
  });

  describe('findAll', () => {
    it('returns all users ordered by name ascending', async () => {
      const users = [mockUser()];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockUserRepository.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
      expect(result).toEqual(users);
    });
  });
});
