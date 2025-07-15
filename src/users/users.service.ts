import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(paginationQuery: PaginationQueryDto): Promise<User[]> {
    const page = Math.max(paginationQuery.page || 1, 1);
    const limit = Math.min(Math.max(paginationQuery.limit || 20, 1), 100);

    return this.usersRepository.find({
      relations: ['skills'], // загружаем связь skills
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { skills, wantToLearn, favoriteSkills, ...simpleFields } =
      updateUserDto;

    void skills;
    void wantToLearn;
    void favoriteSkills;

    await this.usersRepository.update(id, simpleFields);

    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }
    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Пользователь с id ${id} не найден`);
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Исключаем поля ссылок на связи, чтобы не передавать в create()
    const { skills, wantToLearn, favoriteSkills, ...simpleFields } =
      createUserDto;
    void skills;
    void wantToLearn;
    void favoriteSkills;

    const user = this.usersRepository.create(simpleFields);

    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string | null,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      refreshToken: refreshToken ?? undefined,
    });
  }

  // Метод для обновления пароля
  async updatePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
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
