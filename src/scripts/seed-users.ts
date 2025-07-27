import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../common/enums/user.enums';
import * as bcrypt from 'bcrypt';
import { dbConfig } from '../config/db.config';

const AppDataSource = new DataSource(dbConfig());

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);

  // Проверяем, есть ли уже администратор
  const adminCount = await userRepo.count({ where: { role: Role.ADMIN } });
  if (adminCount > 0) {
    console.log('Администратор уже существует, сидирование не требуется');
    await AppDataSource.destroy();
    return;
  }

  // Создаем администратора
  const admin = new User();
  admin.name = 'Admin';
  admin.email = 'admin@example.com';
  // Хешируем пароль
  const saltRounds = 10;
  admin.password = await bcrypt.hash('admin123', saltRounds);
  admin.role = Role.ADMIN;

  await userRepo.save(admin);

  console.log('Администратор успешно создан');
  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error('Ошибка сидирования администратора:', e);
  process.exit(1);
});
