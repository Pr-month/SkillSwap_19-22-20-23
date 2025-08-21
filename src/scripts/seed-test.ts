import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Skill } from '../skills/entities/skill.entity';
import { Request } from '../requests/entities/request.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || 'test',
  synchronize: true,
  dropSchema: process.env.DROP_SCHEMA === 'true',
  entities: [User, Category, Skill, Request],
});

async function seedDatabase() {
  await AppDataSource.initialize();

  const admin = new User();
  admin.name = 'admin';
  admin.password = 'admin123';
  await AppDataSource.manager.save(admin);

  const category1 = new Category();
  category1.name = 'Category 1';
  await AppDataSource.manager.save(category1);

  const category2 = new Category();
  category2.name = 'Category 2';
  await AppDataSource.manager.save(category2);

  const skill1 = new Skill();
  skill1.title = 'Card 1';
  skill1.category = category1;
  await AppDataSource.manager.save(skill1);

  const skill2 = new Skill();
  skill2.title = 'Card 2';
  skill2.category = category2;
  await AppDataSource.manager.save(skill2);

  const request1 = new Request();
  request1.offeredSkill = skill1;
  request1.sender = admin;
  await AppDataSource.manager.save(request1);

  const request2 = new Request();
  request2.offeredSkill = skill2;
  request2.sender = admin;
  await AppDataSource.manager.save(request2);

  await AppDataSource.destroy();
}

seedDatabase()
  .then(() => {
    console.log('Сидирование завершено успешно');
  })
  .catch((error) => {
    console.error('Ошибка при сидировании:', error);
  });
