import { Controller, UseGuards, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { JwtPayload } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refreshToken(@Req() req: Request & { user: JwtPayload }) {
    const user = req.user;
    return this.authService.refreshTokens(user.sub, user.email);
  }
}
