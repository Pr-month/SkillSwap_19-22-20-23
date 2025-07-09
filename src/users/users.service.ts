import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(_createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, _updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  // findByEmail(email: string) {
  //   return `Возврщает пользователя с таким #${email}`;
  // }

  findById(id: number): User {
    // async findById(id: number): Promise<User> {
    // const user = await this.usersRepository.findOne({ where: { id } });
    // if (!user) {
    //   throw new NotFoundException(`Пользователь с id ${id} не найден`);
    // }
    // return user;

    // Временно возвращаем пустого пользователя с минимальным набором полей
    return {
      id,
      email: '',
      name: '',
      password: '',
      refreshToken: null,
    } as unknown as User;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findByEmail(_email: string): User {
    // async findByEmail(email: string): Promise<User | null> {
    // return await this.usersRepository.findOne({ where: { email } });
    // }
    // Временно возвращаем пустого пользователя с минимальным набором полей
    return {
      email: '',
      name: '',
      password: '',
      refreshToken: null,
    } as unknown as User;
  }

  async updateRefreshToken(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _refreshToken: string,
  ): Promise<void> {
    // await this.usersRepository.update(userId, { refreshToken });
  }
}
