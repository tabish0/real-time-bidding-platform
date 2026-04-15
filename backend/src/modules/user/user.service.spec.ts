import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

const mockUser = (): User =>
  ({
    id: 'user-1',
    googleId: 'google-123',
    email: 'alice@example.com',
    name: 'Alice',
    picture: null,
    createdAt: new Date(),
  }) as User;

describe('UserService', () => {
  let service: UserService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
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

  describe('findById', () => {
    it('returns the user when found', async () => {
      const user = mockUser();
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findById('user-1');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(result).toEqual(user);
    });

    it('returns null when not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const result = await service.findById('missing');
      expect(result).toBeNull();
    });
  });

  describe('findByGoogleId', () => {
    it('returns the user when found', async () => {
      const user = mockUser();
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findByGoogleId('google-123');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { googleId: 'google-123' } });
      expect(result).toEqual(user);
    });
  });

  describe('findOrCreate', () => {
    const params = {
      googleId: 'google-123',
      email: 'alice@example.com',
      name: 'Alice',
      picture: null,
    };

    it('returns existing user if found', async () => {
      const user = mockUser();
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.findOrCreate(params);

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(user);
    });

    it('creates and returns a new user if not found', async () => {
      const user = mockUser();
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(user);
      mockUserRepository.save.mockResolvedValue(user);

      const result = await service.findOrCreate(params);

      expect(mockUserRepository.create).toHaveBeenCalledWith(params);
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });
  });
});
