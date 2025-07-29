import { DataSource } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { dbConfig } from '../config/db.config';
import { CategoriesData } from './categories.data';
import * as dotenv from 'dotenv';

dotenv.config();
const AppDataSource = new DataSource(dbConfig());

async function seed() {
  await AppDataSource.initialize();

  const categoryRepo = AppDataSource.getRepository(Category);

  const existingCount = await categoryRepo.count();
  if (existingCount > 0) {
    console.log('Категории уже существуют, сидирование не требуется');
    await AppDataSource.destroy();
    return;
  }

  for (const parentData of CategoriesData) {
    const parentCategory = categoryRepo.create({ name: parentData.name });
    await categoryRepo.save(parentCategory);

    if (parentData.children && parentData.children.length > 0) {
      const childrenCategories = parentData.children.map((childName) =>
        categoryRepo.create({ name: childName }),
      );

      for (const childCategory of childrenCategories) {
        await categoryRepo.save(childCategory);
      }
    }
  }

  console.log('Начальные категории успешно созданы');
  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error('Ошибка сидирования категорий:', e);
  process.exit(1);
});
