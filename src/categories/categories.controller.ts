import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/common/enums/user.enums';
import { HasRoles } from 'src/auth/decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @HasRoles(Role.ADMIN)
  @Post()
  async create(@Body() createDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createDto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @HasRoles(Role.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(
      id,
      updateDto.name,
      updateDto.parentId,
    );
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @HasRoles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
