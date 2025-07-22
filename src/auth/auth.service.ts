import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { IAppConfig } from 'src/config/config.types';
import { appConfig } from '../config/app.config';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';

interface JwtPayload {
  sub: number;
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

    const user = this.usersService.create({
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
  async refreshTokens(authUser: JwtPayload) {
    try {
      const user = this.usersService.findById(authUser.sub);
      if (!user || user.refreshToken) {
        throw new UnauthorizedException('Неверный refresh токен');
      }

      return await this._getTokens({ id: user.id, email: user.email });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new UnauthorizedException('Неверный refresh токен');
    }
  }

  async login(loginDto: LoginUserDto) {
    const { email, password } = loginDto;
    const user = this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return this._getTokens({ id: user.id, email: user.email });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async logout(_userId: string): Promise<void> {
    // пока нет репозитария
    // const user = await this.usersRepository.findOne({ where: { id: userId } });
    // if (!user) {
    //   throw new NotFoundException('Пользователь не найден');
    // }
    // user.refreshToken = null; // Удаляем refresh токен из БД
    // await this.usersRepository.save(user);
    // или
    // await this.usersService.updateRefreshToken(userId, null);
  }

  // private async _getTokens(user: { id: string; email: string; role?: string }) {
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

    // await this.usersRepository.update(user.id, { refreshToken });
    return {
      accessToken,
      refreshToken,
    };
  }
}
