import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { Category } from '../src/categories/entities/category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let categoryRepo: Repository<Category>;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    categoryRepo = moduleFixture.get<Repository<Category>>(
      getRepositoryToken(Category),
    );

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });
    adminToken = adminLogin.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/categories (GET)', () => {
    it('should return an array of categories', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('/categories (POST)', () => {
    it('should create a new category', async () => {
      const res = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test Category' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Test Category');
    });

    it('should fail if not admin', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .send({ name: 'No Admin' })
        .expect(401);
    });
  });

  describe('/categories/:id (PATCH)', () => {
    let categoryId: string;

    beforeAll(async () => {
      const category = await categoryRepo.save({ name: 'Update Category' });
      categoryId = category.id;
    });

    it('should update a category', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Category' })
        .expect(200);

      expect(res.body.name).toBe('Updated Category');
    });
  });

  describe('/categories/:id (DELETE)', () => {
    let categoryId: string;

    beforeAll(async () => {
      const category = await categoryRepo.save({ name: 'Delete Category' });
      categoryId = category.id;
    });

    it('should delete a category', async () => {
      await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const deleted = await categoryRepo.findOne({ where: { id: categoryId } });
      expect(deleted).toBeNull();
    });
  });
});
