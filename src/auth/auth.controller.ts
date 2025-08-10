import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RefreshTokenGuard } from './guards/refreshToken.guard';
import { AuthenticatedRequest } from './auth.types';
import { AccessTokenGuard } from './guards/accessToken.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { TokensResponseDto } from './dto/tokens-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Некорректные данные в запросе' })
  @ApiBody({ type: RegisterUserDto })
  async register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход, возвращает токены',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Неверные учётные данные' })
  @ApiBody({ type: LoginUserDto })
  async login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Выход пользователя' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Успешный выход из системы' })
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user.sub; // Получаем id пользователя из payload JWT

    await this.authService.logout(userId);

    // Очищаем куки с токенами, если они есть
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Вы успешно вышли из системы' };
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление access и refresh токенов' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Токены успешно обновлены',
    type: TokensResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован или недействительный refresh токен',
  })
  refreshToken(@Req() req: AuthenticatedRequest) {
    return this.authService.refreshTokens(req.user);
  }
}
