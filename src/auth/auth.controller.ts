import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { AuthenticatedRequest } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Req() _req: Request,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Res({ passthrough: true }) _res: Response,
  ) {
    const userId = ''; //req.user['sub']; // Получаем id пользователя из payload JWT

    await this.authService.logout(userId);

    // Очищаем куки с токенами, если они есть
    // res.clearCookie('access_token');
    // res.clearCookie('refresh_token');

    return { message: 'Вы успешно вышли из системы' };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refreshToken(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return this.authService.refreshTokens(user.sub, user.email);
  }
}
