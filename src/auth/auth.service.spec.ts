import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { appConfig } from '../config/app.config';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      updateRefreshToken: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        {
          provide: appConfig.KEY,
          useValue: {
            jwt: {
              accessTokenSecret: 'secret',
              refreshTokenSecret: 'secret',
              accessTokenExpiration: '15m',
              refreshTokenExpiration: '7d',
            },
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('register', () => {
    it('should hash password, create user, return user and tokens', async () => {
      const dto = { email: 'a@a.com', password: 'pass', name: 'Name' };
      const fakeUser = { id: '1', ...dto };

      (
        jest.spyOn(bcrypt, 'hash') as unknown as jest.SpyInstance<
          Promise<string>,
          [string, number]
        >
      ).mockResolvedValue('hashedpass');

      (usersService.create as jest.Mock).mockResolvedValue(fakeUser);
      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      (
        usersService.updateRefreshToken as jest.Mock<
          Promise<void>,
          [string, string | null]
        >
      ).mockResolvedValue(undefined);

      const result = await authService.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith({
        ...dto,
        password: 'hashedpass',
      });
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        fakeUser.id,
        'refresh-token',
      );
      expect(result).toEqual({
        user: fakeUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('login', () => {
    it('should throw if user not found', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      await expect(
        authService.login({ email: 'a@a.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if invalid password', async () => {
      const fakeUser = { id: '1', email: 'a@a.com', password: 'hashed' };
      (usersService.findByEmail as jest.Mock).mockResolvedValue(fakeUser);

      (
        jest.spyOn(bcrypt, 'compare') as unknown as jest.SpyInstance<
          Promise<boolean>,
          [boolean]
        >
      ).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'a@a.com', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user and tokens on success', async () => {
      const fakeUser = { id: '1', email: 'a@a.com', password: 'hashed' };
      (usersService.findByEmail as jest.Mock).mockResolvedValue(fakeUser);

      (
        jest.spyOn(bcrypt, 'compare') as unknown as jest.SpyInstance<
          Promise<boolean>,
          [boolean]
        >
      ).mockResolvedValue(true);

      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      (usersService.updateRefreshToken as jest.Mock).mockResolvedValue(
        undefined,
      );

      const result = await authService.login({
        email: 'a@a.com',
        password: 'pass',
      });

      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        fakeUser.id,
        'refresh-token',
      );
      expect(result).toEqual({
        user: fakeUser,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });
});
