import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { AuthenticatedRequest } from 'src/auth/auth.types';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @UseGuards(AccessTokenGuard) // Защищаем маршрут JWT guard'ом
  @Patch('me')
  async updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = req.user.sub; // получаем id пользователя из токена
    return this.usersService.update(userId, updateUserDto);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('me/password')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content, если успешно
  async updatePassword(
    @Req() req: AuthenticatedRequest,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    const userId = req.user.sub;
    const { currentPassword, newPassword } = updatePasswordDto;
    await this.usersService.updatePassword(
      userId,
      currentPassword,
      newPassword,
    );
  }
}
