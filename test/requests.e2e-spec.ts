import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { DataSource, Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Skill } from '../src/skills/entities/skill.entity';
import {
  Request as RequestEntity,
  RequestStatus,
} from '../src/requests/entities/request.entity';
import { Category } from '../src/categories/entities/category.entity';
import * as request from 'supertest';

describe('Requests e2e', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepo: Repository<User>;
  let skillRepo: Repository<Skill>;
  let requestRepo: Repository<RequestEntity>;
  let categoryRepo: Repository<Category>;

  let sender: User;
  let receiver: User;
  let category: Category;
  let offeredSkill: Skill;
  let requestedSkill: Skill;
  let requestEntity: RequestEntity;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    userRepo = dataSource.getRepository(User);
    skillRepo = dataSource.getRepository(Skill);
    requestRepo = dataSource.getRepository(RequestEntity);
    categoryRepo = dataSource.getRepository(Category);
  });

  beforeEach(async () => {
    // Чистим таблицы
    await requestRepo.clear();
    await skillRepo.clear();
    await userRepo.clear();
    await categoryRepo.clear();

    category = await categoryRepo.save({ name: 'Test Category' });

    sender = await userRepo.save({
      name: 'Sender',
      email: 'sender@test.com',
      password: '123',
    });
    receiver = await userRepo.save({
      name: 'Receiver',
      email: 'receiver@test.com',
      password: '123',
    });

    offeredSkill = await skillRepo.save({
      title: 'Offered Skill',
      owner: sender,
      category,
      images: [],
    });
    requestedSkill = await skillRepo.save({
      title: 'Requested Skill',
      owner: receiver,
      category,
      images: [],
    });

    requestEntity = await requestRepo.save({
      sender,
      receiver,
      offeredSkill,
      requestedSkill,
      status: RequestStatus.PENDING,
      isRead: false,
    });
  });

  it('GET /requests/:id', async () => {
    const foundRequest = await requestRepo.findOneOrFail({
      where: { id: requestEntity.id },
    });

    const res = await request(app.getHttpServer())
      .get(`/requests/${foundRequest.id}`)
      .expect(200);

    expect(res.body.id).toBe(foundRequest.id);
  });

  it('PATCH /requests/:id', async () => {
    const foundRequest = await requestRepo.findOneOrFail({
      where: { id: requestEntity.id },
    });

    const res = await request(app.getHttpServer())
      .patch(`/requests/${foundRequest.id}`)
      .send({ status: RequestStatus.ACCEPTED, isRead: true })
      .expect(200);

    expect(res.body.status).toBe(RequestStatus.ACCEPTED);
    expect(res.body.isRead).toBe(true);
  });

  it('DELETE /requests/:id', async () => {
    const foundRequest = await requestRepo.findOneOrFail({
      where: { id: requestEntity.id },
    });

    await request(app.getHttpServer())
      .delete(`/requests/${foundRequest.id}`)
      .expect(200);

    const deleted = await requestRepo.findOne({
      where: { id: foundRequest.id },
    });
    expect(deleted).toBeNull();
  });

  afterAll(async () => {
    await app.close();
  });
});
