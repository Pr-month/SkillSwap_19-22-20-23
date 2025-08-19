import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Server } from 'http';
import { AuthResponse } from './auth.e2e-spec';
import { Response } from 'supertest';

jest.setTimeout(30000);

interface PaginatedUsersResponse {
  items: Array<{ id: number; email: string; name: string }>;
  total: number;
  page: number;
  limit: number;
}

interface UserResponse {
  id: number;
  email: string;
  name: string;
}

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let server: Server;
  let accessToken: string;
  let testUserId: number;

  const testUser = {
    email: 'user1@example.com',
    password: 'TestPassword123',
    name: 'User One',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    server = app.getHttpServer() as Server;

    const res: Response = await request(server)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    const authResponse = res.body as AuthResponse;
    accessToken = authResponse.accessToken;
    testUserId = authResponse.user.id!;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (GET)', () => {
    it('should return paginated users', async () => {
      const res = await request(server)
        .get('/api/users')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = res.body as PaginatedUsersResponse;
      expect(Array.isArray(body.items)).toBe(true);
    });
  });

  describe('/users/me (GET)', () => {
    it('should return current user if authorized', async () => {
      const res = await request(server)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const body = res.body as UserResponse;
      expect(body.email).toBe(testUser.email);
    });

    it('should return 401 if not authorized', async () => {
      await request(server).get('/api/users/me').expect(401);
    });
  });

  describe('/users/me (PATCH)', () => {
    it('should update user profile', async () => {
      const updatedName = 'Updated Name';
      const res = await request(server)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: updatedName })
        .expect(200);

      const body = res.body as UserResponse;
      expect(body.name).toBe(updatedName);
    });
  });

  describe('/users/me/password (PATCH)', () => {
    it('should update password', async () => {
      const newPassword = 'NewPass123!';
      await request(server)
        .patch('/api/users/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: testUser.password, newPassword })
        .expect(200);

      const loginRes = await request(server)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: newPassword })
        .expect(200);

      const body = loginRes.body as AuthResponse;
      expect(body.accessToken).toBeDefined();
    });

    it('should fail with wrong current password', async () => {
      await request(server)
        .patch('/api/users/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: 'wrong', newPassword: '123' })
        .expect(401);
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should forbid deleting without admin role', async () => {
      await request(server)
        .delete(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });
  });
});
