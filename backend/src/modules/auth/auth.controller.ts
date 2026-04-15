import {
  Controller,
  Get,
  NotFoundException,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeEndpoint, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Profile } from 'passport-google-oauth20';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedUser } from './strategies/jwt.strategy';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Initiates the Google OAuth flow. Redirects the browser to Google's
   * sign-in page. This endpoint is meant to be opened in a browser tab,
   * not called via AJAX.
   */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiExcludeEndpoint()
  googleLogin(): void {
    // Guard handles the redirect — nothing to do here.
  }

  /**
   * Google redirects here after the user signs in. We create/look up the
   * user, mint a JWT, and redirect the browser back to the frontend with
   * the token in the query string.
   */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiExcludeEndpoint()
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const user = await this.authService.handleGoogleLogin(
      req.user as Profile,
    );
    const token = this.authService.signToken(user);
    const frontendUrl = this.configService.get<string>('auth.frontendUrl');
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  /**
   * Returns the currently authenticated user's profile. Requires a valid
   * JWT in the Authorization header.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiOkResponse({ type: User })
  async getMe(@Req() req: Request): Promise<User> {
    const { id } = req.user as AuthenticatedUser;
    const user = await this.authService.getMe(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
