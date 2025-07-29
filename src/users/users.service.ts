import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<{ data: User[]; page: number; totalPages: number }> {
    const page = Math.max(paginationQuery.page || 1, 1);
    const limit = Math.min(Math.max(paginationQuery.limit || 20, 1), 100);
    const totalCount = await this.usersRepository.count();
    const totalPages = Math.ceil(totalCount / limit) || 1;

    if (page > totalPages) {
      throw new NotFoundException(`Страница ${page} не найдена`);
    }

    const data = await this.usersRepository.find({
      relations: ['skills'], // загружаем связь skills
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      page,
      totalPages,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOneOrFail({
      //Ищем пользователя
      where: { id },
    });
    return await this.usersRepository.save({
      //Сохраняем пользователя и новые данные
      ...user,
      ...updateUserDto,
    });
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneOrFail({ where: { id } });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      refreshToken: refreshToken,
    });
  }

  // Метод для обновления пароля
  async updatePassword(
    userId: string,
    { currentPassword, newPassword }: UpdatePasswordDto,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Текущий пароль неверен');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    await this.usersRepository.save(user);
  }
}
