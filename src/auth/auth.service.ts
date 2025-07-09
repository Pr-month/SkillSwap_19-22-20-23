import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';

interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // метод регистрации с созданием пользователя
  async register(registerDto: RegisterUserDto) {
    const { email, password, name } = registerDto;

    const existingUser = this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.usersService.create({
      email,
      name,
      password: hashedPassword,
    });
  }

  // метод обновления токенов
  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refreshSecret',
      });

      const user = this.usersService.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Неверный refresh токен');
      }

      const newAccessToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
      });
      const newRefreshToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        {
          secret: process.env.JWT_REFRESH_SECRET || 'refreshSecret',
          expiresIn: '7d',
        },
      );

      // Сохраняем новый refresh токен
      await this.usersService.updateRefreshToken(user.id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
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

    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'refreshSecret',
        expiresIn: '7d',
      },
    );

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
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
  }
}
