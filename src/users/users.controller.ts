import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { AuthenticatedRequest } from 'src/auth/auth.types';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UserPasswordFilter } from 'src/common/user-password.filter';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/common/enums/user.enums';
import { HasRoles } from 'src/auth/decorators/roles.decorator';

@Controller('users')
@UseInterceptors(UserPasswordFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAll(paginationQuery);
  }

  @Get('me')
  @UseInterceptors(UserPasswordFilter)
  @UseGuards(AccessTokenGuard)
  getCurrentUser(@Req() req: AuthenticatedRequest) {
    return this.usersService.findById(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @HasRoles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
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
    await this.usersService.updatePassword(userId, updatePasswordDto);
  }
}
