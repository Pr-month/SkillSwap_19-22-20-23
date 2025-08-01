import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  // Получить все категории (со связями)
  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      relations: ['parent', 'children', 'skills'],
      order: { name: 'ASC' },
    });
  }

  // Создать категорию
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { name, parentId } = createCategoryDto;

    const category = new Category();
    category.name = name;

    if (parentId) {
      const parent = await this.categoriesRepository.findOneBy({
        id: parentId,
      });
      if (!parent) {
        throw new NotFoundException(
          `Родительская категория с ID ${parentId} не найдена`,
        );
      }
      category.parent = parent;
    }

    return this.categoriesRepository.save(category);
  }

  // Обновить категорию
  async update(
    id: string,
    name?: string,
    parentId?: string | null,
  ): Promise<Category> {
    const category = await this.categoriesRepository.findOneOrFail({
      where: { id },
      relations: ['parent', 'children', 'skills'],
    });

    if (name) {
      category.name = name;
    }

    if (parentId !== undefined) {
      if (parentId === null) {
        category.parent = undefined;
      } else {
        const parent = await this.categoriesRepository.findOneByOrFail({
          id: parentId,
        });
        category.parent = parent;
      }
    }

    return this.categoriesRepository.save(category);
  }

  // Удалить категорию
  async remove(id: string): Promise<void> {
    const category = await this.categoriesRepository.findOneOrFail({
      where: { id },
    });
    await this.categoriesRepository.remove(category);
  }
}
