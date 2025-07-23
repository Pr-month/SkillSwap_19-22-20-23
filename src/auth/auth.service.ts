import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IAppConfig } from 'src/config/config.types';
import { appConfig } from '../config/app.config';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(appConfig.KEY)
    private readonly appConfiguration: IAppConfig,
  ) {}

  // метод регистрации с созданием пользователя
  async register(registerDto: RegisterUserDto) {
    const { email, password, name } = registerDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      ...registerDto,
      email,
      name,
      password: hashedPassword,
    });

    const tokens = await this._getTokens({ id: user.id, email: user.email });

    return {
      user,
      ...tokens,
    };
  }

  // метод обновления токенов
  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.appConfiguration.jwt.refreshTokenSecret,
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Неверный refresh токен');
      }

      return await this._getTokens({ id: user.id, email: user.email });
    } catch {
      throw new UnauthorizedException('Неверный refresh токен');
    }
  }

  async login(loginDto: LoginUserDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const tokens = await this._getTokens({ id: user.id, email: user.email });

    return {
      user,
      ...tokens,
    };
  }

  async logout(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    // Удаляем refresh токен из БД
    await this.usersService.updateRefreshToken(userId, null);
  }

  private async _getTokens(user: { id: string; email: string; role?: string }) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.appConfiguration.jwt.accessTokenSecret,
      expiresIn: this.appConfiguration.jwt.accessTokenExpiration,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.appConfiguration.jwt.refreshTokenSecret,
      expiresIn: this.appConfiguration.jwt.refreshTokenExpiration,
    });

    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return {
      accessToken,
      refreshToken,
    };
  }
}
