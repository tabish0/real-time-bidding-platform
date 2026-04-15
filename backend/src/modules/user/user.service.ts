import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

interface FindOrCreateParams {
  googleId: string;
  email: string;
  name: string;
  picture: string | null;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { googleId } });
  }

  async findOrCreate(params: FindOrCreateParams): Promise<User> {
    const existing = await this.findByGoogleId(params.googleId);
    if (existing) return existing;

    const user = this.userRepository.create(params);
    return this.userRepository.save(user);
  }
}
