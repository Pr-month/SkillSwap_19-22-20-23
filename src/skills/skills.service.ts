import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { PaginationQueryDto } from 'src/users/dto/pagination-query.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
    private readonly usersRepository: Repository<User>,
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async findAll(paginationQuery: PaginationQueryDto): Promise<Skill[]> {
    const page = Math.max(paginationQuery.page || 1, 1);
    const limit = Math.min(Math.max(paginationQuery.limit || 20, 1), 100);
    return this.skillsRepository.find({
      relations: ['category', 'owner'],
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findBySkill(
    paginationQuery: PaginationQueryDto,
  ): Promise<{ data: Skill[]; page: number; totalPages: number }> {
    const page = Math.max(paginationQuery.page || 1, 1);
    const limit = Math.min(Math.max(paginationQuery.limit || 20, 1), 100);
    const { search } = paginationQuery;

    const qb = this.skillsRepository.createQueryBuilder('skill');

    if (search) {
      qb.where('LOWER(skill.title) LIKE :search', {
        search: `%${search.toLowerCase()}%`,
      });
    }

    const [skills, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .leftJoinAndSelect('skill.owner', 'owner')
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    if (totalPages > 0 && page > totalPages) {
      throw new NotFoundException('Страница не найдена');
    }

    return {
      data: skills,
      page,
      totalPages,
    };
  }

  async findById(id: string): Promise<Skill> {
    const skill = await this.skillsRepository.findOneOrFail({
      where: { id },
      relations: ['category', 'owner'],
    });
    return skill;
  }

  async create(
    createSkillDto: CreateSkillDto,
    ownerId: string,
  ): Promise<Skill> {
    const { categoryId, ...skillData } = createSkillDto;
    const owner = await this.usersRepository.findOne({
      where: { id: ownerId },
    });
    if (!owner) {
      throw new NotFoundException(`Пользователь с ID ${ownerId} не найден.`);
    }

    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException(`Категория с ID ${categoryId} не найдена.`);
    }

    const skill = this.skillsRepository.create({
      ...skillData,
      owner,
      category,
    });

    return this.skillsRepository.save(skill);
  }

  async update(
    id: string,
    updateSkillDto: UpdateSkillDto,
    currentUserId: string,
  ): Promise<Skill> {
    const skill = await this.skillsRepository.findOneOrFail({
      where: { id },
      relations: ['owner', 'category'],
    });
    // Проверяем владельца
    if (skill.owner.id !== currentUserId) {
      throw new ForbiddenException('Нет прав на обновление этого навыка');
    }

    const { categoryId, ...skillData } = updateSkillDto;

    if (categoryId) {
      const category = await this.categoriesRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Категория с ID ${categoryId} не найдена`);
      }
      skill.category = category;
    }

    Object.assign(skill, skillData);

    return this.skillsRepository.save(skill);
  }

  async remove(id: string): Promise<void> {
    const result = await this.skillsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Skill с id ${id} не найден`);
    }
  }
}
