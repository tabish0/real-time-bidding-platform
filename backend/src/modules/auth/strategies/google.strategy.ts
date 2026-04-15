import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('auth.googleClientId') ?? '',
      clientSecret: configService.get<string>('auth.googleClientSecret') ?? '',
      callbackURL:
        configService.get<string>('auth.googleCallbackUrl') ??
        'http://localhost:3000/api/v1/auth/google/callback',
      scope: ['email', 'profile'],
    } as ConstructorParameters<typeof Strategy>[0]);
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    // Pass the raw Google profile to the controller — the AuthService
    // handles user creation / lookup there.
    done(null, profile);
  }
}
