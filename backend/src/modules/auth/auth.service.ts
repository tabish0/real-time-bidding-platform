import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Profile } from 'passport-google-oauth20';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async handleGoogleLogin(profile: Profile): Promise<User> {
    const email = profile.emails?.[0]?.value ?? '';
    const picture = profile.photos?.[0]?.value ?? null;

    return this.userService.findOrCreate({
      googleId: profile.id,
      email,
      name: profile.displayName,
      picture,
    });
  }

  signToken(user: User): string {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }

  getMe(userId: string): Promise<User | null> {
    return this.userService.findById(userId);
  }
}
