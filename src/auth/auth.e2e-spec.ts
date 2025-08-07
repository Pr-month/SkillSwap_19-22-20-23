import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { Server } from 'http';

export interface AuthResponse {
  user: {
    id?: number;
    email: string;
    name?: string;
    password: string;
    // Другие поля пользователя, если есть
  };
  accessToken: string;
  refreshToken: string;
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Глобальная валидация как в основном приложении
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    email: 'testuser@example.com',
    password: 'TestPassword123',
    name: 'Test User',
  };

  it('/auth/register (POST) - успешная регистрация', () => {
    return request(app.getHttpServer() as Server)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        const body = res.body as AuthResponse;

        expect(body.user).toBeDefined();
        expect(body.accessToken).toBeDefined();
        expect(body.refreshToken).toBeDefined();
        expect(body.user.email).toEqual(testUser.email);
        // Пароль не должен возвращаться в ответе
        expect(body.user.password).toBeUndefined();
      });
  });

  it('/auth/login (POST) - успешный вход', () => {
    return request(app.getHttpServer() as Server)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200)
      .expect((res) => {
        const body = res.body as AuthResponse;

        expect(body.user).toBeDefined();
        expect(body.accessToken).toBeDefined();
        expect(body.refreshToken).toBeDefined();
      });
  });

  it('/auth/login (POST) - вход с неправильным паролем', () => {
    return request(app.getHttpServer() as Server)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' })
      .expect(401);
  });

  // Можно добавить тесты обновления токена, выхода и т.д.
});
